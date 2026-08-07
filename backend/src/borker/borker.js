const amplib = require('amqplib');
let connection , channel;


async function connect() {
    if (connection) return connection;

    try {
        connection = await amplib.connect(process.env.AMPLIB_URL);
        console.log('Connected to RabbitMQ');
        channel = await connection.createChannel();
      
    } catch (error) {
        console.error('Failed to connect to RabbitMQ:', error);
        
    }
}


async function uploadToQueue(queueName, data ={}) {
    if (!channel || !connection) await connect()

        await  channel.assertQueue(queueName, { durable: true });
         channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));

          console.log(`Message sent to queue ${queueName}:`, data); 
        }


async function consumeFromQueue(queueName, callback) {
      
    if (!channel || !connection) await connect()

    channel.assertQueue(queueName, { durable: true });

    channel.consume(queueName, (msg) => {
        if (msg !== null) {
            const messageContent = msg.content.toString();
            console.log(`Message received from queue ${queueName}:`, messageContent);
            callback(messageContent);
            channel.ack(msg);
        }
    });

}        

module.exports = {
    connect,
    connection,
     channel,
    consumeFromQueue,
    uploadToQueue
}