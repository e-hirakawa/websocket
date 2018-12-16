# Application
WebSocket with Node.js

## How to use
```sh
$ git clone https://github.com/e-hirakawa/websocket.git
$ cd websocket/src
$ npm install
$ node index.js
```
Server running at `http://localhost:3000`

## Server side implementation
```sh
$ npm install --save websocket
```
```js
const express = require('express');
const websocket = require('websocket');

const app = express();
const server = http.createServer(app);
server.listen(PORT_NUMBER, () => {
    console.info('Server running at', server.address());
});

// ...

// WebSocketインスタンス作成
new websocket.server({
    httpServer: server,
    path: "/socket",
    maxReceivedFrameSize: 0x1000000,
    autoAcceptConnections: false
})
// 接続要求
.on('request', req => {
    // 接続確立
    const connection = req.accept(null, req.origin);
    connection.on('message', message => {
        // メッセージ受信時　処理...
    });
    connection.on('close', (code, description) => {
        // コネクション切断時　処理...
    });
    // メッセージ送信
    connection.sendUTF(JSON.stringify({message: 'Hello Client!'}));
})
// 接続エラー
.on('error', () => console.error('WebSocket error has occurred.'));
```
- reference:  
services/websocket/websocket.service.js  
services/websocket/websocket.agents.js

## Client side implementation
```js
const socket = new WebSocket(`ws://${location.host}/socket/`);
socket.onopen = () => {
    // 接続確立時　処理...
}
socket.onmessage = event => {
    // メッセージ受信時　処理...
}
socket.onclose = () => {
    // コネクション切断時　処理...
}
socket.onerror = error => {
    // エラー時　処理...
}
// メッセージ送信
socket.send(JSON.stringify({message: 'Hello Server!'}));
```
- reference:  
views/controller.html  
views/monitor.html
