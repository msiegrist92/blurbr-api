 const express = require('express');
 const mongoose = require('mongoose');
 const jwt = require('jsonwebtoken');

 const User = require('../db/schemas/user');
 const Group = require('../db/schemas/group');

 const arrayControls = require('../lib/arrayControls');
 const validateOwner = require('../lib/validateOwner');
 const mailgunFuncs = require('../lib/mailgun');
 const disbandGroup = require('../lib/disbandGroup');
 const mailgun = require('mailgun-js');

 const router = new express.Router();

 //this endpoint receives user and group id from token and sends email to group owner
 router.post('/groupmgmt/joinrequest/:token', async (req, res) => {


   const token_decode = jwt.verify(req.params.token, process.env.JWT_SECRET);

   const {user_id, group_id} = token_decode;

   const user = await User.findById(user_id);
   const group = await Group.findById(group_id);

   const owner = await User.findById(group.owner);


   if(user === null || group === null || owner === null){
     return res.status(403).send()
   }
   const approve_token = jwt.sign({user_id, group_id}, process.env.JWT_GROUP_KEY);


   mailgunFuncs.sendJoinReq(user, group, owner, approve_token);
   return res.status(200).send("Email sent")
 })

 router.post('/groupmgmt/inviteuser/:token', async (req, res) => {

   const token = req.params.token;

   const {user_email, group} = req.body;

   let owner_id = jwt.verify(token, process.env.JWT_SECRET)._id;

   const owner = await User.findById(owner_id);
   const user = await User.findOne({email: user_email});

   //make sure request is coming from the owner of the group
   const owned_group = await Group.findById(group);
   if(!owned_group.owner === user._id){
     return res.status(403).send()
   }

   const approve_token = jwt.sign({user_id: user._id, group_id: owned_group._id}, process.env.JWT_GROUP_KEY);

   mailgunFuncs.sendGroupInvite(user, owner, owned_group, approve_token);
   return res.status(200).send("Email sent");
 })

 router.get('/groupmgmt/approvereq/:token', async (req, res) => {

   const token_decode = jwt.verify(req.params.token, process.env.JWT_GROUP_KEY);

   const {user_id, group_id} = token_decode;


   const user = await User.findById(user_id);
   const group = await Group.findById(group_id);

   if(user === null || group === null){
     return res.status(403).send('Unauthorized back up')
   }

   const members = group.users;

   if(members.includes(user._id)){
     return res.send('User is already a member of your group');
   }

   group.users.push(user._id);
   await group.save();
   user.groups.push(group._id);
   await user.save();

   return res.send('User approved!')

 })

 router.post('/groupmgmt/removeusers', async (req, res) => {


   const {selections, group_id, user_token} = req.body;


   const group = await Group.findById(group_id);

   if(!validateOwner.isGroupOwner(group, user_token)){
     return res.status(403).send();
   }

   const current_members = arrayControls.objIDToString(group.users)

   const new_members = arrayControls.removeSelections(selections, current_members);

   group.users = new_members;
   await group.save();

   return res.status(200).send('Users removed');
 })

 router.post('/groupmgmt/removetopics', async (req, res) => {

   const {selections, group_id, user_token} = req.body;

   const group = await Group.findById(group_id);

   if(!validateOwner.isGroupOwner(group, user_token)){
     return res.staus(403).send()
   }

   const current_topics = arrayControls.objIDToString(group.topics)

   const new_topics = arrayControls.removeSelections(selections, current_topics);

   group.topics = new_topics;
   await group.save();

   return res.status(200).send('Topics removed')
 })

 router.post('/groupmgmt/disbandgroup', async (req, res) => {
   const {group_id, user_token} = req.body;

   const group = await Group.findById(group_id);

   const user_id = jwt.verify(user_token, process.env.JWT_SECRET)._id;


   if(!validateOwner.isGroupOwner(group, user_token)){
     return res.status(403).send();
   }

   await disbandGroup.disbandGroup(group_id);

   await group.remove();
   return res.status(200).send();
 })

 module.exports = router;
