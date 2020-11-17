require('dotenv').config();
const express = require('express');
require('./db/mongoose.js');

const app = express();

const user_router = require('./routers/user.js');
app.use(user_router);

const port = 2912 || process.env.PORT;

app.listen( port , () => {
  console.log(port + 'alive bud');
})
