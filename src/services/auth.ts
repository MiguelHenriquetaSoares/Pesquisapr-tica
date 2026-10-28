import {
  applyActionCode,
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  verifyPasswordResetCode,
  type User,
} from 'firebase/auth';
import { requireFirebase } from '../lib/firebase';

function friendlyError(error: unknown): Error {
  const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
  const messages: Record<string, string> = {
    'auth/invalid-email': 'O e-mail informado não é válido.',
    'auth/invalid-credential': 'E-mail ou senha incorretos.',
    'auth/user-not-found': 'Não existe uma conta com esse e-mail.',
    'auth/wrong-password': 'E-mail ou senha incorretos.',
    'auth/email-already-in-use': 'Este e-mail já possui uma conta.',
    'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
    'auth/too-many-requests': 'Muitas tentativas. Aguarde um pouco e tente novamente.',
    'auth/network-request-failed': 'Sem conexão com a internet. Confira sua conexão e tente novamente.',
    'auth/expired-action-code': 'Este link expirou. Solicite outro e-mail de recuperação.',
    'auth/invalid-action-code': 'Este link não é válido ou já foi usado. Solicite outro.',
    'permission-denied': 'O Firestore recusou o acesso. Confira as regras de segurança do Firebase.',
  };
  if (code && messages[code]) return new Error(messages[code]);
  if (error instanceof Error) return error;
  return new Error('Não foi possível concluir. Confira os dados e tente novamente.');
}

export async function getSession() {
  try {
    const { auth } = requireFirebase();
    await auth.authStateReady();
    const user = auth.currentUser;
    return { data: { session: user ? { user } : null }, error: null };
  } catch (error) { throw friendlyError(error); }
}

export function onAuthChange(callback: (session: { user: User } | null, user: User | null) => void) {
  const { auth } = requireFirebase();
  return onAuthStateChanged(auth, user => callback(user ? { user } : null, user));
}

export async function signIn(email: string, password: string) {
  try {
    const { auth } = requireFirebase();
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { data: { user: result.user }, error: null };
  } catch (error) { throw friendlyError(error); }
}

export async function signUp(email: string, password: string) {
  try {
    const { auth } = requireFirebase();
    const result = await createUserWithEmailAndPassword(auth, email, password);
    try { await sendEmailVerification(result.user); } catch { /* A conta continua criada; a verificação pode ser reenviada depois. */ }
    return { data: { user: result.user, session: { user: result.user } }, error: null };
  } catch (error) { throw friendlyError(error); }
}

export async function signOut() {
  try { const { auth } = requireFirebase(); await firebaseSignOut(auth); return { error: null }; }
  catch (error) { throw friendlyError(error); }
}

export async function sendPasswordReset(email: string) {
  try {
    const { auth } = requireFirebase();
    await sendPasswordResetEmail(auth, email, { url: window.location.origin + '/login', handleCodeInApp: false });
    return { error: null };
  } catch (error) { throw friendlyError(error); }
}

export async function verifyResetCode(code: string) {
  try {
    const { auth } = requireFirebase();
    return await verifyPasswordResetCode(auth, code);
  } catch (error) { throw friendlyError(error); }
}

export async function updatePassword(password: string, code: string) {
  try {
    const { auth } = requireFirebase();
    await confirmPasswordReset(auth, code, password);
    return { error: null };
  } catch (error) { throw friendlyError(error); }
}

export async function finishEmailAction() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('mode') === 'verifyEmail') {
    const code = params.get('oobCode');
    if (code) await applyActionCode(requireFirebase().auth, code);
  }
}
