//Storage utility for Student Finance Tracker
 

const STORAGE_KEY = 'student_finance_transactions';
const SETTINGS_KEY = 'student_finance_settings';

const DEFAULT_SETTINGS = {
    userName: 'Student',
    darkMode: false,
    currency: 'USD',
    monthlyBudget: 600.00
};

const Storage = {
    // Settings Management

    getSettings: function () {
        const data = localStorage.getItem(SETTINGS_KEY);
        return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    },

    saveSettings: function (settings) {
        const current = this.getSettings();
        const updated = { ...current, ...settings };
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    },

    //Currency Formatting & Conversion
    EXCHANGE_RATES: {
        'USD': 1.0,
        'RWF': 1455.0,
        'EUR': 0.84,
        'GBP': 0.73
    },

    getCurrencySymbol: function () {
        const currency = this.getSettings().currency;
        const symbols = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'RWF': 'RWF'
        };
        return symbols[currency] || '$';
    },

    /**
     * Converts an amount from one currency to another using USD as base.
     * @param {number} amount
     * @param {string} from
     * @param {string} to
     */
    convert: function (amount, from, to) {
        if (from === to) return amount;
        // Convert from source to USD first
        const usdAmount = amount / this.EXCHANGE_RATES[from];
        // Then from USD to target
        return usdAmount * this.EXCHANGE_RATES[to];
    },

    /**
     * Formats a USD amount for display in the current selected currency.
     * @param {number} amount - Always assumed to be in USD.
     */
    formatCurrency: function (amount) {
        const settings = this.getSettings();
        const currency = settings.currency;
        const symbol = this.getCurrencySymbol();
        const converted = amount * this.EXCHANGE_RATES[currency];

        const isRWF = currency === 'RWF';
        const formatted = converted.toLocaleString(undefined, {
            minimumFractionDigits: isRWF ? 0 : 2,
            maximumFractionDigits: isRWF ? 0 : 2
        });

        return isRWF ? `${formatted} ${symbol}` : `${symbol}${formatted}`;
    },

    //Returns the raw converted value for input fields
    getCurrencyDisplayValue: function (usdAmount) {
        const currency = this.getSettings().currency;
        const converted = usdAmount * this.EXCHANGE_RATES[currency];
        const isRWF = currency === 'RWF';
        return isRWF ? Math.round(converted) : parseFloat(converted.toFixed(2));
    },

    //Data Portability
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

    // Transaction Management
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
