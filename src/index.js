require('dotenv').config();
const express = require('express');
require('./db/mongoose.js');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const user_router = require('./routers/user.js');
const post_router = require('./routers/post.js');
const topic_router = require('./routers/topic.js');
const uploads_router = require('./routers/uploads.js');
const group_router = require('./routers/group.js');
const user_topics_router = require('./routers/user_topics.js');
const user_groups_router = require('./routers/user_groups.js');
const groupmgmt_router = require('./routers/groupmgmt');

app.use(user_router);
app.use(post_router);
app.use(topic_router);
app.use(uploads_router);
app.use(group_router);
app.use(user_topics_router);
app.use(user_groups_router);
app.use(groupmgmt_router);

const port = 2912 || process.env.PORT;

app.listen( port , () => {
  console.log(port + 'alive bud');
})
