const EventEmitter = require('events').EventEmitter,
      rp = require('request-promise-native'),
      util = require('util');

/*
                              .__                                  
     ____   ____ ___.__. ____ |  |   ____      ____  ____   _____  
    /  _ \ /    <   |  |/  _ \|  |  /  _ \   _/ ___\/  _ \ /     \ 
   (  <_> )   |  \___  (  <_> )  |_(  <_> )  \  \__(  <_> )  Y Y  \
    \____/|___|  / ____|\____/|____/\____/ /\ \___  >____/|__|_|  /
                \/\/                        \/     \/            \/ 
                          ᴏɴʏᴏʟᴏ ᴀᴘɪ ᴀᴄᴄᴇss
*/

// authentication functions, variables, etc.


let generate = {
    session: function() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    },
    token: function() {
        return Buffer.from(generate.session()).toString('base64');
    }
};

function send(code, message) {
    return new Promise((resolve, reject) => {
        if (!code || !message) return reject("AN ARGUMENT IS MISSING");
        let options = {
            method: 'POST',
            uri: `http://onyolo.com/${code}/message`,
            body: { text: message, cookie: generate.session() },
            json: true,
            proxy: 'http://35.235.75.244:3128'
        };

        rp(options).then(res => {
            if (res == "ok") return resolve(res);
            reject(res);
        }).catch(err => reject(err));
    });
};

const default_user = {
    identifier: null,
    username: null,
    name: null,
    avatar: null,
    created: null,
    updated: null
};

function Client() {
    let internal = this;

    this.user = default_user;

    this.get = {
        user: function (code) {
            const options = {
                method: 'GET',
                uri: `https://api.onyolo.com/classes/_User/${code}`,
                headers: {  'x-parse-application-id': 'RTE8CXsUiVWfG1XlXOyJAxfonvt' },
                proxy: 'http://35.235.75.244:3128'
            };
        
            return new Promise((resolve, reject) => {
                if (!code) return reject("NO ID PROVIDED");
                rp(options).then(info => {
                    info = JSON.parse(info);
                    internal.user = {
                        identifier: info.objectId,
                        username: info.username,
                        name: info.displayName,
                        avatar: info.bitmojiAvatarUrl,
                        created: new Date(info.createdAt),
                        updated: new Date(info.updatedAt)
                    };
                    resolve(internal.user);
                }).catch(err => reject(err));
            });
        },
        messages: function () {
            const options = {
                method: 'POST',
                uri: 'https://api.onyolo.com/functions/getMessages',
                headers: { 'x-parse-application-id': 'RTE8CXsUiVWfG1XlXOyJAxfonvt', 'x-parse-session-token': internal.session },
                body: {
                    as: generate.token(),
                    timestamp: new Date().getTime(),
                    before: {
                        __type: "Date",
                        iso: new Date().toISOString()
                    },
                    skip: 0
                },
                json: true,
                proxy: 'http://35.235.75.244:3128'
            };
        
            return new Promise((resolve, reject) => {
                if (!internal.session) return reject("NOT LOGGED IN");
                rp(options).then(messages => {
                    if (messages) return resolve(messages.result);
                    reject(messages);
                }).catch(err => reject(err));
            });
        }
    };

    this.delete = {
        message: function (message) {        
            return new Promise((resolve, reject) => {
                if (!internal.session) return reject("NOT LOGGED IN");
                if (!message) return reject("NO ID PROVIDED");

                if (message.objectId) message = message.objectId;

                const options = {
                    method: 'POST',
                    uri: 'https://api.onyolo.com/functions/deleteMessage',
                    headers: { 'x-parse-application-id': 'RTE8CXsUiVWfG1XlXOyJAxfonvt', 'x-parse-session-token': internal.session },
                    body: {
                        messageId: message,
                        as: generate.token(),
                        timestamp: new Date().getTime()
                    },
                    json: true,
                    proxy: 'http://35.235.75.244:3128'
                };

                rp(options).then(success => {
                    resolve(success);
                }).catch(err => reject(err));
            });
        },
        messages: function () {
            internal.get.messages().then(messages => {
                messages.forEach(message => internal.delete.message(message));
            }).catch(err => console.error(err));
        },
        session: function () {
            const options = {
                method: 'POST',
                uri: 'https://api.onyolo.com/logout',
                headers: { 'x-parse-application-id': 'RTE8CXsUiVWfG1XlXOyJAxfonvt', 'x-parse-session-token': internal.session }
            };

            return new Promise((resolve, reject) => {
                rp(options).then(success => {
                    this.session = null;
                    this.user = default_user;
                    resolve(null);
                }).catch(err => reject(err));
            });
        }
    }
    
    this.login = function (code) {
        return new Promise((resolve, reject) => {
            internal.get.user(code).then(info => {
                const current = new Date().getTime();
            
                const options = {
                    method: 'POST',
                    uri: 'https://api.onyolo.com/functions/login',
                    headers: { 'x-parse-application-id': 'RTE8CXsUiVWfG1XlXOyJAxfonvt' },
                    body: { timestamp: current, snapchatId: info.username, as: generate.token() },
                    json: true,
                    proxy: 'http://35.235.75.244:3128'
                };
            
                rp(options).then(info => {
                    if (!info.result) return reject("NO SESSION ID FOUND");
                    internal.session = info.result;
                    
                    resolve(info);
                    internal.emit('ready');
                });
            }).catch(err => reject(err));
        });
    };
};

util.inherits(Client, EventEmitter);

// module export

module.exports = { Client: Client, send: send };