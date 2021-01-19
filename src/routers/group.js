const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Group = require('../db/schemas/group.js');
const Topic = require('../db/schemas/topic.js');
const User = require('../db/schemas/user.js');
const Token = require('../db/schemas/token.js');
const mongooseQueries = require('../lib/mongooseQueries');
const arrayControls = require('../lib/arrayControls');
const validateOwner = require('../lib/validateOwner');
const mailgunFuncs = require('../lib/mailgun');
const disbandGroup = require('../lib/disbandGroup');
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


    await mongooseQueries.loopFindRefAndAttach(group, User, 'owner', 'owner');
    group.topics = await mongooseQueries.populateByRefId(group.topics, Topic)
    group.users = await mongooseQueries.populateByRefId(group.users, User);
    return res.status(200).send(group);
  }
 catch (err){
    return res.status(500).send(err);
  }
})


router.post('/group', async (req, res) => {

  const {token, name, description} = req.body;

  if(!token){
    return res.status(403).send("Log in to create a new group")
  }


  try {
    const owner_id = jwt.verify(token, process.env.JWT_SECRET)._id;

    const group = new Group({
      name,
      owner: owner_id,
      description,
      users: [owner_id],
      topics: []
    })
    const owner = await User.findById(owner_id);
    owner.groups.push(group._id);

    await group.save();
    await owner.save();
    res.status(201).send(group);
  } catch (err){
    res.status(500).send(err);
  }
})


module.exports = router;
