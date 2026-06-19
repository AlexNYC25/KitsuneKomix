export interface AppToast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
  duration: number
}
