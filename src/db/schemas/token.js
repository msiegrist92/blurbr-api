const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const token_schema = Schema({

  id: Schema.Types.ObjectId,

  owner: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },

  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3000
  },

  token: {
    type: String,
    required: true,
    unique: true
  }

})

const Token = mongoose.model("Token", token_schema);
module.exports = Token;
