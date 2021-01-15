const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Group = require('../db/schemas/group.js');
const Topic = require('../db/schemas/topic.js');
const User = require('../db/schemas/user.js');
const Post = require('../db/schemas/post.js');
const mongooseQueries = require('../lib/mongooseQueries');

const router = new express.Router();

//returns groups which user owns

router.get('/user_groups/:id', async (req, res) => {

  try {
    const user = await User.findById(req.params.id);

    const groups = await Group.find({owner : req.params.id}).lean();

    //var to loop over, Schema to search, ref field name, attach point of var
    await mongooseQueries.loopFindRefAndAttach(groups, User, 'owner', 'owner');

    await mongooseQueries.loopFindRefLastIndexAndAttach(groups, Topic, 'topics', 'most_recent');

    console.log(groups);

    return res.status(200).send(groups);

  } catch (err) {
    return res.status(500).send(err)
  }
})

//returns groups which user is a member of

router.get('/member_groups/:id', async (req, res) => {

  try {
    const user = await User.findById(req.params.id);

    const groups = await Group.find({users : req.params.id}).lean();

    //var to loop over, Schema to search, ref field name, attach point of var
    await mongooseQueries.loopFindRefAndAttach(groups, User, 'owner', 'owner');

    await mongooseQueries.loopFindRefLastIndexAndAttach(groups, Topic, 'topics', 'most_recent');

    console.log(groups);

    return res.status(200).send(groups);

  } catch (err) {
    return res.status(500).send(err)
  }
})



module.exports = router;
