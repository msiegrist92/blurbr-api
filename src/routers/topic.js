const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Topic = require('../db/schemas/topic.js');
const User = require('../db/schemas/user.js');
const Post = require('../db/schemas/post.js');
const Group = require('../db/schemas/group.js');
const mongooseQueries = require('../lib/mongooseQueries');

const router = new express.Router();

router.get('/topics', async (req, res) => {
  try {
    const topics = await Topic.find({}).lean()
    return res.status(200).send(topics);
  } catch (err){
    return res.status(500).send(err);
  }
})

router.get('/topic/:id', async (req, res) => {

  try {

    //lean is used to make response JSON instead of mongoose doc schema
    const topic = await Topic.findById(req.params.id).populate('posts').lean();
    const posts = topic.posts;

    await mongooseQueries.loopFindRefAndAttach(posts, User, 'author', 'user')

    //attach user document to JSON res
    const topic_author = await User.findById(topic.author).lean();
    topic.user = topic_author;

    const body = {
      topic,
      posts
    }
    return res.status(200).send(body);

  } catch (error){
    return res.status(500).send(error);
  }
})

router.get('/topic/:id/posts', async (req, res) => {
  //mongoose enforces object id verify so will error before return null
  try {
    const topic = await Topic.findById(req.params.id).populate('posts');
    //does this not catch on error??
    return res.status(200).send(topic);

  } catch (error) {
    return res.status(500).send(error);
  }
})

//route which returns all topics for use in all topics home page of client
router.get('/topic', async (req, res) => {;
  try {
    const topics = await Topic.find({}).populate('author').lean();
    //this can be replaced with a mongooseQueries method
    for (let topic of topics){
      await Topic.findById(topic._id).populate('posts').lean().then((res) => {
        topic.length = res.posts.length;
      })
    }
    res.status(200).send(topics);
  } catch (error) {
    res.status(500).send(error);
  }
})

router.get('/topic/:id/author', async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id).populate('author');

    return res.status(200).send(topic);

  } catch (error) {
    return res.status(500).send(error);
  }
})

//attach user id to topic when creating new topic
router.post('/topic', async (req, res) => {

  const {title, body, group, token} = req.body;

  if(!token){
    return res.status(403).send('Log in to create a topic')
  }

  try {

    const author = jwt.verify(token, process.env.JWT_SECRET)._id;

    const topic = new Topic({
      title,
      body,
      author,
      group
    });

    const group_db = await Group.findById(group);
    group_db.topics.push(topic._id);
    await group_db.save();

    const user = await User.findById(author);
    user.topics.push(topic._id);
    await user.save();

    await topic.save();
    res.status(201).send(topic);
  } catch (error){
    res.status(500).send(error);
  }
})


module.exports = router;
