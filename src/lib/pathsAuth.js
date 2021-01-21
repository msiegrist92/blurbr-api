const pathsAuth = async (req, res, next) => {
  try {
    const pass = req.header('Authorization');
    if(pass !== process.env.PATHS_SECRET){
      throw new Error();
    }
    next()
  } catch (err) {
    return res.status(403).send()
  }
}

module.exports = pathsAuth;
