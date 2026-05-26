const IORedis = require('ioredis');
const config = require('./index');

let connection;

function getRedisConnection() {
  if (connection) return connection;

  connection = new IORedis(config.redis.url, {
    maxRetriesPerRequest: null, // required by BullMQ
  });

  connection.on('error', (err) => {
    console.error('Redis connection error:', err.message);
  });

  return connection;
}

module.exports = { getRedisConnection };
