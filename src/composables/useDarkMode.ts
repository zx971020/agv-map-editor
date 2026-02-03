// 深色模式 Composable
import { ref, onMounted } from 'vue'

const isDark = ref(false)

export function useDarkMode() {
  // 初始化深色模式
  const initDarkMode = () => {
    // 从 localStorage 读取用户偏好
    const stored = localStorage.getItem('theme')

    if (stored) {
      isDark.value = stored === 'dark'
    } else {
      // 检测系统偏好
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }

    applyTheme()
  }

  // 应用主题
  const applyTheme = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // 切换深色模式
  const toggleDarkMode = () => {
    isDark.value = !isDark.value
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    applyTheme()
  }

  // 设置深色模式
  const setDarkMode = (value: boolean) => {
    isDark.value = value
    localStorage.setItem('theme', value ? 'dark' : 'light')
    applyTheme()
  }

  // 监听系统主题变化
  onMounted(() => {
    initDarkMode()

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        isDark.value = e.matches
        applyTheme()
      }
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  })

  return {
    isDark,
    toggleDarkMode,
    setDarkMode,
  }
}
