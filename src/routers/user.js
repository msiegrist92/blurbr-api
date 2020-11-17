const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const User = require('../db/schemas/user.js');

const router = new express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploads)
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now())
  }
})

const upload = multer({storage: storage});

router.get('/user', async (req, res) => {
  await res.send('hey fucker')
})

router.post('/user/register', async (req, res) => {

  let data = req.body;
  console.log(data);
  const check_email = await User.findOne({email: data.email});
  const check_user = await User.findOne({username: data.username})
  if(check_email != null ){
    return res.status(400).send("Email already in use");
  }

  if (check_user != null){
    return res.status(400).send("Username already in use");
  }

  const user = new User({
    //turn req.body into User here
    //need to wire up multer to grab avatar image first to try
    email: data.email,
    password: data.password,
    username: data.username,
  })

  router.post('/user/avatar', upload.single('image'), (req, res) => {
    //find user by id
    console.log(req.file);
    //update user avatar to the image uploaded
  })

  try {
    await user.save();
    res.status(201).send();
  } catch (error) {
    res.status(500).send(error);
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
    return res.status(500).send(err)
  }

})

module.exports = router;
