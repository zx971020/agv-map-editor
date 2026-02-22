import { cn } from '@/lib/utils'

describe('cn (className merge utility)', () => {
  it('合并多个类名', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2')
  })

  it('处理空字符串', () => {
    expect(cn('')).toBe('')
  })

  it('无参数时返回空字符串', () => {
    expect(cn()).toBe('')
  })

  it('过滤 falsy 值', () => {
    expect(cn('px-4', false, null, undefined, 0, 'py-2')).toBe('px-4 py-2')
  })

  it('条件类名', () => {
    const isActive = true
    const isDisabled = false
    expect(cn('btn', isActive && 'btn-active', isDisabled && 'btn-disabled')).toBe('btn btn-active')
  })

  it('Tailwind 冲突解决：后者覆盖前者', () => {
    expect(cn('px-4', 'px-8')).toBe('px-8')
  })

  it('Tailwind 冲突解决：不同属性保留', () => {
    expect(cn('px-4', 'py-8')).toBe('px-4 py-8')
  })

  it('Tailwind 冲突解决：bg 颜色覆盖', () => {
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500')
  })

  it('处理数组输入', () => {
    expect(cn(['px-4', 'py-2'])).toBe('px-4 py-2')
  })

  it('处理对象输入', () => {
    expect(cn({ 'px-4': true, 'py-2': true, 'mx-4': false })).toBe('px-4 py-2')
  })

  it('复杂混合输入', () => {
    const result = cn(
      'base-class',
      ['array-class'],
      { 'object-class': true, 'hidden-class': false },
      'final-class'
    )
    expect(result).toContain('base-class')
    expect(result).toContain('array-class')
    expect(result).toContain('object-class')
    expect(result).not.toContain('hidden-class')
    expect(result).toContain('final-class')
  })
})
