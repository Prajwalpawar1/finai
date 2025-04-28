document.addEventListener('DOMContentLoaded', function() {
    // Initialize data if not exists
    if (!localStorage.getItem('accounts')) {
        localStorage.setItem('accounts', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('transactions')) {
        localStorage.setItem('transactions', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('goals')) {
        localStorage.setItem('goals', JSON.stringify([]));
    }
    
    // Tab switching
    const tabLinks = document.querySelectorAll('.sidebar li');
    tabLinks.forEach(link => {
        link.addEventListener('click', function() {
            tabLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            const tabId = this.getAttribute('data-tab');
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('active');
            });
            document.getElementById(tabId).classList.add('active');
            
            // Refresh data when tab is switched
            if (tabId === 'accounts') loadAccounts();
            if (tabId === 'transactions') loadTransactions();
            if (tabId === 'goals') loadGoals();
            if (tabId === 'overview') updateOverview();
        });
    });
    
    // Account Modal
    const accountModal = document.getElementById('account-modal');
    const addAccountBtn = document.getElementById('add-account-btn');
    const accountForm = document.getElementById('account-form');
    
    if (addAccountBtn) {
        addAccountBtn.addEventListener('click', function() {
            accountModal.style.display = 'flex';
        });
    }
    
    accountModal.querySelector('.close').addEventListener('click', function() {
        accountModal.style.display = 'none';
    });
    
    accountForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const account = {
            id: Date.now(),
            name: document.getElementById('account-name').value,
            type: document.getElementById('account-type').value,
            balance: parseFloat(document.getElementById('account-balance').value),
            createdAt: new Date().toISOString()
        };
        
        const accounts = JSON.parse(localStorage.getItem('accounts'));
        accounts.push(account);
        localStorage.setItem('accounts', JSON.stringify(accounts));
        
        accountModal.style.display = 'none';
        accountForm.reset();
        loadAccounts();
        updateOverview();
    });
    
    // Transaction Modal
    const transactionModal = document.getElementById('transaction-modal');
    const addTransactionBtn = document.getElementById('add-transaction-btn');
    const transactionForm = document.getElementById('transaction-form');
    
    if (addTransactionBtn) {
        addTransactionBtn.addEventListener('click', function() {
            // Load accounts into dropdown
            const accountSelect = document.getElementById('trans-account');
            accountSelect.innerHTML = '';
            
            const accounts = JSON.parse(localStorage.getItem('accounts'));
            accounts.forEach(account => {
                const option = document.createElement('option');
                option.value = account.id;
                option.textContent = `${account.name} (${account.type})`;
                accountSelect.appendChild(option);
            });
            
            transactionModal.style.display = 'flex';
        });
    }
    
    transactionModal.querySelector('.close').addEventListener('click', function() {
        transactionModal.style.display = 'none';
    });
    
    transactionForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const transaction = {
            id: Date.now(),
            accountId: document.getElementById('trans-account').value,
            amount: parseFloat(document.getElementById('trans-amount').value),
            category: document.getElementById('trans-category').value,
            date: document.getElementById('trans-date').value,
            description: document.getElementById('trans-description').value,
            type: document.querySelector('input[name="trans-type"]:checked').value,
            createdAt: new Date().toISOString()
        };
        
        // Update account balance
        const accounts = JSON.parse(localStorage.getItem('accounts'));
        const accountIndex = accounts.findIndex(a => a.id == transaction.accountId);
        
        if (accountIndex !== -1) {
            if (transaction.type === 'income') {
                accounts[accountIndex].balance += transaction.amount;
            } else {
                accounts[accountIndex].balance -= transaction.amount;
            }
            localStorage.setItem('accounts', JSON.stringify(accounts));
        }
        
        // Save transaction
        const transactions = JSON.parse(localStorage.getItem('transactions'));
        transactions.push(transaction);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        
        transactionModal.style.display = 'none';
        transactionForm.reset();
        loadTransactions();
        updateOverview();
    });
    
    // Goal Modal
    const goalModal = document.getElementById('goal-modal');
    const addGoalBtn = document.getElementById('add-goal-btn');
    const goalForm = document.getElementById('goal-form');
    
    if (addGoalBtn) {
        addGoalBtn.addEventListener('click', function() {
            goalModal.style.display = 'flex';
        });
    }
    
    goalModal.querySelector('.close').addEventListener('click', function() {
        goalModal.style.display = 'none';
    });
    
    goalForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const goal = {
            id: Date.now(),
            name: document.getElementById('goal-name').value,
            targetAmount: parseFloat(document.getElementById('goal-amount').value),
            targetDate: document.getElementById('goal-date').value,
            description: document.getElementById('goal-description').value,
            createdAt: new Date().toISOString(),
            currentAmount: 0
        };
        
        const goals = JSON.parse(localStorage.getItem('goals'));
        goals.push(goal);
        localStorage.setItem('goals', JSON.stringify(goals));
        
        goalModal.style.display = 'none';
        goalForm.reset();
        loadGoals();
        updateOverview();
    });
    
    // AI Assistant
    const aiSendBtn = document.getElementById('ai-send');
    if (aiSendBtn) {
        aiSendBtn.addEventListener('click', sendAIQuery);
        
        document.getElementById('ai-query').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') sendAIQuery();
        });
    }
    
    // Load initial data
    loadAccounts();
    loadTransactions();
    loadGoals();
    updateOverview();
    
    // Initialize chart
    initChart();
});

function loadAccounts() {
    const accountsList = document.getElementById('accounts-list');
    if (!accountsList) return;
    
    accountsList.innerHTML = '';
    
    const accounts = JSON.parse(localStorage.getItem('accounts'));
    
    if (accounts.length === 0) {
        accountsList.innerHTML = '<p>No accounts found. Add your first account to get started.</p>';
        return;
    }
    
    accounts.forEach(account => {
        const accountItem = document.createElement('div');
        accountItem.className = 'account-item';
        accountItem.innerHTML = `
            <div class="account-details">
                <h3>${account.name}</h3>
                <p>${account.type} • Balance: $${account.balance.toFixed(2)}</p>
            </div>
            <div class="account-actions">
                <button class="btn-small" onclick="editAccount(${account.id})">Edit</button>
                <button class="btn-small" onclick="deleteAccount(${account.id})">Delete</button>
            </div>
        `;
        accountsList.appendChild(accountItem);
    });
}

function loadTransactions() {
    const transactionsList = document.getElementById('transactions-list');
    if (!transactionsList) return;
    
    transactionsList.innerHTML = '';
    
    const transactions = JSON.parse(localStorage.getItem('transactions'));
    const accounts = JSON.parse(localStorage.getItem('accounts'));
    
    if (transactions.length === 0) {
        transactionsList.innerHTML = '<p>No transactions found. Add your first transaction to get started.</p>';
        return;
    }
    
    // Sort by date (newest first)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    transactions.forEach(transaction => {
        const account = accounts.find(a => a.id == transaction.accountId);
        const accountName = account ? `${account.name} (${account.type})` : 'Unknown Account';
        
        const transactionItem = document.createElement('div');
        transactionItem.className = 'transaction-item';
        transactionItem.innerHTML = `
            <div class="transaction-details">
                <h3>${transaction.category} • $${transaction.amount.toFixed(2)}</h3>
                <p>${accountName} • ${transaction.date}</p>
                ${transaction.description ? `<p>${transaction.description}</p>` : ''}
            </div>
            <div class="transaction-actions">
                <span class="type-badge ${transaction.type}">${transaction.type}</span>
                <button class="btn-small" onclick="deleteTransaction(${transaction.id})">Delete</button>
            </div>
        `;
        transactionsList.appendChild(transactionItem);
    });
}

function loadGoals() {
    const goalsList = document.getElementById('goals-list');
    if (!goalsList) return;
    
    goalsList.innerHTML = '';
    
    const goals = JSON.parse(localStorage.getItem('goals'));
    
    if (goals.length === 0) {
        goalsList.innerHTML = '<p>No goals found. Set your first financial goal to get started.</p>';
        return;
    }
    
    goals.forEach(goal => {
        const progress = (goal.currentAmount / goal.targetAmount) * 100;
        const progressBar = progress > 100 ? 100 : progress;
        
        const goalItem = document.createElement('div');
        goalItem.className = 'goal-item';
        goalItem.innerHTML = `
            <div class="goal-details">
                <h3>${goal.name}</h3>
                <p>Target: $${goal.targetAmount.toFixed(2)} by ${goal.targetDate}</p>
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${progressBar}%"></div>
                </div>
                <p>$${goal.currentAmount.toFixed(2)} of $${goal.targetAmount.toFixed(2)} (${Math.round(progress)}%)</p>
                ${goal.description ? `<p>${goal.description}</p>` : ''}
            </div>
            <div class="goal-actions">
                <button class="btn-small" onclick="addToGoal(${goal.id})">Add Funds</button>
                <button class="btn-small" onclick="deleteGoal(${goal.id})">Delete</button>
            </div>
        `;
        goalsList.appendChild(goalItem);
    });
}

function updateOverview() {
    const accounts = JSON.parse(localStorage.getItem('accounts'));
    const transactions = JSON.parse(localStorage.getItem('transactions'));
    const goals = JSON.parse(localStorage.getItem('goals'));
    
    // Calculate total balance
    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
    document.getElementById('total-balance').textContent = `$${totalBalance.toFixed(2)}`;
    
    // Calculate monthly spending (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const monthlyExpenses = transactions
        .filter(t => t.type === 'expense' && new Date(t.date) >= thirtyDaysAgo)
        .reduce((sum, t) => sum + t.amount, 0);
    
    document.getElementById('monthly-spending').textContent = `$${monthlyExpenses.toFixed(2)}`;
    
    // Calculate goals progress
    const totalGoals = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    const totalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const goalsProgress = totalGoals > 0 ? (totalSaved / totalGoals) * 100 : 0;
    
    document.getElementById('goals-progress').textContent = `${Math.round(goalsProgress)}%`;
    
    // Update chart
    updateChart();
}

function initChart() {
    const ctx = document.getElementById('financeChart').getContext('2d');
    window.financeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
            datasets: [
                {
                    label: 'Income',
                    backgroundColor: '#4a6bff',
                    data: [1200, 1900, 1500, 2000, 1800, 2200, 2100]
                },
                {
                    label: 'Expenses',
                    backgroundColor: '#ff6b6b',
                    data: [800, 1200, 1000, 1500, 1300, 1700, 1600]
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateChart() {
    // This would be more sophisticated in a real app
    // For demo purposes, we'll just randomize the data
    if (window.financeChart) {
        window.financeChart.data.datasets[0].data = Array(7).fill().map(() => Math.floor(Math.random() * 2000) + 1000);
        window.financeChart.data.datasets[1].data = Array(7).fill().map(() => Math.floor(Math.random() * 1500) + 500);
        window.financeChart.update();
    }
}

function sendAIQuery() {
    const queryInput = document.getElementById('ai-query');
    const query = queryInput.value.trim();
    
    if (!query) return;
    
    // Add user message
    const messagesContainer = document.getElementById('ai-messages');
    const userMessage = document.createElement('div');
    userMessage.className = 'ai-message user';
    userMessage.innerHTML = `<p>${query}</p>`;
    messagesContainer.appendChild(userMessage);
    
    // Clear input
    queryInput.value = '';
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Simulate AI response after a delay
    setTimeout(() => {
        const botMessage = document.createElement('div');
        botMessage.className = 'ai-message bot';
        
        // Simple response logic - in a real app, this would connect to an AI service
        const responses = [
            "Based on your financial data, I recommend increasing your savings by 10% next month.",
            "Your spending on dining out has increased by 15% compared to last month. Consider setting a budget for this category.",
            "You're making good progress on your 'New Car' goal! At this rate, you'll reach your target in about 8 months.",
            "I noticed you have some unused funds in your checking account. Would you like me to suggest some investment options?",
            "Your net worth has increased by $1,200 this month. Great job!"
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        botMessage.innerHTML = `<p>${randomResponse}</p>`;
        messagesContainer.appendChild(botMessage);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 1000);
}

// Account functions
function editAccount(id) {
    const accounts = JSON.parse(localStorage.getItem('accounts'));
    const account = accounts.find(a => a.id == id);
    
    if (account) {
        document.getElementById('account-name').value = account.name;
        document.getElementById('account-type').value = account.type;
        document.getElementById('account-balance').value = account.balance;
        
        const accountModal = document.getElementById('account-modal');
        accountModal.style.display = 'flex';
        
        // Update form submit to handle edit
        const accountForm = document.getElementById('account-form');
        accountForm.onsubmit = function(e) {
            e.preventDefault();
            
            account.name = document.getElementById('account-name').value;
            account.type = document.getElementById('account-type').value;
            account.balance = parseFloat(document.getElementById('account-balance').value);
            
            localStorage.setItem('accounts', JSON.stringify(accounts));
            accountModal.style.display = 'none';
            accountForm.reset();
            loadAccounts();
            updateOverview();
            
            // Reset form handler
            accountForm.onsubmit = originalAccountFormSubmit;
        };
    }
}

function deleteAccount(id) {
    if (confirm('Are you sure you want to delete this account? All associated transactions will be removed.')) {
        let accounts = JSON.parse(localStorage.getItem('accounts'));
        accounts = accounts.filter(a => a.id != id);
        localStorage.setItem('accounts', JSON.stringify(accounts));
        
        // Also remove transactions associated with this account
        let transactions = JSON.parse(localStorage.getItem('transactions'));
        transactions = transactions.filter(t => t.accountId != id);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        
        loadAccounts();
        loadTransactions();
        updateOverview();
    }
}

// Transaction functions
function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        // First, we need to reverse the transaction's effect on the account balance
        const transactions = JSON.parse(localStorage.getItem('transactions'));
        const transaction = transactions.find(t => t.id == id);
        
        if (transaction) {
            const accounts = JSON.parse(localStorage.getItem('accounts'));
            const accountIndex = accounts.findIndex(a => a.id == transaction.accountId);
            
            if (accountIndex !== -1) {
                if (transaction.type === 'income') {
                    accounts[accountIndex].balance -= transaction.amount;
                } else {
                    accounts[accountIndex].balance += transaction.amount;
                }
                localStorage.setItem('accounts', JSON.stringify(accounts));
            }
        }
        
        // Now remove the transaction
        let updatedTransactions = transactions.filter(t => t.id != id);
        localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
        
        loadTransactions();
        updateOverview();
    }
}

// Goal functions
function addToGoal(id) {
    const amount = prompt('How much would you like to add to this goal?');
    if (amount && !isNaN(amount) )
        {
        const goals = JSON.parse(localStorage.getItem('goals'));
        const goal = goals.find(g => g.id == id);
        
        if (goal) {
            goal.currentAmount += parseFloat(amount);
            localStorage.setItem('goals', JSON.stringify(goals));
            loadGoals();
            updateOverview();
        }
    }
}

function deleteGoal(id) {
    if (confirm('Are you sure you want to delete this goal?')) {
        let goals = JSON.parse(localStorage.getItem('goals'));
        goals = goals.filter(g => g.id != id);
        localStorage.setItem('goals', JSON.stringify(goals));
        loadGoals();
        updateOverview();
    }
}


const originalAccountFormSubmit = document.getElementById('account-form').onsubmit;