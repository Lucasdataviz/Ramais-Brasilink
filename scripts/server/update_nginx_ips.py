#!/usr/bin/env python3
"""
Script para atualizar automaticamente o nginx.conf com IPs do banco de dados Supabase.
Este script deve ser executado no servidor onde o nginx está rodando.

Uso:
    python3 update_nginx_ips.py

Ou configure como webhook/cron job para atualizar automaticamente.
"""

import os
import sys
import subprocess
import requests
from pathlib import Path

# Configurações
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://zamksbryvuuaxxwszdgc.supabase.co')
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY', '')
NGINX_CONF_PATH = os.getenv('NGINX_CONF_PATH', '/etc/nginx/nginx.conf')
NGINX_CONF_BACKUP_PATH = os.getenv('NGINX_CONF_BACKUP_PATH', '/etc/nginx/nginx.conf.backup')

def get_allowed_ips():
    """Busca IPs permitidos do Supabase"""
    try:
        url = f"{SUPABASE_URL}/rest/v1/ips_permitidos"
        headers = {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        }
        params = {
            'ativo': 'eq.true',
            'select': 'ip,descricao'
        }
        
        response = requests.get(url, headers=headers, params=params, timeout=10)
        response.raise_for_status()
        
        ips_data = response.json()
        return ips_data
    except Exception as e:
        print(f"Erro ao buscar IPs do Supabase: {e}", file=sys.stderr)
        return []

def generate_nginx_config(ips_data):
    """Gera a configuração do nginx para os IPs permitidos"""
    if not ips_data:
        print("Nenhum IP ativo encontrado. Bloqueando todos os IPs.", file=sys.stderr)
        return "# WHITELIST DE IPS - Permitir apenas IPs específicos\n    deny all;                     # Bloquear todos os outros"
    
    config_lines = ["# WHITELIST DE IPS - Permitir apenas IPs específicos"]
    for ip_data in ips_data:
        ip = ip_data.get('ip', '')
        descricao = ip_data.get('descricao', '')
        if ip:
            comment = f"       # {descricao}" if descricao else ""
            config_lines.append(f"    allow {ip};{comment}")
    
    config_lines.append("    deny all;                     # Bloquear todos os outros")
    return "\n".join(config_lines)

def update_nginx_conf(new_config):
    """Atualiza o arquivo nginx.conf com a nova configuração"""
    try:
        # Ler o arquivo atual
        with open(NGINX_CONF_PATH, 'r') as f:
            content = f.read()
        
        # Fazer backup
        with open(NGINX_CONF_BACKUP_PATH, 'w') as f:
            f.write(content)
        print(f"Backup criado em: {NGINX_CONF_BACKUP_PATH}")
        
        # Encontrar e substituir a seção de IPs permitidos
        import re
        pattern = r'# WHITELIST DE IPS.*?deny all;.*?# Bloquear todos os outros'
        
        if re.search(pattern, content, re.DOTALL):
            # Substituir seção existente
            new_content = re.sub(pattern, new_config, content, flags=re.DOTALL)
        else:
            # Adicionar após real_ip_recursive on
            insert_pattern = r'(real_ip_recursive on;)'
            new_content = re.sub(insert_pattern, f'\\1\n\n{new_config}', content)
        
        # Escrever novo conteúdo
        with open(NGINX_CONF_PATH, 'w') as f:
            f.write(new_content)
        
        print(f"nginx.conf atualizado com sucesso!")
        return True
    except Exception as e:
        print(f"Erro ao atualizar nginx.conf: {e}", file=sys.stderr)
        return False

def test_nginx_config():
    """Testa a configuração do nginx"""
    try:
        result = subprocess.run(
            ['nginx', '-t'],
            capture_output=True,
            text=True,
            timeout=10
        )
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        print(f"Erro ao testar nginx: {e}", file=sys.stderr)
        return False, "", str(e)

def reload_nginx():
    """Recarrega o nginx"""
    try:
        result = subprocess.run(
            ['systemctl', 'reload', 'nginx'],
            capture_output=True,
            text=True,
            timeout=10
        )
        if result.returncode == 0:
            print("Nginx recarregado com sucesso!")
            return True
        else:
            print(f"Erro ao recarregar nginx: {result.stderr}", file=sys.stderr)
            return False
    except Exception as e:
        print(f"Erro ao recarregar nginx: {e}", file=sys.stderr)
        return False

def main():
    """Função principal"""
    if not SUPABASE_ANON_KEY:
        print("Erro: SUPABASE_ANON_KEY não configurada!", file=sys.stderr)
        sys.exit(1)
    
    print("Buscando IPs permitidos do Supabase...")
    ips_data = get_allowed_ips()
    
    print(f"Encontrados {len(ips_data)} IP(s) ativo(s)")
    for ip_data in ips_data:
        print(f"  - {ip_data.get('ip')} ({ip_data.get('descricao', 'sem descrição')})")
    
    print("\nGerando configuração do nginx...")
    nginx_config = generate_nginx_config(ips_data)
    print("\nConfiguração gerada:")
    print(nginx_config)
    
    print("\nAtualizando nginx.conf...")
    if not update_nginx_conf(nginx_config):
        print("Falha ao atualizar nginx.conf", file=sys.stderr)
        sys.exit(1)
    
    print("\nTestando configuração do nginx...")
    is_valid, stdout, stderr = test_nginx_config()
    if not is_valid:
        print(f"Configuração inválida! Revertendo backup...", file=sys.stderr)
        print(f"Erro: {stderr}", file=sys.stderr)
        # Restaurar backup
        with open(NGINX_CONF_BACKUP_PATH, 'r') as f:
            backup_content = f.read()
        with open(NGINX_CONF_PATH, 'w') as f:
            f.write(backup_content)
        sys.exit(1)
    
    print("Configuração válida!")
    
    print("\nRecarregando nginx...")
    if reload_nginx():
        print("\n✅ Nginx atualizado com sucesso!")
        sys.exit(0)
    else:
        print("\n❌ Falha ao recarregar nginx", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()

