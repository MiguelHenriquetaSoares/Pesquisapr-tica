<template>
  <ion-page>
    <ion-content class="auth-bg">
      <main class="auth-card">
        <p class="eyebrow">NOVA SENHA</p>
        <h1>Escolha uma senha nova.</h1>

        <form @submit.prevent="submit">
          <label>Nova senha</label>
          <ion-input v-model="password" type="password" autocomplete="new-password" required />
          <label>Confirme a senha</label>
          <ion-input v-model="confirm" type="password" autocomplete="new-password" required />
          <p v-if="notice.message" class="notice" :class="notice.kind">
            {{ notice.message }}
          </p>
          <ion-button expand="block" type="submit" :disabled="busy || !resetCode">
            {{ busy ? 'Salvando...' : 'Salvar nova senha' }}
          </ion-button>
        </form>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonContent, IonInput, IonButton } from '@ionic/vue';
import { finishEmailAction, updatePassword, verifyResetCode } from '../services/auth';
import { useNotice } from '../composables/useNotice';

const router = useRouter();
const password = ref('');
const confirm = ref('');
const busy = ref(false);
const resetCode = ref('');
const notice = useNotice();

onMounted(async () => {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get('mode');
  const code = params.get('oobCode');

  if (mode === 'verifyEmail') {
    if (!code) {
      notice.show('Link de verificacao invalido. Solicite um novo e-mail de verificacao.');
      return;
    }
    busy.value = true;
    try {
      await finishEmailAction();
      notice.show('E-mail verificado. Este link nao redefine a senha; solicite um link em Esqueci minha senha.', 'success');
    } catch (error) {
      notice.show(error instanceof Error ? error.message : 'Nao foi possivel verificar o e-mail.');
    } finally {
      busy.value = false;
    }
    return;
  }
  if (mode !== 'resetPassword' || !code) {
    notice.show('Link de redefinicao invalido. Solicite um novo link em Esqueci minha senha.');
    return;
  }

  busy.value = true;
  try {
    await verifyResetCode(code);
    resetCode.value = code;
  } catch (error) {
    notice.show(error instanceof Error ? error.message : 'O link expirou ou nao e valido. Solicite outro.');
  } finally {
    busy.value = false;
  }
});

async function submit() {
  if (!resetCode.value) {
    notice.show('Abra um link valido de redefinicao de senha enviado por e-mail.');
    return;
  }
  if (password.value.length < 6) {
    notice.show('A senha precisa ter pelo menos 6 caracteres.');
    return;
  }

  if (password.value !== confirm.value) {
    notice.show('As senhas não conferem.');
    return;
  }

  busy.value = true;
  try {
    const { error } = await updatePassword(password.value, resetCode.value);
    if (error) throw error;
    notice.show('Senha atualizada com sucesso.', 'success');
    setTimeout(() => router.replace('/login'), 1000);
  } catch (error) {
    notice.show(
      error instanceof Error
        ? error.message
        : 'O link pode ter expirado. Solicite uma nova recuperação.',
    );
  } finally {
    busy.value = false;
  }
}
</script>
