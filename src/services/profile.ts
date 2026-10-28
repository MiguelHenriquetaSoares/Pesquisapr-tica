import { doc, getDoc, setDoc } from 'firebase/firestore';
import { requireFirebase } from '../lib/firebase';

export type Profile = {
  id: string;
  nome_completo: string;
  data_nascimento: string | null;
  apelido: string;
  avatar_path: string | null;
};

function profileRef(userId: string) {
  return doc(requireFirebase().db, 'usuarios', userId);
}

export async function loadProfile(userId: string): Promise<Profile | null> {
  const snapshot = await getDoc(profileRef(userId));
  return snapshot.exists() ? ({ id: userId, ...snapshot.data(), avatar_path: null } as Profile) : null;
}

export async function saveProfile(
  profile: Pick<Profile, 'nome_completo' | 'data_nascimento' | 'apelido'>,
  userId: string,
) {
  await setDoc(profileRef(userId), { ...profile, atualizado_em: new Date().toISOString() }, { merge: true });
  return { id: userId, ...profile, avatar_path: null } as Profile;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Não foi possível abrir essa imagem. Tente outra foto.')); };
    image.src = url;
  });
}

async function toSmallDataUrl(file: File): Promise<string> {
  const image = await loadImage(file);
  const longestSide = Math.max(image.naturalWidth, image.naturalHeight);
  let scale = Math.min(1, 1280 / longestSide);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Não foi possível preparar a imagem neste dispositivo.');

  for (let attempt = 0; attempt < 8; attempt++) {
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.78, 0.62, 0.48, 0.35]) {
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      if (dataUrl.length <= 450 * 1024) return dataUrl;
    }
    scale *= 0.75;
  }
  throw new Error('A imagem é muito grande para salvar no Firestore. Escolha uma foto menor.');
}

export async function uploadAvatar(userId: string, file: File) {
  if (!file.type.startsWith('image/')) throw new Error('Selecione um arquivo de imagem.');
  const image = await toSmallDataUrl(file);
  await setDoc(doc(requireFirebase().db, 'imagens', userId), { image }, { merge: true });
  return image;
}

export async function avatarUrl(image: string | null) {
  if (!image) return null;
  if (image.startsWith('data:image/')) return image;
  const snapshot = await getDoc(doc(requireFirebase().db, 'imagens', image));
  return snapshot.exists() && typeof snapshot.data().image === 'string' ? snapshot.data().image as string : null;
}

export async function loadAvatar(userId: string) {
  const snapshot = await getDoc(doc(requireFirebase().db, 'imagens', userId));
  const image = snapshot.exists() ? snapshot.data().image : null;
  return typeof image === 'string' ? image : null;
}
