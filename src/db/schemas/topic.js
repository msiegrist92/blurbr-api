const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const topic_schema = Schema({

  _id: Schema.Types.ObjectId,

  title: {
    type: String,
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
    type: Schema.Types.ObjectId
  },

  //created by is a reference to the author of the topic
  created_by: {
    type: Schema.Types.ObjectId
  },

  //posts is an array of posts where owner === id this topic
  posts: {
    type: Number
  }
})

const Topic = mongoose.model('Topic', topic_schema );
