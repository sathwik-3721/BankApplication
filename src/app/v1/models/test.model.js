//model file 
import { poolPromise } from "../utils/dbConnection.js";
const tableName = '' //table name
class Test {
    static async create() {
        try {
            //Your Query
            return ;
        } catch (err) {
            throw err;
        }
    }

    static async read() {
        try {
            //Your Query
            return ;
        } catch (err) {
            throw err;
        }
    }

    static async update() {
        try {
            //Your Query
            return ;
        } catch (err) {
            throw err;
        }
    }

    static async delete() {
        try {
            //Your Query
            return ;
        } catch (err) {
            throw err;
        }
    }

    static async getCustomers() {
        try {
            const pool = await poolPromise;
            const sql = 'SELECT * FROM Customers';
            const [res] = await pool.query(sql);
            console.log(res);
            return res;
        } catch(err) {
            throw err;
        }
    }

    static async validateCustomer(mobile_num, email, pancard_num) {
        try {   
            const pool = await poolPromise;
            const sql = 'SELECT mobile_num, email, pancard_num FROM Customers';
            const [res] = await pool.query(sql, [mobile_num, email, pancard_num]);
            // console.log(res);
            return res;
        } catch(err) {
            throw err;
        }
    }

    static async createCustomer(first_name, last_name, mobile_num, email, pancard_num, dob, account_type, password) {
        try {
            const pool = await poolPromise;
            const validateCustomerResult = await Test.validateCustomer(mobile_num, email, pancard_num);
            // console.log(validateCustomerResult);
            if (!(validateCustomerResult.length != 0)) {
                return false;
            } else {
                const sql = 'INSERT INTO Customers (first_name, last_name, mobile_num, email, pancard_num, dob, account_type, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
                const [res] = await pool.query(sql, [first_name, last_name, mobile_num, email, pancard_num, dob, account_type, password]);
                console.log(res);
                return res;
            }
        } catch(err) {
            throw err;
        }
    }

    static async getCustomerID(email) {
        try {
            const pool = await poolPromise;
            const sql = 'SELECT * FROM Customers WHERE email = ?';
            const [res] = await pool.query(sql, [email]);
            console.log("res:", res)
            return res;
        } catch(err) {
            throw err;
        }
    }

    static async validateLogin(email, password) {
        try {
            const pool = await poolPromise;
            const sql = 'SELECT * from Customers WHERE email = ? AND password = ?';
            const [res] = await pool.query(sql, [email, password]);
            if (res.length === 0) {
                return false;
            } else {
                const existEmail = res[0].email;
                const existPassword = res[0].password;
                if (email === existEmail && password === existPassword) {
                    return true;
                } else {
                    return false;
                }
            }
        } catch(err) {
            throw err;
        }
    }

    static async validateUser(customer_id, email) {
        try {
            const pool = await poolPromise;
            const sql = 'SELECT * FROM Customers WHERE customer_id = ? AND email = ?';
            const [res] = await pool.query(sql, [customer_id, email]);
            console.log(res);
            if (res.length === 0) {
                return false;
            } else {
                return true;
            }
        } catch(err){
            throw err;
        }
    }

    static async getAccountByCustomerID(customer_id) {
        try {
            const pool = await poolPromise;
            const sql = 'SELECT account_number FROM Accounts WHERE customer_id = ?';
            const [res] = await pool.query(sql, [customer_id]);
            return res[0].account_number;
        } catch (err) {
            throw err;
        }
    }

    static async getCustomerByMail(email) {
        try {
            const pool = await poolPromise;
            const sql = 'SELECT customer_id FROM Customers WHERE email = ?';
            const [res] = await pool.query(sql, [email]);
            return res[0].customer_id;
        } catch (err) {
            throw err;
        }
    }

    static async validateAccount(customer_id) {
        try {
            const pool = await poolPromise;
            const sql = 'SELECT account_number FROM Accounts WHERE customer_id = ?';
            const [res] = await pool.query(sql, [customer_id]);
            console.log("res", res);
            if (res.length == 0) {
                console.log("if");
                return false;
            } else {
                return true;
            }
        } catch(err) {
            throw err;
        }
    }

    static async createAccountNumber(customer_id) {
        try {
            console.log("in createAccountNumber");
            const pool = await poolPromise;
            console.log("after pool in createAccountNUmber");
    
            let accountNumber = '';
            for (let i = 0; i < 16; i++) {
                accountNumber += Math.floor(Math.random() * 10).toString();
            }
            console.log("Generated Account Number:", accountNumber);
            return accountNumber;
        } catch(err) {
            throw err;
        }
    }    

    static async createAccount(customer_id, balance, account_type) {
        try {
            console.log("in createAccount");
            const pool = await poolPromise;
            const createAccountNumberResult = await this.createAccountNumber(customer_id);
            console.log(createAccountNumberResult);
            if (!createAccountNumberResult) {
                return false;
            } else {
                const sql = 'INSERT INTO Accounts (customer_id, balance, acc_status, account_type, account_number) VALUES (?, ?, ?, ?, ?)';
                const [res] = await pool.query(sql, [customer_id, balance, "Active", account_type, createAccountNumberResult]);
                console.log(res);
                return {
                    result: res,
                    accountNumber: createAccountNumberResult
                };
            }
        } catch(err) {
            throw err;
        }
    }
    

    static async getAccountByNumber(account_number) {
        try {
            const pool = await poolPromise;
            const sql = 'SELECT * FROM Accounts WHERE account_number = ?';
            const [res] = await pool.query(sql, [account_number]);
            return res[0];
        } catch (err) {
            throw err;
        }
    }
    
    static async depositMoney(account_number, amount) {
        try {
            const pool = await poolPromise;
            const sql = 'UPDATE Accounts SET balance = balance + ? WHERE account_number = ?';
            const [res] = await pool.query(sql, [amount, account_number]);
    
            if (res.affectedRows > 0) {
                const updatedAccount = await this.getAccountByNumber(account_number);
    
                const transactionSql = `
                    INSERT INTO Transactions (from_account_number, amount, transaction_type)
                    VALUES (?, ?, 'deposit')
                `;
                await pool.query(transactionSql, [account_number, amount]);
    
                return { newBalance: updatedAccount.balance };
            } else {
                return false;
            }
        } catch (err) {
            throw err;
        }
    }    

    static async withdrawMoney(account_number, amount) {
        try {
            const pool = await poolPromise;
            const sql = 'UPDATE Accounts SET balance = balance - ? WHERE account_number = ? AND balance >= ?';
            const [res] = await pool.query(sql, [amount, account_number, amount]);
    
            if (res.affectedRows > 0) {
                const updatedAccount = await this.getAccountByNumber(account_number);
    
                const transactionSql = `
                    INSERT INTO Transactions (from_account_number, amount, transaction_type)
                    VALUES (?, ?, 'withdraw')
                `;
                await pool.query(transactionSql, [account_number, amount]);
    
                return { newBalance: updatedAccount.balance };
            } else {
                return false;
            }
        } catch (err) {
            throw err;
        }
    }    

    static async transferMoney(from_account_number, to_account_number, amount) {
        try {
            const pool = await poolPromise;
            const connection = await pool.getConnection();
    
            try {
                await connection.beginTransaction();
    
                const withdrawSql = 'UPDATE Accounts SET balance = balance - ? WHERE account_number = ? AND balance >= ?';
                const [withdrawRes] = await connection.query(withdrawSql, [amount, from_account_number, amount]);
    
                if (withdrawRes.affectedRows === 0) {
                    throw new Error("Insufficient balance in sender's account");
                }
    
                const depositSql = 'UPDATE Accounts SET balance = balance + ? WHERE account_number = ?';
                const [depositRes] = await connection.query(depositSql, [amount, to_account_number]);
    
                if (depositRes.affectedRows === 0) {
                    throw new Error("Failed to deposit into recipient's account");
                }
    
                const transactionSql = `
                    INSERT INTO Transactions (from_account_number, to_account_number, amount, transaction_type)
                    VALUES (?, ?, ?, 'transfer')
                `;
                await connection.query(transactionSql, [from_account_number, to_account_number, amount]);
    
                await connection.commit();
                return true;
            } catch (err) {
                await connection.rollback();
                throw err;
            } finally {
                connection.release();
            }
        } catch (err) {
            throw err;
        }
    }    

    static async getTransactionHistory(account_number) {
        try {
            const pool = await poolPromise;
            console.log('Accno', account_number);
            const sql = 'SELECT * FROM Transactions WHERE from_account_number = ? OR to_account_number = ?';
            const [res] = await pool.query(sql, [account_number, account_number]);
            console.log("res", res);
            return res;
        } catch (err) {
            throw err;
        }
    }    

    static async isValidCard(account_number, card_type) {
        try {
            const pool = await poolPromise;
            const sql = 'SELECT * FROM Cards WHERE account_number = ? AND card_type = ?';
            const [res] = await pool.query(sql, [account_number, card_type]);
            return res.length !== 0;  // Return true if a card of the same type exists
        } catch (err) {
            throw err;
        }
    }    
     
    static async isValidAccount(account_number) {
        try {
            const pool = await poolPromise;
            const sql = 'SELECT * FROM Accounts WHERE account_number = ?';
            const [res] = await pool.query(sql, [account_number]);
            return res.length !== 0;  // Return true if account exists
        } catch (err) {
            throw err;
        }
    }
    
    static async deleteFromAccounts(account_number) {
        try {
            const pool = await poolPromise;
            const customer_id_sql = 'SELECT customer_id FROM Accounts WHERE account_number = ?';
            const [res] = await pool.query(customer_id_sql, [account_number]);
            
            if (res.length === 0) {
                throw new Error('Account not found');
            }
    
            const sql = 'DELETE FROM Accounts WHERE account_number = ?';
            await pool.query(sql, [account_number]);
    
            return res[0].customer_id;
        } catch (err) {
            throw err;
        }
    }    
    
    static async deleteFromCustomers(customer_id) {
        try {
            const pool = await poolPromise;
            const sql = 'DELETE FROM Customers WHERE customer_id = ?';
            await pool.query(sql, [customer_id]);
        } catch (err) {
            throw err;
        }
    }    
    
    static async deleteCustomer(account_number) {
        try {
            const pool = await poolPromise;
    
            const isValidAccountResult = await this.isValidAccount(account_number);
            if (!isValidAccountResult) {
                return { error: 'Account does not exist' };
            }
    
            const customer_id = await this.deleteFromAccounts(account_number);
    
            const sqlCheckAccounts = 'SELECT COUNT(*) as count FROM Accounts WHERE customer_id = ?';
            const [checkRes] = await pool.query(sqlCheckAccounts, [customer_id]);
    
            if (checkRes[0].count === 0) {
                await this.deleteFromCustomers(customer_id);
            }
    
            return { message: 'Customer and related account deleted successfully' };
        } catch (err) {
            throw err;
        }
    }
        
    static async getBalance(account_number) {
        try {
            const pool = await poolPromise;
            const sql = 'SELECT balance FROM Accounts WHERE account_number = ?';
            const [res] = await pool.query(sql, [account_number]);
            return res;
        } catch(err) {
            throw err;
        }
    }

    static async generateCardNumber() {
        try {
            const length = 16;
            let card_number = '';
            for (let i = 0; i < length; i++) {
                card_number += Math.floor(Math.random() * 10).toString();
            }
            return card_number;
        } catch(err) {
            throw err;
        }
    }

    static async isValidCard(account_number) {
        try {
            const pool = await poolPromise;
            const sql = 'SELECT * FROM Cards WHERE account_number = ?';
            const [res] = await pool.query(sql, [account_number]);
            if (res.length === 0) {
                return true;
            } else {
                return false;
            }
        } catch(err) {
            throw err;
        }
    }

    static async applyForCard(account_number, card_type) {
        try {
            const pool = await poolPromise;
            const card_number = await this.generateCardNumber();
            console.log("cardn", card_number);
    
            // Check if the requested card type already exists for the account
            const isCardTypeExists = await this.isValidCard(account_number, card_type);
    
            // Check if any card exists for the account
            const sqlCheckAllCards = 'SELECT * FROM Cards WHERE account_number = ?';
            const [allCards] = await pool.query(sqlCheckAllCards, [account_number]);
    
            // Determine if more cards can be added
            const hasCreditCard = allCards.some(card => card.card_type === 'credit');
            const hasDebitCard = allCards.some(card => card.card_type === 'debit');
    
            if (card_type === 'credit' && hasCreditCard) {
                return null;  // A credit card already exists
            }
    
            if (card_type === 'debit' && hasDebitCard) {
                return null;  // A debit card already exists
            }
    
            if (!isCardTypeExists) {
                const sqlInsert = 'INSERT INTO Cards (account_number, card_number, card_type) VALUES (?, ?, ?)';
                const [res] = await pool.query(sqlInsert, [account_number, card_number, card_type]);
                return { card_number };  // Return the card number if insertion is successful
            } else {
                return null;  // A card of the requested type already exists
            }
        } catch (err) {
            throw err;
        }
    }
    
    static async getCardNumbers(account_number) {
        try {
            const pool = await poolPromise;
            const sql = 'SELECT card_number, card_type FROM Cards WHERE account_number = ?';
            const [res] = await pool.query(sql, [account_number]);
            return res;
        } catch (err) {
            throw err;
        }
    }

    static async getCardDetails(account_number) {
        try {
            const pool = await poolPromise;
            const sql = 'SELECT * FROM Cards WHERE account_number = ?';
            const [res] = await pool.query(sql, [account_number]);
            return res;
        } catch(err) {
            throw err;
        }
    }

    static async generatePINNumber() {
        try {
            const pinNumber = Math.floor(1000 + Math.random() * 9000);
            return pinNumber.toString();
        } catch(err) {
            throw err;
        }
    }

    static async isValidPIN(pin) {
        try {
            let PIN = pin;
            let revPin = PIN.split('').reverse().join(''); 
            if (PIN === revPin) {
                return false;
            } else {
                return true;
            }
        } catch(err) {
            throw err;
        }
    }

    static async generatePIN(card_number, pin) {
        try {
            const pool = await poolPromise;
            const sql = 'UPDATE Cards SET pin = ? WHERE card_number = ?';
            const [res] = await pool.query(sql, [pin, card_number]);
            return res;
        } catch(err) {
            throw err;
        }
    }

    static async validatePIN(card_number, pin) {
        try{
            const pool = await poolPromise;
            const isValidPINResult = await this.isValidPIN(pin);
            const sql = 'SELECT pin FROM Cards WHERE card_number = ?';
            const [res] = await pool.query(sql, [card_number]);
            const existingPIN = res[0].pin;
            if (pin === existingPIN) {
                return false;
            } else {
                if (isValidPINResult) {
                    const updatePinSql = 'UPDATE Cards SET pin = ? WHERE card_number = ?';
                    const [updateRes] = await pool.query(updatePinSql, [pin, card_number]);
                    if (updateRes.affectedRows > 0) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            }
        } catch(err) {
            throw err;
        }
    }

    static async validateEmail(email) {
        try {
            const pool = await poolPromise;
            const sql = 'SELECT * FROM Users WHERE email = ?';
            const [res] = await pool.query(sql, [email]);
            console.log(res);
            return res;
        } catch(err) {
            throw err;
        }
    }

    static async getUserName(email) {
        try {
            const pool = await poolPromise;
            const sql = 'SELECT * FROM Customers WHERE email = ?';
            const [res] = await pool.query(sql, [email]);
            const first_name = res[0].first_name;
            const last_name = res[0].last_name;
            return first_name + " " + last_name;
        } catch(err) {
            throw err;
        }
    }

    static async updatePassword(email, new_password) {
        try {
            console.log("email ", email);
            console.log("password ", new_password);
            const pool = await poolPromise;
            const sql = 'UPDATE Customers SET password = ? WHERE email = ?';
            const [res] = await pool.query(sql, [new_password, email]);
            console.log("res ", res);
            if(res.affectedRows > 0) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            throw err;
        }
    }
        
}

export default Test;
