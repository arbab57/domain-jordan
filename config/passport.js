const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User'); // Adjust path as needed
const jwt = require('jsonwebtoken');
const SECRET_TOKEN = process.env.SECRET_TOKEN;
const bcrypt = require('bcrypt')

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/facebook/callback",
  profileFields: ['id', 'emails', 'name']
},
async function(accessToken, refreshToken, profile, done) {
  try {
    let user = await User.findOne({ email: profile.emails[0].value });

    if (!user) {
      const hashedPass = bcrypt.hash(profile.emails[0].value, 10)
      user = new User({
        email: profile.emails[0].value,
        name: profile.name.givenName + ' ' + profile.name.familyName,
        password: hashedPass,
      });
      const savedUser = await user.save();
      
      const payload = { id: savedUser._id };
      const token = jwt.sign(payload, SECRET_TOKEN, { expiresIn: '24h' });
      return done(null, { user, token });
    }

    const payload = { id: user._id };
    const token = jwt.sign(payload, SECRET_TOKEN, { expiresIn: '24h' });
    return done(null, { user, token });
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then(user => {
    done(null, user);
  });
});