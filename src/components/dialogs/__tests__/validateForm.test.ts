/**
 * PathFormDialog validateForm 逻辑的单元测试
 *
 * 由于组件依赖 el-dialog、NodeSelect 等难以在测试中挂载的组件，
 * 这里将验证逻辑提取为纯函数进行独立测试。
 */

// --- 类型定义（与组件内部一致） ---

interface PathFormData {
  startNode: number | null
  endNode: number | null
  lineType: number
  cpx: number | undefined | null
  cpy: number | undefined | null
}

interface FormErrors {
  startNode: string
  endNode: string
  cpx: string
  cpy: string
}

interface NodeLike {
  node: number
}

// --- 从组件中提取的纯验证函数（逻辑完全一致） ---

function validateForm(formData: PathFormData, errors: FormErrors, nodes: NodeLike[]): boolean {
  let isValid = true

  // 重置错误
  errors.startNode = ''
  errors.endNode = ''
  errors.cpx = ''
  errors.cpy = ''

  // 验证起始节点
  if (formData.startNode === null) {
    errors.startNode = '请选择起始节点'
    isValid = false
  }

  // 验证结束节点
  if (formData.endNode === null) {
    errors.endNode = '请选择结束节点'
    isValid = false
  }

  // 验证节点不能相同
  if (formData.startNode !== null && formData.endNode !== null) {
    if (formData.startNode === formData.endNode) {
      errors.endNode = '起始节点和结束节点不能相同'
      isValid = false
    }
  }

  // 验证节点是否存在
  if (formData.startNode !== null) {
    const startNodeExists = nodes.some(n => n.node === formData.startNode)
    if (!startNodeExists) {
      errors.startNode = '起始节点不存在'
      isValid = false
    }
  }

  if (formData.endNode !== null) {
    const endNodeExists = nodes.some(n => n.node === formData.endNode)
    if (!endNodeExists) {
      errors.endNode = '结束节点不存在'
      isValid = false
    }
  }

  // 验证弧线控制点
  if (formData.lineType === 1) {
    if (formData.cpx === undefined || formData.cpx === null || isNaN(formData.cpx)) {
      errors.cpx = '弧线路径必须输入控制点 X 坐标'
      isValid = false
    }
    if (formData.cpy === undefined || formData.cpy === null || isNaN(formData.cpy)) {
      errors.cpy = '弧线路径必须输入控制点 Y 坐标'
      isValid = false
    }
  }

  return isValid
}

// --- 测试辅助函数 ---

function makeErrors(): FormErrors {
  return { startNode: '', endNode: '', cpx: '', cpy: '' }
}

const defaultNodes: NodeLike[] = [{ node: 1 }, { node: 2 }, { node: 3 }]

// --- 测试 ---

describe('PathFormDialog validateForm', () => {
  describe('节点必填验证', () => {
    it('两个节点都为 null 时，设置两个错误并返回 false', () => {
      const errors = makeErrors()
      const result = validateForm(
        { startNode: null, endNode: null, lineType: 0, cpx: undefined, cpy: undefined },
        errors,
        defaultNodes
      )

      expect(result).toBe(false)
      expect(errors.startNode).toBe('请选择起始节点')
      expect(errors.endNode).toBe('请选择结束节点')
    })

    it('仅 startNode 为 null 时，设置 startNode 错误并返回 false', () => {
      const errors = makeErrors()
      const result = validateForm(
        { startNode: null, endNode: 2, lineType: 0, cpx: undefined, cpy: undefined },
        errors,
        defaultNodes
      )

      expect(result).toBe(false)
      expect(errors.startNode).toBe('请选择起始节点')
      expect(errors.endNode).toBe('')
    })

    it('仅 endNode 为 null 时，设置 endNode 错误并返回 false', () => {
      const errors = makeErrors()
      const result = validateForm(
        { startNode: 1, endNode: null, lineType: 0, cpx: undefined, cpy: undefined },
        errors,
        defaultNodes
      )

      expect(result).toBe(false)
      expect(errors.startNode).toBe('')
      expect(errors.endNode).toBe('请选择结束节点')
    })
  })

  describe('节点有效性验证', () => {
    it('两个节点都存在且不同时，返回 true 且无错误', () => {
      const errors = makeErrors()
      const result = validateForm(
        { startNode: 1, endNode: 2, lineType: 0, cpx: undefined, cpy: undefined },
        errors,
        defaultNodes
      )

      expect(result).toBe(true)
      expect(errors.startNode).toBe('')
      expect(errors.endNode).toBe('')
      expect(errors.cpx).toBe('')
      expect(errors.cpy).toBe('')
    })

    it('起始节点和结束节点相同时，设置 endNode 错误', () => {
      const errors = makeErrors()
      const result = validateForm(
        { startNode: 1, endNode: 1, lineType: 0, cpx: undefined, cpy: undefined },
        errors,
        defaultNodes
      )

      expect(result).toBe(false)
      expect(errors.endNode).toBe('起始节点和结束节点不能相同')
    })

    it('起始节点不存在于节点列表中时，设置 startNode 错误', () => {
      const errors = makeErrors()
      const result = validateForm(
        { startNode: 999, endNode: 2, lineType: 0, cpx: undefined, cpy: undefined },
        errors,
        defaultNodes
      )

      expect(result).toBe(false)
      expect(errors.startNode).toBe('起始节点不存在')
      expect(errors.endNode).toBe('')
    })

    it('结束节点不存在于节点列表中时，设置 endNode 错误', () => {
      const errors = makeErrors()
      const result = validateForm(
        { startNode: 1, endNode: 888, lineType: 0, cpx: undefined, cpy: undefined },
        errors,
        defaultNodes
      )

      expect(result).toBe(false)
      expect(errors.startNode).toBe('')
      expect(errors.endNode).toBe('结束节点不存在')
    })

    it('两个节点都不存在时，两个都设置"不存在"错误', () => {
      const errors = makeErrors()
      const result = validateForm(
        { startNode: 999, endNode: 888, lineType: 0, cpx: undefined, cpy: undefined },
        errors,
        defaultNodes
      )

      expect(result).toBe(false)
      expect(errors.startNode).toBe('起始节点不存在')
      expect(errors.endNode).toBe('结束节点不存在')
    })
  })

  describe('直线路径（lineType=0）控制点验证', () => {
    it('直线路径时 cpx/cpy 为 undefined 不报错', () => {
      const errors = makeErrors()
      const result = validateForm(
        { startNode: 1, endNode: 2, lineType: 0, cpx: undefined, cpy: undefined },
        errors,
        defaultNodes
      )

      expect(result).toBe(true)
      expect(errors.cpx).toBe('')
      expect(errors.cpy).toBe('')
    })
  })

  describe('弧线路径（lineType=1）控制点验证', () => {
    it('cpx 为 undefined 时，设置 cpx 错误', () => {
      const errors = makeErrors()
      const result = validateForm(
        { startNode: 1, endNode: 2, lineType: 1, cpx: undefined, cpy: 10 },
        errors,
        defaultNodes
      )

      expect(result).toBe(false)
      expect(errors.cpx).toBe('弧线路径必须输入控制点 X 坐标')
      expect(errors.cpy).toBe('')
    })

    it('cpy 为 undefined 时，设置 cpy 错误', () => {
      const errors = makeErrors()
      const result = validateForm(
        { startNode: 1, endNode: 2, lineType: 1, cpx: 10, cpy: undefined },
        errors,
        defaultNodes
      )

      expect(result).toBe(false)
      expect(errors.cpx).toBe('')
      expect(errors.cpy).toBe('弧线路径必须输入控制点 Y 坐标')
    })

    it('cpx 为 NaN 时，设置 cpx 错误', () => {
      const errors = makeErrors()
      const result = validateForm(
        { startNode: 1, endNode: 2, lineType: 1, cpx: NaN, cpy: 10 },
        errors,
        defaultNodes
      )

      expect(result).toBe(false)
      expect(errors.cpx).toBe('弧线路径必须输入控制点 X 坐标')
    })

    it('cpy 为 NaN 时，设置 cpy 错误', () => {
      const errors = makeErrors()
      const result = validateForm(
        { startNode: 1, endNode: 2, lineType: 1, cpx: 10, cpy: NaN },
        errors,
        defaultNodes
      )

      expect(result).toBe(false)
      expect(errors.cpy).toBe('弧线路径必须输入控制点 Y 坐标')
    })

    it('cpx 为 null 时，设置 cpx 错误', () => {
      const errors = makeErrors()
      const result = validateForm(
        { startNode: 1, endNode: 2, lineType: 1, cpx: null, cpy: 10 },
        errors,
        defaultNodes
      )

      expect(result).toBe(false)
      expect(errors.cpx).toBe('弧线路径必须输入控制点 X 坐标')
    })

    it('cpx 和 cpy 都为有效数字时，无错误', () => {
      const errors = makeErrors()
      const result = validateForm(
        { startNode: 1, endNode: 2, lineType: 1, cpx: 50, cpy: 75 },
        errors,
        defaultNodes
      )

      expect(result).toBe(true)
      expect(errors.cpx).toBe('')
      expect(errors.cpy).toBe('')
    })

    it('cpx=0, cpy=0 是有效坐标', () => {
      const errors = makeErrors()
      const result = validateForm(
        { startNode: 1, endNode: 2, lineType: 1, cpx: 0, cpy: 0 },
        errors,
        defaultNodes
      )

      expect(result).toBe(true)
      expect(errors.cpx).toBe('')
      expect(errors.cpy).toBe('')
    })

    it('负数控制点坐标是有效的', () => {
      const errors = makeErrors()
      const result = validateForm(
        { startNode: 1, endNode: 2, lineType: 1, cpx: -100.5, cpy: -200.3 },
        errors,
        defaultNodes
      )

      expect(result).toBe(true)
      expect(errors.cpx).toBe('')
      expect(errors.cpy).toBe('')
    })
  })

  describe('多重错误场景', () => {
    it('节点为 null + 弧线缺少控制点时，同时报告所有错误', () => {
      const errors = makeErrors()
      const result = validateForm(
        { startNode: null, endNode: null, lineType: 1, cpx: undefined, cpy: undefined },
        errors,
        defaultNodes
      )

      expect(result).toBe(false)
      expect(errors.startNode).toBe('请选择起始节点')
      expect(errors.endNode).toBe('请选择结束节点')
      expect(errors.cpx).toBe('弧线路径必须输入控制点 X 坐标')
      expect(errors.cpy).toBe('弧线路径必须输入控制点 Y 坐标')
    })
  })

  describe('错误重置行为', () => {
    it('验证前会清除之前的错误信息', () => {
      const errors: FormErrors = {
        startNode: '旧的起始节点错误',
        endNode: '旧的结束节点错误',
        cpx: '旧的 cpx 错误',
        cpy: '旧的 cpy 错误',
      }

      // 使用有效数据验证
      const result = validateForm(
        { startNode: 1, endNode: 2, lineType: 0, cpx: undefined, cpy: undefined },
        errors,
        defaultNodes
      )

      expect(result).toBe(true)
      expect(errors.startNode).toBe('')
      expect(errors.endNode).toBe('')
      expect(errors.cpx).toBe('')
      expect(errors.cpy).toBe('')
    })

    it('第二次验证会清除第一次的错误再重新设置', () => {
      const errors = makeErrors()

      // 第一次验证：触发 startNode 错误
      validateForm(
        { startNode: null, endNode: 2, lineType: 0, cpx: undefined, cpy: undefined },
        errors,
        defaultNodes
      )
      expect(errors.startNode).toBe('请选择起始节点')

      // 第二次验证：触发 endNode 错误，startNode 应被清除
      validateForm(
        { startNode: 1, endNode: null, lineType: 0, cpx: undefined, cpy: undefined },
        errors,
        defaultNodes
      )
      expect(errors.startNode).toBe('')
      expect(errors.endNode).toBe('请选择结束节点')
    })
  })
})
