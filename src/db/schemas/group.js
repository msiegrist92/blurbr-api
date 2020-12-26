const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const group_schema = Schema({

  name : {
    type: String,
    required: true,
    validate(value){
      if(value.length < 4){
        throw new Error("Group name must be at least 4 characters")
      }
    }
  },

  description: {
    type: String,
    required: true
  },

  owner : {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },

  users: [{
    type: Schema.Types.ObjectId,
    ref: "User"
  }],

  topics : [{
    type: Schema.Types.ObjectId,
    ref: "Topic"
  }]

},
  {toJSON: {virtuals: true}})

// group_schema.virtual('users', {
//   ref: "User",
//   localField: '_id',
//   foreignField: 'groups',
//   justOne: false
// })
//
// group_schema.virtual('topics', {
//   ref: "Topic",
//   localField: '_id',
//   foreignField: 'group',
//   justOne: false
// })

const Group = mongoose.model('Group', group_schema);
module.exports = Group;
