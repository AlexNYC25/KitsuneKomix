import { ref, watch } from 'vue'

const THEME_KEY = 'kk-theme'
const isDark = ref(true)

const stored = localStorage.getItem(THEME_KEY)
isDark.value = stored !== 'light'
if (stored === 'light') {
  document.documentElement.setAttribute('data-theme', 'light')
}

export function useTheme() {
  const toggle = () => {
    isDark.value = !isDark.value
  }

  watch(isDark, (val) => {
    if (val) {
      document.documentElement.removeAttribute('data-theme')
      localStorage.setItem(THEME_KEY, 'dark')
    } else {
      document.documentElement.setAttribute('data-theme', 'light')
      localStorage.setItem(THEME_KEY, 'light')
    }
  })

  return { isDark, toggle }
}
