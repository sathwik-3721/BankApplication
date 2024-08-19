import logger from "../../../../logger.js";
import config from "../../../../config.js";
import { StatusCodes } from 'http-status-codes';
import Test from "../models/test.model.js";

export function test(req, res) {
    try {
        Test.create()
        logger.info("inside test");
        const token = sign({ payload: "payload" }, 'superSecret', {
            expiresIn: "1d" // expires in 24 hours
        });
        if (!token) {
            throw { status: StatusCodes.INTERNAL_SERVER_ERROR, message: "Failed to generate token" };
        }
        var time = new Date();
        res.status(StatusCodes.OK).send({ time: time, message: config.API_KEY, token: token });
    } catch (error) {
        console.error("An error occurred in test function:", error);
        if (error.status) {
            res.status(error.status).send(error.message);
        } else {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("An error occurred");
        }
    }
}

export async function pingTest(req, res) {
    try {
        var time = new Date();
        res.status(StatusCodes.OK).send(time);
    } catch (error) {
        console.error("An error occurred in pingTest function:", error);
        if (error.status) {
            res.status(error.status).send(error.message);
        } else {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("An error occurred");
        }
    }
}

export async function getCustomers(req, res) {
    try {
        // const [user, password] = req.body;
        // const validateUser = Test.validateUser(user, password);
        // if (validateUser === false) {
        //     return res.status(401).json({error: 'Unauthorized user access'});
        // }
        const customerResult = await Test.getCustomers();
        if (customerResult.length != 0) {
            return res.status(200).json(customerResult);
        } else {
            return res.status(204).json({message: "no data"});
        }
    } catch (err) {
        throw err;
    }
}

export async function createCustomer(req, res) {
    try {
        const {first_name, last_name, mobile_num, email, pancard_num, dob, account_type} = req.body;
        const createResult = await Test.createCustomer(first_name, last_name, mobile_num, email, pancard_num, dob, account_type);
        if (createResult) {
            return res.status(201).json({message: "Customer Created"});
        } else {
            return res.status(422).json({error: "Error while creating"});
        }
    } catch(err) {
        throw err;
    }
}

export async function createAccount(req, res) {
    try {
        const {customer_id, balance, account_type} = req.body;
        const validateAccountResult = await Test.validateAccount(customer_id);
        if (!validateAccountResult) {
            console.log("if1");
            const createAccountResult =  await Test.createAccount(customer_id, balance, account_type);
            console.log(createAccountResult);
            if(!createAccountResult) {
                res.status(409).json({error: "Duplicate entry - Account number already exists"});
            } else {
                res.status(201).json({message: "Account Number generated"});
            }
        } //else {

        //}
    } catch(err) {
        throw err;
    }
}

export async function depositMoney(req, res) {
    try {
        const { account_number, amount } = req.body;
        const account = await Test.getAccountByNumber(account_number);

        if (!account) {
            return res.status(404).json({ error: "Account not found" });
        }

        const depositResult = await Test.depositMoney(account_number, amount);

        if (depositResult) {
            return res.status(200).json({ message: "Deposit successful", new_balance: depositResult.newBalance });
        } else {
            return res.status(500).json({ error: "Failed to deposit money" });
        }
    } catch(err) {
        throw err;
    }
}

export async function withdrawMoney(req, res) {
    try {
        const { account_number, amount } = req.body;
        const account = await Test.getAccountByNumber(account_number);

        if (!account) {
            return res.status(404).json({ error: "Account not found" });
        }

        if (account.balance < amount) {
            return res.status(400).json({ error: "Insufficient funds" });
        }

        const withdrawResult = await Test.withdrawMoney(account_number, amount);

        if (withdrawResult) {
            return res.status(200).json({ message: "Withdrawal successful", new_balance: withdrawResult.newBalance });
        } else {
            return res.status(500).json({ error: "Failed to withdraw money" });
        }
    } catch (err) {
        throw err;
    }
}

export async function transferMoney(req, res) {
    try {
        const { from_account_number, to_account_number, amount } = req.body;

        const fromAccount = await Test.getAccountByNumber(from_account_number);
        const toAccount = await Test.getAccountByNumber(to_account_number);

        if (!fromAccount || !toAccount) {
            return res.status(404).json({ error: "One or both accounts not found" });
        }

        if (fromAccount.balance < amount) {
            return res.status(400).json({ error: "Insufficient funds" });
        }

        const transferResult = await Test.transferMoney(from_account_number, to_account_number, amount);

        if (transferResult) {
            return res.status(200).json({ message: "Transfer successful" });
        } else {
            return res.status(500).json({ error: "Failed to transfer money" });
        }
    } catch (err) {
       throw err;
    }
}

export async function transactionHistory(req, res) {
    try {
        const { account_number } = req.body;
        const transactions = await Test.getTransactionHistory(account_number);

        if (transactions.length > 0) {
            return res.status(200).json(transactions);
        } else {
            return res.status(404).json({ error: "No transactions found" });
        }
    } catch (err) {
        throw err;
    }
}

export async function deleteCustomer(req, res) {
    try {
        const { account_number } = req.body;
        
        const deleteResult = await Test.deleteCustomer(account_number);
        
        if (deleteResult.error) {
            return res.status(404).json({ error: deleteResult.error });
        }

        return res.status(200).json({ message: deleteResult.message });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }

}
