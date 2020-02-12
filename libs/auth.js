import jwt from "jsonwebtoken";
import _ from "lodash";

export async function verifyJWTToken(token) {
  try {
    const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);

    if (!decodedToken) {
      throw new err();
    }
    return decodedToken;
  } catch (err) {
    throw new err();
  }
}

export function createJWToken(details) {
  if (typeof details !== "object") {
    details = {};
  }

  if (!details.maxAge || typeof details.maxAge !== "number") {
    details.maxAge = 3600;
  }

  details.sessionData = _.reduce(
    details.sessionData || {},
    (memo, val, key) => {
      if (typeof val !== "function" && key !== "password") {
        memo[key] = val;
      }
      return memo;
    },
    {}
  );

  let token = jwt.sign(
    {
      data: details.sessionData
    },
    process.env.JWT_SECRET,
    {
      expiresIn: details.maxAge,
      algorithm: "HS256"
    }
  );

  return token;
}

export function verifyJWT_isConnected(req, res, next) {
  let token = req.headers.authorization;
  verifyJWTToken(token)
    .then(decodedToken => {
      //console.log(decodedToken);
      req.user = decodedToken.data
      next();
    })
    .catch(err => {
      res.status(401).json({ message: "You must be connected to access this page." });
    });
}

export function verifyJWT_isRightUser(req, res, next) {
  let token = req.headers.authorization;
  verifyJWTToken(token)
    .then(decodedToken => {
      if(req.body._id !== decodedToken.data._id){
        res.status(401).json({ message: "You aren't allowed to access this page."})
      }
      else{
        req.user = decodedToken.data
        next();
      }
    })
    .catch(err => {
      res.status(401).json({ message: "Invalid auth token provided." });
    });
}

export function verifyJWT_isAdmin(req, res, next) {
  let token = req.headers.authorization;
  verifyJWTToken(token)
    .then(decodedToken => {
      if(decodedToken.data.role != "admin"){
        res.status(401).json({ message: "You must be admin to access this page."})
      }
      req.user = decodedToken.data;
      next();
    })
    .catch(err => {
      res.status(401).json({ message: "Invalid auth token provided." });
    });
}