import { ref, type Ref } from 'vue'

export interface AppToast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
  duration: number
}

const toasts = ref<AppToast[]>([])
let nextId = 0

function removeToast(id: number) {
  toasts.value = toasts.value.filter((t) => t.id !== id)
}

function addToast(
  message: string,
  type: AppToast['type'],
  duration: number,
) {
  const id = ++nextId
  toasts.value.push({ id, message, type, duration })
  if (duration > 0) {
    setTimeout(() => removeToast(id), duration)
  }
  return id
}

export function useAppToast() {
  return {
    success: (message: string, duration = 3000) => addToast(message, 'success', duration),
    error: (message: string, duration = 5000) => addToast(message, 'error', duration),
    info: (message: string, duration = 3000) => addToast(message, 'info', duration),
  }
}

export function useToastState(): { toasts: Ref<AppToast[]>; removeToast: (id: number) => void } {
  return { toasts, removeToast }
}
