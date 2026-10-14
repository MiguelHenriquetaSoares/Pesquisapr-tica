# Meu Espaço

Aplicativo responsivo em Ionic Vue com Capacitor e Supabase. Inclui cadastro, login, redefinição de senha, boas-vindas, perfil privado e foto de perfil em bucket privado.

## Requisitos

- Node.js 20 ou superior e npm
- Projeto Supabase
- Android Studio e Android SDK para gerar/abrir a versão Android

## Configuração do Supabase

1. No painel do Supabase, abra **Project Settings → API** (ou **API Keys**) e copie a Project URL e a chave pública anon/publishable.
2. Copie o arquivo .env.example para .env na raiz e preencha VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY (ou VITE_SUPABASE_ANON_KEY) e VITE_APP_URL com a origem desta execução (localmente http://localhost:5173). Use apenas a chave pública; nunca coloque service_role no aplicativo. A origem deve corresponder às URLs permitidas abaixo.
3. No **SQL Editor**, execute todo o arquivo supabase/schema.sql. Ele cria a tabela perfis, ativa RLS e cria as políticas do bucket privado fotos-perfil.
4. Em **Authentication → URL Configuration**, defina http://localhost:5173 como Site URL e inclua http://localhost:5173/nova-senha e http://localhost:5173/boas-vindas em Redirect URLs. Em produção, inclua sua URL HTTPS e os caminhos /nova-senha e /boas-vindas. Para Android, configure também um deep link do aplicativo antes de usar confirmação/recuperação no app nativo.
5. Em **Authentication → Providers → Email**, habilite e configure confirmação de e-mail conforme necessário. A recuperação real depende do serviço de e-mail/SMTP configurado no Supabase.

As variáveis VITE_* são incluídas no cliente: armazene nelas somente URL e chave pública. Não compartilhe o .env.

## Instalar e executar

    npm install
    npm run dev

Abra a URL indicada pelo Vite (normalmente http://localhost:5173). Para compilar a versão web:

    npm run build

## Android com Capacitor

Adicione a plataforma uma vez e sincronize:

    npx cap add android
    npm run cap:sync
    npx cap open android

Depois de alterações web, execute npm run cap:sync novamente. A seleção de imagem usa o seletor de arquivos do navegador/WebView.

## Como testar

1. Configure o .env, execute o SQL e configure e-mail e URLs antes de testar chamadas reais.
2. Crie uma conta. Se a confirmação estiver ativa, confirme pelo e-mail e então entre.
3. Faça login, abra Completar meu perfil, salve nome, data e apelido e recarregue a página.
4. Selecione uma foto JPG/PNG de até 5 MB. O perfil usa URL assinada temporária para exibir o arquivo privado.
5. Em Esqueci minha senha, solicite o link do e-mail e defina a nova senha em /nova-senha.
6. Saia e tente abrir /perfil; o app deve encaminhar para o login.

## GitHub

O .gitignore exclui .env, node_modules e dist. Mantenha .env.example com valores fictícios. Depois de revisar o projeto:

    git init
    git add .
    git commit -m "Implementa aplicativo Ionic Vue com Supabase"
    git branch -M main
    git remote add origin URL_DO_SEU_REPOSITORIO
    git push -u origin main

Crie o repositório no GitHub, substitua URL_DO_SEU_REPOSITORIO pela URL fornecida e não inclua credenciais. Nenhum repositório ou push foi criado.
