const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const jwt  = require('jsonwebtoken');

passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  `${process.env.SERVER_URL || 'http://localhost:5000'}/api/auth/google/callback`,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = await User.findOne({ email: profile.emails[0].value });
      if (user) {
        user.googleId = profile.id;
        if (!user.avatar) user.avatar = profile.photos[0]?.value;
        await user.save();
      } else {
        user = await User.create({
          googleId: profile.id,
          name:     profile.displayName,
          email:    profile.emails[0].value,
          avatar:   profile.photos[0]?.value || '',
          isVerified: true,
          role:     'student',
        });
      }
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    return done(null, { user, token });
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((data, done) => done(null, data));
passport.deserializeUser((data, done) => done(null, data));
