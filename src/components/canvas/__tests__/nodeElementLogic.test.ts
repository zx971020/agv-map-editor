/**
 * Tests for getNodeColor and getIconText logic from NodeElement.vue
 *
 * These pure functions are replicated here for direct unit testing
 * since they are defined inside the component's <script setup>.
 */

// --- Replicated functions from NodeElement.vue ---

const getNodeColor = (type: number): { fill: string; stroke: string; dark: string } => {
  const colorMap: Record<number, { fill: string; stroke: string; dark: string }> = {
    1: { fill: '#3B82F6', stroke: '#2563EB', dark: '#1E40AF' },
    2: { fill: '#8B5CF6', stroke: '#7C3AED', dark: '#6D28D9' },
    3: { fill: '#10B981', stroke: '#059669', dark: '#047857' },
    4: { fill: '#F59E0B', stroke: '#D97706', dark: '#B45309' },
    5: { fill: '#EF4444', stroke: '#DC2626', dark: '#B91C1C' },
    6: { fill: '#06B6D4', stroke: '#0891B2', dark: '#0E7490' },
    7: { fill: '#6B7280', stroke: '#4B5563', dark: '#374151' },
    12: { fill: '#EC4899', stroke: '#DB2777', dark: '#BE185D' },
  }
  return colorMap[type] || { fill: '#3B82F6', stroke: '#2563EB', dark: '#1E40AF' }
}

const getIconText = (type: number): string => {
  const iconMap: Record<number, string> = {
    1: '工',
    2: '人',
    3: '充',
    4: '机',
    5: '门',
    6: '停',
    7: '路',
    12: '货',
  }
  return iconMap[type] || '?'
}

// --- Constants ---

const MAPPED_TYPES = [1, 2, 3, 4, 5, 6, 7, 12] as const
const UNMAPPED_TYPES = [0, 8, 9, 10, 11, 13, -1, 100]
const DEFAULT_COLOR = { fill: '#3B82F6', stroke: '#2563EB', dark: '#1E40AF' }
const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/

// --- Tests ---

describe('getNodeColor', () => {
  describe('mapped types return correct colors', () => {
    it.each([
      [1, { fill: '#3B82F6', stroke: '#2563EB', dark: '#1E40AF' }],
      [2, { fill: '#8B5CF6', stroke: '#7C3AED', dark: '#6D28D9' }],
      [3, { fill: '#10B981', stroke: '#059669', dark: '#047857' }],
      [4, { fill: '#F59E0B', stroke: '#D97706', dark: '#B45309' }],
      [5, { fill: '#EF4444', stroke: '#DC2626', dark: '#B91C1C' }],
      [6, { fill: '#06B6D4', stroke: '#0891B2', dark: '#0E7490' }],
      [7, { fill: '#6B7280', stroke: '#4B5563', dark: '#374151' }],
      [12, { fill: '#EC4899', stroke: '#DB2777', dark: '#BE185D' }],
    ])('type %i returns correct fill/stroke/dark', (type, expected) => {
      expect(getNodeColor(type)).toEqual(expected)
    })
  })

  describe('unmapped types return default blue color', () => {
    it('type 0 returns default', () => {
      expect(getNodeColor(0)).toEqual(DEFAULT_COLOR)
    })

    it.each(UNMAPPED_TYPES)('type %i returns default', type => {
      expect(getNodeColor(type)).toEqual(DEFAULT_COLOR)
    })
  })

  describe('default fallback structure', () => {
    it('has all three properties: fill, stroke, dark', () => {
      const result = getNodeColor(999)
      expect(result).toHaveProperty('fill')
      expect(result).toHaveProperty('stroke')
      expect(result).toHaveProperty('dark')
    })
  })

  describe('color format validation', () => {
    it.each(MAPPED_TYPES)('type %i fill is a valid hex color', type => {
      expect(getNodeColor(type).fill).toMatch(HEX_COLOR_REGEX)
    })

    it.each(MAPPED_TYPES)('type %i stroke is a valid hex color', type => {
      expect(getNodeColor(type).stroke).toMatch(HEX_COLOR_REGEX)
    })

    it.each(MAPPED_TYPES)('type %i dark is a valid hex color', type => {
      expect(getNodeColor(type).dark).toMatch(HEX_COLOR_REGEX)
    })

    it('default fill is a valid hex color', () => {
      expect(getNodeColor(0).fill).toMatch(HEX_COLOR_REGEX)
    })

    it('default stroke is a valid hex color', () => {
      expect(getNodeColor(0).stroke).toMatch(HEX_COLOR_REGEX)
    })

    it('default dark is a valid hex color', () => {
      expect(getNodeColor(0).dark).toMatch(HEX_COLOR_REGEX)
    })
  })

  describe('uniqueness', () => {
    it('all mapped types have unique fill colors', () => {
      const fills = MAPPED_TYPES.map(t => getNodeColor(t).fill)
      expect(new Set(fills).size).toBe(MAPPED_TYPES.length)
    })

    it('all mapped types have unique stroke colors', () => {
      const strokes = MAPPED_TYPES.map(t => getNodeColor(t).stroke)
      expect(new Set(strokes).size).toBe(MAPPED_TYPES.length)
    })
  })

  describe('stroke differs from fill', () => {
    it.each(MAPPED_TYPES)('type %i stroke is different from fill', type => {
      const color = getNodeColor(type)
      expect(color.stroke).not.toBe(color.fill)
    })
  })
})

describe('getIconText', () => {
  describe('mapped types return correct Chinese characters', () => {
    it.each([
      [1, '工'],
      [2, '人'],
      [3, '充'],
      [4, '机'],
      [5, '门'],
      [6, '停'],
      [7, '路'],
      [12, '货'],
    ])('type %i returns "%s"', (type, expected) => {
      expect(getIconText(type)).toBe(expected)
    })
  })

  describe('unmapped types return "?"', () => {
    it.each(UNMAPPED_TYPES)('type %i returns "?"', type => {
      expect(getIconText(type)).toBe('?')
    })
  })

  describe('icon character validation', () => {
    it.each(MAPPED_TYPES)('type %i icon is a single character', type => {
      expect(getIconText(type)).toHaveLength(1)
    })

    it('fallback "?" is a single character', () => {
      expect(getIconText(0)).toHaveLength(1)
    })
  })

  describe('uniqueness', () => {
    it('all mapped icons are unique', () => {
      const icons = MAPPED_TYPES.map(t => getIconText(t))
      expect(new Set(icons).size).toBe(MAPPED_TYPES.length)
    })
  })
})
