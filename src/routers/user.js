const express = require('express');
const mongoose = require('mongoose');
const User = require('../db/schemas/user.js');

const router = new express.Router();

router.get('/user', async (req, res) => {
  await res.send('hey fucker')
})

router.post('/user/register', async (req, res) => {

  let data = req.body;
  console.log(data);
  const check = await User.findOne({email: data.email});
  if(check != null){
    return res.status(400).send("Email already in use");
  }

  const user = new User({
    //turn req.body into User here
    //need to wire up multer to grab avatar image first to try
    email: data.email,
    password: data.password,
    username: data.username,
    signature: data.signature
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
