const express = require('express');
const router = new express.Router();
const path = require('path');


router.get('/uploads/:filename', async (req, res) => {
  res.sendFile(req.params.filename,
    { root :
      path.join(__dirname, '../../uploads')
    });
})

module.exports = router;
