import React, {Component} from 'react'
import {Link} from 'react-router-dom'
import {inject, observer} from 'mobx-react'
import Header from '../../components/common/Header'
import WalletCard from '../../components/partial/WalletCard'
import walletToLoginImg from '../../assets/images/wallet-to-login.png'
import walletZbsImg from '../../assets/images/wallet-zbs.png'
import walletUsdtImg from '../../assets/images/wallet-usdt.png'
import {COMMON_ASSET} from '../../assets'
import './Index.scss'

const USDT_CARD = {
  bgImg: walletUsdtImg,
  name: 'USDT',
  asset: '',
  rechargeUrl: '/wallet/recharge/USDT',
  withdrawUrl: '/wallet/withdraw/USDT',
  link: '/wallet/usdt'
}

const WALLET_CARD = {
  bgImg: walletZbsImg,
  name: COMMON_ASSET.COIN_NAME,
  asset: '',
  locked: '',
  rechargeUrl: '/wallet/recharge/',
  withdrawUrl: '/wallet/withdraw/',
  link: '/wallet/coin/',
  productId: ''
}

class CardList extends Component {
  render() {
    const {cards} = this.props
    return (
      <ul className="cards-warp">
        {cards.map(card => (
          <li key={card.name}>
            <WalletCard card={card}/>
          </li>
        ))}
      </ul>
    )
  }
}

@inject('localeStore')
@observer
class ToLogin extends Component {
  render() {
    const {localeStore} = this.props
    const {WALLET} = localeStore.language || {}
    return (
      <div className="login-warp">
        <main>
          <img src={walletToLoginImg} alt="去登录"/>
          <p>{WALLET.SIGNIN_TO_OPERATE}</p>
        </main>
        <aside>
          <Link to="/login">{WALLET.TO_LOGIN}</Link>
        </aside>
      </div>
    )
  }

}

@inject('localeStore')
@inject('userStore')
@inject('personStore')
@inject('walletStore')
@observer
class Index extends Component {
  state = {
    cards: []
  }

  componentDidMount() {
    this.getProductCards().then()
  }

  getProductCards = async () => {
    const {personStore, walletStore} = this.props
    await personStore.getUserInfo()
    await walletStore.getWallets()
    const {userInfo} = personStore
    const {wallets} = walletStore
    const cards = []
    cards.push({
      ...USDT_CARD,
      asset: userInfo.balance
    })
    const walletCards = wallets.map(wallet => {
      return {
        ...WALLET_CARD,
        name: wallet.productName,
        rechargeUrl: '/wallet/recharge/' + wallet.productName,
        withdrawUrl: '/wallet/withdraw/' + wallet.productName,
        asset: wallet.data.amount,
        locked: wallet.data.locked,
        productId: wallet.productId,
        link: '/wallet/coin/' + wallet.productId
      }
    })
    cards.push(...walletCards)
    this.setState({cards})
  }

  render() {
    const {userStore,localeStore} = this.props
    const {cards} = this.state
    const {WALLET} = localeStore.language || {}

    return (
      <div id="wallet">
        <Header hideIcon title={WALLET.WALLET} isFixed isShadow/>
        {userStore.isOnline ? <CardList cards={cards}/> : <ToLogin/>}
      </div>
    )
  }
}

export default Index
