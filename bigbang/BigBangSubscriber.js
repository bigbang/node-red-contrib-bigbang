module.exports = function (RED) {
    function BigBangNode(config) {
        'use strict';
        var node = this;
        var BigBang = require('bigbang.io');

        RED.nodes.createNode(this, config);
        var connection = RED.nodes.getNode(config.connection);

        node.status(connection.STATUS_DISCONNECTED);

        var channelName = config.channel;

        if (!channelName) {
            node.error("Channel required, check config!");
        }

        connection.on('bigbang.connect', function (err) {
            node.status(connection.STATUS_CONNECTED);
            connection.subscribe(channelName, function (err, channel) {
                node.status(connection.STATUS_SUBSCRIBED);
                channel.on('message', function (msg) {
                    var m = {};
                    m.payload = msg.payload.getBytesAsJSON();
                    node.send(m);
                });
            });
        });

        connection.on('bigbang.disconnect', function () {
            node.status(connection.STATUS_DISCONNECTED);
        });
    }

    RED.nodes.registerType("bigbang subscribe", BigBangNode);
}