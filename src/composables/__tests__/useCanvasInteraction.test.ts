import { ref, defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useCanvasStore } from '@/stores/canvasStore'
import { useCanvasInteraction } from '@/composables/useCanvasInteraction'

/**
 * 在组件 setup 上下文中执行 composable，
 * 使其能正常访问生命周期钩子（onMounted / onUnmounted）
 */
function withSetup(fn: () => any) {
  let result: any
  const comp = defineComponent({
    setup() {
      result = fn()
      return () => null
    },
  })
  const wrapper = mount(comp)
  return { result, wrapper }
}

/** 创建一个最小化的 stageRef mock */
const createMockStageRef = () => ref({ getStage: () => null })

describe('useCanvasInteraction - 坐标转换', () => {
  let canvasStore: ReturnType<typeof useCanvasStore>
  let screenToCanvas: (sx: number, sy: number) => { x: number; y: number }
  let canvasToScreen: (cx: number, cy: number) => { x: number; y: number }
  let wrapper: any

  beforeEach(() => {
    setActivePinia(createPinia())
    canvasStore = useCanvasStore()
    // 重置视口到默认状态
    canvasStore.setViewport({ x: 0, y: 0, scale: 1 })

    const setup = withSetup(() => {
      return useCanvasInteraction(createMockStageRef(), canvasStore)
    })
    screenToCanvas = setup.result.screenToCanvas
    canvasToScreen = setup.result.canvasToScreen
    wrapper = setup.wrapper
  })

  afterEach(() => {
    wrapper.unmount()
  })

  // ─── 基本恒等变换（原点 + scale=1） ───

  describe('恒等变换 (viewport 在原点, scale=1)', () => {
    it('screenToCanvas: 屏幕 (0,0) → 画布 (0,0)', () => {
      const result = screenToCanvas(0, 0)
      expect(result.x).toBeCloseTo(0)
      expect(result.y).toBeCloseTo(0)
    })

    it('screenToCanvas: Y 轴翻转 — 屏幕 (100, 200) → 画布 (100, -200)', () => {
      const result = screenToCanvas(100, 200)
      expect(result.x).toBeCloseTo(100)
      expect(result.y).toBeCloseTo(-200)
    })

    it('canvasToScreen: 画布 (100, -200) → 屏幕 (100, 200)', () => {
      const result = canvasToScreen(100, -200)
      expect(result.x).toBeCloseTo(100)
      expect(result.y).toBeCloseTo(200)
    })
  })

  // ─── 缩放因子 ───

  describe('缩放因子 (scale=2)', () => {
    beforeEach(() => {
      canvasStore.setViewport({ x: 0, y: 0, scale: 2 })
    })

    it('screenToCanvas: scale=2 应将画布坐标减半', () => {
      const result = screenToCanvas(200, 100)
      expect(result.x).toBeCloseTo(100)
      expect(result.y).toBeCloseTo(-50)
    })

    it('canvasToScreen: scale=2 应将屏幕坐标加倍', () => {
      const result = canvasToScreen(100, -50)
      expect(result.x).toBeCloseTo(200)
      expect(result.y).toBeCloseTo(100)
    })
  })

  // ─── 视口偏移 ───

  describe('视口偏移 (viewport.x=100, viewport.y=50, scale=1)', () => {
    beforeEach(() => {
      canvasStore.setViewport({ x: 100, y: 50, scale: 1 })
    })

    it('screenToCanvas: 偏移应被减去', () => {
      // canvasX = (200 - 100) / 1 = 100
      // canvasY = -(300 - 50) / 1 = -250
      const result = screenToCanvas(200, 300)
      expect(result.x).toBeCloseTo(100)
      expect(result.y).toBeCloseTo(-250)
    })

    it('canvasToScreen: 偏移应被加上', () => {
      // screenX = 100 * 1 + 100 = 200
      // screenY = -(-250) * 1 + 50 = 300
      const result = canvasToScreen(100, -250)
      expect(result.x).toBeCloseTo(200)
      expect(result.y).toBeCloseTo(300)
    })
  })

  // ─── 组合缩放 + 偏移 ───

  describe('组合缩放 + 偏移 (viewport.x=100, viewport.y=50, scale=2)', () => {
    beforeEach(() => {
      canvasStore.setViewport({ x: 100, y: 50, scale: 2 })
    })

    it('screenToCanvas: 组合变换', () => {
      // canvasX = (300 - 100) / 2 = 100
      // canvasY = -(150 - 50) / 2 = -50
      const result = screenToCanvas(300, 150)
      expect(result.x).toBeCloseTo(100)
      expect(result.y).toBeCloseTo(-50)
    })

    it('canvasToScreen: 组合变换', () => {
      // screenX = 100 * 2 + 100 = 300
      // screenY = -(-50) * 2 + 50 = 150
      const result = canvasToScreen(100, -50)
      expect(result.x).toBeCloseTo(300)
      expect(result.y).toBeCloseTo(150)
    })
  })

  // ─── 往返转换 ───

  describe('往返转换 (round-trip)', () => {
    const testCases = [
      { cx: 0, cy: 0 },
      { cx: 100, cy: -200 },
      { cx: -50, cy: 75 },
      { cx: 123.456, cy: -789.012 },
      { cx: 99999, cy: -99999 },
    ]

    const viewports = [
      { x: 0, y: 0, scale: 1 },
      { x: 100, y: 50, scale: 2 },
      { x: -300, y: 200, scale: 0.5 },
      { x: 500, y: -100, scale: 3 },
    ]

    describe('canvasToScreen → screenToCanvas 应返回原始画布坐标', () => {
      for (const vp of viewports) {
        for (const { cx, cy } of testCases) {
          it(`viewport(${vp.x},${vp.y},${vp.scale}) canvas(${cx},${cy})`, () => {
            canvasStore.setViewport(vp)
            const screen = canvasToScreen(cx, cy)
            const back = screenToCanvas(screen.x, screen.y)
            expect(back.x).toBeCloseTo(cx, 5)
            expect(back.y).toBeCloseTo(cy, 5)
          })
        }
      }
    })

    describe('screenToCanvas → canvasToScreen 应返回原始屏幕坐标', () => {
      const screenCases = [
        { sx: 0, sy: 0 },
        { sx: 400, sy: 300 },
        { sx: -100, sy: -200 },
        { sx: 1920, sy: 1080 },
      ]

      for (const vp of viewports) {
        for (const { sx, sy } of screenCases) {
          it(`viewport(${vp.x},${vp.y},${vp.scale}) screen(${sx},${sy})`, () => {
            canvasStore.setViewport(vp)
            const canvas = screenToCanvas(sx, sy)
            const back = canvasToScreen(canvas.x, canvas.y)
            expect(back.x).toBeCloseTo(sx, 5)
            expect(back.y).toBeCloseTo(sy, 5)
          })
        }
      }
    })
  })

  // ─── 负坐标 ───

  describe('负坐标', () => {
    it('screenToCanvas: 负屏幕坐标', () => {
      canvasStore.setViewport({ x: 0, y: 0, scale: 1 })
      const result = screenToCanvas(-100, -200)
      expect(result.x).toBeCloseTo(-100)
      expect(result.y).toBeCloseTo(200)
    })

    it('canvasToScreen: 负画布坐标', () => {
      canvasStore.setViewport({ x: 0, y: 0, scale: 1 })
      const result = canvasToScreen(-100, 200)
      expect(result.x).toBeCloseTo(-100)
      expect(result.y).toBeCloseTo(-200)
    })

    it('负视口偏移', () => {
      canvasStore.setViewport({ x: -200, y: -100, scale: 1 })
      // canvasX = (50 - (-200)) / 1 = 250
      // canvasY = -(50 - (-100)) / 1 = -150
      const result = screenToCanvas(50, 50)
      expect(result.x).toBeCloseTo(250)
      expect(result.y).toBeCloseTo(-150)
    })
  })

  // ─── 零坐标（原点） ───

  describe('零坐标（原点）', () => {
    it('screenToCanvas: 屏幕原点在各种视口下', () => {
      canvasStore.setViewport({ x: 100, y: 200, scale: 2 })
      // canvasX = (0 - 100) / 2 = -50
      // canvasY = -(0 - 200) / 2 = 100
      const result = screenToCanvas(0, 0)
      expect(result.x).toBeCloseTo(-50)
      expect(result.y).toBeCloseTo(100)
    })

    it('canvasToScreen: 画布原点在各种视口下', () => {
      canvasStore.setViewport({ x: 100, y: 200, scale: 2 })
      // screenX = 0 * 2 + 100 = 100
      // screenY = -0 * 2 + 200 = 200
      const result = canvasToScreen(0, 0)
      expect(result.x).toBeCloseTo(100)
      expect(result.y).toBeCloseTo(200)
    })
  })

  // ─── 极小缩放（zoom out） ───

  describe('极小缩放 (scale=0.1)', () => {
    beforeEach(() => {
      canvasStore.setViewport({ x: 0, y: 0, scale: 0.1 })
    })

    it('screenToCanvas: 小缩放放大画布坐标', () => {
      // canvasX = 10 / 0.1 = 100
      // canvasY = -10 / 0.1 = -100
      const result = screenToCanvas(10, 10)
      expect(result.x).toBeCloseTo(100)
      expect(result.y).toBeCloseTo(-100)
    })

    it('canvasToScreen: 小缩放缩小屏幕坐标', () => {
      // screenX = 100 * 0.1 = 10
      // screenY = -(-100) * 0.1 = 10
      const result = canvasToScreen(100, -100)
      expect(result.x).toBeCloseTo(10)
      expect(result.y).toBeCloseTo(10)
    })

    it('往返精度在极小缩放下保持', () => {
      const canvas = screenToCanvas(500, 300)
      const back = canvasToScreen(canvas.x, canvas.y)
      expect(back.x).toBeCloseTo(500, 5)
      expect(back.y).toBeCloseTo(300, 5)
    })
  })

  // ─── 极大缩放（zoom in） ───

  describe('极大缩放 (scale=5.0)', () => {
    beforeEach(() => {
      canvasStore.setViewport({ x: 0, y: 0, scale: 5 })
    })

    it('screenToCanvas: 大缩放缩小画布坐标', () => {
      // canvasX = 500 / 5 = 100
      // canvasY = -500 / 5 = -100
      const result = screenToCanvas(500, 500)
      expect(result.x).toBeCloseTo(100)
      expect(result.y).toBeCloseTo(-100)
    })

    it('canvasToScreen: 大缩放放大屏幕坐标', () => {
      // screenX = 100 * 5 = 500
      // screenY = -(-100) * 5 = 500
      const result = canvasToScreen(100, -100)
      expect(result.x).toBeCloseTo(500)
      expect(result.y).toBeCloseTo(500)
    })

    it('往返精度在极大缩放下保持', () => {
      const canvas = screenToCanvas(123, 456)
      const back = canvasToScreen(canvas.x, canvas.y)
      expect(back.x).toBeCloseTo(123, 5)
      expect(back.y).toBeCloseTo(456, 5)
    })
  })

  // ─── Y 轴翻转行为 ───

  describe('Y 轴翻转', () => {
    beforeEach(() => {
      canvasStore.setViewport({ x: 0, y: 0, scale: 1 })
    })

    it('正画布 Y 映射到负屏幕 Y 方向', () => {
      // canvasY = 100 (正) → screenY = -100 * 1 + 0 = -100
      const result = canvasToScreen(0, 100)
      expect(result.y).toBeCloseTo(-100)
    })

    it('负画布 Y 映射到正屏幕 Y 方向', () => {
      // canvasY = -100 (负) → screenY = -(-100) * 1 + 0 = 100
      const result = canvasToScreen(0, -100)
      expect(result.y).toBeCloseTo(100)
    })

    it('正屏幕 Y 映射到负画布 Y', () => {
      // screenY = 100 → canvasY = -(100 - 0) / 1 = -100
      const result = screenToCanvas(0, 100)
      expect(result.y).toBeCloseTo(-100)
    })

    it('负屏幕 Y 映射到正画布 Y', () => {
      // screenY = -100 → canvasY = -(-100 - 0) / 1 = 100
      const result = screenToCanvas(0, -100)
      expect(result.y).toBeCloseTo(100)
    })

    it('X 轴不翻转', () => {
      const s2c = screenToCanvas(50, 0)
      expect(s2c.x).toBeCloseTo(50)

      const c2s = canvasToScreen(50, 0)
      expect(c2s.x).toBeCloseTo(50)
    })

    it('Y 翻转在有缩放和偏移时仍然成立', () => {
      canvasStore.setViewport({ x: 200, y: 300, scale: 2 })

      // 画布 Y 正 → 屏幕 Y 减小
      const a = canvasToScreen(0, 50)
      const b = canvasToScreen(0, 100)
      expect(b.y).toBeLessThan(a.y)

      // 屏幕 Y 增大 → 画布 Y 减小
      const c = screenToCanvas(0, 100)
      const d = screenToCanvas(0, 200)
      expect(d.y).toBeLessThan(c.y)
    })
  })

  // ─── 响应式：视口变化后转换结果更新 ───

  describe('响应式视口变化', () => {
    it('视口变化后 screenToCanvas 使用新视口', () => {
      canvasStore.setViewport({ x: 0, y: 0, scale: 1 })
      const before = screenToCanvas(100, 100)

      canvasStore.setViewport({ x: 50, y: 50, scale: 2 })
      const after = screenToCanvas(100, 100)

      // 结果应该不同
      expect(after.x).not.toBeCloseTo(before.x)
      expect(after.y).not.toBeCloseTo(before.y)

      // 验证新值
      // canvasX = (100 - 50) / 2 = 25
      // canvasY = -(100 - 50) / 2 = -25
      expect(after.x).toBeCloseTo(25)
      expect(after.y).toBeCloseTo(-25)
    })
  })
})
