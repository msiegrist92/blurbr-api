const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Topic = require('../db/schemas/topic.js');
const User = require('../db/schemas/user.js');
const Post = require('../db/schemas/post.js');
const Group = require('../db/schemas/group.js');
const mongooseQueries = require('../lib/mongooseQueries.js');

const router = new express.Router();

//returns topics that a user has created

router.get('/user_topics/:id', async (req, res) => {

  try {

    const user = await User.findById(req.params.id).lean();

    //groups and topics contain array of IDs matching ref records
    const {groups, topics} = user;

    const user_groups = await mongooseQueries.populateByRefId(groups, Group);

    const user_topics = await mongooseQueries.populateByRefIdWithVirtual(topics, Topic, 'posts');

    await mongooseQueries.loopFindRefAndAttach(user_topics, User, 'author', 'author');

    await mongooseQueries.loopFindRefAndAttach(user_topics, Group, 'group', 'group');

    const data = {
      user_groups,
      user_topics
    }

    return res.status(200).send(data);

  } catch (err) {
    return res.status(500).send(err);
  }
})

//returns topics that belong to groups a user is a member of

router.get('/member_topics/:id', async (req, res) => {

  const {id} = req.params;

  try {
    const user = await User.findById(id);

    const groups = user.groups;
    let all_topics = [];
    for(let group of groups){
      let topics = await Topic.find({group: group});
      for(let topic of topics){
        all_topics.push(topic);
      }
    }

    const user_groups = await mongooseQueries.populateByRefId(groups, Group);
    const member_topics = await mongooseQueries.populateByRefIdWithVirtual(all_topics, Topic, 'posts')

    await mongooseQueries.loopFindRefAndAttach(member_topics, User, 'author', 'author');

    await mongooseQueries.loopFindRefAndAttach(member_topics, Group, 'group', 'group');


    const data = {
      member_topics,
      user_groups
    }

    return res.status(200).send(data);

  } catch (err) {
    return res.status(500).send(err);
  }

})


module.exports = router;
