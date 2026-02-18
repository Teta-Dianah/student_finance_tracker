/**
 * Storage utility for Student Finance Tracker
 */

const STORAGE_KEY = 'student_finance_transactions';

const Storage = {
    /**
     * Get all transactions from local storage
     * @returns {Array} Array of transaction objects
     */
    getTransactions: function() {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    /**
     * Save a new transaction
     * @param {Object} transaction - The transaction object to save
     */
    saveTransaction: function(transaction) {
        const transactions = this.getTransactions();
        // Generate a simple unique ID if not present
        if (!transaction.id) {
            transaction.id = Date.now().toString();
        }
        transactions.push(transaction);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    },

    /**
     * Update an existing transaction
     * @param {string} id - The ID of the transaction to update
     * @param {Object} updatedData - The new data for the transaction
     */
    updateTransaction: function(id, updatedData) {
        let transactions = this.getTransactions();
        const index = transactions.findIndex(t => t.id === id);
        if (index !== -1) {
            transactions[index] = { ...transactions[index], ...updatedData };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
            return true;
        }
        return false;
    },

    /**
     * Delete a transaction by ID
     * @param {string} id - The ID of the transaction to delete
     */
    deleteTransaction: function(id) {
        let transactions = this.getTransactions();
        const initialLength = transactions.length;
        transactions = transactions.filter(t => t.id !== id);
        if (transactions.length !== initialLength) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
            return true;
        }
        return false;
    }
};

window.Storage = Storage;
