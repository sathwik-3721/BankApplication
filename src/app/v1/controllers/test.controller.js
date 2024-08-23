import logger from "../../../../logger.js";
import config from "../../../../config.js";
import { StatusCodes } from "http-status-codes";
import Test from "../models/test.model.js";
import pkg from "jsonwebtoken";
const { sign } = pkg;

export function test(req, res) {
  try {
    Test.create();
    logger.info("inside test");
    const token = sign({ payload: "payload" }, "superSecret", {
      expiresIn: "1d", // expires in 24 hours
    });
    if (!token) {
      throw {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to generate token",
      };
    }
    var time = new Date();
    res
      .status(StatusCodes.OK)
      .send({ time: time, message: config.API_KEY, token: token });
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

// export async function registerUser(req, res) {
//     try {
//         const { email, password } = req.body;
//         const validateEmailResult = await Test.validateEmail(email);
//         if (!validateEmailResult) {
//             return res.status(409).json({error: 'Email already exists. Please Login'});
//         } else {
//             const registerUserResult = await Test.registerUser(email, password);
//             if (registerUserResult.affectedRows > 0) {
//                 return res.status(201).json({message: 'User and password created'});
//             } else {
//                 return res.status(500).json({error: 'Internal server error'});
//             }
//         }
//     } catch(err) {
//         return res.status(409).json({error: 'Error occured, Mail must'});
//     }
// }

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
      return res.status(204).json({ message: "no data" });
    }
  } catch (err) {
    throw err;
  }
}

export async function createCustomer(req, res) {
  try {
    const { first_name, last_name, mobile_num, email, pancard_num, dob, account_type, password} = req.body;
    console.log("req.body", req.body);
    const createResult = await Test.createCustomer(first_name, last_name, mobile_num, email, pancard_num, dob, account_type, password);
    if (createResult) {
        console.log("email", email);
        const getCustomerIDResult = await Test.getCustomerID(email);
        if (getCustomerIDResult.length > 0) {
            const customer_id_result = getCustomerIDResult[0].customer_id;
            return res.status(201).json({
                message: "Please store the customer_id as it is important for account creation.",
                customer_id: customer_id_result,
              }); 
        } else {
            return res.status(400).json({error: 'niub'});
        }
    } else {
      return res.status(422).json({ error: "Error while creating" });
    }
  } catch (err) {
    throw err;
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    console.log(email, password);

    const validateLoginResult = await Test.validateLogin(email, password);
    if (validateLoginResult) {
      res.status(200).json({ message: "Login successful" });
    } else {
      res.status(404).json({ error: "Error while login" });
    }
  } catch (err) {
    throw err;
  }
}

export async function createAccount(req, res) {
  try {
    const { customer_id, balance, account_type, email } = req.body;
    const validateAccountResult = await Test.validateAccount(customer_id);
    const validateUserResult = await Test.validateUser(customer_id, email);
    if (!validateAccountResult && validateUserResult) {
      console.log("if1");
      const createAccountResult = await Test.createAccount(customer_id, balance, account_type);
      console.log(createAccountResult);
      if (!createAccountResult) {
        res.status(409).json({ error: "Duplicate entry - Account number already exists" });
      } else {
        res.status(201).json({ message: "Account Number generated" });
      }
    } else {
        return res.status(400).json({error: 'Internal server error (check email and account number related)'});
    }
  } catch (err) {
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
      return res
        .status(200)
        .json({
          message: "Deposit successful",
          new_balance: depositResult.newBalance,
        });
    } else {
      return res.status(500).json({ error: "Failed to deposit money" });
    }
  } catch (err) {
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
      return res
        .status(200)
        .json({
          message: "Withdrawal successful",
          new_balance: withdrawResult.newBalance,
        });
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

    const transferResult = await Test.transferMoney(
      from_account_number,
      to_account_number,
      amount
    );

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
    console.log("transactions", transactions);

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

    console.log("delete result", deleteResult);

    if (deleteResult.error) {
      return res.status(404).json({ error: deleteResult.error });
    }

    return res.status(200).json({ message: deleteResult.message });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getBalance(req, res) {
  try {
    const { account_number } = req.body;
    const accountResult = await Test.isValidAccount(account_number);
    console.log("is exist", accountResult);
    if (accountResult) {
      const balanceResult = await Test.getBalance(account_number);
      res.status(200).json(balanceResult);
    } else {
      res.status(404).json({ error: "Account not exists" });
    }
  } catch (err) {
    throw err;
  }
}

export async function applyForCard(req, res) {
  try {
    const { account_number, card_type } = req.body;
    console.log(req.body);
    const new_card_type = card_type.toLowerCase();
    const isValidAccount = await Test.isValidAccount(account_number);
    if (!isValidAccount) {
      return res.status(404).json({ error: "Account not exists" });
    }

    if (new_card_type !== "credit" && new_card_type !== "debit") {
      return res.status(400).json({ error: "Invalid card type" });
    }

    const applyForCardReslut = await Test.applyForCard(
      account_number,
      card_type
    );
    console.log("applyforcardres", applyForCardReslut);
    if (applyForCardReslut !== null) {
      return res
        .status(201)
        .json({ message: "Card has been sucessfully generated" });
    } else {
      return res
        .status(409)
        .json({
          error: "Card number already exist for the given account number",
        });
    }
  } catch (err) {
    throw err;
  }
}

export async function getCardDetails(req, res) {
  try {
    const { account_number } = req.body;
    console.log(req.body);
    const getCardDetailsResult = await Test.getCardDetails(account_number);
    if (getCardDetailsResult.length > 0) {
      return res.status(200).json(getCardDetailsResult);
    } else {
      console.log(getCardDetailsResult);
      return res.status(404).json({ error: "Account number not exists" });
    }
  } catch (err) {
    throw err;
  }
}

export async function generatePIN(req, res) {
  try {
    const { card_number, account_number } = req.body;
    console.log(req.body);
    const pin = await Test.generatePINNumber();
    console.log("pin", pin);
    const isValidCardResult = await Test.isValidCard(account_number);
    const isValidAccountResult = await Test.isValidAccount(account_number);
    const isValidPINResult = await Test.isValidPIN(pin);
    if (!isValidCardResult && isValidAccountResult && isValidPINResult) {
      const pinResult = await Test.generatePIN(card_number, pin);
      if (pinResult.affectedRows > 0) {
        return res.status(200).json({ message: "Pin generated sucessfully" });
      } else {
        return res.status(404).json({ error: "Card number not exists" });
      }
    } else {
      return res
        .status(500)
        .json({ error: "Internal server error, please try again" });
    }
  } catch (err) {
    throw err;
  }
}

export async function updatePIN(req, res) {
  try {
    const { card_number, pin } = req.body;
    console.log(req.body);
    const validatePinResult = await Test.validatePIN(card_number, pin);
    if (validatePinResult) {
      return res.status(200).json({ message: "PIN updated sucessfully" });
    } else {
      return res
        .status(409)
        .json({ error: "Check pin number or account number" });
    }
  } catch (err) {}
}
