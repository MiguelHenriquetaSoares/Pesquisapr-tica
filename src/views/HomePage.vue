<template>
  <ion-page>
    <ion-content class="page-bg">
      <main class="page-wrap">
        <header class="topbar">
          <a class="brand" href="/boas-vindas">
            <span class="brand-mark small">ME</span>
            <span>meu espaço</span>
          </a>
          <button class="text-link" @click="leave">Sair ↗</button>
        </header>

        <section class="welcome">
          <p class="eyebrow">BEM-VINDO(A)</p>
          <h1>Olá<span v-if="name">, {{ name }}</span>.</h1>
          <p class="muted">
            Este é o seu espaço. Um lugar para cuidar dos seus dados e deixar seu perfil com a sua
            cara.
          </p>
          <ion-button @click="router.push('/perfil')">
            {{ profile ? 'Ver meu perfil' : 'Completar meu perfil' }}
            <span class="arrow">→</span>
          </ion-button>
        </section>

        <section class="home-card">
          <div class="home-card-icon">✳</div>
          <div>
            <h2>Seu perfil, do seu jeito</h2>
            <p>Adicione seus dados e uma foto para personalizar sua experiência.</p>
          </div>
          <button class="circle-arrow" @click="router.push('/perfil')">↗</button>
        </section>

        <footer class="page-foot">Feito com cuidado · Seu espaço pessoal</footer>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonContent, IonButton } from '@ionic/vue';
import { getSession, signOut } from '../services/auth';
import { loadProfile, type Profile } from '../services/profile';

const router = useRouter();
const profile = ref<Profile | null>(null);
const name = ref('');

onMounted(async () => {
  try {
    const { data } = await getSession();
    if (data.session) {
      const loadedProfile = await loadProfile(data.session.user.uid);
      profile.value = loadedProfile;
      name.value =
        loadedProfile?.apelido || loadedProfile?.nome_completo?.split(' ')[0] || '';
    }
  } catch {
    // A tela continua disponível se não houver dados de perfil carregáveis.
  }
});

async function leave() {
  await signOut();
  router.replace('/login');
}
</script>
