/**
 * Add Transaction Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('add-transaction-form');
    const descInput = document.getElementById('desc');
    const amountInput = document.getElementById('amount');
    const categorySelect = document.getElementById('category');
    const typeSelect = document.getElementById('type');
    const dateInput = document.getElementById('date');
    const feedback = document.getElementById('form-feedback');

    // Regexes provided by user
    // Regexes: Allows alphanumeric with at least one letter, single spaces only.
    const descriptionRegex = /^(?=.*[a-zA-Z])[a-zA-Z0-9]+(?:\s[a-zA-Z0-9]+)*$/;
    const amountRegex = /^(0|[1-9]\d*)(\.\d{1,2})?$/;
    const categoryRegex = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;

    // Helper to show/hide error messages
    const showError = (id, msg) => {
        const errorEl = document.getElementById(id);
        if (errorEl) {
            errorEl.textContent = msg;
            errorEl.classList.add('visible');
        }
    };

    const hideError = (id) => {
        const errorEl = document.getElementById(id);
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.classList.remove('visible');
        }
    };

    // Helper to update field UI
    const updateFieldUI = (inputElement, isValid, errorId, errorMessage) => {
        if (isValid) {
            inputElement.classList.remove('invalid');
            inputElement.classList.add('valid');
            hideError(errorId);
        } else {
            inputElement.classList.remove('valid');
            inputElement.classList.add('invalid');
            if (errorMessage) {
                showError(errorId, errorMessage);
            }
        }
    };

    // Dynamic Categories Logic
    const categoryOptions = {
        Expense: ['Food', 'Transport', 'Books', 'Entertainment', 'Other'],
        Income: ['Salary', 'Allowance', 'Gift', 'Other']
    };

    const updateCategoryOptions = (type) => {
        const options = categoryOptions[type] || [];
        categorySelect.innerHTML = '<option value="" disabled selected>Select a category</option>';
        options.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categorySelect.appendChild(option);
        });
        // Clear category error and validity state when type changes
        categorySelect.classList.remove('valid', 'invalid');
        hideError('category-error');
    };

    // Real-time validation listeners
    descInput.addEventListener('input', () => {
        const isValid = descriptionRegex.test(descInput.value.trim());
        updateFieldUI(descInput, isValid, 'desc-error', 'Description must contain letters and not be numbers only.');
    });

    amountInput.addEventListener('input', () => {
        const isValid = amountRegex.test(amountInput.value.trim());
        updateFieldUI(amountInput, isValid, 'amount-error', 'Use a valid number (e.g., 10 or 10.50).');
    });

    typeSelect.addEventListener('change', () => {
        updateCategoryOptions(typeSelect.value);
    });

    categorySelect.addEventListener('change', () => {
        const isValid = categoryRegex.test(categorySelect.value);
        updateFieldUI(categorySelect, isValid, 'category-error', 'Please select a valid category.');
    });

    dateInput.addEventListener('change', () => {
        const isValid = !!dateInput.value;
        updateFieldUI(dateInput, isValid, 'date-error', 'Date is required.');
    });

    // Initialize categories on load
    updateCategoryOptions(typeSelect.value);

    // Helper to clear errors
    const clearErrors = () => {
        document.querySelectorAll('.error-msg').forEach(span => {
            span.textContent = '';
            span.classList.remove('visible');
        });
        document.querySelectorAll('input, select').forEach(el => {
            el.classList.remove('valid', 'invalid');
        });
        feedback.textContent = '';
        feedback.className = 'form-feedback';
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const desc = descInput.value.trim();
        const amount = amountInput.value.trim();
        const type = typeSelect.value;
        const category = categorySelect.value;
        const date = dateInput.value;

        // Final validation check
        const isDescValid = descriptionRegex.test(desc);
        const isAmountValid = amountRegex.test(amount);
        const isCategoryValid = categoryRegex.test(category);
        const isDateValid = !!date;

        updateFieldUI(descInput, isDescValid, 'desc-error', 'Description must contain letters and not be numbers only.');
        updateFieldUI(amountInput, isAmountValid, 'amount-error', 'Use a valid number (e.g., 10 or 10.50).');
        updateFieldUI(categorySelect, isCategoryValid, 'category-error', 'Please select a valid category.');
        updateFieldUI(dateInput, isDateValid, 'date-error', 'Date is required.');

        if (!isDescValid || !isAmountValid || !isCategoryValid || !isDateValid) {
            feedback.textContent = 'Please fix the errors highlighted above.';
            feedback.classList.add('error');
            return; // Stop here if invalid
        }

        // Only save if valid
        const transaction = {
            description: desc,
            amount: parseFloat(amount),
            type: type,
            category: category,
            date: date,
            id: Date.now().toString()
        };

        try {
            window.Storage.saveTransaction(transaction);
            feedback.textContent = 'Transaction saved successfully!';
            feedback.classList.add('success');
            form.reset();

            // Redirect after a short delay
            setTimeout(() => {
                window.location.href = 'transactions.html';
            }, 1500);
        } catch (error) {
            feedback.textContent = 'Something went wrong. Please try again.';
            feedback.classList.add('error');
        }
    });
});
