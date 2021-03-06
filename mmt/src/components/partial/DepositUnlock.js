import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'
import { Button, Toast } from 'antd-mobile'
import Header from '../common/Header'
import { formatCoinPrice, formatSpecialOffer } from '../../utils/format'
import openPwdImg from '../../assets/images/open-pwd.png'
import closePwdImg from '../../assets/images/close-pwd.png'
import { USDT_POINT_LENGTH } from '../../utils/constants'
import './DepositUnlock.scss'

@inject('localeStore')
@inject('productStore')
@inject('userStore')
@observer
class DepositUnlock extends Component {
  state = {
    showConfirm: false,
    payPassword: '',
    pwdType: 'password'
  }

  onInputChange = (e, key) => {
    const { value } = e.target
    this.setState({ [key]: value })
  }

  onSetType = currentType => {
    this.setState({ pwdType: currentType === 'text' ? 'password' : 'text' })
  }

  onDeposit = amount => {
    this.setState({ showConfirm: true })
    // const reg = /^[0-9]*[1-9][0-9]*$/
    // if (!reg.test(amount)) {
    //   Toast.info('认购数量需为正整数')
    //   return
    // }
    // if (amount) this.setState({showConfirm: true})
  }

  onSubmit = () => {
    const { history, userStore, productStore } = this.props
    const { payPassword } = this.state
    userStore
      .getPayToken({ payPassword })
      .then(res => {
        if (res.status !== 1) {
          Toast.info(res.msg)
          return
        }
        return res.data.token
      })
      .then(payToken => {
        if (!payToken) return
        productStore.createSpecialOrder(payToken).then(res => {
          if (res.status !== 1) {
            Toast.info(res.msg)
            return
          }
          history.push({ pathname: '/deposit/result', state: 'unLock' })
        })
      })
  }

  render() {
    const { showConfirm, payPassword, pwdType } = this.state
    const { show, productStore, localeStore } = this.props
    const {
      productDetail,
      unLockAmount
      // totalAmount,
    } = productStore
    const { COMMON, DEPOSIT, HOME } = localeStore.language || {}
    const {
      productName,
      serviceCharge,
      specialOffer,
      userSpecial,
      userBalance
    } = productDetail

    return (
      <div className={`deposit-unlock ${show ? 'show' : ''}`}>
        <section className="content-detail">
          <h1>{userSpecial}</h1>
          <span>{DEPOSIT.AVAILABLE_MUSDT_UNLOCK}</span>
          <br />
          <Link to="/home/bargain">{DEPOSIT.CHECK_DETAILS}</Link>
        </section>
        <section className="content-charge">
          <p>
            {productName || '--'}/{HOME.MUSDT_AVAILABLE}:
            {formatSpecialOffer(specialOffer)}
          </p>
          <label>
            {/*<input*/}
            {/*type="text"*/}
            {/*placeholder="输入解锁数量"*/}
            {/*value={unLockAmount}*/}
            {/*onChange={e => onAmountChange(e)}*/}
            {/*/>*/}
            {/*<span*/}
            {/*className="all"*/}
            {/*onClick={() => productStore.addAllUnLockAmount()}>*/}
            {/*全部*/}
            {/*</span>*/}
            <input
              type="text"
              placeholder={DEPOSIT.ENTER_UNLOCK_AMOUNT}
              value={userSpecial}
              readOnly
              onChange={e => productStore.onAmountChange(e.target.value)}
            />
          </label>
          <label>
            <small>
              USDT {DEPOSIT.BALANCE}：
              {formatCoinPrice(userBalance, USDT_POINT_LENGTH)}
            </small>
            <small>
              {DEPOSIT.FEES}：{serviceCharge * 100}%
            </small>
          </label>
          <h3>
            <span>{DEPOSIT.TRADING_AMOUNT}（USDT）</span>
            <span>
              {formatCoinPrice(specialOffer * userSpecial, USDT_POINT_LENGTH)}
            </span>
          </h3>
        </section>
        <Button
          className="primary-button"
          activeClassName="active"
          disabled={!userSpecial}
          onClick={() => this.onDeposit(unLockAmount)}
        >
          {DEPOSIT.SUBSCRIBE}
        </Button>

        {/*解锁弹窗*/}
        <div className={`confirm-wrapper ${showConfirm ? 'show' : ''}`}>
          <div className="content-box">
            <Header
              isShadow
              title={DEPOSIT.CONFIRM_PAYMENT}
              icon={require('../../assets/images/close.png')}
              onHandle={() => this.setState({ showConfirm: false })}
            />
            <div className="content">
              <p className="deposit-price">
                <span>{DEPOSIT.TOTAL_PAYMENT}（USDT）</span>
                <span>
                  {formatCoinPrice(
                    specialOffer * userSpecial,
                    USDT_POINT_LENGTH
                  )}
                </span>
              </p>
              <p className="service-charge">
                <span>
                  {DEPOSIT.FEE}
                  {serviceCharge * 100}%
                </span>
                <span>
                  {formatCoinPrice(specialOffer * userSpecial * serviceCharge)}
                </span>
              </p>
              <p>
                <span>{DEPOSIT.AVAILABLE}</span>
                <span>{formatCoinPrice(userBalance, USDT_POINT_LENGTH)}</span>
              </p>
              <p className="service-charge">*{DEPOSIT.AMOUNT_TO_DEDUCT}</p>
              <div className="input-box">
                <input
                  type={pwdType}
                  placeholder={DEPOSIT.PLEASE_ENTER_PAY_PASSWORD}
                  value={payPassword}
                  onChange={e => this.onInputChange(e, 'payPassword')}
                />
                <img
                  src={pwdType === 'text' ? openPwdImg : closePwdImg}
                  alt="eyes"
                  onClick={() => this.onSetType(pwdType)}
                />
              </div>
            </div>
            <Button
              activeClassName="btn-common__active"
              className="primary-button"
              onClick={this.onSubmit}
            >
              {COMMON.CONFIRM}
            </Button>
          </div>
        </div>
      </div>
    )
  }
}

export default withRouter(DepositUnlock)
