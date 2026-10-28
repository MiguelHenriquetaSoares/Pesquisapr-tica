<template>
  <ion-page>
    <ion-content class="auth-bg">
      <main class="auth-card">
        <div class="brand-mark">ME</div>
        <p class="eyebrow">SEU ESPAÇO PESSOAL</p>
        <h1>Que bom ter você de volta.</h1>
        <p class="muted">Entre para continuar de onde parou.</p>

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
            autocomplete="current-password"
            placeholder="Sua senha"
            required
          />
          <button
            class="text-link forgot"
            type="button"
            @click="router.push('/recuperar-senha')"
          >
            Esqueci minha senha
          </button>
          <p v-if="notice.message" class="notice" :class="notice.kind">
            {{ notice.message }}
          </p>
          <ion-button expand="block" type="submit" :disabled="busy">
            {{ busy ? 'Entrando...' : 'Entrar' }}
          </ion-button>
        </form>

        <p class="switch">
          Ainda não tem conta? <router-link to="/cadastro">Criar conta</router-link>
        </p>
        <p v-if="!isFirebaseConfigured" class="config-hint">
          O Firebase será conectado depois, na etapa de configuração do projeto.
        </p>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonContent, IonInput, IonButton } from '@ionic/vue';
import { signIn } from '../services/auth';
import { useNotice } from '../composables/useNotice';
import { isFirebaseConfigured } from '../lib/firebase';

const router = useRouter();
const email = ref('');
const password = ref('');
const busy = ref(false);
const notice = useNotice();

async function submit() {
  if (!email.value.trim() || !password.value) {
    notice.show('Preencha seu e-mail e sua senha.');
    return;
  }

  busy.value = true;
  try {
    const { error } = await signIn(email.value.trim(), password.value);
    if (error) throw error;
    router.replace('/boas-vindas');
  } catch (error) {
    notice.show(
      error instanceof Error
        ? error.message
        : 'Não foi possível entrar. Confira sua conexão e tente novamente.',
    );
  } finally {
    busy.value = false;
  }
}
</script>
