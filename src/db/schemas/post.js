const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const post_schema = Schema({

  body: {
    type: String,
    required: true
  },

  date_created: {
    type: Date,
    default: Date.now
  },

  edited: {
    type: Date,
    default: null
  },

  //author is the ID of user making the post
  //retrieve this data from the token
  author : {
    type: Schema.Types.ObjectId,
    ref: "User"
  },

  //topic is the ID of the topic making the post to
  //retrieve this data from the client somehow
  //session storage? id in client url ?
  topic: {
    type: Schema.Types.ObjectId,
    ref: "Topic"
  }
})

const Post = mongoose.model("Post", post_schema);
module.exports = Post;
