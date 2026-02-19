/**
 * Dashboard Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    const totalBalanceEl = document.getElementById('total-balance-value');
    const totalExpensesEl = document.getElementById('total-expenses-value');
    const remainingAmountEl = document.getElementById('remaining-amount-value');
    const topCategoryEl = document.getElementById('top-category-value');
    const totalRecordsEl = document.getElementById('total-records-value');
    const trendContainer = document.getElementById('trend-container');

    // Budget Cap elements
    const budgetProgressBar = document.getElementById('budget-progress-bar');
    const budgetSpentText = document.getElementById('budget-spent-text');
    const budgetLimitText = document.getElementById('budget-limit-text');

    function updateDashboard() {
        const transactions = window.Storage.getTransactions();
        const settings = window.Storage.getSettings();
        const MONTHLY_BUDGET = settings.monthlyBudget;

        // 1. Total Records
        if (totalRecordsEl) totalRecordsEl.textContent = transactions.length;

        // 2. Calculations
        // Total Balance = sum of all Income
        // Total Expenses = sum of all Expenses
        // Remaining Amount = Total Balance - Total Expenses
        let totalIncome = 0;
        let totalExpenses = 0;
        let monthlySpending = 0; // Still used for budget cap

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        transactions.forEach(txn => {
            const amount = parseFloat(txn.amount);
            // Default to 'Expense' if type is missing (legacy support)
            const type = txn.type || 'Expense';

            if (type === 'Income') {
                totalIncome += amount;
            } else if (type === 'Expense') {
                totalExpenses += amount;

                // Monthly Spending (Expenses for the current month for budget tracker)
                const txnDate = new Date(txn.date);
                if (txnDate.getMonth() === currentMonth && txnDate.getFullYear() === currentYear) {
                    monthlySpending += amount;
                }
            }
        });

        // The user asked for "remaining amount" = totalIncome - totalExpenses
        const remainingAmount = totalIncome - totalExpenses;

        // Progress bar logic: Total Expenses relative to Total Income
        const spendingPercentage = totalIncome > 0 ? Math.min(100, (totalExpenses / totalIncome) * 100) : 0;

        // Update Stat Cards (Using Global Formatter)
        if (totalBalanceEl) totalBalanceEl.textContent = window.Storage.formatCurrency(totalIncome);
        if (totalExpensesEl) totalExpensesEl.textContent = window.Storage.formatCurrency(totalExpenses);
        if (remainingAmountEl) remainingAmountEl.textContent = window.Storage.formatCurrency(remainingAmount);

        // Update Budget Gap Section
        if (budgetProgressBar) {
            budgetProgressBar.style.width = `${spendingPercentage}%`;
            // Change color if spending is heavy relative to income
            if (spendingPercentage >= 100) {
                budgetProgressBar.style.background = '#ef4444'; // Red
            } else if (spendingPercentage >= 80) {
                budgetProgressBar.style.background = '#f59e0b'; // Orange
            } else {
                budgetProgressBar.style.background = 'var(--accent-primary)';
            }
        }
        if (budgetSpentText) {
            budgetSpentText.textContent = `Total Spent: ${window.Storage.formatCurrency(totalExpenses)}`;
        }
        if (budgetLimitText) {
            budgetLimitText.textContent = `Total Income: ${window.Storage.formatCurrency(totalIncome)}`;
        }

        // 4. Top Category (Highest transaction count)
        const expenseTransactions = transactions.filter(t => (t.type || 'Expense') === 'Expense');
        if (expenseTransactions.length > 0) {
            const categoryCounts = {};
            expenseTransactions.forEach(txn => {
                categoryCounts[txn.category] = (categoryCounts[txn.category] || 0) + 1;
            });

            let topCat = '';
            let maxCount = 0;
            for (const cat in categoryCounts) {
                if (categoryCounts[cat] > maxCount) {
                    maxCount = categoryCounts[cat];
                    topCat = cat;
                }
            }
            if (topCategoryEl) topCategoryEl.textContent = topCat || 'None';
        } else {
            if (topCategoryEl) topCategoryEl.textContent = 'None';
        }

        // 5. Expenditure Trend (Responsive to latest transaction)
        renderTrendChart(transactions);
    }

    function renderTrendChart(transactions) {
        // Always align with the CURRENT calendar week
        const referenceDate = new Date();
        referenceDate.setHours(0, 0, 0, 0);

        // Find the Monday of the current week
        // getDay() returns 0 for Sunday, 1 for Monday, etc.
        // We want 1 (Mon) to be the start.
        const dayOfWeek = referenceDate.getDay();
        const diffToMonday = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek);

        const startOfWeek = new Date(referenceDate);
        startOfWeek.setDate(referenceDate.getDate() + diffToMonday);

        const days = [];
        const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);

            // Format to YYYY-MM-DD in LOCAL time
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;

            days.push({
                dateStr: dateStr,
                dayName: dayNames[i],
                total: 0
            });
        }

        transactions.forEach(txn => {
            if (txn.type === 'Expense') {
                // Find matching day in the CURRENT calendar week
                const day = days.find(d => d.dateStr === txn.date);
                if (day) {
                    day.total += parseFloat(txn.amount);
                }
            }
        });

        const maxSpending = Math.max(...days.map(d => d.total), 50);

        const yAxis = trendContainer.querySelector('.trend-y-axis');
        const labels = [
            Math.round(maxSpending),
            Math.round(maxSpending * 0.75),
            Math.round(maxSpending * 0.5),
            Math.round(maxSpending * 0.25),
            0
        ];

        const ySpans = yAxis.querySelectorAll('span');
        const symbol = window.Storage.getCurrencySymbol();
        labels.forEach((val, i) => {
            if (ySpans[i]) ySpans[i].textContent = `${symbol}${val}`;
        });

        const oldBarWrappers = trendContainer.querySelectorAll('.trend-bar-wrapper');
        oldBarWrappers.forEach(el => el.remove());

        const todayStr = new Date().toISOString().split('T')[0];

        days.forEach(day => {
            const height = maxSpending > 0 ? (day.total / maxSpending) * 100 : 0;
            const barWrapper = document.createElement('div');
            barWrapper.className = 'trend-bar-wrapper';

            // Highlight today if it is in the current view
            const isToday = day.dateStr === todayStr;
            const barStyle = isToday
                ? `style="height: ${height}%; background: linear-gradient(to top, var(--accent-primary), #4fd1c5);"`
                : `style="height: ${height}%;"`;

            barWrapper.innerHTML = `
                <div class="trend-bar" ${barStyle} data-value="${window.Storage.formatCurrency(day.total)}"></div>
                <span class="trend-day">${day.dayName}</span>
            `;
            trendContainer.appendChild(barWrapper);
        });
    }

    updateDashboard();
});
