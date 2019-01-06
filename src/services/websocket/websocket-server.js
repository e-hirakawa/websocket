const url = require('url');
const WebSocket = require('ws');
const EventEmmiter = require('events');
const WebSocketEventType = require('./websocket-event-type');

/**
 * WebSocket サーバーサイドクラス
 */
module.exports = class WebSocketServer {
    constructor(server) {
        this.__events = new EventEmmiter();

        const wss = new WebSocket.Server({ noServer: true });

        wss.on('connection', (socket, request) => {
            const requestKey = request.headers['sec-websocket-key'];
            socket.on('message', data => {
               this.__events.emit(WebSocketEventType.RECIEVED, {
                    requestKey: requestKey,
                    recieveData: JSON.parse(data),
                    connection: socket
                });
            });
            socket.on('close', () => this.__events.emit(WebSocketEventType.CLOSED, requestKey));
            socket.on('error', err => this.__events.emit(WebSocketEventType.FAILED, err.message));
        });

        server.on('upgrade', function upgrade(request, socket, head) {
            const pathname = url.parse(request.url).pathname;
            if (pathname === '/socket') {
                wss.handleUpgrade(request, socket, head, ws => {
                    wss.emit('connection', ws, request);
                });
            } else {
                socket.destroy();
            }
        });
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
