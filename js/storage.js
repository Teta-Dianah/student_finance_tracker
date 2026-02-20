//Storage utility for Student Finance Tracker


const STORAGE_KEY = 'student_finance_transactions';
const SETTINGS_KEY = 'student_finance_settings';

const DEFAULT_SETTINGS = {
    userName: 'Student',
    currency: 'GBP',
    monthlyBudget: 600,
    darkMode: false,
    exchangeRates: {
        'USD': 1.0,
        'RWF': 1455.0,
        'EUR': 0.94,
        'GBP': 0.79
    }
};

const Storage = {
    // Settings Management

    getSettings: function () {
        const data = localStorage.getItem(SETTINGS_KEY);
        // Deep merge for exchangeRates
        const parsed = data ? JSON.parse(data) : {};
        return {
            ...DEFAULT_SETTINGS,
            ...parsed,
            exchangeRates: { ...DEFAULT_SETTINGS.exchangeRates, ...(parsed.exchangeRates || {}) }
        };
    },

    saveSettings: function (newSettings) {
        const current = this.getSettings();
        // Handle deep merge for exchangeRates if present in newSettings
        const updated = { ...current, ...newSettings };
        if (newSettings.exchangeRates) {
            updated.exchangeRates = { ...current.exchangeRates, ...newSettings.exchangeRates };
        }
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    },

    //Currency Formatting & Conversion
    getExchangeRates: function () {
        return this.getSettings().exchangeRates;
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
        const rates = this.getExchangeRates();
        // Convert from source to USD first
        const usdAmount = amount / rates[from];
        // Then from USD to target
        return usdAmount * rates[to];
    },

    /**
     * Formats a USD amount for display in the current selected currency.
     * @param {number} amount - Always assumed to be in USD.
     */
    formatCurrency: function (amount) {
        const settings = this.getSettings();
        const currency = settings.currency;
        const symbol = this.getCurrencySymbol();
        const rates = settings.exchangeRates;
        const converted = amount * rates[currency];

        const isRWF = currency === 'RWF';
        const formatted = converted.toLocaleString(undefined, {
            minimumFractionDigits: isRWF ? 0 : 2,
            maximumFractionDigits: isRWF ? 0 : 2
        });

        return isRWF ? `${formatted} ${symbol}` : `${symbol}${formatted}`;
    },

    //Returns the raw converted value for input fields
    getCurrencyDisplayValue: function (usdAmount) {
        const settings = this.getSettings();
        const currency = settings.currency;
        const rates = settings.exchangeRates;
        const converted = usdAmount * rates[currency];
        const isRWF = (currency === 'RWF');
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

    saveTransaction: function (txn) {
        const transactions = this.getTransactions();
        const now = new Date().toISOString();

        // Add timestamps
        txn.createdAt = now;
        txn.updatedAt = now;

        transactions.unshift(txn); // Add to beginning
        localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    },

    updateTransaction: function (id, updatedData) {
        const transactions = this.getTransactions();
        const index = transactions.findIndex(t => t.id === id);
        if (index !== -1) {
            // Update timestamps
            const now = new Date().toISOString();
            transactions[index] = {
                ...transactions[index],
                ...updatedData,
                updatedAt: now
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
        }
    },

    deleteTransaction: function (id) {
        const transactions = this.getTransactions();
        const filtered = transactions.filter(t => t.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
};

window.Storage = Storage;
