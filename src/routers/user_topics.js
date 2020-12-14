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

    let user_groups = [];
    for (let group of groups){
      await Group.findById(group).lean().then((res) => {
        return user_groups.push(res);
      })
    }


    //attach username of topic creator to response
    let user_topics = [];

    for(let topic of topics){
      await Topic.findById(topic).populate('posts').lean().then((res) => {
        return user_topics.push(res);
      })
    }

    for (let topic of user_topics){
      await User.findById(topic.author).lean().then((res) => {
        topic.author = res;
      })
    }

    for(let topic of user_topics){
      for(let user_group of user_groups){
        console.log(typeof user_group._id, typeof topic.group)
        if(user_group._id.equals(topic.group)){
          topic.group = user_group;
        }
      }
    }

    const data = {
      user,
      user_groups,
      user_topics
    }

    return res.status(200).send(data);

  } catch (err) {
    return res.status(500).send(err);
  }
})


module.exports = router;
