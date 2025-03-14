import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import User from '../models/User';

function loadPassport() {
passport.use(new LocalStrategy(async function verify(username, password, done) {
    const user = await User.findOne({where: {username: username}});
    if (!user) {
        return done(null, false, {message: 'Invalid username or password'});
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        return done(null, false, {message: 'Invalid username or password'});
    }
    return done(null, user);
})) 


passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
  passport.deserializeUser(function(user : Express.User, done) {
    done(null, user);
  });

}

export default loadPassport;