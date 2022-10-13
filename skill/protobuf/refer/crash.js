import gmproto from '@/proto/gmproto_pb.js';
import gmproto105 from '@/proto/gameproto105_pb.js';
import {
  request,
  getHeadData,
  onceConnect,
  initGameState,
  watchPageChange,
  getLoginData,
  setLoginData
} from '@/utils/websocket';
const betTarget = {
  mainId: 3,
  subId: 0,
  packName: 'getBetData'
};

// mainid
const {
  COMMON, // 1,
  GAME_STATUS, // 2,
  GAME_MSG // 3
} = gmproto.EnMainMsgID;

// 初始化游戏状态
const {
  GAME_STATUS_FREE, // 0
  GAME_STATUS_PLAYING, // 101
  GAME_STATUS_STOP_BET // 100
} = gmproto105.GameStatus;

// subId
const {
  SUB_BET, // 0,
  SUB_BET_NOTIFY, // 1
  SUB_CASH_OUT, // 2
  SUB_CASH_NOTIFY, // 3
  SUB_STOP_BET, // 5
  SUB_NEXT_ROUND, // 6
  SUB_UPDATE_POINT, // 7
  SUB_GAME_REC, // 8
  SUB_GAME_REC_LIST // 9
  // SUB_GAME_TEST_SET_RES, // 10 设置测试点数
} = gmproto105.enGameSubID;

const hashMap = new Map([
  // 用户登录 1  0
  [{ mainId: COMMON, subId: 0 }, gmproto.LoginAuthRes.deserializeBinary],
  // 建立连接成功-crash初始化-当前游戏状态(空闲)
  [{ mainId: GAME_STATUS, subId: GAME_STATUS_FREE}, gmproto105.GameSceneFree.deserializeBinary],
  // 建立连接成功-crash初始化-当前游戏状态(正在游戏)
  [{ mainId: GAME_STATUS, subId: GAME_STATUS_PLAYING }, gmproto105.GameScenePlaying.deserializeBinary],
  // 建立连接成功-crash初始化-当前游戏状态(停止投注)
  [{ mainId: GAME_STATUS, subId: GAME_STATUS_STOP_BET }, gmproto105.GameSceneStopBet.deserializeBinary],
  // 投注请求回应(显示兑现)
  [{ mainId: GAME_MSG, subId: SUB_BET }, gmproto105.SCBetRes.deserializeBinary],
  // 下注通知(更新排行榜)
  [{ mainId: GAME_MSG, subId: SUB_BET_NOTIFY }, gmproto105.SCBetNotify.deserializeBinary],
  // 兑换通知(当前玩家)
  [{ mainId: GAME_MSG, subId: SUB_CASH_OUT }, gmproto105.SCCashOutRes.deserializeBinary],
  // 兑换通知(更新排行榜)
  [{ mainId: GAME_MSG, subId: SUB_CASH_NOTIFY }, gmproto105.SCCashOutNotify.deserializeBinary],
  // 停止投注-滞留期(正开始...)
  [{ mainId: GAME_MSG, subId: SUB_STOP_BET }, gmproto105.SCStopBet.deserializeBinary],
  // 下一局即将开始
  [{ mainId: GAME_MSG, subId: SUB_NEXT_ROUND }, gmproto105.SCNextRound.deserializeBinary],
  // 更新点数变化
  [{ mainId: GAME_MSG, subId: SUB_UPDATE_POINT}, gmproto105.SCUpdatePoint.deserializeBinary],
  // 根据局数ID获取历史记录详情
  [{ mainId: GAME_MSG, subId: SUB_GAME_REC}, gmproto105.SCGameRecByIDRes.deserializeBinary],
  // 获取历史记录列表
  [{ mainId: GAME_MSG, subId: SUB_GAME_REC_LIST}, gmproto105.SCGameRecListRes.deserializeBinary]
]);

class CrashProto{
  constructor() {
    this.mainIdMap = gmproto.EnMainMsgID;
    this.subIdMap = gmproto105.enGameSubID;
    this.gameStatusMap = gmproto105.GameStatus;
  }

  async unpack(data, cb, ws, self) {
    if (!data) return;
    const headData = getHeadData(data);
    // 再次连接
    if (headData.mainId === 0 && headData.subId === 0) {
      this.onceConnect(ws);
      return;
    }
    if (headData.mainId === 0 && headData.subId === 4) {
      location.origin.includes(process.env.REACT_APP_PLATFORM_GAME_URL) && self.props.updateGlobalData({ showNoticeDialog: true });
      return;
    }
    if (self && headData.mainId === 1) {
      await self.setState({
        countDown: 0, // 游戏开始倒计时
        multiple: 0, // 当前倍数
        point: 0, // 爆点值(当达到临界值时大于0-爆点)
        elapsed: 0, //过去了多久 （毫秒）
        outNotify: [], // 可以成功兑换的玩家信息
        roundId: ''
      });
    }
    // 连接坐下，初始化游戏状态
    if (headData.mainId === 1 && headData.subId === 1) {
      this.initGameState({ ws });
      return;
    }
    const action = [...hashMap].filter(([key]) => (
      key.mainId === headData.mainId && key.subId === headData.subId
    ));
    if (!action.length) return;
    const deserializeBinaryObj = action[0][1];
    const res = headData.any.unpack(deserializeBinaryObj, 'getMsg');
    cb && cb(res, headData);
  }

  // 发送投注数据
  sendBetData(data) {
    const { ws, params } = data;
    const betReq = new gmproto105.CSBetReq();
    const { amount, cashout } = params;
    betReq.setAmount(amount);
    betReq.setCashoutat(cashout);
    console.log('发送投注数据===', betReq);
    request(Object.assign({ ws, params, msgProto: betReq }, { ...betTarget }));
  }

  // 用户点击兑换
  sendCachData(data) {
    const { ws } = data;
    const betReq = new gmproto105.CSCashOutReq();
    request(Object.assign({ ws, msgProto: betReq }, {...betTarget}, { subId: 2 }));
  }

  testPoint(data) {
    const { ws } = data;
    const betReq = new gmproto105.CSTestGameSetRes();
    //爆点
    betReq.setCrashpoint(1.5);
    //初始步长 ，默认0.01
    betReq.setInitshowstep(0.01);
    //设置更新间隔(毫秒) 默认100
    betReq.setStepshowtime(210);
    //多少之前是匀速的，默认1.4
    betReq.setSlowupdatemax(1);
    //后期的增长倍数，默认1.01
    betReq.setStepincrymul(1.01);
    request(Object.assign({ ws, msgProto: betReq }, {...betTarget}, { subId: 10 }));
  }

  // 转换投注列表(初始化)
  changeBetPlayerList(betList, outNotify) {
    const result = betList.map((item) => {
      let multiple = '';
      const userId = item.getPlayer().getId();
      let temp = null;
      if (outNotify) {
        const some = outNotify.some(row => {
          const flag = row.getPlayer().getId() === userId;
          temp = flag ? row.getCashoutat() : null;
          return row.getPlayer().getId() === userId;
        });
        multiple = some ? temp : '';
      }
      return {
        amount: item.getAmount(),
        currency: item.getCurrency(),
        userId,
        userName: item.getPlayer().getName(),
        roundId: item.getRoundid(),
        multiple
      };
    });
    return result;
  }

  // 转换投注列表(点数更新)
  changeRoundBetPlayerList(betList, outNotify) {
    const result = betList.map((item) => {
      let multiple = item.multiple || '';
      const {userId} = item;
      let temp = null;
      const some = outNotify.some(row => {
        const flag = row.getPlayer().getId() === userId;
        temp = flag ? row.getCashoutat() : null;
        return row.getPlayer().getId() === userId;
      });
      multiple = some ? temp : item.multiple;
      return Object.assign({}, {...item}, { multiple });
    });
    return result;
  }

  // 转换可成功兑换玩家列表
  changeBetResolveList(outNotify) {
    return outNotify.map(item => ({
      amount: item.getAmount(),
      currency: item.getCurrency(),
      userId: item.getPlayer().getId(),
      userName: item.getPlayer().getName(),
      multiple: item.getCashoutat()
    }));
  }

  // 获取历史记录列表
  getHistoryList(ws, pagination) {
    const msgProto = new gmproto105.CSGameRecListReq();
    if (pagination) {
      const { limit, page } = pagination;
      const offset = (page - 1) * limit;
      msgProto.setLimit(limit);
      msgProto.setOffset(offset);
    } else {
      msgProto.setLimit(5);
      msgProto.setOffset(0);
    }
    request(Object.assign({ ws, msgProto }, {...betTarget}, { subId: SUB_GAME_REC_LIST }));
  }

  // 根据局数id获取历史记录详情数据
  getHistoryDetailByid(ws, id = 'eb7be321-3a53-48e7-b042-64cef98ef58a') {
    const msgProto = new gmproto105.CSGameRecByIDReq();
    msgProto.setRoundid(id);
    request(Object.assign({ ws, msgProto }, {...betTarget}, { subId: SUB_GAME_REC }));
  }

  getInitRecentListData(recList) {
    return recList.map(item => ({
      roundId: item.getRoundid(),
      point: item.getCrashpoint()
    }));
  }
}

CrashProto.prototype.onceConnect = onceConnect;
CrashProto.prototype.getLoginData = getLoginData;
CrashProto.prototype.setLoginData = setLoginData;
CrashProto.prototype.initGameState = initGameState;
CrashProto.prototype.watchPageChange = watchPageChange;

export default new CrashProto();
