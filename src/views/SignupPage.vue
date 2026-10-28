<template>
  <ion-page>
    <ion-content class="auth-bg">
      <main class="auth-card">
        <div class="brand-mark">ME</div>
        <p class="eyebrow">COMECE POR AQUI</p>
        <h1>Crie sua conta.</h1>
        <p class="muted">Use seu e-mail para criar um acesso seguro.</p>

        <form @submit.prevent="submit">
          <label>E-mail</label>
          <ion-input
            v-model="email"
            type="email"
            autocomplete="email"
            placeholder="voce@email.com"
            required
          />
          <label>Senha</label>
          <ion-input
            v-model="password"
            type="password"
            autocomplete="new-password"
            placeholder="Pelo menos 6 caracteres"
            required
          />
          <label>Confirmar senha</label>
          <ion-input
            v-model="confirm"
            type="password"
            autocomplete="new-password"
            placeholder="Digite a senha novamente"
            required
          />
          <p v-if="notice.message" class="notice" :class="notice.kind">
            {{ notice.message }}
          </p>
          <ion-button expand="block" type="submit" :disabled="busy">
            {{ busy ? 'Criando conta...' : 'Criar conta' }}
          </ion-button>
        </form>

        <p class="switch">
          Já tem uma conta? <router-link to="/login">Entrar</router-link>
        </p>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonContent, IonInput, IonButton } from '@ionic/vue';
import { signUp } from '../services/auth';
import { useNotice } from '../composables/useNotice';

const router = useRouter();
const email = ref('');
const password = ref('');
const confirm = ref('');
const busy = ref(false);
const notice = useNotice();

async function submit() {
  if (!email.value.trim() || !password.value) {
    notice.show('Preencha todos os campos.');
    return;
  }

  if (password.value.length < 6) {
    notice.show('A senha precisa ter pelo menos 6 caracteres.'); ////////////////////////////////////////////////////
    return;
  }

  if (password.value !== confirm.value) {
    notice.show('As senhas não conferem.');
    return;
  }

  busy.value = true;
  try {
    const { data, error } = await signUp(email.value.trim(), password.value);
    if (error) throw error;
    if (data.session) router.replace('/boas-vindas');
  } catch (error) {
    notice.show(error instanceof Error ? error.message : 'Não foi possível criar a conta.');
  } finally {
    busy.value = false;
  }
}
</script>
