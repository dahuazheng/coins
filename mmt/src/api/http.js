import axios from 'axios'
import qs from 'qs'
import Cookies from 'js-cookie'
import CONFIG from '../config'
import { optionsToHump, optionsToLine } from '../utils/common'
import { Toast } from 'antd-mobile'
import { TOAST_DURATION } from '../utils/constants'

const requestToast = Toast
const axiosConfig = {
  baseURL: CONFIG.API_BASE_URL,
  transformRequest: [
    data => {
      if (!data) return data
      return qs.stringify(optionsToLine(data))
    }
  ], // 对data进行转换处理
  headers: {
    Accept: 'application/json, text/plain, */*',
    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    LANG: 'zh-cn'
  },
  timeout: 100000
}

let instance = axios.create(axiosConfig)
let requestCount = 0
let timer

// 添加请求拦截器
instance.interceptors.request.use(
  config => {
    const locale = localStorage.getItem('LOCALE')

    config.headers['LANG'] = locale === 'zh_CN' ? 'zh-cn' : 'en-us'
    // console.log(config.headers)
    if (config.data && config.data.noLogin) {
      delete config.data.noLogin
    } else {
      config.data = config.data ? config.data : {}
      config.data.openId = Cookies.get('OPENID')
      config.data.token = Cookies.get('TOKEN')
    }
    // config.data.lang = 'zh_CN'
    requestCount++
    if (requestCount === 1) {
      const msg = locale === 'zh_CN' ? '请稍后...' : 'Loading...'
      requestToast.loading(msg, 10)
    }
    return config
  },
  error => {
    // 对请求错误做些什么
    return Promise.reject(error)
  }
)

// 添加响应拦截器
instance.interceptors.response.use(
  response => {
    let res = response.data

    requestCount--
    if (requestCount <= 0) {
      requestToast.hide()
      clearTimeout(timer)
    }

    // 用户请求需要登录的接口，跳转登录页
    if (res.status === -101) {
      Cookies.remove('OPENID')
      Cookies.remove('TOKEN')
      Cookies.remove('PAY_PASSWORD')
      const locale = localStorage.getItem('LOCALE')
      const msg = locale === 'zh_CN' ? '请先登录' : 'Please sign in first.'
      Toast.info(msg, TOAST_DURATION, () => (window.location.href = '/login'))
      return res
    }

    // 对下划线转驼峰进行处理
    if (res.data) {
      const isArr = res.data instanceof Array
      if (isArr) {
        res.data = res.data.map(i => optionsToHump(i))
        return res
      }
      res.data = optionsToHump(res.data)
    }
    return res
  },
  error => {
    console.log(error)
  }
)

export default instance
