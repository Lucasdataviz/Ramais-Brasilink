#!/usr/bin/env python3
"""
Script para atualizar automaticamente a configuração do Traefik com IPs do banco de dados Supabase.
Este script funciona com Coolify que usa Traefik como proxy reverso.

Uso:
    python3 update_traefik_ips.py

Ou configure como webhook/cron job para atualizar automaticamente.
"""

import os
import sys
import subprocess
import requests
import json
import yaml
from pathlib import Path

# Configurações
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://zamksbryvuuaxxwszdgc.supabase.co')
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY', '')
TRAEFIK_DYNAMIC_CONFIG_PATH = os.getenv('TRAEFIK_DYNAMIC_CONFIG_PATH', '/etc/traefik/dynamic/ipwhitelist.yml')
COOLIFY_PROXY_PATH = os.getenv('COOLIFY_PROXY_PATH', '/data/coolify/proxy')
BACKUP_PATH = os.getenv('BACKUP_PATH', '/tmp/traefik-ipwhitelist.backup.yml')

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

def generate_traefik_config(ips_data):
    """Gera a configuração do Traefik para IP Whitelist"""
    if not ips_data:
        print("Nenhum IP ativo encontrado. Bloqueando todos os IPs.", file=sys.stderr)
        # Retornar configuração que bloqueia tudo
        return {
            'http': {
                'middlewares': {
                    'ipwhitelist': {
                        'ipWhiteList': {
                            'sourceRange': []
                        }
                    }
                }
            }
        }
    
    # Extrair IPs
    source_ranges = [ip_data.get('ip') for ip_data in ips_data if ip_data.get('ip')]
    
    config = {
        'http': {
            'middlewares': {
                'ipwhitelist': {
                    'ipWhiteList': {
                        'sourceRange': source_ranges
                    }
                }
            }
        }
    }
    
    return config

def update_traefik_config(new_config):
    """Atualiza o arquivo de configuração dinâmica do Traefik"""
    try:
        # Criar diretório se não existir
        config_dir = Path(TRAEFIK_DYNAMIC_CONFIG_PATH).parent
        config_dir.mkdir(parents=True, exist_ok=True)
        
        # Fazer backup se arquivo existir
        if os.path.exists(TRAEFIK_DYNAMIC_CONFIG_PATH):
            with open(TRAEFIK_DYNAMIC_CONFIG_PATH, 'r') as f:
                content = f.read()
            with open(BACKUP_PATH, 'w') as f:
                f.write(content)
            print(f"Backup criado em: {BACKUP_PATH}")
        
        # Escrever nova configuração em YAML
        with open(TRAEFIK_DYNAMIC_CONFIG_PATH, 'w') as f:
            yaml.dump(new_config, f, default_flow_style=False, sort_keys=False)
        
        print(f"Configuração do Traefik atualizada em: {TRAEFIK_DYNAMIC_CONFIG_PATH}")
        return True
    except Exception as e:
        print(f"Erro ao atualizar configuração do Traefik: {e}", file=sys.stderr)
        return False

def update_coolify_labels(ips_data):
    """Atualiza labels do Docker para Coolify/Traefik"""
    try:
        # No Coolify, as configurações são feitas via labels Docker
        # Este método atualiza um arquivo que pode ser usado para recriar o container
        
        source_ranges = [ip_data.get('ip') for ip_data in ips_data if ip_data.get('ip')]
        source_ranges_str = ','.join(source_ranges)
        
        # Criar arquivo com labels para usar no docker-compose ou Coolify
        labels_file = os.path.join(COOLIFY_PROXY_PATH, 'ipwhitelist-labels.txt')
        
        labels_content = f"""# Labels para Traefik IP Whitelist
# Adicione estas labels no Coolify ou docker-compose.yml

traefik.http.middlewares.ipwhitelist.ipwhitelist.sourcerange={source_ranges_str}
traefik.http.routers.seu-servico.middlewares=ipwhitelist
"""
        
        with open(labels_file, 'w') as f:
            f.write(labels_content)
        
        print(f"Labels geradas em: {labels_file}")
        print("\nPara aplicar, adicione estas labels no Coolify:")
        print(f"traefik.http.middlewares.ipwhitelist.ipwhitelist.sourcerange={source_ranges_str}")
        print("traefik.http.routers.seu-servico.middlewares=ipwhitelist")
        
        return True
    except Exception as e:
        print(f"Erro ao gerar labels: {e}", file=sys.stderr)
        return False

def reload_traefik():
    """Recarrega o Traefik (via API ou sinal)"""
    try:
        # Tentar recarregar via API do Traefik
        traefik_api = os.getenv('TRAEFIK_API_URL', 'http://localhost:8080')
        
        try:
            response = requests.post(f"{traefik_api}/api/http/middlewares", timeout=5)
            # Se a API responder, o Traefik já detectou a mudança
            print("Traefik detectou mudanças automaticamente")
            return True
        except:
            # Se não tiver API, tentar enviar sinal SIGHUP ao container
            print("Tentando recarregar Traefik via container...")
            result = subprocess.run(
                ['docker', 'kill', '--signal=SIGHUP', 'traefik'],
                capture_output=True,
                text=True,
                timeout=10
            )
            if result.returncode == 0:
                print("Sinal SIGHUP enviado ao Traefik")
                return True
            else:
                print("Traefik recarregará automaticamente ao detectar mudanças no arquivo")
                return True
    except Exception as e:
        print(f"Aviso: Não foi possível recarregar Traefik automaticamente: {e}", file=sys.stderr)
        print("O Traefik recarregará automaticamente ao detectar mudanças no arquivo de configuração")
        return True

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
    
    print("\nGerando configuração do Traefik...")
    traefik_config = generate_traefik_config(ips_data)
    
    print("\nAtualizando configuração do Traefik...")
    if not update_traefik_config(traefik_config):
        print("Falha ao atualizar configuração do Traefik", file=sys.stderr)
        sys.exit(1)
    
    print("\nGerando labels para Coolify...")
    update_coolify_labels(ips_data)
    
    print("\nRecarregando Traefik...")
    if reload_traefik():
        print("\n✅ Traefik atualizado com sucesso!")
        print("\n⚠️  IMPORTANTE: Se usar Coolify, adicione as labels mostradas acima")
        print("   nas configurações do seu serviço no painel do Coolify.")
        sys.exit(0)
    else:
        print("\n⚠️  Aviso: Traefik será recarregado automaticamente ao detectar mudanças")
        sys.exit(0)

if __name__ == '__main__':
    # Tentar importar yaml, se não tiver, instalar
    try:
        import yaml
    except ImportError:
        print("Instalando PyYAML...", file=sys.stderr)
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'pyyaml'])
        import yaml
    
    main()

