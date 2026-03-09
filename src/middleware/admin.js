const adminAuth = (err, req, res, next) => {
  if (err) {
    res.status(401).json("Unauthorized");
  }

  if (req.body && req.body.isAdmin) {
    next();
  }
};

module.exports = { adminAuth };
