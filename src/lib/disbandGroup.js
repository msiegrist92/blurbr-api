const mongoose = require('mongoose');
const User = require('../db/schemas/user');
const Topic = require('../db/schemas/topic');
const Group = require('../db/schemas/group');
const arrayControls = require('./arrayControls');

const getAllGroupTopicID = async (group_id) => {
  const topics = await Topic.find({group: group_id});
  return topics.map((topic) => {
    return topic._id.toString();
  })
}

const deleteAllGroupTopics = (group_id, topics) => {
  for(let topic of topics){
    topic.remove();
  }
}

const removeGroupFromUsers = async (group_id, users) => {
  for(let user of users){
    let new_groups = arrayControls.removeSelections([group_id], user.groups);
    user.groups = new_groups;
    await user.save();
  }
}

const removeMemberTopics = async (users, topic_ids) => {
  for(let user of users){
    let old_topics = arrayControls.objIDToString(user.topics);
    let new_topics = arrayControls.removeSelections(topic_ids, old_topics);
    user.topics = new_topics;
    await user.save();
  }
}

const disbandGroup = async (group_id) => {

  const topic_ids = await getAllGroupTopicID(group_id);
  const users = await User.find({groups: group_id});
  const topics = await Topic.find({group: group_id});

  deleteAllGroupTopics(group_id, topics);
  removeGroupFromUsers(group_id, users);
  removeMemberTopics(users, topic_ids);
}

module.exports = {
  disbandGroup: disbandGroup
}
