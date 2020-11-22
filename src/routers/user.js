const express = require('express');
const mongoose = require('mongoose');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const pipeline = promisify(require('stream').pipeline);
const User = require('../db/schemas/user.js');

const router = new express.Router();

router.post('/user/register', async (req, res) => {

  let data = req.body;
  const check_email = await User.findOne({email: data.email});
  const check_user = await User.findOne({username: data.username})
  if(check_email != null ){
    return res.status(400).send("Email already in use");
  }

  if (check_user != null){
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
    console.log(token);
    res.status(201).send(token);
  } catch (error) {
    res.status(500).send();
  }

})

  const upload = multer();
router.post('/user/:id/avatar', upload.single('file'), async (req, res, next) => {

    const filename = 'avatar' + Date.now() + '.jpg';

    await pipeline(req.file.stream,
      fs.createWriteStream(`${__dirname}/../../uploads/${filename}`));

    const user = await User.findById(req.params.id);
    if(user === null){
      return res.status(400).send("Bad request");
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

router.post('/user/:id/signature', async (req, res) => {
  const signature = req.body.signature;

  const user = await User.findById(req.params.id);
  if (user === null){
    return res.status(400).send('Bad request');
  }

  try {
    user.signature = signature;
    await user.save();
    res.status(201).send(user.signature);
  } catch (err) {
    res.status(500).send();
  }
})

router.get('/user/:id', async (req, res) => {

  //do not send back password in the endpoint
  try {
    const user = await User.findById(req.params.id);

    if(user === null){
      return res.status(400).send('User not found')
    } else {
      res.status(200).send(user);
    }
  } catch(error){
    return res.status(500).send(error)
  }

})

module.exports = router;
