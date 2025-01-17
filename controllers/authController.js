const passport = require("passport");

function login(req, res) {
  passport.authenticate("local", {
    successRedirect: req.session.redirectTo ? req.session.redirectTo : "/",
    failureRedirect: "/login",
    failureFlash: true,
  })(req, res);
}

module.exports = { login };
