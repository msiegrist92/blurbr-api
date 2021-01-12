const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Group = require('../db/schemas/group.js');
const Topic = require('../db/schemas/topic.js');
const User = require('../db/schemas/user.js');
const Token = require('../db/schemas/token.js');
const mongooseQueries = require('../lib/mongooseQueries');
const arrayControls = require('../lib/arrayControls');
const validateOwner = require('../lib/validateOwner');
const mailgun = require('mailgun-js');

const router = new express.Router();

router.get('/groups', async (req, res) => {

  try {
    const groups = await Group.find({}).lean();

    await mongooseQueries.loopFindRefAndAttach(groups, User, 'owner', 'owner');

    await mongooseQueries.loopFindRefLastIndexAndAttach(groups, Topic, 'topics', 'most_recent')


    return res.status(200).send(groups);
  } catch (err){
    return res.status(500).send(err);
  }
})

router.get('/group/:id', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).lean();
    if(group === null){
      return res.status(400).send("Group not found");
    } else {

      await mongooseQueries.loopFindRefAndAttach(group, User, 'owner', 'owner');
      group.topics = await mongooseQueries.populateByRefId(group.topics, Topic)
      group.users = await mongooseQueries.populateByRefId(group.users, User);
      return res.status(200).send(group);
    }
  } catch (err){
    return res.status(500).send(err);
  }
})


router.post('/group', async (req, res) => {

  if(!req.body.token){
    return res.status(403).send("Log in to create a new group")
  }


  try {
    const owner_id = jwt.verify(req.body.token, process.env.JWT_SECRET)._id;

    const group = new Group({
      name: req.body.name,
      owner: owner_id,
      description: req.body.description,
      users: [owner_id],
      topics: []
    })
    const owner = await User.findById(owner_id);
    owner.groups.push(group._id);

    await group.save();
    await owner.save();
    res.status(201).send(group);
  } catch (err){
    res.status(500).send(err);
  }
})

//this endpoint receives user and group id from token and sends email to group owner
router.post('/group/joinrequest/:token', async (req, res) => {


  const token_decode = jwt.verify(req.params.token, process.env.JWT_SECRET);

  const {user_id, group_id} = token_decode;

  const user = await User.findById(user_id);
  const group = await Group.findById(group_id);

  const owner = await User.findById(group.owner);


  if(user === null || group === null || owner === null){
    return res.status(403).send()
  }
  const approve_token = jwt.sign({user_id, group_id}, process.env.JWT_GROUP_KEY);

  const user_url = 'http://' + process.env.CLIENT_URL + '/users/' + user._id;
  const approve_url = 'http://' + process.env.API_URL + '/group/approvereq/' + approve_token;

  const domain = 'sandbox5da1889582d94201a8cdecedb7a36b1d.mailgun.org';
  const mg = mailgun({apiKey: process.env.MAILGUN_KEY, domain});
  const data = {
    from : "Blurbr Groups <groups@blurbr.com>",
    to: 'm.siegrist92@gmail.com',
    subject: `Blurbr User ${user.username} would like to join your group ${group.name}`,
    html: `<html><body><p>Hello there ${owner.username} - ${user.username} would like to join one of your groups.</p>
      <button><a href="${user_url}">View Profile</a></button>
      <button><a href="${approve_url}">Approve Request</a></button>
      </body>
      </html> `
  };
  mg.messages().send(data, (err, body) => {
    console.log(body)
  })
  return res.status(200).send('Email sent')

})

router.post('/group/inviteuser/:token', async (req, res) => {

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

  const group_url = `http://${process.env.CLIENT_URL}/groups/${owned_group._id}`;

  const approve_token = jwt.sign({user_id: user._id, group_id: owned_group._id}, process.env.JWT_GROUP_KEY);

  const approve_url = 'http://' + process.env.API_URL + '/group/approvereq/' + approve_token;


    const domain = 'sandbox5da1889582d94201a8cdecedb7a36b1d.mailgun.org';
    const mg = mailgun({apiKey: process.env.MAILGUN_KEY, domain});
    const data = {
      from : "Blurbr Groups <groups@blurbr.com>",
      to: 'm.siegrist92@gmail.com',
      subject: `Blurbr User ${owner.username} invites you to join their group ${owned_group.name}`,
      html: `<html><body><p>Hello there ${user.username} - ${owner.username} invites you to join their group!</p>
        <button><a href="${group_url}">View Group</a></button>
        <button><a href="${approve_url}">Join Group</a></button>
        </body>
        </html> `
    };
    mg.messages().send(data, (err, body) => {
      console.log(body)
    })


  console.log(user_email, group);
  return res.status(200).send('Invite sent')
})

router.get('/group/approvereq/:token', async (req, res) => {

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

router.post('/group/removeusers', async (req, res) => {


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

router.post('/group/removetopics', async (req, res) => {

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

router.post('/group/disbandgroup', async (req, res) => {
  const {group_id, user_token} = req.body;


  const group = await Group.findById(group_id);

  const user_id = jwt.verify(user_token, process.env.JWT_SECRET)._id;


  if(!validateOwner.isGroupOwner(group, user_token)){
    return res.status(403).send();
  }

  //delete all topics belonging to group
  const topics = await Topic.find({group: group_id});
  const topic_ids = topics.map((topic) => {
    return topic._id.toString();
  })
  for(let topic of topics){
    topic.remove();
  }

  //remove group from all users' groups array
  const users = await User.find({groups: group_id});
  for(let user of users){
    let new_array = user.groups.filter((group) => {
      return group.toString() !== group_id
    })
    user.groups = new_array;
    await user.save();
  }

  //remove all topics with group id from members topics array
  console.log(users, topic_ids)
  for(let user of users){
    let new_array = user.topics.filter((topic) => {
      return !topic_ids.includes(topic.toString())
    })
    user.topics = new_array;
    await user.save();
  }


  await group.remove();


  return res.status(200).send();

})

module.exports = router;
