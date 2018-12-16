const Agent = require('./websocket.agent');

class Agents {
    constructor() {
        this.agents = [];
    }
    find(key) {
        return this.agents.find(_ => _.key === key);
    }
    findAll() {
        return this.agents;
    }
    add(agent) {
        this.agents.push(agent);
    }
    remove(key) {
        const index = this.agents.findIndex(agent => agent.key === key);
        if (index >= 0) {
            this.agents.splice(index, 1);
        }
    }
    unicast(key, data) {
        const agent = this.find(key);
        if (agent) {
            agent.connection.sendUTF(JSON.stringify(data));
        }
    }
    broadcast(data) {
        const json = JSON.stringify(data);
        for (const agent of this.agents) {
            agent.connection.sendUTF(json);
        }
    }
}

class MonitorAgents extends Agents {
    constructor() {
        super();
    }
}

class ControllerAgents extends Agents {
    constructor() {
        super();
    }
    toResponse() {
        return this.agents.map(agent => ({
            key: agent.key,
            name: agent.name,
            message: agent.message,
        }));
    }
}

module.exports = { MonitorAgents, ControllerAgents }