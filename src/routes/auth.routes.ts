import express, { Request, Response } from 'express';
import passport from 'passport';
import User from '../models/User';
const router = express.Router();

router.get("/login", passport.authenticate('local', {
    successRedirect: '/dash',
    failureRedirect: '/login',
    failureFlash: true
}))

router.get("/register", function (req: Request, res: Response) {
    res.render("register.html");
})

router.post("/register", function (req: Request, res: Response) {
    const { username, email, password } = req.body;
    User.create({
        username: username,
        email: email,
        password: password
    }).then(() => {
        res.redirect("/auth/login");
    }).catch((err) => {
        console.log(err);
        res.redirect("/auth/register");
    })
})

export default router;