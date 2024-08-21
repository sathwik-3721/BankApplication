import passport from "passport";
import passportJWT from "passport-jwt";
import express from 'express';

const { Strategy: JwtStrategy, ExtractJwt } = passportJWT;

const app = express();

//controllers
import { applyForCard, createAccount, createCustomer, deleteCustomer, depositMoney, generatePIN, getBalance, getCardDetails, getCustomers, pingTest, test, transactionHistory, transferMoney, withdrawMoney } from '../v1/controllers/test.controller.js';

//routers
import testRouter from '../v1/routes/test.routes.js';

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

// get all customers
app.get('/bank/getCustomers', passport.authenticate('jwt', { session: false }), getCustomers);

// create customer
app.post('/bank/createCustomer', createCustomer)

// create account
app.post('/bank/createAccount', createAccount);

// deposit money
app.put('/bank/depositMoney', depositMoney);

// withdraw money
app.put('/bank/withdrawMoney', withdrawMoney);

// transfer money
app.post('/bank/transferMoney', transferMoney);

// get transaction history
app.get('/bank/transactionHistory', transactionHistory);

// delete customer
app.delete('/bank/deleteCustomer', deleteCustomer);

// get check balance of account
app.get('/bank/getBalance', getBalance);

// apply for a card
app.post('/bank/applyForCard', applyForCard);

// get card details
app.get('/bank/getCardDetails', getCardDetails);

// generate PIN for card
app.put('/bank/generatePIN', generatePIN);


//secured routes - auth using user JWT
app.use('/api', handleOptionsReq, passport.authenticate('jwt', { session: false }));
app.use('/api', testRouter);

export default app;
