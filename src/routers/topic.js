const express = require('express');
const mongoose = require('mongoose');
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
router.get('topic/all', async (req, res) => {
  try {
    const topics = Topic.find({});
    res.status(200).send(topics);
  } catch (error) {
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
  let data = req.body;
  const topic = new Topic({
    title: data.title,
  })

  try {
    await topic.save();
    res.status(201).send();
  } catch (error){
    res.status(500).send(error);
  }
})


module.exports = router;
