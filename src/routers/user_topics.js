const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Topic = require('../db/schemas/topic.js');
const User = require('../db/schemas/user.js');
const Post = require('../db/schemas/post.js');
const Group = require('../db/schemas/group.js');
const mongooseQueries = require('../lib/mongooseQueries.js');

const router = new express.Router();

router.get('/user_topics/:id', async (req, res) => {

  try {
    const user = await User.findById(req.params.id).lean();

    //groups and topics contain array of IDs matching ref records
    const groups = user.groups;
    const topics = user.topics;


    const user_groups = await mongooseQueries.populateByRefId(groups, Group);

    const user_topics = await mongooseQueries.populateByRefIdWithVirtual(topics, Topic, 'posts');

    await mongooseQueries.loopFindRefAndAttach(user_topics, User, 'author', 'author');


    //adds correct group information to topic
    for(let topic of user_topics){
      console.log(topic.group)
      for(let user_group of user_groups){
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
