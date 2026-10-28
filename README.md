# Perfil Ionic + Firebase

Aplicativo Ionic Vue com Capacitor, Firebase Authentication (e-mail e senha) e Cloud Firestore. Os perfis ficam em `usuarios/{UID}`. As fotos são compactadas no aparelho e salvas como string Base64 em `imagens/{UID}`, no campo `image`.

## Preparar no computador

1. Instale as dependências com `npm install`.
2. Copie `.env.example` para `.env`.
3. Quando o projeto Firebase estiver pronto, copie os valores de configuração do app Web para as variáveis `VITE_FIREBASE_*` no `.env`.
4. No Firebase Console, habilite **Authentication → Sign-in method → Email/Password** e crie um banco **Cloud Firestore**.
5. Publique no Firestore as regras do arquivo `firestore.rules`.
6. Inicie com `npm run dev`.

O aplicativo não usa Firebase Storage. A imagem vai para o documento `imagens/{UID}`. A compactação limita o texto Base64 a aproximadamente 450 KiB, mantendo espaço abaixo do limite de 1 MiB por documento do Firestore.

## Android

`npm run android` compila a versão web, sincroniza com Capacitor e abre o projeto Android Studio.
