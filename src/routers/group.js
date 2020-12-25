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

//this endpoint receives user and group id from token and sends email to group owner
router.post('/group/joinrequest/:token', async (req, res) => {


  const token_decode = jwt.verify(req.params.token, process.env.JWT_SECRET);

  const {user_id, group_id} = token_decode;

  const user = await User.findById(user_id);
  const group = await Group.findById(group_id);

  const owner = await User.findById(group.owner);

  console.log(user, group, owner)

  if(user === null || group === null || owner === null){
    return res.status(403).send()
  }
  const approve_token = jwt.sign({user_id, group_id}, process.env.JWT_GROUP_KEY);

  const user_url = 'http://' + process.env.CLIENT_URL + '/users/' + user._id;
  console.log(user_url)
  const approve_url = 'http://' + process.env.API_URL + '/group/approvereq/' + approve_token;
  console.log(user_url)

  const domain = 'sandbox5da1889582d94201a8cdecedb7a36b1d.mailgun.org';
  const mg = mailgun({apiKey: process.env.MAILGUN_KEY, domain});
  const data = {
    from : "Blurbr Groups <groups@blurbr.com>",
    to: 'm.siegrist92@gmail.com',
    subject: `Blurbr User ${user.username} would like to join your group ${group.name}`,
    html: `<html><body><p>Hello there ${owner.username} - ${user.username} would like to join one of your groups.</p>
      <button><a href="${user_url}">View Profile</a></button>
      <button><a href="${approve_url}">Approve Request</a></button>
      </body>
      </html> `
  };
  mg.messages().send(data, (err, body) => {
    console.log(body)
  })
  return res.status(200).send('Email sent')

})

router.get('/group/approvereq/:token', async (req, res) => {

  const token_decode = jwt.verify(req.params.token, process.env.JWT_GROUP_KEY);

  const {user_id, group_id} = token_decode;

  const user = await User.findById(user_id);
  const group = await Group.findById(group_id);

  if(user === null || group === null){
    return res.status(403).send('Unauthorized back up')
  }

  const members = group.users;

  if(members.includes(user._id)){
    return res.send('User is already a member of your group');
  }

  group.users.push(user._id);
  await group.save();

  return res.send('User approved!')

})


module.exports = router;
