require("dotenv").config();
const amplib = require("amqplib");

let connection;
let pubChannel;
let subChannel;

async function connect() {
  if (connection) return connection;

  try {
    connection = await amplib.connect(process.env.AMPLIB_URL);
    console.log("Connected to RabbitMQ");

    connection.on("error", (err) => {
      console.error("RabbitMQ connection error:", err?.message || err);
      connection = null;
      pubChannel = null;
      subChannel = null;
    });

    connection.on("close", () => {
      console.warn("RabbitMQ connection closed");
      connection = null;
      pubChannel = null;
      subChannel = null;
    });

    return connection;
  } catch (error) {
    console.error("Failed to connect to RabbitMQ:", error?.message || error);
    throw error;
  }
}

async function getPubChannel() {
  await connect();
  if (!pubChannel) {
    pubChannel = await connection.createChannel();
  }
  return pubChannel;
}

async function getSubChannel() {
  await connect();
  if (!subChannel) {
    subChannel = await connection.createChannel();
  }
  return subChannel;
}

async function uploadToQueue(queueName, data = {}) {
  try {
    const ch = await getPubChannel();
    await ch.assertQueue(queueName, { durable: true });
    const sent = ch.sendToQueue(
      queueName,
      Buffer.from(JSON.stringify(data)),
      { persistent: true }
    );
    console.log(`Message sent to queue ${queueName}:`, data);
    return sent;
  } catch (error) {
    console.error(`Error uploading to queue ${queueName}:`, error?.message || error);
    throw error;
  }
}

async function consumeFromQueue(queueName, callback) {
  try {
    const ch = await getSubChannel();
    await ch.assertQueue(queueName, { durable: true });

    const consumer = await ch.consume(queueName, async (msg) => {
      if (msg !== null) {
        const messageContent = msg.content.toString();
        console.log(`Message received from queue ${queueName}:`, messageContent);
        try {
          await callback(messageContent);
          ch.ack(msg);
        } catch (error) {
          console.error(
            `Error processing message from queue ${queueName}:`,
            error?.message || error
          );
          ch.nack(msg, false, false);
        }
      }
    });

    console.log(`Consumer active on queue [${queueName}] (ConsumerTag: ${consumer.consumerTag})`);
  } catch (error) {
    console.error(`Error subscribing to queue ${queueName}:`, error?.message || error);
    throw error;
  }
}

module.exports = {
  connect,
  connection,
  getPubChannel,
  getSubChannel,
  consumeFromQueue,
  uploadToQueue,
};