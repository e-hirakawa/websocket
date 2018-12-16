module.exports = class Agent{
    constructor(key, connection, name = '', message = '') {
        this.key = key;
        this.connection = connection;
        this.name = name;
        this.message = message;
    }
}