const express = require('express');
const router = new express.Router();
const path = require('path');
console.log(__dirname);

router.get('/uploads/:filename', async (req, res) => {
  console.log(req.params.filename);
  res.sendFile(req.params.filename,
    { root :
      path.join(__dirname, '../../uploads')
    });
})

module.exports = router;
