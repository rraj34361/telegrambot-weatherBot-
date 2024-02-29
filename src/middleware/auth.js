const jwt = require("jsonwebtoken")






const verifyToken =async (req, res, next) => {
    let authHeader = req.header("authorization");
    if (authHeader) {
      authHeader = authHeader.split(" ");
      const token = authHeader[1];
      if (!token) {
        return res
          .status(403)
          .send({ message: "A token is required for authentication" });
      }
      try {
        console.log(token)
        const getuser = jwt.verify(token, "helloworld");
        req.user = getuser;
        next();
      } catch (err) {
        console.log(err)
        return res.status(401).send({ message: "Token is not valid!" });
      }
    } else {
      return res
        .status(403)
        .send({ message: "A token is required for authentication" });
    }
  };
  
  const verifyTokenAndAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
      if (req.user.role==="admin") {
        next();
      } else {
        return res.status(403).json({
          status: 0,
          message: "You are not Admin user",
        });
      }
    });
  };
  

  module.exports = {
    verifyToken,
    verifyTokenAndAdmin
  }