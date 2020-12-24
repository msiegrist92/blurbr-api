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

  body : {
    type: String,
    required: true,
    validate(value){
      if (value.length === 0){
        throw new Error('New topics must contain a body')
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

  group : {
    type: Schema.Types.ObjectId,
    ref: "Group",
    required: true
  }
  // },
  //
  // //posts is populated to render posts when a user views a forum topic
  // posts: [{
  //   type: Schema.Types.ObjectId,
  //   ref: "Post"
  // }]
},
  {toJSON: {virtuals: true}})

topic_schema.virtual('posts', {
  ref: "Post",
  localField: '_id',
  foreignField: 'topic',
  justOne: false
})

const Topic = mongoose.model('Topic', topic_schema );
module.exports = Topic;
