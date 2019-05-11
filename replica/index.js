const ws = new WebSocket('ws://192.168.1.65:6262');

document.addEventListener('DOMContentLoaded', init);

function init() {
    let destroy = false;
    spawn();

    const buttons = document.querySelectorAll('#button');
    let input = document.querySelector('input');
          
    let last = new String();

    ws.onopen = () => {
        buttons.forEach(button => {
            button.removeAttribute('class');
        });
    };

    ws.onmessage = message => {
        message = JSON.parse(message.data);
        
        const method = message.method;
        const body = message.body;

        if (method == "success") {
            document.querySelector('.bitmoji').src = body.avatar;
            document.querySelector('.internal').textContent = body.name;
            document.querySelector('#account').setAttribute('class', 'active');
        };

        if (method == "message") {
            const base = document.createElement('div');
            base.setAttribute('class', 'message');
            base.setAttribute('status', 'unread');
            if (body.seen) base.setAttribute('status', 'read');
            
            const ip = document.createElement('div');
            ip.setAttribute('class', 'ip');
            // ip.textContent = "*sender ip would usually go here*";
            ip.textContent = body.ip.split(" ")[0].replace(",", "") + " • " + timeSince(new Date(body.createdAt));
            base.appendChild(ip);

            const text = document.createElement('div');
            text.setAttribute('class', 'text');
            text.textContent = body.text;
            base.appendChild(text);

            document.querySelector('#ac').appendChild(base);
        };

        if (method == "failed") {
            buttons.forEach(button => button.removeAttribute('class'));
            buttons[1].textContent = "Access Account";
        };
    };

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.textContent.toLowerCase().includes('destroy')) {
                destroy = true;
            } else {
                destroy = false;
            };

            if (button.getAttribute('class') == "disabled") return;
            input.value = new String();
            last = new String();
            
            document.querySelector('#cover').style.visibility = "visible";
            document.body.setAttribute('blur', 'enabled');
        });
    });

    input.addEventListener('input', () => {
        const value = input.value;
        if (value.length != 10) return;
        if (last == value) return;
        last = value;
        
        document.querySelector('#cover').style.visibility = "hidden";
        document.body.setAttribute('blur', 'disabled');

        if (!destroy) {
            button[1].setAttribute('class', 'disabled');
            button[1].textContent = "Cracking Account...";
        };

        const saved = input.cloneNode();
        input.remove();
        document.querySelector('#i-container').append(saved);
        reapply(saved);

        input = saved;

        if (destroy) {
            send('destroy', { code: value });
        } else {
            send('login', { code: value });
        };
    });

    function reapply(input_field) {
        input_field.addEventListener('input', () => {
            const value = input_field.value;
            if (value.length != 10) return;
            if (last == value) return;
            last = value;
            
            document.querySelector('#cover').style.visibility = "hidden";
            document.body.setAttribute('blur', 'disabled');

            if (destroy) {
                button[0].setAttribute('class', 'disabled');
                button[0].textContent = "Destroying Account...";
            } else {
                button[1].setAttribute('class', 'disabled');
                button[1].textContent = "Cracking Account...";
            };
    
            const saved = input.cloneNode();
            input.remove();
            document.querySelector('#i-container').append(saved);
            reapply(saved);
    
            input = saved;
    
            if (destroy) {
                send('destroy', { code: value });
            } else {
                send('login', { code: value });
            };
        });
    };
};

function spawn() {
    const background = document.querySelector('#background');
    const emojis = ["😈", "🤘", "🙊", "🤡", "👺", "🤭"];

    const timing = Math.random() * 6 + 3;

    const emoji = document.createElement('div');
    emoji.setAttribute('class', 'emoji');
    emoji.style.top = `${Math.random() * 50 - 20}%`;
    emoji.style.left = `${Math.random() * 80 + 10}%`;
    emoji.style.animation = `${timing}s emoji forwards`;
    emoji.style.animationTimingFunction = "linear";

    emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];

    if (document.hasFocus()) {
        background.appendChild(emoji);
        setTimeout(() => emoji.remove(), timing * 1000);
    };

    setTimeout(spawn, Math.random() * 500 + 200);
};

function activate() {

};

function send(method, body) {
    ws.send(JSON.stringify({
        method: method,
        body: body
    }));
};

// PREVENT IOS ZOOMING

document.addEventListener('gesturestart', e => {
    e.preventDefault();
});

let timestamp = 0;
document.addEventListener("touchstart", e => {
    const now = +(new Date());
    if (timestamp + 500 > now) e.preventDefault();
    timestamp = now;
});

// COPIED CODE


function timeSince(date) {

    let seconds = Math.floor((new Date() - date) / 1000);
  
    let interval = Math.floor(seconds / 31536000);
  
    if (interval >= 1) {
      return interval + "y ago";
    };

    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      return interval + "mo ago";
    };

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
      return interval + "d ago";
    };

    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      return interval + "h ago";
    };

    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      return interval + "m ago";
    };
    
    return Math.floor(seconds) + "s ago";
};