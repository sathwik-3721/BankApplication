import passport from "passport";
import passportJWT from "passport-jwt";
import express from 'express';

const { Strategy: JwtStrategy, ExtractJwt } = passportJWT;

const app = express();

//controllers
import { pingTest, test, login } from '../v1/controllers/test.controller.js';

//routers
import testRouter from '../v1/routes/test.routes.js';
import bankRouter from '../v1/routes/bank.routes.js';  // New router file

//defining the JWT strategy
const passportStrategy = new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: "superSecret"  // secret key 
}, (jwt_payload, next) => {
    console.log(jwt_payload)
    next(null, jwt_payload)
});

//init passport strategy
passport.use(passportStrategy);

//handle browser options Request
const handleOptionsReq = (req, res, next) => {
    if (req.method === 'OPTIONS') { 
        res.send(200);
    } else { 
        next();
    }
}

//test routes
app.get('/test', test);
app.get('/test/ping', pingTest);
app.post('/login', login);
app.use('/bank', passport.authenticate('jwt', { session: false }), bankRouter);  // Bank-related routes


//secured routes - auth using user JWT
app.use('/api', handleOptionsReq, passport.authenticate('jwt', { session: false }));
app.use('/api', testRouter);

export default app;
