const jwt = require('jsonwebtoken');
const { SECRET_TOKEN } = require("../config/crypto")


exports.verifyEditor = async (req, res, next) => {

    try {
        const cookie = req.cookies.editorToken;
        if (!cookie) {
            return res.status(401).json({
                message: "Unauthorized editor!"
            });
        }
        jwt.verify(cookie, SECRET_TOKEN, (err, decode) => {
            if (err) {
                return res.status(403).json({
                    Message: "Invalid Token"
                })
            }
            req.id = decode.id;
            next();
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: error
        });
    }
}

