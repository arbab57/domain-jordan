const redis = require("redis")

const redisClient = redis.createClient()

const index = async () => {

await redisClient.connect();
}
index()

module.exports = redisClient;
