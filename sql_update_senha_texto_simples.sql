-- SQL para atualizar a tabela usuario_telefonia
-- Converter senhas de bcrypt hash para texto simples

-- 1. Ver a senha atual (hash bcrypt)
SELECT id, email, senha FROM usuario_telefonia;

-- 2. Atualizar a senha para texto simples
-- IMPORTANTE: Substitua 'SUA_SENHA_AQUI' pela senha desejada em texto simples
-- Substitua o email pelo email do usuário que você quer atualizar

UPDATE usuario_telefonia
SET senha = 'Bslkadm1010',  -- Senha em texto simples
    updated_at = now()
WHERE email = 'luccsilva07@gmail.com';

-- 3. Ou atualizar todos os usuários com uma senha padrão
-- CUIDADO: Isso atualiza TODOS os usuários!
-- UPDATE usuario_telefonia
-- SET senha = 'senha123',
--     updated_at = now();

-- 4. Verificar se foi atualizado corretamente
SELECT id, email, senha, updated_at 
FROM usuario_telefonia 
WHERE email = 'luccsilva07@gmail.com';

-- 5. Criar um novo usuário com senha em texto simples (se necessário)
-- INSERT INTO usuario_telefonia (nome, email, senha, role, ativo)
-- VALUES ('Administrador', 'admin@empresa.com', 'senha123', 'super_admin', true);



