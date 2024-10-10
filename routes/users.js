const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");
const users = require("../controllers/users");

router
    .route("/register")
    .get(users.renderRegister)
    .post(
        catchAsync(async (req, res, next) => {
            try {
                const { email, username, password } = req.body;
                const user = new User({ email, username });
                const registeredUser = await User.register(user, password);
                req.login(registeredUser, (err) => {
                    if (err) return next(err);
                    req.flash("success", "Welcome to Terrainly!");
                    res.redirect("/");
                });
            } catch (e) {
                req.flash("error", e.message);
                res.redirect("register");
            }
        })
    );

router
    .route("/login")
    .get(users.renderLogin)
    .post(
        passport.authenticate("local", {
            failureFlash: true,
            failureRedirect: "/login",
        }),
        (req, res) => {
            req.flash("success", "Welcome back!");
            res.redirect("/");
        }
    );

router.get("/logout", users.logout);

module.exports = router;
