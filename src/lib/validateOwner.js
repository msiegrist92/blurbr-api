const jwt = require('jsonwebtoken')

const isGroupOwner = (group, token) => {
  const user_id = jwt.verify(token, process.env.JWT_SECRET)._id;
  if(user_id !== group.owner.toString()){
    return false;
  }
  return true;
}

module.exports = {
  isGroupOwner: isGroupOwner
}
