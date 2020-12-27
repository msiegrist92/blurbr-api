const express = require('express');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const pipeline = promisify(require('stream').pipeline);
const jwt = require('jsonwebtoken');
const mongooseQueries = require('../lib/mongooseQueries.js');
const User = require('../db/schemas/user.js');
const Topic = require('../db/schemas/topic.js');
const Post = require('../db/schemas/post.js');
const Token = require('../db/schemas/token.js');
const Group = require('../db/schemas/group.js');

const router = new express.Router();

router.post('/user/register', async (req, res) => {

  let data = req.body;

  const check_email = await User.findOne({email: data.email});
  const check_user = await User.findOne({username: data.username})

  if(check_email != null ){
    return res.status(400).send('Email already in use')
  }

  if(check_user != null){
    return res.status(400).send("Username already in use");
  }

  const user = new User({
      email: data.email,
      password: data.password,
      username: data.username,
      signature: 'this is at emp signature'
  })
  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send(token);
  } catch (error) {
    res.status(500).send();
  }
})


router.post('/user/login', async (req, res) => {

  const user = await User.findOne({email: req.body.email}).select("+password");
  if (user === null){
    return res.status(400).send("Incorrect username or password");
  }

  //make this async
  const match = bcrypt.compareSync(req.body.password, user.password);
  if (!match){
    return res.status(400).send('Incorrect username or password');
  }

  try {
    const token = await user.generateAuthToken();
    res.status(200).send(token);
  } catch (err) {
    res.status(500).send(err);
  }

})

//auth endpoint
const upload = multer();
router.post('/user/:id/avatar', upload.single('file'), async (req, res, next) => {

  if(!req.body.token){
    return res.status(401).send('Session expired please log in')
  }

  if(jwt.verify(req.body.token, process.env.JWT_SECRET)._id != req.params.id){
    return res.status(403).send('No')
  }

  const filename = 'avatar' + Date.now() + '.jpg';

  await pipeline(req.file.stream,
    fs.createWriteStream(`${__dirname}/../../uploads/${filename}`));

  const user = await User.findById(req.params.id);
  if(user === null){
    return res.status(404).send("User not found");
  }
  user.avatar = filename;

  try {
    await user.save();
    res.status(201).send(user);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
})

//auth endpoint
router.post('/user/:id/signature', async (req, res) => {

  if(!req.body.token){
    return res.status(401).send("Session expired please log in")
  }

  if(jwt.verify(req.body.token, process.env.JWT_SECRET)._id != req.params.id){
    return res.status(403).send('Bad request')
  }

  const signature = req.body.signature;

  const user = await User.findById(req.params.id);
  if (user === null){
    return res.status(404).send('User not found');
  }

  try {
    user.signature = signature;
    await user.save();
    res.status(201).send(user.signature);
  } catch (err) {
    res.status(500).send('Signature too long');
  }
})

//this gets a fuckload more data than is needed in some cases
router.get('/user/:id', async (req, res) => {

  //do not send back password in the endpoint
  try {
    const user = await User.findById(req.params.id).lean();
    const topics = await Topic.find({author: user._id}).lean();
    const posts = await Post.find({author: user._id}).lean();
    user.number_posts = posts.length + topics.length;
    user.topics = topics;
    user.groups = await mongooseQueries.populateByRefId(user.groups, Group);
    console.log(user);
    if(user === null){
      return res.status(400).send('User not found')
    } else {
      res.status(200).send(user);
    }
  } catch(error){
    return res.status(500).send(error)
  }

})

//route used for generating staticPaths in /users
router.get('/users/paths', async (req, res) => {
  try {
    const users = await User.find({}).lean();
    const ids = users.map((user) => {
      return {
        params : {
          id : user._id
        }
      }
    })
    res.status(200).send(ids);
  } catch (err) {
    return res.status(500).send(error)
  }
})

router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).lean();
    res.status(200).send(users);
  } catch (err) {
    res.status(500).send(err);
  }
})

router.get('/users/me/:token', async (req, res) => {
  const token = req.params.token;
  const user_id = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(user_id);
  console.log(user);
  if(!user){
    res.status(400).send();
  }

  return res.status(200).send(user);
})

router.post('/users/logout', async(req, res) => {
  //alwayus log out of all sessions
  console.log(req.body.token)
  try {
    const token = await Token.findOneAndDelete({token: req.body.token});
    console.log(token)
    return res.status(200).send()
  } catch (err){
    return res.status(500).send(err);
  }
})

router.get('/users/searchby/:option/:term', async (req, res) => {

  const {option, term} = req.params;
  const accepted_options = ['email', 'username'];

  if(!accepted_options.includes(option)){
    return res.status(400).send("Invalid search term");
  }

  const results = await User.find({[option]: term}).lean();
  for(let user of results){
    user.posts = await Post.countDocuments({author: user._id});
  }

  if(results.length === 0){
    return res.status(400).send("No users found");
  }

  return res.status(200).send(results);


})

module.exports = router;
