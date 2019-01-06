/**
 * WebSocketイベント種別
 */
const WebSocketEventType = {
    /** 接続 */
    OPENED: 'OPENED',
    /** 切断 */
    CLOSED: 'CLOSED',
    /** 障害 */
    FAILED: 'FAILED',
    /** 受信 */
    RECIEVED: 'RECIEVED'
}

/**
 * Socketイベント割り当てクラス
 */
class WebSocketEvents {
    constructor() {
        this.__events = {};
    }

    /**
     * イベントの割当メソッド
     * @param {string} name イベント名
     * @param {function} listener イベントリスナー
     */
    add(name, listener) {
        if (!this.__events.hasOwnProperty(name)) {
            this.__events[name] = [];
        }
        this.__events[name].push(listener);
    }

    /**
     * イベントの解除メソッド
     * @param {string} name イベント名
     * @param {function} listener イベントリスナー
     */
    remove(name, listener) {
        if (!this.__events.hasOwnProperty(name)) {
            return;
        }
        const index = this.__events[name].indexOf(listener);
        if (index >= 0) {
            this.__events[name].splice(index, 1);
        }
    }

    /**
     * イベント発火メソッド
     * @param {string} name イベント名
     * @param {any} data データ
     */
    trigger(name, data) {
        if (!this.__events.hasOwnProperty(name)) {
            return;
        }
        this.__events[name].forEach(listener => {
            listener(data);
        });
    }
}

/**
 * WebSocketクライアントサイドクラス
 */
class WebSocketClient {
    constructor(destination) {
        this.destination = destination;
        this.__events = new WebSocketEvents();
        this.__socket = new WebSocket(`ws://${location.host}/${destination}/`);
        this.__socket.onopen = () => {
            this.__events.trigger(WebSocketEventType.OPENED, {});
        }
        this.__socket.onclose = () => {
            this.__events.trigger(WebSocketEventType.CLOSED, {});
        }
        this.__socket.onerror = error => {
            this.__events.trigger(WebSocketEventType.FAILED, error);
        }
        this.__socket.onmessage = event => {
            const data = JSON.parse(event.data);
            this.__events.trigger(WebSocketEventType.RECIEVED, data);
        }
    }

    /**
     * 送信
     * @param {object} data 送信データ
     */
    send(data) {
        const json = JSON.stringify(data);
        this.__socket.send(json);
    }

    /**
     * イベントの割当
     * @param {WebSocketEventType} webSocketEventType イベント名
     * @param {function} listener イベントリスナー
     */
    addEventListener(webSocketEventType, listener) {
        this.__events.add(webSocketEventType, listener);
    }

    /**
     * イベントの解除
     * @param {WebSocketEventType} webSocketEventType イベント名
     * @param {function} listener イベントリスナー
     */
    removeEventListener(webSocketEventType, listener) {
        this.__events.remove(webSocketEventType, listener);
    }
}
