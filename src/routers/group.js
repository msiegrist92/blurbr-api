const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Group = require('../db/schemas/group.js');
const Topic = require('../db/schemas/topic.js');
const User = require('../db/schemas/user.js');
const Token = require('../db/schemas/token.js');
const mongooseQueries = require('../lib/mongooseQueries');
const mailgun = require('mailgun-js');

const router = new express.Router();

router.get('/groups', async (req, res) => {

  try {
    const groups = await Group.find({}).lean();

    await mongooseQueries.loopFindRefAndAttach(groups, User, 'owner', 'owner');

    await mongooseQueries.loopFindRefLastIndexAndAttach(groups, Topic, 'topics', 'most_recent')


    return res.status(200).send(groups);
  } catch (err){
    return res.status(500).send(err);
  }
})

router.get('/group/:id', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).lean();
    if(group === null){
      return res.status(400).send("Group not found");
    } else {

      await mongooseQueries.loopFindRefAndAttach(group, User, 'owner', 'owner');
      group.topics = await mongooseQueries.populateByRefId(group.topics, Topic)
      group.users = await mongooseQueries.populateByRefId(group.users, User);
      return res.status(200).send(group);
    }
  } catch (err){
    return res.status(500).send(err);
  }
})

//get topics for group router


//get users for group router

//post new group router
router.post('/group', async (req, res) => {

  if(!req.body.token){
    return res.status(403).send("Log in to create a new group")
  }

  const owner = jwt.verify(req.body.token, process.env.JWT_SECRET)._id;

  const group = new Group({
    name: req.body.name,
    owner,
    users: [owner],
    topics: []
  })

  try {
    await group.save();
    res.status(201).send(group);
  } catch (err){
    res.status(500).send(erro);
  }
})

router.post('/group/joinrequest/:token', async (req, res) => {
  console.log(req.params.token)

  const token = Token.findOne({token: req.params.token});
  if(!token){
    return res.status(403).send("You must log in to request a group");
  }

  const user_id = jwt.verify(req.params.token, process.env.JWT_SECRET)._id;

  const domain = 'sandbox5da1889582d94201a8cdecedb7a36b1d.mailgun.org';
  const mg = mailgun({apiKey: process.env.MAILGUN_KEY, domain});
  const data = {
    from : "Blurbr Groups <groups@blurbr.com>",
    to: 'm.siegrist92@gmail.com',
    subject: "Good ol' Mailgun Test",
    text: "Testing testing 1 2"
  };
  mg.messages().send(data, (err, body) => {
    console.log(body)
  })
  return res.status(200).send('Email sent')


})



module.exports = router;
