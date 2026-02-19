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

    // Helper to show error
    const showError = (elementId, message) => {
        const errorSpan = document.getElementById(elementId);
        if (errorSpan) {
            errorSpan.textContent = message;
            errorSpan.classList.add('visible');
        }
    };

    // Helper to hide error
    const hideError = (elementId) => {
        const errorSpan = document.getElementById(elementId);
        if (errorSpan) {
            errorSpan.textContent = '';
            errorSpan.classList.remove('visible');
        }
    };

    // Real-time validation listeners
    descInput.addEventListener('input', () => {
        if (descriptionRegex.test(descInput.value.trim())) {
            hideError('desc-error');
        } else {
            showError('desc-error', 'Description must contain letters and not be numbers only.');
        }
    });

    amountInput.addEventListener('input', () => {
        if (amountRegex.test(amountInput.value.trim())) {
            hideError('amount-error');
        } else {
            showError('amount-error', 'Use a valid number (e.g., 10 or 10.50).');
        }
    });

    categorySelect.addEventListener('change', () => {
        if (categoryRegex.test(categorySelect.value)) {
            hideError('category-error');
        } else {
            showError('category-error', 'Please select a valid category.');
        }
    });

    dateInput.addEventListener('change', () => {
        if (dateInput.value) {
            hideError('date-error');
        } else {
            showError('date-error', 'Date is required.');
        }
    });

    // Helper to clear errors
    const clearErrors = () => {
        document.querySelectorAll('.error-msg').forEach(span => {
            span.textContent = '';
            span.classList.remove('visible');
        });
        feedback.textContent = '';
        feedback.className = 'form-feedback';
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        clearErrors();

        const desc = descInput.value.trim();
        const amount = amountInput.value.trim();
        const type = typeSelect.value;
        const category = categorySelect.value;
        const date = dateInput.value;

        let isValid = true;

        if (!descriptionRegex.test(desc)) {
            showError('desc-error', 'Description must contain letters and not be numbers only.');
            isValid = false;
        }

        if (!amountRegex.test(amount)) {
            showError('amount-error', 'Use a valid number (e.g., 10 or 10.50).');
            isValid = false;
        }

        if (!categoryRegex.test(category)) {
            showError('category-error', 'Please select a valid category.');
            isValid = false;
        }

        if (!date) {
            showError('date-error', 'Date is required.');
            isValid = false;
        }

        if (!isValid) {
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
