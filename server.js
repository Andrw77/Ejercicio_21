require("dotenv").config();
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const { Article, User, Comment } = require("./models");
const bcrypt = require("bcryptjs");
const flash = require("express-flash");
const sequelize = require("sequelize");

const express = require("express");
const routes = require("./routes");
const methodOverride = require("method-override");
const APP_PORT = process.env.APP_PORT || 3000;
const app = express();

app.use(methodOverride("_method"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(flash());

routes(app);

app.listen(APP_PORT, () => {
  console.log(`\n[Express] Servidor corriendo en el puerto ${APP_PORT}.`);
  console.log(`[Express] Ingresar a http://localhost:${APP_PORT}.\n`);
});

app.use(
  session({
    secret: "AlgúnTextoSuperSecreto",
    resave: false, // Docs: "The default value is true, but using the default has been deprecated".
    saveUninitialized: false, // Docs: "The default value is true, but using the default has been deprecated".
  }),
);

app.use(passport.session());

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ where: { email: username } });
      const bdPassHasheada = await bcrypt.hash(user.password, 8);
      if (!user) {
        done(null, false, { message: "Creedenciales incorrectas" });
      } else if (!(await bcrypt.compare(password, bdPassHasheada))) {
        done(null, false, { message: "Creedenciales incorrectas" });
      } else {
        return done(null, user);
      }
    } catch (error) {
      return done(error);
    }
    // Aquí adentro es necesario validar (contra nuestra base de datos)
    // que username y password sean correctos.
    // Ver la documentación de Passport por detalles.
  }),
);

app.get("/login", function (req, res) {
  res.render("panel", { modal: "Login" });
});

app.get("/welcome", function (req, res) {
  if (req.isAuthenticated()) {
    res.send(`Te damos la bienvenida, ${req.user.firstname}!!`);
  } else {
    res.redirect("/login");
  }
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/welcome",
    failureRedirect: "/login",
    failureFlash: true,
  }),
);

// router.get("/registro")
// router.post("/registro")
// router.get("/login")
// router.post("/login")
// router.get("/logout")
