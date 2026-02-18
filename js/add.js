/**
 * Add Transaction Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('add-transaction-form');
    const descInput = document.getElementById('desc');
    const amountInput = document.getElementById('amount');
    const categorySelect = document.getElementById('category');
    const dateInput = document.getElementById('date');
    const feedback = document.getElementById('form-feedback');

    // Regexes provided by user
    const descriptionRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
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
        const category = categorySelect.value;
        const date = dateInput.value;

        let isValid = true;

        if (!descriptionRegex.test(desc)) {
            showError('desc-error', 'Invalid description');
            isValid = false;
        }

        if (!amountRegex.test(amount)) {
            showError('amount-error', 'Invalid amount. Use formats like 10 or 10.50.');
            isValid = false;
        }

        if (!categoryRegex.test(category)) {
            showError('category-error', 'Invalid category selection.');
            isValid = false;
        }

        if (!date) {
            showError('date-error', 'Please select a date.');
            isValid = false;
        }

        if (isValid) {
            const transaction = {
                description: desc,
                amount: parseFloat(amount),
                category: category,
                date: date,
                id: Date.now().toString()
            };

            try {
                window.Storage.saveTransaction(transaction);
                feedback.textContent = 'Transaction saved successfully!';
                feedback.classList.add('success');
                form.reset();

                // Optional: Redirect after a short delay
                setTimeout(() => {
                    window.location.href = 'transactions.html';
                }, 1500);
            } catch (error) {
                feedback.textContent = 'Error saving transaction. Please try again.';
                feedback.classList.add('error');
            }
        }
    });
});
