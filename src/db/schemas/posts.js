const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const posts_schema = Schema({

  _id: Schema.Types.ObjectId,

  date_created: {
    type: Date,
    default: Date.now
  },

  edited: {
    type: Date,
    default: null
  },

  //owner is a reference to the author of the post
  owner : {
    type: Schema.Types.ObjectId
  }
})
