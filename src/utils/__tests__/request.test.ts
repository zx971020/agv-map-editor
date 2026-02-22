import { describe, it, expect, vi, beforeEach } from 'vitest'

const requestInterceptors: { fulfilled: Function; rejected: Function }[] = []
const responseInterceptors: { fulfilled: Function; rejected: Function }[] = []

const mockInstance = {
  interceptors: {
    request: {
      use: vi.fn((fulfilled: Function, rejected: Function) => {
        requestInterceptors.push({ fulfilled, rejected })
      }),
    },
    response: {
      use: vi.fn((fulfilled: Function, rejected: Function) => {
        responseInterceptors.push({ fulfilled, rejected })
      }),
    },
  },
  defaults: { headers: { common: {} } },
}

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockInstance),
  },
}))

vi.mock('element-plus', () => ({
  ElMessage: vi.fn(),
}))

import axios from 'axios'
import { ElMessage } from 'element-plus'

describe('request 工具模块', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('axios.create 配置', () => {
    it('应使用 baseURL 和 timeout: 5000 调用 axios.create', async () => {
      await import('@/utils/request')

      expect(axios.create).toHaveBeenCalledWith({
        baseURL: import.meta.env.VITE_API_BASE_URL,
        timeout: 5000,
      })
    })
  })

  describe('请求拦截器', () => {
    it('应注册请求拦截器', () => {
      expect(requestInterceptors.length).toBeGreaterThanOrEqual(1)
    })

    it('应原样传递 config', () => {
      const { fulfilled } = requestInterceptors[0]
      const config = { url: '/test', method: 'get', headers: { Authorization: 'Bearer token' } }

      const result = fulfilled(config)

      expect(result).toEqual(config)
      expect(result).toBe(config)
    })

    it('请求错误时应 reject 错误', async () => {
      const { rejected } = requestInterceptors[0]
      const error = new Error('request error')
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      await expect(rejected(error)).rejects.toBe(error)
      expect(consoleSpy).toHaveBeenCalledWith(error)

      consoleSpy.mockRestore()
    })
  })

  describe('响应拦截器', () => {
    it('应注册响应拦截器', () => {
      expect(responseInterceptors.length).toBeGreaterThanOrEqual(1)
    })

    it('应提取 response.data（解包响应）', () => {
      const { fulfilled } = responseInterceptors[0]
      const responseData = { code: 200, message: 'ok', data: [1, 2, 3] }
      const response = { data: responseData, status: 200, headers: {} }

      const result = fulfilled(response)

      expect(result).toEqual(responseData)
      expect(result).toBe(responseData)
    })

    it('response.data 为 null 时应返回 null', () => {
      const { fulfilled } = responseInterceptors[0]
      const response = { data: null, status: 200 }

      const result = fulfilled(response)

      expect(result).toBeNull()
    })

    it('response.data 为空对象时应返回空对象', () => {
      const { fulfilled } = responseInterceptors[0]
      const response = { data: {}, status: 200 }

      const result = fulfilled(response)

      expect(result).toEqual({})
    })

    it('响应错误时应调用 ElMessage 显示错误信息', async () => {
      const { rejected } = responseInterceptors[0]
      const error = new Error('Network Error')
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      try {
        await rejected(error)
      } catch {
        // expected
      }

      expect(ElMessage).toHaveBeenCalledWith({
        message: 'Network Error',
        type: 'error',
        duration: 5000,
      })

      consoleSpy.mockRestore()
    })

    it('error.message 为空字符串时应调用 ElMessage 并传入空 message', async () => {
      const { rejected } = responseInterceptors[0]
      const error = new Error('')
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      try {
        await rejected(error)
      } catch {
        // expected
      }

      expect(ElMessage).toHaveBeenCalledWith({
        message: '',
        type: 'error',
        duration: 5000,
      })

      consoleSpy.mockRestore()
    })

    it('响应错误时应 reject 错误', async () => {
      const { rejected } = responseInterceptors[0]
      const error = new Error('Server Error')
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      await expect(rejected(error)).rejects.toBe(error)

      consoleSpy.mockRestore()
    })
  })
})
