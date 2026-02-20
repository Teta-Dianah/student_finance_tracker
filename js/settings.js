// Settings Page Controller
document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const currencySelect = document.getElementById('currency-select');
    const budgetInput = document.getElementById('budget-input');
    const userNameInput = document.getElementById('user-name-input');

    const exportBtn = document.querySelector('button.btn-primary'); 
    const clearBtn = document.querySelector('button.btn-danger'); 

    const dataSection = exportBtn.closest('.settings-section');
    const importItem = document.createElement('div');
    importItem.className = 'setting-item';
    importItem.innerHTML = `
        <div class="setting-info">
            <h4>Import Data</h4>
            <p>Upload a JSON file to restore your records</p>
        </div>
        <div style="display: flex; flex-direction: column; gap: 5px; align-items: flex-end;">
            <input type="file" id="import-input" accept=".json" style="display: none;">
            <button id="import-btn" class="btn-primary" style="width: auto; padding: 8px 16px; margin: 0; font-size: 0.85rem; background: var(--accent-secondary);">Import</button>
        </div>
    `;
    dataSection.insertBefore(importItem, exportBtn.closest('.setting-item'));

    const importInput = document.getElementById('import-input');
    const importBtn = document.getElementById('import-btn');

    // 1. Load Initial Values
    const settings = window.Storage.getSettings();
    darkModeToggle.checked = settings.darkMode;
    currencySelect.value = settings.currency;
    userNameInput.value = settings.userName;

    // Load budget as converted display value
    budgetInput.value = window.Storage.getCurrencyDisplayValue(settings.monthlyBudget);

    // Update budget symbol
    const initialSymbolSpan = budgetInput.previousElementSibling;
    if (initialSymbolSpan && initialSymbolSpan.tagName === 'SPAN') {
        initialSymbolSpan.textContent = window.Storage.getCurrencySymbol();
    }

    // 2. Personalization: Dark Mode
    darkModeToggle.addEventListener('change', () => {
        const isDark = darkModeToggle.checked;
        window.Storage.saveSettings({ darkMode: isDark });
        if (isDark) {
            document.documentElement.classList.add('dark-mode');
        } else {
            document.documentElement.classList.remove('dark-mode');
        }
    });

    // 3. User Name
    userNameInput.addEventListener('input', () => {
        const newName = userNameInput.value.trim() || 'Student';
        const newInitial = newName.charAt(0).toUpperCase();

        window.Storage.saveSettings({ userName: newName });

        document.querySelectorAll('.user-name').forEach(el => el.textContent = newName);
    });

    // 4. Currency Preferences
    let previousCurrency = currencySelect.value;
    currencySelect.addEventListener('change', () => {
        const newCurrency = currencySelect.value;
        const currentBudget = parseFloat(budgetInput.value) || 0;

        const usdBudget = window.Storage.convert(currentBudget, previousCurrency, 'USD');

        window.Storage.saveSettings({ currency: newCurrency });

        // Recalculate and update the display value in the input
        const newDisplayBudget = window.Storage.getCurrencyDisplayValue(usdBudget);
        budgetInput.value = newDisplayBudget;

        // Update the symbol span if it exists 
        const symbolSpan = budgetInput.previousElementSibling;
        if (symbolSpan && symbolSpan.tagName === 'SPAN') {
            symbolSpan.textContent = window.Storage.getCurrencySymbol();
        }

        previousCurrency = newCurrency;
    });

    // 5. Budget Goals
    budgetInput.addEventListener('input', () => {
        const displayVal = parseFloat(budgetInput.value);
        if (!isNaN(displayVal)) {
            // Convert the displayed value to USD before saving
            const usdVal = window.Storage.convert(displayVal, currencySelect.value, 'USD');
            window.Storage.saveSettings({ monthlyBudget: usdVal });
        }
    });

    // 6. Data Management: Export
    exportBtn.addEventListener('click', () => {
        const data = window.Storage.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `finance_tracker_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // 7. Data Management: Import
    importBtn.addEventListener('click', () => importInput.click());
    importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const success = window.Storage.importData(event.target.result);
            if (success) {
                alert('Data imported successfully! The page will now reload.');
                window.location.reload();
            } else {
                alert('Failed to import data. Please ensure the file is a valid JSON export.');
            }
        };
        reader.readAsText(file);
    });

    // 8. Data Management: Reset
    clearBtn.addEventListener('click', () => {
        if (confirm('Are you absolutely sure? This will wipe ALL transactions and settings permanently.')) {
            window.Storage.clearAll();
            window.location.reload();
        }
    });
});
