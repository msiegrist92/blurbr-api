const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Token = require('./token.js')
const Schema = mongoose.Schema;

const user_schema = Schema({

  email : {
    lowercase: true,
    unique: true,
    type: String,
    required: true,
    validate(value){
      if(!validator.isEmail(value)){
        throw new Error ('Invalid email address')
      }
    }
  },

  password: {
    type: String,
    required: true,
    trim: true,
    validate(value){
      if(value.length < 6){
        throw new Error ("Password must be longer than 6 characters")
      }
      if(value.toLowerCase() === 'password'){
        throw new Error ('cmon now')
      }
    }
  },

  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    validate(value){
      if(value.length < 4){
        throw new Error ("Username must be atleast 4 characters")
      }

      if (value.length > 20){
        throw new Error ("Username must be less than 20 characters")
      }
    }
  },

  //user makes account then customizes with avatar and signature
  //default value will only be used if passed in as UNDEFINED
  signature: {
    type: String,
    default: '',
    validate(value){
      if(value.length > 120){
        throw new Error ("Signature must be shorter than 120 characters")
      }
    }
  },

  avatar: {
    type: String,
    default: 'default.jpg'
  },

  topics : [{
    type: Schema.Types.ObjectId,
    ref: "Topic"
  }],

  tokens: [{
    type: Schema.Types.ObjectId,
    ref: "Token"
  }],

  groups: [{
    type: Schema.Types.ObjectId,
    ref: "Group"
  }]

})

//hash user password before saving to DB
user_schema.pre('save', async function(next){
  const user = this;
  if (user.isModified('password')){
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
})

user_schema.methods.generateAuthToken = async function(){
  const user = this;
  const token = new Token({
    token: jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET),
    owner: user._id,
    createdAt: undefined
  });
  await token.save();
  return token;
}

const User = mongoose.model('User', user_schema);
module.exports = User;
