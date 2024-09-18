const redisClient = require("../config/redis");
const hash = require("object-hash");

function requestToKey(req) {
  const reqDataToHash = {
    query: req.query,
    body: req.body,
  };
  if(req?.id) {
    return `${req.path}/${req.id}@${hash.sha1(reqDataToHash)}`;
  }
  return `${req.path}@${hash.sha1(reqDataToHash)}`;
}

function isRedisWorking() {
  return !!redisClient?.isOpen;
}

exports.checkCache = () => {
  if(isRedisWorking()) {
    return async (req, res, next) => {
      try {
        const key = requestToKey(req);
        const data = await redisClient.get(key);
        if (data) {
          // console.log("Cache Hit");
          return res.json(JSON.parse(data));
        } else {
          // console.log("Cache miss");
          const oldSend = res.send;
          res.send = function (data) {
            res.send = oldSend;
  
            if (res.statusCode.toString().startsWith("2")) {
              redisClient.setEx(key, 3600, JSON.stringify(JSON.parse(data)));
            }
            return res.send(data);
          };
        }
  
        next();
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
      }
    };
  }else{
    next()
  }
};
