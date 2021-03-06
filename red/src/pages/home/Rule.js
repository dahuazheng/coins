import React, {Component} from 'react'
import {inject, observer} from "mobx-react";
import Header from '../../components/common/Header'
import {Toast} from 'antd-mobile'
import {OtherApi} from '../../api'
import './Rule.scss'

@inject('localeStore')
@observer
class Rule extends Component {
  state = {
    content: ''
  };

  componentDidMount() {
    this.getRules()
  }

  getRules = () => {
    OtherApi.getRules().then(res => {
      if (res.status !== 1) {
        Toast.info(res.msg);
        return
      }
      this.setState({content: res.data[0].content})
    })
  }

  render() {
    const {localeStore: {locale: {RULE}}} = this.props;
    const {content} = this.state;
    return (
      <div id="rule">
        <Header title={RULE.TITLE} isFixed isShadow bgPrimary/>
        <div dangerouslySetInnerHTML={{__html: content}}/>
      </div>
    )
  }
}

export default Rule
