## 1. 安装protoC
```txt
1. 从下方下载地址下载protobuf-java-3.21.7.zip
2. 指定安装地址后配置环境变量(系统变量)
3. protoc --version  验证安装是否完成
```
[protoc下载地址](https://github.com/protocolbuffers/protobuf/releases)

```txt
tips: 如果从protoc下载地址下载的文件没有bin目录，则从refer文件夹中解压protoc安装包，再配置环境变量
```

[protoc参考地址](https://www.cnblogs.com/xiaolintongxue1/p/15699286.html)

## 2. 下载Google-protobuf
```txt
npm install google-protobuf
or
yarn add google-protobuf
```

## 3. 编译protobuf文件
```txt
在proto文件中打开cmd，输入以下命令。 *.proto代表编译所有proto文件，若需要指定文件编译，则需手动配置文件名
protoc --js_out=import_style=commonjs,binary:. *.proto
```

## 4. 解包

### (1) 获取头部信息(mainId-subId)

```javascript

// 导入protobuf Any
import gbp from 'google-protobuf/google/protobuf/any_pb.js';
// 配置any类型(因为无法确认socket返回的类型，所以必须指定any)
const AnyType = gbp.Any;
/**
 * 接收到的ArrayBuffer数据需要通过Uint8Array方法去转换 
 */
export function getHeadData(data) {
  const head = new gmproto.Head();
  const any = new AnyType();
  // 通过head获取标识符
  any.pack(new Uint8Array(data), 'getHeader');
  head.setMsg(any);
  const identity = any.unpack(gmproto.Head.deserializeBinary, 'getHeader');
  const mainId = identity.getMainid();
  const subId = identity.getSubid();
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
```

[参考文档-通过any解包](https://developers.google.com/protocol-buffers/docs/proto3#any)


### (2) 通过unpack解包

```javascript
const callbackMap = [
  // 接收消息1
  [{ mainId: mainIdMap.COMMON, subId: 0 }, callback],
  // 接收消息2
  [{ mainId: mainIdMap.GAME_STATUS, subId: gameStatusMap.GAME_STATUS_FREE }, callback],
  // 接收消息3
  [{ mainId: mainIdMap.GAME_MSG, subId: subIdMap.SUB_BET }, callback]
]
const hashMap = new Map([
  // 获取socket1解包码
  [{ mainId: COMMON, subId: 0 }, gmproto.LoginAuthRes.deserializeBinary],
  // 获取socket2解包码 （建立连接成功-crash初始化-当前游戏状态(空闲))
  [{ mainId: GAME_STATUS, subId: GAME_STATUS_FREE}, gmproto105.GameSceneFree.deserializeBinary]
]);
async unpack(data, cb, ws) {
  if (!data) return;
  const headData = getHeadData(data);
  // 根据头部信息去获取对应的proto Any解包码 => deserializeBinary
  const action = [...hashMap].filter(([key]) => (
    key.mainId === headData.mainId && key.subId === headData.subId
  ));
  if (!action.length) return;
  const deserializeBinaryObj = action[0][1];
  const res = headData.any.unpack(deserializeBinaryObj, 'getMsg');
  // 解析完成执行对应回调
  cb && cb(res, headData);
}
```

### (3) 建立连接
```javascript
export async function connectWebsocket(data) {
  const { proto, gameName } = data;
  const { servise } = this.props.state.playerInfo;
  const ws = new WebSocket(servise);
  await this.setState({ socket: { ws, servise } });
  this.state.socket.ws.onopen = () => {
  };
  this.state.socket.ws.onmessage = (e) => {
    proto.unpack(e.data, this.switchCb, this.state.socket.ws, this);
  };
  this.state.socket.ws.onclose = async () => {
    console.log('已断开连接-------');
  };
  this.state.socket.ws.binaryType = 'arraybuffer';
}
```


## 5. 发包
```javascript
// 导入protobuf Any
import gbp from 'google-protobuf/google/protobuf/any_pb.js';
// 配置any类型(因为无法确认socket返回的类型，所以必须指定any)
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

  // send => 获取head的解包码
  const result = head.serializeBinary();
  ws.send(result);
}

  // 发送投注数据
  sendBetData(data) {
    const { ws, params } = data;
    // 实例化指定协议
    const betReq = new gmproto105.CSBetReq();
    const { amount, cashout } = params;
    // 设置参数
    betReq.setAmount(amount);
    betReq.setCashoutat(cashout);
    // request
    request(Object.assign({ ws, params, msgProto: betReq }, { ...betTarget }));
  }
```