const express = require('express');
const mongoose = require('mongoose');
const Post = require('../db/schemas/post.js');

const router = new express.Router();

router.get('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if(post === null){
      return res.status(400).send("Post not found");
    } else {
      return res.status(200).send(post);
    }
  } catch (error){
    return res.status(500).send(error)
  }
})

router.get('/posts/:id/author', async (req,res) => {
  try {
    const post = await Post.findById(req.params.id);

    if(post === null){
      return res.status(400).send("Bad request").populate('author');
    } else {
      return res.status(200).send(post);
    }
  } catch (error){
    return res.status(500).send(error);
  }
})

router.get('/posts/:id/topic', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('topic');

    if(post === null){
      return res.status(400).send("Bad request");
    } else {
      return res.status(200).send(post);
    }
  } catch (error){
    return res.status(500).send(error);
  }
})

//attach user id to new post creation using token
//attach id of topic to body when making a new post
router.post('/posts', async (req, res) => {
  let data = req.body;
  const post = new Post({
    body: data.body
  })

  try {
    await post.save();
    res.status(201).send();
  } catch (error) {
    res.status(500).send(error);
  }
})

module.exports = router;
