import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { useDarkMode } from '@/composables/useDarkMode'

// --- matchMedia mock infrastructure ---

let mediaMatches = false
let mediaChangeHandler: ((e: MediaQueryListEvent) => void) | null = null

function createMatchMediaMock() {
  const addEventListenerMock = vi.fn((event: string, handler: any) => {
    if (event === 'change') {
      mediaChangeHandler = handler
    }
  })
  const removeEventListenerMock = vi.fn((event: string, handler: any) => {
    if (event === 'change' && mediaChangeHandler === handler) {
      mediaChangeHandler = null
    }
  })

  return {
    addEventListenerMock,
    removeEventListenerMock,
    install() {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: vi.fn((query: string) => ({
          matches: mediaMatches,
          media: query,
          onchange: null,
          addEventListener: addEventListenerMock,
          removeEventListener: removeEventListenerMock,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      })
    },
  }
}

function fireMediaChange(matches: boolean) {
  if (mediaChangeHandler) {
    mediaChangeHandler({ matches } as MediaQueryListEvent)
  }
}

// --- withSetup helper ---

function withSetup<T>(composable: () => T) {
  let result!: T
  const comp = defineComponent({
    setup() {
      result = composable()
      return () => null
    },
  })
  const wrapper = mount(comp)
  return { result, wrapper }
}

// --- Reset module-level isDark between tests ---
// isDark is module-level shared state. We need to reset it by importing
// and directly setting it, or by driving it through the composable API.
// We'll use setDarkMode(false) after mount to normalize state.

let matchMediaMock: ReturnType<typeof createMatchMediaMock>

beforeEach(() => {
  // Clear localStorage
  localStorage.clear()

  // Reset DOM class
  document.documentElement.classList.remove('dark')

  // Reset media mock state
  mediaMatches = false
  mediaChangeHandler = null

  // Install fresh matchMedia mock
  matchMediaMock = createMatchMediaMock()
  matchMediaMock.install()
})

// --- Tests ---

describe('useDarkMode', () => {
  describe('initDarkMode (on mount)', () => {
    it('reads "dark" from localStorage and sets isDark to true', async () => {
      localStorage.setItem('theme', 'dark')

      const { result, wrapper } = withSetup(() => useDarkMode())

      expect(result.isDark.value).toBe(true)
      expect(document.documentElement.classList.contains('dark')).toBe(true)

      wrapper.unmount()
    })

    it('reads "light" from localStorage and sets isDark to false', async () => {
      localStorage.setItem('theme', 'light')

      const { result, wrapper } = withSetup(() => useDarkMode())

      expect(result.isDark.value).toBe(false)
      expect(document.documentElement.classList.contains('dark')).toBe(false)

      wrapper.unmount()
    })

    it('falls back to system preference (dark) when no localStorage', async () => {
      mediaMatches = true
      matchMediaMock.install() // re-install with updated matches

      const { result, wrapper } = withSetup(() => useDarkMode())

      expect(result.isDark.value).toBe(true)
      expect(document.documentElement.classList.contains('dark')).toBe(true)

      wrapper.unmount()
    })

    it('falls back to system preference (light) when no localStorage', async () => {
      mediaMatches = false

      const { result, wrapper } = withSetup(() => useDarkMode())

      expect(result.isDark.value).toBe(false)
      expect(document.documentElement.classList.contains('dark')).toBe(false)

      wrapper.unmount()
    })
  })

  describe('toggleDarkMode', () => {
    it('flips isDark from false to true', async () => {
      localStorage.setItem('theme', 'light')

      const { result, wrapper } = withSetup(() => useDarkMode())

      expect(result.isDark.value).toBe(false)

      result.toggleDarkMode()

      expect(result.isDark.value).toBe(true)
      expect(localStorage.getItem('theme')).toBe('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)

      wrapper.unmount()
    })

    it('flips isDark from true to false', async () => {
      localStorage.setItem('theme', 'dark')

      const { result, wrapper } = withSetup(() => useDarkMode())

      expect(result.isDark.value).toBe(true)

      result.toggleDarkMode()

      expect(result.isDark.value).toBe(false)
      expect(localStorage.getItem('theme')).toBe('light')
      expect(document.documentElement.classList.contains('dark')).toBe(false)

      wrapper.unmount()
    })

    it('toggling twice returns to original state', async () => {
      localStorage.setItem('theme', 'light')

      const { result, wrapper } = withSetup(() => useDarkMode())

      const original = result.isDark.value

      result.toggleDarkMode()
      result.toggleDarkMode()

      expect(result.isDark.value).toBe(original)
      expect(localStorage.getItem('theme')).toBe('light')
      expect(document.documentElement.classList.contains('dark')).toBe(false)

      wrapper.unmount()
    })
  })

  describe('setDarkMode', () => {
    it('sets dark mode to true', async () => {
      localStorage.setItem('theme', 'light')

      const { result, wrapper } = withSetup(() => useDarkMode())

      result.setDarkMode(true)

      expect(result.isDark.value).toBe(true)
      expect(localStorage.getItem('theme')).toBe('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)

      wrapper.unmount()
    })

    it('sets dark mode to false', async () => {
      localStorage.setItem('theme', 'dark')

      const { result, wrapper } = withSetup(() => useDarkMode())

      result.setDarkMode(false)

      expect(result.isDark.value).toBe(false)
      expect(localStorage.getItem('theme')).toBe('light')
      expect(document.documentElement.classList.contains('dark')).toBe(false)

      wrapper.unmount()
    })

    it('handles setting the same value (true → true)', async () => {
      localStorage.setItem('theme', 'dark')

      const { result, wrapper } = withSetup(() => useDarkMode())

      expect(result.isDark.value).toBe(true)

      result.setDarkMode(true)

      expect(result.isDark.value).toBe(true)
      expect(localStorage.getItem('theme')).toBe('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)

      wrapper.unmount()
    })

    it('handles setting the same value (false → false)', async () => {
      localStorage.setItem('theme', 'light')

      const { result, wrapper } = withSetup(() => useDarkMode())

      expect(result.isDark.value).toBe(false)

      result.setDarkMode(false)

      expect(result.isDark.value).toBe(false)
      expect(localStorage.getItem('theme')).toBe('light')
      expect(document.documentElement.classList.contains('dark')).toBe(false)

      wrapper.unmount()
    })
  })

  describe('applyTheme (via DOM class)', () => {
    it('adds "dark" class when isDark is true', async () => {
      localStorage.setItem('theme', 'dark')

      const { wrapper } = withSetup(() => useDarkMode())

      expect(document.documentElement.classList.contains('dark')).toBe(true)

      wrapper.unmount()
    })

    it('removes "dark" class when isDark is false', async () => {
      // Pre-add the dark class to verify it gets removed
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'light')

      const { wrapper } = withSetup(() => useDarkMode())

      expect(document.documentElement.classList.contains('dark')).toBe(false)

      wrapper.unmount()
    })
  })

  describe('system theme change listener', () => {
    it('registers a media query change listener on mount', async () => {
      const { wrapper } = withSetup(() => useDarkMode())

      expect(matchMediaMock.addEventListenerMock).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      )

      wrapper.unmount()
    })

    it('follows system theme change when no manual theme is set', async () => {
      // No localStorage theme → composable should follow system
      const { result, wrapper } = withSetup(() => useDarkMode())

      expect(result.isDark.value).toBe(false)

      // Simulate system switching to dark
      fireMediaChange(true)

      expect(result.isDark.value).toBe(true)
      expect(document.documentElement.classList.contains('dark')).toBe(true)

      // Simulate system switching back to light
      fireMediaChange(false)

      expect(result.isDark.value).toBe(false)
      expect(document.documentElement.classList.contains('dark')).toBe(false)

      wrapper.unmount()
    })

    it('ignores system theme change when user has set theme manually', async () => {
      localStorage.setItem('theme', 'light')

      const { result, wrapper } = withSetup(() => useDarkMode())

      expect(result.isDark.value).toBe(false)

      // Simulate system switching to dark — should be ignored
      fireMediaChange(true)

      expect(result.isDark.value).toBe(false)
      expect(document.documentElement.classList.contains('dark')).toBe(false)

      wrapper.unmount()
    })

    it('ignores system theme change after user toggles theme', async () => {
      // Start with no localStorage (follows system)
      const { result, wrapper } = withSetup(() => useDarkMode())

      // User manually toggles → sets localStorage
      result.toggleDarkMode()
      expect(localStorage.getItem('theme')).toBe('dark')

      // Now system change should be ignored
      fireMediaChange(false)

      expect(result.isDark.value).toBe(true)
      expect(document.documentElement.classList.contains('dark')).toBe(true)

      wrapper.unmount()
    })

    it('removes the media query listener on unmount', async () => {
      const { wrapper } = withSetup(() => useDarkMode())

      wrapper.unmount()

      expect(matchMediaMock.removeEventListenerMock).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      )
    })

    it('the removed listener is the same function that was added', async () => {
      const { wrapper } = withSetup(() => useDarkMode())

      wrapper.unmount()

      const addedHandler = matchMediaMock.addEventListenerMock.mock.calls.find(
        (c: any[]) => c[0] === 'change'
      )?.[1]
      const removedHandler = matchMediaMock.removeEventListenerMock.mock.calls.find(
        (c: any[]) => c[0] === 'change'
      )?.[1]

      expect(addedHandler).toBe(removedHandler)
    })
  })

  describe('shared state across multiple instances', () => {
    it('isDark ref is shared between multiple useDarkMode calls', async () => {
      localStorage.setItem('theme', 'light')

      const { result: result1, wrapper: wrapper1 } = withSetup(() => useDarkMode())
      const { result: result2, wrapper: wrapper2 } = withSetup(() => useDarkMode())

      // Both should reference the same ref
      expect(result1.isDark.value).toBe(result2.isDark.value)

      result1.setDarkMode(true)

      expect(result2.isDark.value).toBe(true)

      wrapper1.unmount()
      wrapper2.unmount()
    })
  })
})
