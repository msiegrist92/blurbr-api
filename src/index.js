require('dotenv').config();
const express = require('express');
require('./db/mongoose.js');

const app = express();
const port = 2912 || process.env.PORT;

app.listen( port , () => {
  console.log(port + 'alive bud');
})
