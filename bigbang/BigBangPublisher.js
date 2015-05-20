module.exports = function (RED) {

    function BigBangPublisherNode(config) {
        'use strict';
        var node = this;
        var BigBang = require('bigbang.io');

        RED.nodes.createNode(this, config);

        var connection = RED.nodes.getNode(config.connection);
        node.status(connection.STATUS_DISCONNECTED);

        var channelName = config.channel;
        var channel;

        connection.on('bigbang.connect', function (err) {

            node.status(connection.STATUS_CONNECTED);

            var client = connection.client;

            connection.subscribe(channelName, function (err, c) {
                if (err) {
                    node.error("ERROR:  " + err);
                    return;
                }

                channel = c;
                node.status(connection.STATUS_SUBSCRIBED);
            })
        });

        connection.on('bigbang.disconnect', function () {
            node.status(connection.STATUS_DISCONNECTED);
        });
        
        node.on("input", function (msg) {
            if (channel) {
                channel.publish(msg.payload);
            }
        });
    }

    RED.nodes.registerType("bigbang publisher", BigBangPublisherNode);
}