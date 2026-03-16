const jwt = require("jsonwebtoken");

const userAuth = async (req, res, next) => {
  const { token } = req.cookies;

  try {
    const validUser = jwt.verify(token, process.env.JWT_SECRET);
    if (validUser) {
      next();
    }
  } catch (err) {
    console.log(err);
    res.status(401).send("unauthorizedd");
  }
};

module.exports = { userAuth };
