const express = require("express");
const router = express.Router();
const handleAsyncError = require("express-async-wrap");
const userHandler = require("../handler/user_handler");
//const jwt_validation = require("../middleware/jwt_middleware");
const { passport } = require("../middleware/passport_middleware");

router.post("/signup", handleAsyncError(userHandler.registerNewUser));
router.post("/login", handleAsyncError(userHandler.login));
router.put(
  "/change_password",
  passport.authenticate("jwt", { session: false }),
  handleAsyncError(userHandler.changePassword)
);
router.put(
  "/change_username",
  //jwt_validation.required,
  passport.authenticate("jwt", { session: false }),
  handleAsyncError(userHandler.changeUsername)
);
router.post("/logout", handleAsyncError(userHandler.logout));

module.exports = router;
