import express from 'express';

import { applyForCard, createAccount, createCustomer, deleteCustomer, 
         depositMoney, generatePIN, getBalance, getCardDetails, 
         transactionHistory, transferMoney, updatePIN, withdrawMoney, 
         login, getBalanceByCid, getTransactionByMail, getUserName, 
         getAccnoByMail, getCardNumbers } from '../controllers/test.controller.js';

const router = express.Router();

// register to bank
// router.post('/registerUser', registerUser);

// login
router.post('/login', login);

// create customer and login
router.post('/createCustomer', createCustomer);

// create accout
router.post('/createAccount', createAccount);

// deposit money
router.put('/depositMoney', depositMoney);

// money withdraw
router.put('/withdrawMoney', withdrawMoney);

// money transfer
router.post('/transferMoney', transferMoney);

// transaction history of particular account
router.get('/transactionHistory', transactionHistory);

// delete customer
router.delete('/deleteCustomer', deleteCustomer);

// fetch balance of account
router.get('/getBalance', getBalance);

// apply for credit/debit card
router.post('/applyForCard', applyForCard);

// get card details based on acc_no
router.get('/getCardDetails/:account_number', getCardDetails);

// generate default pin for a card
router.put('/generatePIN', generatePIN);

// update pin for it
router.put('/updatePIN', updatePIN);

// get balanve type 2
router.get('/getBalanceCid/:email', getBalanceByCid)

// get transaction by mail
router.get('/getTransactionByMail/:email', getTransactionByMail)

// get user name
router.get('/getUserName/:email', getUserName)

// get account number using email
router.get('/getAccnoByMail/:email', getAccnoByMail);

// get card numbers by account number
router.get('/getCardNumbers/:account_number', getCardNumbers);

export default router;
