const amqp = require('amqplib/callback_api');
const config = require('config');
const QUEUE_NAME = config.get('queue_name');

let globalChannel;

amqp.connect('amqp://localhost', function (error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function (error1, channel) {
        if (error1) {
            throw error1;
        } 
        
        channel.assertQueue(QUEUE_NAME, {
            durable: false
        });

        globalChannel = channel;

    });
});

exports.getChannel = function () {
    return globalChannel;
}
