import jwt from "jsonwebtoken";

export const userAuth = async (req, res, next) => {
  console.log(Object.keys(req));
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
