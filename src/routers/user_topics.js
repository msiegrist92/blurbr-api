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

    const groups = user.groups;
    const topics = user.topics;

    console.log(topics);

    let user_groups = [];
    for (let group of groups){
      await Group.findById(group).then((res) => {
        return user_groups.push(res);
      })
    }

    let user_topics = [];
    for(let topic of topics){
      await Topic.findById(topic).then((res) => {
        return user_topics.push(res);
      })
    }

    const data = {
      user,
      user_groups,
      user_topics
    }

    console.log(data);

    return res.status(200).send(data);

  } catch (err) {
    return res.status(500).send(err);
  }
})


module.exports = router;
