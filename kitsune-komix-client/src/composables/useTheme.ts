import { ref, watch } from 'vue'

const THEME_KEY = 'kk-theme'

function getInitialDark(): boolean {
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === 'light') return false
  if (stored === 'dark') return true
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

const isDark = ref(getInitialDark())

function applyTheme(val: boolean) {
  if (val) {
    document.documentElement.setAttribute('data-theme', 'dark')
    localStorage.setItem(THEME_KEY, 'dark')
  } else {
    document.documentElement.setAttribute('data-theme', 'light')
    localStorage.setItem(THEME_KEY, 'light')
  }
}

applyTheme(isDark.value)

export function useTheme() {
  const toggle = () => {
    isDark.value = !isDark.value
  }

  watch(isDark, (val) => {
    applyTheme(val)
  })

  return { isDark, toggle }
}
