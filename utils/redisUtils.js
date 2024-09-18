const redisClient = require("../config/redis");

const clearCache = () => {
  redisClient.flushAll();
};

async function deleteKeys(pattern) {
  let cursor = "0";
  const reply = await redisClient.scan(cursor, { MATCH: pattern, COUNT: 1000 });
  for (key of reply.keys) {
    cursor = reply.cursor;
    await redisClient.del(key);
  }
}

module.exports = {clearCache, deleteKeys}
