import axios from 'axios'
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'

// 统一响应结构(约定后端/Mock都按这个格式返回)
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

const service: AxiosInstance = axios.create({
  baseURL: '/api', // 开发环境下会被 Mock 拦截，未来接真实后端时改这里或走 Vite 代理
  timeout: 10000
})

// 请求拦截器：统一携带 token
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器：统一处理错误 & 解包 data
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data
    if (res.code !== 200) {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || 'Error'))
    }
    // 直接返回 data，业务代码里就不用每次都写 res.data.data 了
    return res.data
  },
  (error) => {
    ElMessage.error(error.message || '网络错误，请稍后重试')
    return Promise.reject(error)
  }
)

export default service
