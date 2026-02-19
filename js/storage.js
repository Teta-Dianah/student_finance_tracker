/**
 * Storage utility for Student Finance Tracker
 */

const STORAGE_KEY = 'student_finance_transactions';
const SETTINGS_KEY = 'student_finance_settings';

const DEFAULT_SETTINGS = {
    userName: 'Student',
    darkMode: false,
    currency: 'USD',
    monthlyBudget: 600.00
};

const Storage = {
    /**
     * Settings Management
     */
    getSettings: function () {
        const data = localStorage.getItem(SETTINGS_KEY);
        return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    },

    saveSettings: function (settings) {
        const current = this.getSettings();
        const updated = { ...current, ...settings };
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    },

    /**
     * Currency Formatting & Conversion
     */
    getCurrencySymbol: function () {
        const currency = this.getSettings().currency;
        const symbols = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'RWF': 'R'
        };
        return symbols[currency] || '$';
    },

    formatCurrency: function (amount) {
        const settings = this.getSettings();
        const currency = settings.currency;
        const symbol = this.getCurrencySymbol();

        // Simple conversion rates (Base: USD)
        const rates = {
            'USD': 1.0,
            'EUR': 0.95,
            'GBP': 0.82,
            'RWF': 1400.0
        };

        const convertedAmount = amount * (rates[currency] || 1.0);
        return `${symbol}${convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    },

    /**
     * Data Portability
     */
    exportData: function () {
        const transactions = this.getTransactions();
        const settings = this.getSettings();
        const exportObj = {
            transactions: transactions,
            settings: settings,
            exportedAt: new Date().toISOString()
        };
        return JSON.stringify(exportObj, null, 2);
    },

    importData: function (jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (!data.transactions || !Array.isArray(data.transactions)) {
                throw new Error('Invalid format: Missing transactions array.');
            }

            // Save settings if present
            if (data.settings) {
                this.saveSettings(data.settings);
            }

            // Overwrite transactions
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data.transactions));
            return true;
        } catch (e) {
            console.error('Import failed:', e);
            return false;
        }
    },

    clearAll: function () {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(SETTINGS_KEY);
    },

    /**
     * Transaction Management
     */
    getTransactions: function () {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    saveTransaction: function (transaction) {
        const transactions = this.getTransactions();
        if (!transaction.id) {
            transaction.id = Date.now().toString();
        }
        transactions.push(transaction);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    },

    updateTransaction: function (id, updatedData) {
        let transactions = this.getTransactions();
        const index = transactions.findIndex(t => t.id === id);
        if (index !== -1) {
            transactions[index] = { ...transactions[index], ...updatedData };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
            return true;
        }
        return false;
    },

    deleteTransaction: function (id) {
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
