const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Topic = require('../db/schemas/topic.js');
const User = require('../db/schemas/user.js');
const Post = require('../db/schemas/post.js');

const router = new express.Router();

router.get('/topic/:id', async (req, res) => {

  try {

    //lean is used to make response JSON instead of mongoose doc schema
    const topic = await Topic.findById(req.params.id).populate('posts').lean();
    const posts = topic.posts;

    //user data is added to matching post object
    for(let post of posts){
      await User.findById(post.author).lean().then((res) => {
        post.user = res;
      })
    }

    const topic_author = await User.findById(topic.author).lean();
    topic.user = topic_author;

    const body = {
      topic,
      posts
    }
    if(topic === null){
      return res.status(400).send("Topic not found");
    } else {
      return res.status(200).send(body);
    }
  } catch (error){
    return res.status(500).send(error);
  }
})

router.get('/topic/:id/posts', async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id).populate('posts');
    console.log(topic);
    if(topic === null){
      return res.status(400).send("Bad request");
    } else {
      return res.status(200).send(topic);
    }
  } catch (error) {
    return res.status(500).send(error);
  }
})

//route which returns all topics for use in all topics home page of client
router.get('/topic', async (req, res) => {;
  try {
    const topics = await Topic.find({}).populate('author').lean();
    for (let topic of topics){
      await Topic.findById(topic._id).populate('posts').lean().then((res) => {
        topic.length = res.posts.length;
      })
    }
    console.log(topics);
    res.status(200).send(topics);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
})

router.get('/topic/:id/author', async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id).populate('author');
    if (topic === null){
      return res.status(400).send("Bad request");
    } else {
      return res.status(200).send(topic);
    }
  } catch (error) {
    return res.status(500).send(error);
  }
})

//attach user id to topic when creating new topic
router.post('/topic', async (req, res) => {

  if(!req.body.token){
    return res.status(403).send('Log in to create a topic')
  }

  //decode token to retrieve ID of user creating the new topic
  const author = jwt.verify(req.body.token, process.env.JWT_SECRET)._id;

  const topic = new Topic({
    title: req.body.title,
    body: req.body.body,
    author
  })

  try {
    await topic.save();
    res.status(201).send(topic);
  } catch (error){
    res.status(500).send(error);
  }
})


module.exports = router;
