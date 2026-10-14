import { ref } from 'vue';
export function useNotice() {
  const message = ref(''); const kind = ref<'error'|'success'>('error');
  function show(text: string, tone: 'error'|'success' = 'error') { message.value = text; kind.value = tone; }
  return { message, kind, show };
}
