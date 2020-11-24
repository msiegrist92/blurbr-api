const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Topic = require('../db/schemas/topic.js');

const router = new express.Router();

router.get('/topic/:id', async (req, res) => {

  try {
    const topic = await Topic.findById(req.params.id)

    if(topic === null){
      return res.status(400).send("Topic not found");
    } else {
      return res.status(200).send(topic);
    }
  } catch (error){
    return res.status(500).send(error);
  }
})

router.get('/topic/:id/posts', async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id).populate('posts');
    if(topic === null){
      return res.status(400).send("Bad request");
    } else {
      return res.status(200).send(topic);
    }
  } catch (error) {
    return res.status(500).send(error);
  }
})

//modular route to return x number of topics in -1 sort for creating a page
router.get('/topic', async (req, res) => {;
  try {
    const topics = await Topic.find({}).populate('author');
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

  console.log(req.body);
  if(!req.body.token){
    return res.status(403).send('Log in to create a topic')
  }

  //decode token to retrieve ID of user creating the new topic
  const author = jwt.verify(req.body.token, process.env.JWT_SECRET)._id;
  console.log(author);

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
