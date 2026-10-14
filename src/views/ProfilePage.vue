<template>
  <ion-page>
    <ion-content class="page-bg">
      <main class="page-wrap">
        <header class="topbar">
          <button class="back-link" @click="router.push('/boas-vindas')">&#8592; In&iacute;cio</button>
          <button class="text-link" @click="leave">Sair &rarr;</button>
        </header>
        <section class="profile-head">
          <p class="eyebrow">SEU ESPA&Ccedil;O</p>
          <h1>Meu perfil</h1>
          <p class="muted">Mantenha suas informa&ccedil;&otilde;es atualizadas.</p>
        </section>
        <section class="profile-card">
          <div class="avatar-area">
            <div class="avatar">
              <img v-if="imageUrl" :src="imageUrl" alt="Foto de perfil" />
              <span v-else>{{ initials }}</span>
            </div>
            <div class="avatar-copy">
              <strong>Sua foto</strong>
              <span>JPG ou PNG &middot; at&eacute; 5 MB</span>
              <button class="text-link" :disabled="uploading" @click="picker?.click()">
                {{ uploading ? 'Enviando...' : 'Adicionar ou trocar foto' }}
              </button>
              <input ref="picker" type="file" accept="image/*" class="hidden" @change="choosePhoto" />
            </div>
          </div>
          <form @submit.prevent="save">
            <label>Nome completo</label>
            <ion-input v-model="form.nome_completo" autocomplete="name" placeholder="Como podemos chamar voc&ecirc;?" />
            <label>Data de nascimento</label>
            <ion-input v-model="form.data_nascimento" type="date" />
            <label>Apelido</label>
            <ion-input v-model="form.apelido" placeholder="Como prefere ser chamado?" />
            <p v-if="notice.message" class="notice" :class="notice.kind">{{ notice.message }}</p>
            <ion-button expand="block" type="submit" :disabled="busy">
              {{ busy ? 'Salvando...' : 'Salvar altera&ccedil;&otilde;es' }}
            </ion-button>
          </form>
        </section>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { IonButton, IonContent, IonInput, IonPage } from '@ionic/vue';
import { useNotice } from '../composables/useNotice';
import { getSession, signOut } from '../services/auth';
import { avatarUrl, loadProfile, saveProfile, uploadAvatar, type Profile } from '../services/profile';

const router = useRouter();
const form = reactive({ nome_completo: '', data_nascimento: '', apelido: '' });
const userId = ref('');
const imageUrl = ref<string | null>(null);
const busy = ref(false);
const uploading = ref(false);
const picker = ref<HTMLInputElement>();
const notice = useNotice();
const initials = ref('ME');

function getMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}

function updateInitials() {
  initials.value = (form.apelido || form.nome_completo || 'ME')
    .split(' ').slice(0, 2).map(part => part[0]).join('').toUpperCase();
}

async function refresh() {
  try {
    const { data } = await getSession();
    if (!data.session) { router.replace('/login'); return; }
    userId.value = data.session.user.id;
    const profile: Profile | null = await loadProfile(userId.value);
    if (profile) {
      form.nome_completo = profile.nome_completo || '';
      form.data_nascimento = profile.data_nascimento || '';
      form.apelido = profile.apelido || '';
      imageUrl.value = await avatarUrl(profile.avatar_path);
    }
    updateInitials();
  } catch (error) {
    notice.show(getMessage(error, 'Nao foi possivel carregar o perfil.'));
  }
}

onMounted(refresh);

async function save() {
  if (!form.nome_completo.trim()) { notice.show('Informe seu nome completo.'); return; }
  busy.value = true;
  try {
    await saveProfile({
      nome_completo: form.nome_completo.trim(),
      data_nascimento: form.data_nascimento || null,
      apelido: form.apelido.trim()
    }, userId.value);
    updateInitials();
    notice.show('Perfil salvo com sucesso.', 'success');
  } catch (error) {
    notice.show(getMessage(error, 'Nao foi possivel salvar o perfil.'));
  } finally {
    busy.value = false;
  }
}

async function choosePhoto(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  uploading.value = true;
  try {
    const path = await uploadAvatar(userId.value, file);
    imageUrl.value = await avatarUrl(path);
    notice.show('Foto atualizada com sucesso.', 'success');
  } catch (error) {
    notice.show(getMessage(error, 'Nao foi possivel enviar a foto.'));
  } finally {
    uploading.value = false;
    input.value = '';
  }
}

async function leave() {
  await signOut();
  router.replace('/login');
}
</script>
