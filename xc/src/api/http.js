import axios from 'axios'
import qs from 'qs'
import locales from '../locales'
import Cookies from 'js-cookie'
import {CONFIG} from '../config'
import {optionsToHump, optionsToLine} from '../utils/common'
import {Toast} from 'antd-mobile'

function getLocale() {
  const lang = localStorage.getItem('LANG') || 'zh-cn';
  console.log(lang);
  console.log(locales[lang]);
  return locales[lang]
}

const axiosConfig = {
  baseURL: CONFIG.API_BASE_URL,
  transformRequest: [
    data => {
      if (!data) return data;
      return qs.stringify(optionsToLine(data))
    }
  ], // 对data进行转换处理
  headers: {
    Accept: 'application/json, text/plain, */*',
    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
  },
  timeout: 100000
};
let instance = axios.create(axiosConfig);
let requestCount = 0;

// 添加请求拦截器
instance.interceptors.request.use(
  config => {
    const lang = localStorage.getItem('LANG');
    const locale = getLocale();
    config.headers['LANG'] = lang || 'zh-cn';

    if (config.data && config.data.noLogin) {
      delete config.data.noLogin
    } else {
      config.data = config.data ? config.data : {};
      config.data.openId = Cookies.get('OPENID');
      config.data.token = Cookies.get('TOKEN');
    }
    requestCount++;
    if (requestCount === 1) {
      Toast.loading(locale.ASIDE.LOADING, 10)
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
    requestCount--;
    if (requestCount <= 0) {
      Toast.hide()
    }

    let res = response.data;
    const locale = getLocale();

    // 用户请求需要登录的接口，跳转登录页
    if (res.status === -101) {
      Cookies.remove('OPENID');
      Cookies.remove('TOKEN');
      Cookies.remove('PAY_PASSWORD');
      Cookies.remove('LAST_TIME');
      setTimeout(() => {
        Toast.info(locale.ASIDE.PLEASE_LOGIN_FIRST, 1, () => window.location.href = '/login')
      }, 1000);

      return res
    }

    // 对下划线转驼峰进行处理
    if (res.data) {
      const isArr = res.data instanceof Array;
      if (isArr) {
        res.data = res.data.map(i => optionsToHump(i));
        return res
      }
      res.data = optionsToHump(res.data)
    }

    return res
  },
  error => {
    const locale = getLocale();
    console.log(error);
    Toast.hide();
    Toast.fail(locale.ASIDE.HTTP_ERR)
  }
);

export default instance
