document.addEventListener('DOMContentLoaded', init);

const ws = new WebSocket('ws://localhost:6262');

function init() {
    let overlay = document.querySelector('#overlay');
    let input = document.querySelector('input');

    document.querySelector('#title').addEventListener('click', () => {
        location.reload();
    });

    document.querySelector('#button').addEventListener('click', () => {
        input.value = "";
        overlay.setAttribute('class', 'vis');
    });

    input.addEventListener('input', () => {
        if (input.value.length != 10) return;
        overlay.setAttribute('class', '');

        let login = input.value;
        setTimeout(() => {
            send('login', { code: login });
        }, 1500);

        input.disabled = true;
        setTimeout(() => {    
            input.value = "";
            input.disabled = false
        }, 200);

        document.querySelector('#body').setAttribute('class', 'loading');
    });

    ws.onmessage = function(message) {
        message = JSON.parse(message.data);
    
        if (message.method == "success") {
            document.querySelector('#body').setAttribute('class', 'loaded');
            document.querySelector('#username').textContent = message.body.name;
        };
    
        if (message.method == "message") {
            let base = document.createElement('div');
            base.textContent = message.body.text;
            base.setAttribute('class', 'message');

            document.querySelector('#messages').appendChild(base);
        };
    
        if (message.method == "failed") {
            document.querySelector('#body').setAttribute('class', 'default');    
        };
    };
};

function send(method, body) {
    ws.send(JSON.stringify({
        method: method,
        body: body
    }));
};