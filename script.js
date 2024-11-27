// Get DOM Elements
const expenseForm = document.getElementById('expense-form');
const expenseList = document.getElementById('expense-list');
const expenseChartCanvas = document.getElementById('expense-chart');
const showExpensesBtn = document.getElementById('show-expenses-btn');
const showChartBtn = document.getElementById('show-chart-btn');
const exportExpensesBtn = document.getElementById('export-expenses-btn');
const expenseSection = document.getElementById('expense-section');
const chartSection = document.getElementById('chart-section');
const setTodayButton = document.getElementById('set-today');
const expenseDateInput = document.getElementById('expense-date');
const filterDateInput = document.getElementById('filter-date');
const filterMonthInput = document.getElementById('filter-month');

// Local storage key
const STORAGE_KEY = 'expenses';

// Load expenses from LocalStorage
let expenses = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// Toggle visibility
function toggleVisibility(section) {
    const isHidden = section.classList.contains('hidden');
    document.querySelectorAll('.container > div').forEach(div => div.classList.add('hidden'));
    if (isHidden) section.classList.remove('hidden');
}


// Show/Hide sections
showExpensesBtn.addEventListener('click', () => toggleVisibility(expenseSection));
showChartBtn.addEventListener('click', () => toggleVisibility(chartSection));

// Render expenses
function renderExpenses() {
    expenseList.innerHTML = '';
    
    expenses.forEach((expense, index) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <strong>${expense.name} - ₹${expense.amount} (${expense.date})</strong>
            <span>Category: ${expense.category}</span>
            <span>Note: ${expense.note || 'N/A'}</span>
            <button onclick="deleteExpense(${index})">Delete</button>
        `;
        listItem.style.borderLeft = `5px solid ${
            expense.category === 'Food'
                ? '#ff6384'
                : expense.category === 'Travel'
                ? '#36a2eb'
                : '#cc65fe'
        }`;
        expenseList.appendChild(listItem);
    });

    // Update chart
    renderChart('all');
}

// Add a new expense
expenseForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = document.getElementById('expense-name').value;
    const amount = document.getElementById('expense-amount').value;
    const date = expenseDateInput.value;
    const category = document.getElementById('expense-category').value;
    const note = document.getElementById('expense-note').value;

    if (name && amount && date && category) {
        const newExpense = { name, amount: parseFloat(amount).toFixed(2), date, category, note };
        expenses.push(newExpense);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
        renderExpenses();
        expenseForm.reset();
    } else {
        alert('Please fill in all required fields.');
    }
});

// Delete an expense
function deleteExpense(index) {
    expenses.splice(index, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    renderExpenses();
}

// Set today's date
setTodayButton.addEventListener('click', () => {
    const today = new Date().toISOString().split('T')[0];
    expenseDateInput.value = today;
});

// Export File Pop-up
exportExpensesBtn.addEventListener('click', () => {
    const popup = document.createElement('div');
    popup.className = 'popup';
    popup.innerHTML = `
        <p>Select Export Format:</p>
        <button id="export-json">JSON</button>
        <button id="export-csv">CSV</button>
        <button id="cancel-export">Cancel</button>
    `;
    document.body.appendChild(popup);
    popup.style.display = 'block';

    document.getElementById('export-json').addEventListener('click', () => exportFile('json'));
    document.getElementById('export-csv').addEventListener('click', () => exportFile('csv'));
    document.getElementById('cancel-export').addEventListener('click', () => popup.remove());
});

function exportFile(type) {
    const dataStr = type === 'json'
        ? JSON.stringify(expenses, null, 2)
        : expenses.map(exp => `${exp.name},${exp.amount},${exp.date},${exp.category},${exp.note || ''}`).join('\n');

    const blob = new Blob([dataStr], { type: type === 'json' ? 'application/json' : 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `expenses.${type}`;
    link.click();
    document.querySelector('.popup').remove();
}

// Render chart
let expenseChart;

function renderChart(filterType, filterValue) {
    const filteredExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        if (filterType === 'day') return exp.date === filterValue;
        if (filterType === 'month') return expDate.toISOString().slice(0, 7) === filterValue;
        return true;
    });

    const totals = filteredExpenses.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + parseFloat(exp.amount);
        return acc;
    }, {});

    if (expenseChart) expenseChart.destroy();
    expenseChart = new Chart(expenseChartCanvas, {
        type: 'pie',
        data: {
            labels: Object.keys(totals),
            datasets: [{ data: Object.values(totals), backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe'] }],
        },
    });
}

// Apply filters to chart
filterDateInput.addEventListener('change', () => renderChart('day', filterDateInput.value));
filterMonthInput.addEventListener('change', () => renderChart('month', filterMonthInput.value));

// Initial Render
renderExpenses();
