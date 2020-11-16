const mongoose = require('mongoose');

mongoose.connect('127.0.0.1:27017/blurbr', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})
