const websocket = require('websocket');
const Agent = require('./websocket.agent');
const Agents = require('./websocket.agents');

let monitorAgents = new Agents.MonitorAgents();
let controllerAgents = new Agents.ControllerAgents();

module.exports.init = (server) => {
    console.log('websocket service init');
    new websocket.server({
        httpServer: server,
        path: "/socket",
        maxReceivedFrameSize: 0x1000000,
        autoAcceptConnections: false
    })
        // client requests connection 
        .on('request', req => {
            const connection = req.accept(null, req.origin);
            connection.on('message', message => {
                const reqData = getUTF8Data(message);
                if (reqData.role === 'monitor') {
                    let agent = monitorAgents.find(req.key);
                    if (!agent) {
                        // monitorの登録
                        agent = new Agent(req.key, connection);
                        monitorAgents.add(agent);
                        monitorAgents.unicast(agent.key, controllerAgents.toResponse());
                    }
                    // monitor -> controllerへ送信
                    if (reqData.message) {
                        console.log('monitor -> controllerへ送信', reqData);
                        if (reqData.destinationKey) {
                            // 特定のcontrollerへ送信
                            controllerAgents.unicast(reqData.destinationKey, { message: reqData.message });
                        } else {
                            // 全てのcontrollerへ送信
                            controllerAgents.broadcast({ message: reqData.message });
                        }
                    }
                }
                else if (reqData.role === 'controller') {
                    let agent = controllerAgents.find(req.key);
                    if (!agent) {
                        agent = new Agent(req.key, connection);
                        controllerAgents.add(agent);
                    }
                    agent.name = reqData.name;
                    agent.message = reqData.message;
                    monitorAgents.broadcast(controllerAgents.toResponse());
                }
            });
            connection.on('close', (code, description) => {
                let agent;
                if ((agent = monitorAgents.find(req.key)) != null) {
                    monitorAgents.remove(agent.key);
                } else if ((agent = controllerAgents.find(req.key)) != null) {
                    controllerAgents.remove(agent.key);
                    monitorAgents.broadcast(controllerAgents.toResponse());
                }
            });
        })
        .on('error', () => console.error('WebSocket error has occurred.'));
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