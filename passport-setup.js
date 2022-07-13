const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth2').Strategy;


passport.use(new GoogleStrategy({
    clientID: '84824095128-qn133faddhn2nt1fus8e156fdg2ctskv.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: "/auth/google/callback",
    passReqToCallback: true
},
    (request, accessToken, refreshToken, profile, done) => {
        return done(null, profile);
    }
));

passport.serializeUser((user, done) => {
    done(null, user);
})

passport.deserializeUser((user, done) => {
    done(null, user);
})