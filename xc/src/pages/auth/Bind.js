import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Button, Toast } from 'antd-mobile'
import Header from '../../components/common/Header'
import openPwdImg from '../../assets/images/open-pwd.png'
import closePwdImg from '../../assets/images/close-pwd.png'
import { isEmail, isMobile, isPassword } from '../../utils/reg'
import { TOAST_DURATION } from '../../utils/constants'
import './Bind.scss'

@inject('userStore')
@observer
class Bind extends Component {
  state = {
    account: '',
    password: '',
    phonePrefix: '86',
    type: 'password'
  }

  onInputChange = (e, key) => {
    const { value } = e.target
    this.setState({ [key]: value })
  }

  onSetType = currentType => {
    this.setState({ type: currentType === 'text' ? 'password' : 'text' })
  }

  onSubmit = () => {
    const { history, userStore } = this.props
    const infoKey = userStore.getInfoKey()
    const { account, password, phonePrefix } = this.state

    // if (!infoKey) {
    //   Toast.fail('授权失效，请返回重试')
    //   return
    // }

    if (!isEmail(account) && !isMobile(account)) {
      Toast.info('账号输入错误', TOAST_DURATION)
      return
    }

    if (!isPassword(password)) {
      Toast.info('密码最少8位，字母加数字', TOAST_DURATION)
      return
    }

    userStore
      .oldUserLogin({
        infoKey,
        userName: account,
        password,
        phonePrefix: isMobile(account) ? phonePrefix : null
      })
      .then(res => {
        if (res.status === 200) {
          Toast.success('授权成功', TOAST_DURATION, () => {
            history.push('/deposit')
          })
          return
        } else {
          Toast.info(res.msg, TOAST_DURATION)
          // Toast.info(res.msg, TOAST_DURATION, () => {
          //   history.push('/zbx-login')
          // })
        }
      })
  }

  render() {
    const { account, password, type } = this.state
    const canSubmit = account === '' || password === ''

    return (
      <div id="bind">
        <Header title="账号绑定" />
        {/* <AccountHeader title="账号绑定" /> */}
        <div className="content">
          <label>
            <input
              className="input-main"
              type="text"
              placeholder="请输入X-PLAN 邮箱/手机号"
              value={account}
              onChange={e => this.onInputChange(e, 'account')}
            />
          </label>
          <label>
            <input
              className="input-main"
              type={type}
              placeholder="密码"
              value={password}
              onChange={e => this.onInputChange(e, 'password')}
            />
            <img
              src={type === 'text' ? openPwdImg : closePwdImg}
              alt=""
              onClick={() => this.onSetType(type)}
            />
          </label>
        </div>

        <div className="btn-box">
          <Button
            activeClassName="active"
            className="primary-button"
            disabled={canSubmit}
            onClick={this.onSubmit}
          >
            确认绑定
          </Button>
        </div>
      </div>
    )
  }
}

export default Bind
