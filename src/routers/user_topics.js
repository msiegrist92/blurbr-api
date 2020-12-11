const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Topic = require('../db/schemas/topic.js');
const User = require('../db/schemas/user.js');
const Post = require('../db/schemas/post.js');
const Group = require('../db/schemas/group.js');

const router = new express.Router();

router.get('/user_topics/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    console.log('user_groups', user.groups);
    const groups = user.groups;
    for(let group of groups){
      let user_group = await Group.findById(group);
      console.log(user_group);
    }

  } catch (err) {
    return res.status(500).send(err);
  }
})


module.exports = router;
