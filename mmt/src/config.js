// MMT正式站访问地址：https://mmt.mastermix.io/
// MMT测试站访问地址：http://47.75.138.157:8091

/**
 * @description 开关配置，打包前修改配置
 *
 * PROJECT String 项目名（XC|NTTC）
 * ONLINE bool 线上版本
 * */

const ONLINE = true

const CONFIG = {
  PROD: {
    API_BASE_URL: 'https://mmt-api.mastermix.io/api'
  },
  DEV: {
    // API_BASE_URL: 'http://47.75.138.157:8090/api',
    API_BASE_URL: 'http://47.75.196.141:8090/api'
  }
}

export default ONLINE ? CONFIG.PROD : CONFIG.DEV
