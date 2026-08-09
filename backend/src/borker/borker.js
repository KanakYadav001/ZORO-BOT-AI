const amplib = require("amqplib");
let connection, channel;

async function connect() {
  if (connection) return connection;

  try {
    connection = await amplib.connect(process.env.AMPLIB_URL);
    console.log("Connected to RabbitMQ");
    channel = await connection.createChannel();
    return connection;
  } catch (error) {
    console.error("Failed to connect to RabbitMQ:", error);
    throw error;
  }
}

async function uploadToQueue(queueName, data = {}) {
  if (!channel || !connection) await connect();

  await channel.assertQueue(queueName, { durable: true });
  const sent = channel.sendToQueue(
    queueName,
    Buffer.from(JSON.stringify(data)),
  );

  console.log(`Message sent to queue ${queueName}:`, data);
  return sent;
}

async function consumeFromQueue(queueName, callback) {
  if (!channel || !connection) await connect();

  await channel.assertQueue(queueName, { durable: true });

  await channel.consume(queueName, async (msg) => {
    if (msg !== null) {
      const messageContent = msg.content.toString();
      console.log(`Message received from queue ${queueName}:`, messageContent);
      try {
        await callback(messageContent);
        channel.ack(msg);
      } catch (error) {
        console.error(
          `Error processing message from queue ${queueName}:`,
          error,
        );
        channel.nack(msg, false, true);
      }
    }
  });
}

module.exports = {
  connect,
  connection,
  channel,
  consumeFromQueue,
  uploadToQueue,
};
