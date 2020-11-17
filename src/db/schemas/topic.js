const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const topic_schema = Schema({

  title: {
    type: String,
    required: true,
    validate(value){
      if(value.length > 40){
        throw new Error ("Title must be less than 40 characters")
      }
    }
  },

  date_created: {
    type: Date,
    default: Date.now
  },

  last_post: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },

  //retrieve the id of user making the topic from the token
  author: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },

  //posts is populated to render posts when a user views a forum topic
  posts: [{
    type: Schema.Types.ObjectId,
    ref: "Post"
  }]
})

const Topic = mongoose.model('Topic', topic_schema );
module.exports = Topic;
