/**
 * Transactions Page Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const sortSelect = document.getElementById('sort-select');

    const listContainer = document.getElementById('transaction-list');

    // Regexes provided by user
    const descriptionRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
    const amountRegex = /^(0|[1-9]\d*)(\.\d{1,2})?$/;
    const categoryRegex = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;

    // Regex Search Highlight Utility
    function highlight(text, re) {
        if (!re) return text;
        return text.replace(re, m => `<mark>${m}</mark>`);
    }

    // Safe Regex Compiler
    function compileRegex(input, isCaseSensitive) {
        try {
            const flags = isCaseSensitive ? 'g' : 'gi';
            return input ? new RegExp(input, flags) : null;
        } catch (e) {
            return null;
        }
    }

    //Filter and Sort Transactions logic
    function filterAndSortTransactions() {
        const query = searchInput.value.trim();
        const category = categoryFilter.value;
        const sortBy = sortSelect.value;
        const searchStatus = document.getElementById('search-status');
        const isCaseSensitive = document.getElementById('case-sensitive-toggle').checked;

        let filtered = window.Storage.getTransactions();
        const regex = compileRegex(query, isCaseSensitive);

        // 1. Search Filter (Regex supported)
        if (query) {
            if (regex) {
                filtered = filtered.filter(txn =>
                    regex.test(txn.description) ||
                    regex.test(txn.category)
                );
            } else {
                // Fallback to basic include if regex is malformed
                const lowerQuery = query.toLowerCase();
                filtered = filtered.filter(txn =>
                    txn.description.toLowerCase().includes(lowerQuery) ||
                    txn.category.toLowerCase().includes(lowerQuery)
                );
            }
        }

        // 2. Category Filter
        if (category !== 'all') {
            filtered = filtered.filter(txn => txn.category === category);
        }

        // 3. Sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'date-desc':
                    return new Date(b.date) - new Date(a.date);
                case 'date-asc':
                    return new Date(a.date) - new Date(b.date);
                case 'category-asc':
                    return a.category.localeCompare(b.category);
                case 'category-desc':
                    return b.category.localeCompare(a.category);
                case 'amount-asc':
                    return a.amount - b.amount;
                case 'amount-desc':
                    return b.amount - a.amount;
                default:
                    return 0;
            }
        });

        // Update ARIA live region for results count
        if (searchStatus) {
            searchStatus.textContent = `${filtered.length} transactions found.`;
        }

        renderTransactions(filtered, regex);
    }

    // Event Listeners for Live Search, Filter and Sort
    searchInput.addEventListener('input', filterAndSortTransactions);
    categoryFilter.addEventListener('change', filterAndSortTransactions);
    sortSelect.addEventListener('change', filterAndSortTransactions);
    document.getElementById('case-sensitive-toggle').addEventListener('change', filterAndSortTransactions);

    //Render the list of transaction
    function renderTransactions(transactionsToRender, highlightRegex) {
        const transactions = transactionsToRender || window.Storage.getTransactions();
        listContainer.innerHTML = '';

        if (transactions.length === 0) {
            listContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No transactions found.</p>';
            return;
        }

        transactions.forEach(txn => {
            const item = createTransactionItem(txn, highlightRegex);
            listContainer.appendChild(item);
        });
    }

    //Create a transaction item element
    function createTransactionItem(txn, highlightRegex) {
        const div = document.createElement('div');
        div.className = 'transaction-item';
        div.dataset.id = txn.id;

        const amountClass = txn.type === 'Income' ? 'positive' : 'negative';
        const highlightedDesc = highlightRegex ? highlight(txn.description, highlightRegex) : txn.description;

        div.innerHTML = `
            <span class="txn-tag category-${txn.category.toLowerCase()}">${txn.category.substring(0, 6)}</span>
            <div class="txn-details">
                <p class="txn-desc">${highlightedDesc}</p>
                <p class="txn-date">${txn.date}</p>
            </div>
            <div class="txn-amount ${amountClass}">${window.Storage.formatCurrency(txn.amount)}</div>
            <div class="txn-actions">
                <button class="btn-action edit">Edit</button>
                <button class="btn-action delete">Delete</button>
            </div>
        `;

        // Delete button logic
        div.querySelector('.delete').addEventListener('click', () => {
            showDeleteConfirmation(div, txn.id);
        });

        // Edit button logic
        div.querySelector('.edit').addEventListener('click', () => {
            showEditMode(div, txn);
        });

        return div;
    }

    //Show delete confirmation state
    function showDeleteConfirmation(row, id) {
        const originalContent = row.innerHTML;
        row.classList.add('deleting');

        row.innerHTML = `
            <div class="txn-details" style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                <p style="color: #ef4444; font-weight: 700;">Are you sure you want to delete this?</p>
                <div class="txn-actions" style="display: flex; align-items: center; gap: 10px;">
                    <button class="btn-action confirm-yes" style="background: #ef4444; color: white; border: none;">Yes</button>
                    <button class="btn-action confirm-no">No</button>
                </div>
            </div>
        `;

        row.querySelector('.confirm-yes').addEventListener('click', () => {
            window.Storage.deleteTransaction(id);
            renderTransactions();
        });

        row.querySelector('.confirm-no').addEventListener('click', () => {
            row.classList.remove('deleting');
            renderTransactions();
        });
    }

    // Show edit mode state
    function showEditMode(row, txn) {
        row.classList.add('editing');

        row.innerHTML = `
            <div class="txn-details" style="display: flex; gap: 10px; flex-wrap: wrap; width: 100%;">
                <div style="flex: 1; display: flex; flex-direction: column; gap: 5px;">
                    <div style="display: flex; gap: 5px;">
                        <select class="edit-type" style="padding: 5px; border-radius: 4px; font-size: 0.8rem; flex: 1;">
                            <option value="Expense" ${txn.type === 'Expense' ? 'selected' : ''}>Expense</option>
                            <option value="Income" ${txn.type === 'Income' ? 'selected' : ''}>Income</option>
                        </select>
                        <select class="edit-category" style="padding: 5px; border-radius: 4px; font-size: 0.8rem; flex: 2;">
                            <option value="Food" ${txn.category === 'Food' ? 'selected' : ''}>Food</option>
                            <option value="Transport" ${txn.category === 'Transport' ? 'selected' : ''}>Transport</option>
                            <option value="Books" ${txn.category === 'Books' ? 'selected' : ''}>Books</option>
                            <option value="Entertainment" ${txn.category === 'Entertainment' ? 'selected' : ''}>Entertainment</option>
                            <option value="Salary" ${txn.category === 'Salary' ? 'selected' : ''}>Salary</option>
                            <option value="Allowance" ${txn.category === 'Allowance' ? 'selected' : ''}>Allowance</option>
                            <option value="Gift" ${txn.category === 'Gift' ? 'selected' : ''}>Gift</option>
                            <option value="Other" ${txn.category === 'Other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                    <input type="text" class="edit-desc" value="${txn.description}" 
                           style="padding: 5px; border-radius: 4px; border: 1px solid #ccc; font-size: 0.9rem;">
                    <input type="date" class="edit-date" value="${txn.date}"
                           style="padding: 5px; border-radius: 4px; border: 1px solid #ccc; font-size: 0.8rem;">
                </div>
                <div style="display: flex; flex-direction: column; gap: 5px; align-items: flex-end;">
                    <input type="number" class="edit-amount" value="${txn.amount}" step="0.01"
                           style="padding: 5px; border-radius: 4px; border: 1px solid #ccc; font-weight: 800; font-family: monospace; width: 100px; text-align: right;">
                    <div class="txn-actions" style="margin-top: 5px;">
                        <button class="btn-action save" style="background: var(--accent-success); color: white; border: none;">Save</button>
                        <button class="btn-action cancel" style="background: #94a3b8; color: white; border: none;">Cancel</button>
                    </div>
                </div>
                <div class="edit-errors" style="color: #ef4444; font-size: 0.7rem; width: 100%; margin-top: 5px;"></div>
            </div>
        `;

        const saveBtn = row.querySelector('.save');
        const cancelBtn = row.querySelector('.cancel');
        const errorDiv = row.querySelector('.edit-errors');

        saveBtn.addEventListener('click', () => {
            const newType = row.querySelector('.edit-type').value;
            const newCat = row.querySelector('.edit-category').value;
            const newDesc = row.querySelector('.edit-desc').value.trim();
            const newDate = row.querySelector('.edit-date').value;
            const newAmount = row.querySelector('.edit-amount').value;

            let errors = [];
            if (!descriptionRegex.test(newDesc)) errors.push('Invalid description');
            if (!amountRegex.test(newAmount)) errors.push('Invalid amount.');
            if (!categoryRegex.test(newCat)) errors.push('Invalid category.');
            if (!newDate) errors.push('Date required.');

            if (errors.length > 0) {
                errorDiv.textContent = errors.join(' ');
                return;
            }

            const updatedData = {
                type: newType,
                category: newCat,
                description: newDesc,
                date: newDate,
                amount: parseFloat(newAmount)
            };

            window.Storage.updateTransaction(txn.id, updatedData);
            renderTransactions();
        });

        cancelBtn.addEventListener('click', () => {
            renderTransactions();
        });
    }

    // Initial render
    filterAndSortTransactions();
});
