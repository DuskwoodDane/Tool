import React, { Component } from 'react';
import { connect } from 'react-redux';
import style from './css/main.module.scss';
import Range from './range';
import Bet from './bet';
import GlobalLoading from '@/components/GlobalLoading';
import { updateMinAmountTips } from '@/utils/betMixin';
import { getState, getForwardComponent } from '@/utils/globalVar';
import PropTypes from 'prop-types';
import DiceProto from '@/api/dice';
import DiceMain from './utils/main';
const { mainIdMap, subIdMap, gameStatusMap } = DiceProto;
const { pageState } = getState();
class Dice extends Component {
  constructor(props) {
    super(props);
    this.betRef = React.createRef();
    this.rangeRef = React.createRef();
    this.diceMain = new DiceMain();
    this.betting = this.betting.bind(this);
    this.switchCb = this.diceMain.switchCb.bind(this);
    this.connectWebsocket = this.diceMain.connectWebsocket.bind(this);
    this.getLoginData = DiceProto.getLoginData.bind(this);
    this.clearLoginData = DiceProto.setLoginData.bind(this);
    this.initAboutBet = this.diceMain.initAboutBet.bind(this);
    this.updateRangeValue = this.diceMain.updateRangeValue.bind(this);
    this.getBetData = this.diceMain.getBetData.bind(this);
    this.resetBet = this.diceMain.resetBet.bind(this);
    this.sendData = this.sendData.bind(this);
    this.state = Object.assign({ ...pageState }, {
      callbackMap: [
        // 用户登录 1  0
        [{ mainId: mainIdMap.COMMON, subId: 0 }, this.getLoginData],
        // 建立连接成功-dice初始化-当前游戏状态(空闲)
        [{ mainId: mainIdMap.GAME_STATUS, subId: gameStatusMap.GAME_STATUS_FREE }, this.initAboutBet],
        // 获取投注信息
        [{ mainId: mainIdMap.GAME_MSG, subId: subIdMap.SUB_BET }, this.getBetData]
      ],
      rangeValue: {
        isGreat: true,
        value: '50.50',
        multiple: '2.0000',
        probability: '49.5000',
        oldProbability: '49.5000' // 用以重置获胜几率
      },
      bettingParams: {}
    });
  }
  componentDidMount() {
    this.connectWebsocket({
      proto: DiceProto,
      gameName: 'Dice'
    });
  }

  get hasOpenBetMask() {
    const { multiple, probability } = this.state.rangeValue;
    const newMultiple = Number(multiple);
    const newProbability = Number(probability);
    const disable = newMultiple > 9900 || newMultiple < 1.0102 || newProbability < 0.01 || newProbability > 98;
    return disable;
  }

  get getBetQuery() {
    const { dataColumn, rangeValue } = this.state;
    if (!dataColumn) return null;
    const { amount } = dataColumn;
    const { isGreat, value } = rangeValue;
    return {
      amount,
      currency: 'btc',
      identifier: 'h4-H1Y7m4xG02xRhSELVg',
      condition: isGreat ? 'above' : 'below',
      target: value
    };
  }

  async betting(data) {
    const min = updateMinAmountTips(this.props.state.playerInfo.currency, data.amount);
    if (min.type === 'error') {
      !this.props.state.errorTipsItem && this.props.updateGlobalData({ errorTipsItem: { message: min.message } });
      return;
    }
    this.rangeRef.current.soundCom.current.onPlay('btnClick');
    const betDom = this.betRef.current;
    await this.setState({ dataColumn: data, loading: true });
    if (data.navValue) {
      const autoNum = data.betNum;
      const newValue = autoNum - 1 > 0 ? autoNum - 1 : 0;
      await this.setState({
        autoNum,
        autoAmount: data.amount,
        betState: 1,
        currentBetNum: newValue
      });
      betDom.columnInputChange({ id: 1, value: newValue }, 'autoForm');
    } else {
      await this.setState({ betLoading: true });
    }
    this.sendData();
  }

  sendData() {
    DiceProto.betData({ ws: this.state.socket.ws, params: this.getBetQuery });
  }
  render() {
    return (
      <div className={style['game-main']}>
        {/* <div style={{ color: 'red' }} >{this.props.state.userInfo.balance}</div> */}
        <Range
          ref={this.rangeRef}
          {...this.state}
          updateRangeValue={(data) => this.updateRangeValue(data)} />
        <Bet
          ref={this.betRef}
          {...this.state}
          {...this.props}
          betMask={this.hasOpenBetMask}
          selectedList={ this.hasOpenBetMask ? [] : [1]}
          betting={data => this.betting(data)}
          stopBet={() => { this.setState({ betState: 2 }); }} />
        { this.state.showLoadingpage && <GlobalLoading /> }
      </div>
    );
  }
}

export default getForwardComponent(Dice);

Dice.propTypes = {
  state: PropTypes.object,
  updateUserInfo: PropTypes.func,
  updateGlobalData: PropTypes.func
};
