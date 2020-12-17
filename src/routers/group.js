const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Group = require('../db/schemas/group.js');
const Topic = require('../db/schemas/topic.js');
const User = require('../db/schemas/user.js');
const mongooseQueries = require('../lib/mongooseQueries');

const router = new express.Router();

router.get('/groups', async (req, res) => {

  //returns all group info for use in /groups
  //attach owner username to info
  //attach latest topic info
  //attach user info

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
    const group = await Group.findById(req.params.id);
    if(group === null){
      return res.status(400).send("Group not found");
    } else {
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

module.exports = router;
