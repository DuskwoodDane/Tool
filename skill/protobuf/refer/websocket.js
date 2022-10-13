import gmproto from '@/proto/gmproto_pb.js';
// import gmproto123 from '@/proto/gameproto103_pb.js';
import gbp from 'google-protobuf/google/protobuf/any_pb.js';
import { getItem, setItem } from '@/utils/tool';
const AnyType = gbp.Any;

export function request(data) {
  const { ws, mainId, subId, msgProto, packName } = data;
  const head = new gmproto.Head();
  const any = new AnyType();

  // set Mainid and subID
  head.setMainid(mainId);
  head.setSubid(subId);

  // set any pack
  const binarySerialized = msgProto.serializeBinary();
  any.pack(binarySerialized, packName);
  head.setMsg(any);

  // send
  const result = head.serializeBinary();
  ws.send(result);
}

export function getHeadData(data) {
  const head = new gmproto.Head();
  const any = new AnyType();
  // 通过head获取标识符
  any.pack(new Uint8Array(data), 'getHeader');
  head.setMsg(any);
  const identity = any.unpack(gmproto.Head.deserializeBinary, 'getHeader');
  const mainId = identity.getMainid();
  const subId = identity.getSubid();
  // console.log('identity', mainId, subId, identity);
  console.log('identity', mainId, subId);
  // 重新连接、多账户登录
  const someList = [mainId === 0 && subId === 0, mainId === 0 && subId === 4];
  if (someList.some(item => item)) return { mainId, subId };
  // 获取请求的ArrayBuffer数据
  identity.getMsg() && any.pack(identity.getMsg().getValue(), 'getMsg');
  return {
    mainId,
    subId,
    any,
    identity,
    binary: gmproto.Head.deserializeBinary
  };
}

export function onceConnect(ws) {
  const head = new gmproto.Head();
  head.setMainid(0);
  head.setSubid(0);
  const result = head.serializeBinary();
  ws.send(result);
}

export function initGameState(data) {
  const { ws } = data;
  const head = new gmproto.Head();
  head.setMainid(1);
  head.setSubid(2);
  const result = head.serializeBinary();
  ws.send(result);
}

// export function getGameKindid(data) {
//   console.log('获取当前账号锁定游戏==', data);
// }

export function storageUserInterface(data) {
  // console.log('storage==', data);
  // console.log('id====', data.getAccountid());
  setItem('accountId', data.getAccountid());
}

export function switchCb(res, headerData) {
  const { mainId, subId } = headerData;
  const { callbackMap } = this.state;
  const action = [...callbackMap].filter(([key]) => (
    key.mainId === mainId && key.subId === subId
  ));
  const getCb = action.length ? action[0][1] : callbackMap[0][1];
  const cb = getCb.bind(this);
  cb && cb(res);
}

export function watchPageChange(socket) {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState == 'hidden') {
      console.log('close page=====================', socket.ws.readyState);
      this.setState({ connect: 1 });
      socket.ws.close();
    } else {
      if (this.state.connect > 0) {
        console.log('show page=====================', socket.ws.readyState, socket);
        if (socket.ws.readyState !== 1) {
          socket.ws = new WebSocket(socket.servise);
          this.connectWebsocket();
        }
        this.setState({ connect: 0 });
      }
    }
  });
}

export function getLoginData(data) {
  // 显示的语言
  const language = data.getLanguage() || 'zh';
  // 余额
  const balance = data.getBalance();
  // 用户ID
  const accountId = data.getAccountid();
  // 用户名
  const nickName = data.getNickname();
  // 平台币种
  const platformCurrency = data.getPlatformcurrency();
  // 玩家选择的币种
  const currency = data.getCurrency();
  // 当前汇率
  const exRate = data.getExrate();
  this.props.updateUserInfo({
    language,
    // balance: 1.100001198442111,
    balance,
    accountId,
    nickName,
    platformCurrency,
    currency,
    exRate
  });
  console.log('获取登录状态==', data, this.props.state.userInfo);
}

export function setLoginData(target) {
  this.props.updateUserInfo(target ? {...target} : {
    language: '', // 显示的语言
    balance: 0, // 余额
    accountId: 0, // 用户ID
    nickName: '', // 用户名
    platformCurrency: '', // 平台币种
    currency: '', // 玩家选择的币种
    exRate: 0 // 当前汇率
  });
}

export async function connectWebsocket(data) {
  const { proto, gameName } = data;
  this.setState({ showLoadingpage: true });
  const { servise } = this.props.state.playerInfo;
  const ws = new WebSocket(servise);
  await this.setState({ socket: { ws, servise } });
  this.state.socket.ws.onopen = () => {
    console.log(`${gameName}--open`, proto);
    this.setState({ socketState: 1 });
  };
  this.state.socket.ws.onmessage = (e) => {
    proto.unpack(e.data, this.switchCb, this.state.socket.ws, this);
  };
  this.state.socket.ws.onclose = async () => {
    console.log('已断开连接-------');
    this.setState({ socketState: 0 });
  };
  this.state.socket.ws.binaryType = 'arraybuffer';
}
