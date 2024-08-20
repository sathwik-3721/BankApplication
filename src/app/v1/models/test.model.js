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
            console.log(res);
            return res;
        } catch(err) {
            throw err;
        }
    }

    static async createCustomer(first_name, last_name, mobile_num, email, pancard_num, dob, account_type) {
        try {
            const pool = await poolPromise;
            const validateCustomerResult = await Test.validateCustomer(mobile_num, email, pancard_num);
            console.log(validateCustomerResult);
            if (!(validateCustomerResult.length != 0)) {
                return false;
            } else {
                const sql = 'INSERT INTO Customers (first_name, last_name, mobile_num, email, pancard_num, dob, account_type) VALUES (?, ?, ?, ?, ?, ?, ?)';
                const [res] = await pool.query(sql, [first_name, last_name, mobile_num, email, pancard_num, dob, account_type]);
                console.log(res);
                return res;
            }
        } catch(err) {
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
            const sql = 'SELECT mobile_num, pancard_num FROM Customers WHERE customer_id = ?';
            const [res] = await pool.query(sql, [customer_id]);
            console.log("mob", res);
            if (res.length != 0) {
                let mobileNum = res[0].mobile_num;
                let pancardNum = res[0].pancard_num;
                let accountNumber = mobileNum.substring(0, 5) + pancardNum.substring(0, 5);
                console.log(accountNumber);
                return accountNumber;
            } else {
                return false;
            }
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
                return res;
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

    static async isValidAccount(account_number) {
        try {
            const pool = await poolPromise;
            const sql = 'SELECT * FROM Accounts WHERE account_number = ?';
            const [res] = await pool.query(sql, [account_number]);
            return res.length !== 0;
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
    
    
    // static async deleteTransactionsByAccountNumber(account_number) {
    //     try {
    //         const pool = await poolPromise;
    //         const sql = 'DELETE FROM Transactions WHERE from_account_number = ? OR to_account_number = ?';
    //         await pool.query(sql, [account_number, account_number]);
    //     } catch (err) {
    //         throw err;
    //     }
    // }    
        
}

export default Test;
