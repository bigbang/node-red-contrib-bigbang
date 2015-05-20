module.exports = function (RED) {
    function BigBangConnectionNode(n) {
        RED.nodes.createNode(this, n);

        'use strict';
        var node = this;
        var BigBang = require('bigbang.io');
        var async = require('async');

        this.url = n.url;
        this.client = new BigBang.Client();

        var subscribeQueue = async.queue(function (task, callback) {

            var channel = this.client.getChannel(task.name);

            if (channel) {
                task.callback(null, channel);
                callback();
            }
            else {
                this.client.subscribe(task.name, function (err, channel) {
                    task.callback(err, channel);
                    callback();
                });
            }
        }.bind(this), 1);

        subscribeQueue.drain = function () {
            node.log("Subscription queue empty.");
        }

        this.STATUS_CONNECTED = {fill: "green", shape: "ring", text: "connected"};
        this.STATUS_SUBSCRIBED = {fill: "green", shape: "dot", text: "subscribed"};
        this.STATUS_DISCONNECTED = {fill: "grey", shape: "ring", text: "disconnected"};

        this.client.connect(this.url, function (err) {
            if (err) {
                node.log("Error connecting " + err);

            }
            node.emit('bigbang.connect', err);
        });

        this.client.on('disconnect', function () {
            node.emit('bigbang.disconnect');
        });


        this.subscribe = function (name, callback) {
            subscribeQueue.push({name: name, callback: callback}, function (err) {
                node.log("Subscription to channel[" + name + "] completed.");
            })
        }

        this.on('close', function () {
            this.client.disconnect();
        }.bind(this))

    }

    RED.nodes.registerType("bigbang.connection", BigBangConnectionNode);
}