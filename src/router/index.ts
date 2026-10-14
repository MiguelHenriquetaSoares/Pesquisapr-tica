import { createRouter, createWebHistory } from '@ionic/vue-router';
import { getSession } from '../services/auth';
const router = createRouter({ history: createWebHistory(import.meta.env.BASE_URL), routes: [
  { path: '/', redirect: '/boas-vindas' },
  { path: '/login', component: () => import('../views/LoginPage.vue'), meta: { guest: true } },
  { path: '/cadastro', component: () => import('../views/SignupPage.vue'), meta: { guest: true } },
  { path: '/recuperar-senha', component: () => import('../views/RecoverPage.vue'), meta: { guest: true } },
  { path: '/nova-senha', component: () => import('../views/NewPasswordPage.vue') },
  { path: '/boas-vindas', component: () => import('../views/HomePage.vue'), meta: { auth: true } },
  { path: '/perfil', component: () => import('../views/ProfilePage.vue'), meta: { auth: true } },
  { path: '/:pathMatch(.*)*', redirect: '/boas-vindas' }
] });
router.beforeEach(async to => {
  try {
    const { data } = await getSession();
    if (to.meta.auth && !data.session) return '/login';
    if (to.meta.guest && data.session) return '/boas-vindas';
  } catch { if (to.meta.auth) return '/login'; }
});
export default router;
