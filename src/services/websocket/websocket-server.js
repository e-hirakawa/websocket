const websocket = require('websocket');
const EventEmmiter = require('events');
const WebSocketEventType = require('./websocket-event-type');

/**
 * WebSocket サーバーサイドクラス
 */
module.exports = class WebSocketServer {
    constructor(server) {
        this.__events = new EventEmmiter();

        const wss = new websocket.server({
            httpServer: server,
            path: '/socket',
            maxReceivedFrameSize: 0x1000000,
            autoAcceptConnections: false
        });
        wss.on('request', req => {
            const connection = req.accept(null, req.origin);
            // メッセージ受信
            connection.on('message', message => {
                this.__events.emit(WebSocketEventType.RECIEVED, {
                    requestKey: req.key,
                    recieveData: getUTF8Data(message),
                    connection: connection
                });
            });
            // 切断
            connection.on('close', (code, description) => {
                this.__events.emit(WebSocketEventType.CLOSED, req.key);
            });
        });
        wss.on('error', error => this.__events.emit(WebSocketEventType.FAILED, error));
    }

    /**
     * イベントの割当
     * @param {WebSocketEventType} webSocketEventType イベント名
     * @param {function} listener イベントリスナー
     */
    addEventListener(webSocketEventType, listener) {
        this.__events.on(webSocketEventType, listener);
    }

    /**
     * イベントの解除
     * @param {WebSocketEventType} webSocketEventType イベント名
     * @param {function} listener イベントリスナー
     */
    removeEventListener(webSocketEventType, listener) {
        this.__events.off(webSocketEventType, listener);
    }
}

function getUTF8Data(message) {
    var data = null;
    if (message.type === 'utf8') {
        const utf8Data = message.utf8Data.trim();
        if (utf8Data !== '') {
            data = JSON.parse(utf8Data);
        }
    }
    return data;
}