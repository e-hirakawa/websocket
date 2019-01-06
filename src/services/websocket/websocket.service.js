const Agent = require('./websocket.agent');
const Agents = require('./websocket.agents');
const WebSocketServer = require('./websocket-server');
const WebSocketEventType = require('./websocket-event-type');

let monitorAgents = new Agents.MonitorAgents();
let controllerAgents = new Agents.ControllerAgents();

module.exports.init = (server) => {
    console.log('websocket service init');
    //#region WebSocketServer for Monitor
    const monitorServer = new WebSocketServer(server, '/monitor');
    monitorServer.addEventListener(
        WebSocketEventType.RECIEVED,
        data => {
            const { requestKey, recieveData, connection } = data;
            // monitorからのメッセージ受信
            let agent = monitorAgents.find(requestKey);
            if (!agent) {
                // monitorの登録
                agent = new Agent(requestKey, connection);
                monitorAgents.add(agent);
                monitorAgents.unicast(agent.key, controllerAgents.toResponse());
            }
            // monitor -> controllerへ送信
            if (recieveData.message) {
                console.log('monitor -> controllerへ送信', recieveData);
                if (recieveData.destinationKey) {
                    // 特定のcontrollerへ送信
                    controllerAgents.unicast(recieveData.destinationKey, { message: recieveData.message });
                } else {
                    // 全てのcontrollerへ送信
                    controllerAgents.broadcast({ message: recieveData.message });
                }
            }
        }
    );

    monitorServer.addEventListener(
        WebSocketEventType.CLOSED,
        key => {
            let agent;
            if ((agent = monitorAgents.find(key)) != null) {
                monitorAgents.remove(agent.key);
            }
        }
    );

    monitorServer.addEventListener(
        WebSocketEventType.FAILED,
        error => console.error('WebSocket error has occurred.', error)
    );
    //#endregion

    //#region WebSocketServer for Controller
    const controllerServer = new WebSocketServer(server, '/controller');
    controllerServer.addEventListener(
        WebSocketEventType.RECIEVED,
        data => {
            const { requestKey, recieveData, connection } = data;
            // controllerからのメッセージ受信
            let agent = controllerAgents.find(requestKey);
            if (!agent) {
                agent = new Agent(requestKey, connection);
                controllerAgents.add(agent);
            }
            agent.name = recieveData.name;
            agent.message = recieveData.message;

            // 受信したデータをmonitorへ伝える
            monitorAgents.broadcast(controllerAgents.toResponse());
        }
    );

    controllerServer.addEventListener(
        WebSocketEventType.CLOSED,
        key => {
            let agent;
            if ((agent = controllerAgents.find(key)) != null) {
                controllerAgents.remove(agent.key);
                monitorAgents.broadcast(controllerAgents.toResponse());
            }
        }
    );

    controllerServer.addEventListener(
        WebSocketEventType.FAILED,
        error => console.error('WebSocket error has occurred.', error)
    );
}
