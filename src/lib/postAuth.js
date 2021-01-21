const jwt = require('jsonwebtoken');
const User = require('../db/schemas/user');
const Token = require('../db/schemas/token');

const postAuth = async (req, res, next) => {

  try {
    const {token} = req.body;
    const user_id = jwt.verify(token, process.env.JWT_SECRET)._id;

    const checkUser = await User.findById(user_id);
    const check_token = await Token.find({token: token});

    if(!checkUser || !check_token){
      throw new Error();
    }

    next();
  } catch (err){
    return res.status(403).send('Session expired please log in');
  }

}

module.exports = postAuth;
