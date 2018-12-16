
Date.prototype.toLogString = (function () {
    var y = this.getFullYear();
    var m = this.getMonth() + 1;
    var d = this.getDate();
    var h = this.getHours();
    var M = this.getMinutes();
    var s = this.getSeconds();
    var ms = this.getMilliseconds();
    var d1 = [y,
        ("00" + m).slice(-2),
        ("00" + d).slice(-2)
    ];
    var d2 = [
        ("00" + h).slice(-2),
        ("00" + M).slice(-2),
        ("00" + s).slice(-2)
    ];
    var d3 = ("00" + ms).slice(-3);
    return d1.join("/") + " " + d2.join(":") + "." + d3;
});

function Logger(parent) {
    const append = (direction, message) => {
        const log = document.createElement('div');
        log.className = 'log';

        const dir = document.createElement('span');
        dir.className = direction;

        const date = document.createElement('span');
        date.className = 'date';
        date.innerText = new Date().toLogString();

        const msg = document.createElement('span');
        msg.className = 'message';
        msg.innerText = message;

        log.appendChild(dir);
        log.appendChild(date);
        log.appendChild(msg);
        parent.appendChild(log);
    }
    this.send = (message) => {
        append('send', message);
    }
    this.recieve = (message) => {
        append('recieve', message);
    }
    this.error = (message) => {
        append('error', message);
    }
    return this;
}

function MonitorTable(parent) {
    this.create = (controllers, unicast) => {
        parent.innerHTML = '';
        controllers.forEach((controller, index) => {
            const tr = document.createElement('tr');
            const td1 = document.createElement('td');
            const td2 = document.createElement('td');
            const td3 = document.createElement('td');
            const td4 = document.createElement('td');
            td1.innerText = index;
            td2.innerText = controller.name || '-';
            td3.innerText = controller.message || '-';
            const input = document.createElement('input');
            const button = document.createElement('button');
            button.innerText = 'SEND';
            button.addEventListener('click', ev => {
                unicast(controller.key, input.value);
                input.value = '';
            });
            td4.appendChild(input);
            td4.appendChild(button);
            tr.appendChild(td1);
            tr.appendChild(td2);
            tr.appendChild(td3);
            tr.appendChild(td4);
            parent.appendChild(tr);
        });
    }
}