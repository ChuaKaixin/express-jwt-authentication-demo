const User = require("../model/user");
const status = require("http-status");

async function registerNewUser(req, res) {
  let user = new User({
    username: req.body.user.username,
    email: req.body.user.email
  });
  try {
    user.setPassword(req.body.user.password);
    await user.save();
  } catch (error) {
    return res.status(status.UNPROCESSABLE_ENTITY).json({
      message: error.messageDefined ? error.message : "username is invalid"
    });
  }
  return res.json({
    user: {
      username: user.username,
      email: user.email
    }
  });
}

async function changePassword(req, res) {
  //const username = req.user.username;
  //const users = await User.find({ username });
  //const user = users[0];
  const user = req.user;
  const newUserProfile = req.body.user;
  if (newUserProfile.password) {
    try {
      user.setPassword(newUserProfile.password);
    } catch (error) {
      return res.status(status.UNPROCESSABLE_ENTITY).json({
        message: error.message
      });
    }
  }
  await user.save();
  return res.json({ status: "done" });
}

async function changeUsername(req, res) {
  await User.findByIdAndUpdate(req.user._id, {
    username: req.body.user.username
  });
  return res.json({ status: "done" });
}

async function login(req, res) {
  const username = req.body.user.username;
  const password = req.body.user.password;
  const email = req.body.user.email;
  if (!username || !password || !email) {
    return res.status(status.UNAUTHORIZED).json({
      error: {
        message: "username, email and password are required for login"
      }
    });
  }
  let user = await User.findOne({ username });
  if (!user || !user.validPassword(password)) {
    return res
      .status(status.UNAUTHORIZED)
      .json({ error: { message: "username or password is invalid" } });
  }
  const token = user.generateJWT();
  /** was for JWT put in response body 
  return res.json({
    user: {
      username,
      token,
      email: req.body.user.email
    }
  });*/
  res.cookie("jwt", token, {
    httpOnly: true,
    sameSite: true
  });
  return res.json({
    user: {
      username: user.username,
      email: user.email
    }
  });
}

async function logout(req, res) {
  res.clearCookie("jwt");
  res.json({ status: "done" });
}

module.exports = {
  registerNewUser,
  login,
  logout,
  changePassword
};

module.exports = {
  registerNewUser,
  login,
  logout,
  changePassword,
  changeUsername
};
