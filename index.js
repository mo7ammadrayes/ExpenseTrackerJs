// Global variables
let transactionsList = JSON.parse(localStorage.getItem("transactionsList")) || [];
let balance = Number(localStorage.getItem("currentBalance")) || 0;
let incomes = Number(localStorage.getItem("incomes")) || 0;
let outcomes = Number(localStorage.getItem("outcomes")) || 0;
let recurrencePeriod = null;
let transactionsChart; 
let recurringTasks = JSON.parse(localStorage.getItem("recurringTasks")) || [];

// DOM elements
const balanceHtml = document.getElementById("balance");
const incomesHtml = document.getElementById("incomes");
const outcomesHtml = document.getElementById("outcomes");
const list = document.getElementById("list");
const addBtn = document.getElementById("add");

// Initialize the app
initializeApp();

function initializeApp() {
    generateRecurringTransactions(); // Generate missing recurring transactions
    loadRecurringTasks(); // Load recurring tasks into the UI

    // Display transactions
    transactionsList.forEach((transaction, index) => {
        addTransactionToDOM(transaction, index);
    });

    updateBalanceUI();
    
    // Event listeners
    addBtn.addEventListener("click", handleAddTransaction);
    document.getElementById("nowMonth").addEventListener("click", () => filterTransactions(1));
    document.getElementById("last3").addEventListener("click", () => filterTransactions(3));
    document.getElementById("last6").addEventListener("click", () => filterTransactions(6));
    document.getElementById("all").addEventListener("click", () => filterTransactions());
    document.getElementById("search").addEventListener("click", handleSearch);
    document.getElementById("recurringNo").addEventListener("click", () => handleRecurrence(false));
    document.getElementById("recurringYes").addEventListener("change", () => handleRecurrence(true));
    handleRecurrenceSetup();
    renderChart();
}

function updateBalanceUI() {
    balanceHtml.textContent = `Current balance: ${balance}`;
    incomesHtml.textContent = `Incomes: ${incomes}`;
    outcomesHtml.textContent = `Outcomes: ${outcomes}`;
}

function updateLocalStorage() {
    localStorage.setItem("transactionsList", JSON.stringify(transactionsList));
    localStorage.setItem("currentBalance", balance);
    localStorage.setItem("incomes", incomes);
    localStorage.setItem("outcomes", outcomes);
}

function addTransaction(transaction) {
    const isDuplicate = transactionsList.some(existingTransaction => 
        existingTransaction.description === transaction.description &&
        existingTransaction.date === transaction.date &&
        existingTransaction.amount === transaction.amount &&
        existingTransaction.type === transaction.type
    );

    if (isDuplicate) {
        window.alert("This transaction already exists.");
        return;
    }

    // If the transaction is recurring, add it to recurringTasks
    if (transaction.recurrencePeriod) {
        recurringTasks.unshift(transaction);
        localStorage.setItem("recurringTasks", JSON.stringify(recurringTasks));
        addRecurringTransactions(transaction); // Add future occurrences
    } else {
        transactionsList.unshift(transaction);
    }

    updateTransactionBalances(transaction);
    updateLocalStorage();
    updateBalanceUI();
    displayFilteredTransactions(transactionsList);
    renderChart();
}

function addRecurringTransactions(transaction) {
    const now = new Date();
    let nextDate = new Date(transaction.date);

    while (nextDate <= now) {
        const recurringTransaction = {
            ...transaction,
            date: new Date(nextDate).toISOString().split('T')[0]  // Update the date
        };

        if (!transactionsList.some(t => t.description === recurringTransaction.description && t.date === recurringTransaction.date)) {
            transactionsList.unshift(recurringTransaction);
            updateTransactionBalances(recurringTransaction); // Update balance for each recurring transaction
        }

        nextDate.setDate(nextDate.getDate() + transaction.recurrencePeriod);
    }
    loadRecurringTasks(); 
    updateLocalStorage(); // Save all recurring transactions to local storage
}
function updateTransactionBalances(transaction) {
    if (transaction.type === "income") {
        balance += transaction.amount;
        incomes += transaction.amount;
    } else {
        balance -= transaction.amount;
        outcomes -= transaction.amount;
    }
}

function deleteTransaction(index) {
    const transaction = transactionsList[index];
    const returnedAmount = transaction.amount;

    if (transaction.type !== "income") {
        balance += returnedAmount;
        outcomes -= returnedAmount;
    } else {
        balance -= returnedAmount;
        incomes -= returnedAmount;
    }

    transactionsList.splice(index, 1);
    updateLocalStorage();
    updateBalanceUI();

    // Re-render the chart with updated data
    renderChart();
}

function addTransactionToDOM(transaction, index) {
    let listElement = document.createElement("li");
    listElement.textContent = `${transaction.description} - ${transaction.amount} -${transaction.type} on ${transaction.date}`;

    // Create a delete button
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.style.marginLeft = '10px';

    // Append the delete button to the list item
    listElement.appendChild(deleteButton);

    // Append the list item to the list
    list.appendChild(listElement);

    // Add an event listener to the delete button
    deleteButton.addEventListener('click', () => {
        deleteTransaction(index);
        listElement.remove();
    });
}

function handleAddTransaction() {
    const purchaseType = document.getElementById("types").value;
    const purchaseName = document.getElementById("name").value;
    const purchaseDate = document.getElementById("date").value;
    const purchaseAmount = Number(document.getElementById("amount").value);

    if (!isValidDate(new Date(purchaseDate))) {
        window.alert("You can't add things more than 2 months in the future");
        return;
    }

    if (purchaseAmount && purchaseDate && purchaseName && purchaseType && (purchaseAmount > 0)) {
        const newTransaction = {
            description: purchaseName,
            date: purchaseDate,
            amount: purchaseAmount,
            type: purchaseType,
            name: purchaseName,
            recurrencePeriod: recurrencePeriod // Include recurrencePeriod
        };

        addTransaction(newTransaction);
    } else {
        window.alert("Please enter correct values.");
    }
}

function filterTransactions(months) {
    const now = new Date();
    const filteredTransactions = transactionsList.filter(transaction => {
        const transactionDate = new Date(transaction.date);

        if (months) {
            const pastDate = new Date(now.getFullYear(), now.getMonth() - months, now.getDate());
            return transactionDate >= pastDate;
        } else {
            return true; // Show all transactions
        }
    });

    displayFilteredTransactions(filteredTransactions);
}

function displayFilteredTransactions(filteredTransactions) {
    list.innerHTML = ''; // Clear the current list

    filteredTransactions.forEach((transaction, index) => {
        addTransactionToDOM(transaction, index);
    });
}

function isValidDate(date) {
    let nowDate = new Date();
    let futureDate = new Date(nowDate.getFullYear(), nowDate.getMonth() + 2, nowDate.getDate());

    return date < futureDate;
}

function handleSearch() {
    const input = document.getElementById("nameInput").value.trim().toLowerCase();
    const filteredTransactions = transactionsList.filter(element => {
        return element.description.toLowerCase().includes(input) || 
               element.amount === Number(input) || 
               element.type.toLowerCase() === input|| 
               element.date === input;
    });

    if (filteredTransactions.length > 0) {
        displayFilteredTransactions(filteredTransactions);
    } else {
        list.innerHTML = ""; // Clear the current list
        let listItem = document.createElement("li");
        listItem.textContent = "No transactions found.";
        list.appendChild(listItem);
    }
}

function handleRecurrence(isRecurring) {
    if (isRecurring) {
        document.getElementById("recurrenceOptions").style.display = "block";
    } else {
        document.getElementById("recurrenceOptions").style.display = "none";
        recurrencePeriod = null;
    }
}

function handleRecurrenceSetup() {
    document.querySelectorAll('input[name="period"]').forEach((radio) => {
        radio.addEventListener("change", () => {
            const customPeriodInput = document.getElementById("customPeriodValue");

            if (document.getElementById("customPeriod").checked) {
                customPeriodInput.style.display = "block";
                recurrencePeriod = Number(customPeriodInput.value);
            } else {
                customPeriodInput.style.display = "none";
            }

            switch (true) {
                case document.getElementById("daily").checked:
                    recurrencePeriod = 1;
                    break;
                case document.getElementById("weekly").checked:
                    recurrencePeriod = 7;
                    break;
                case document.getElementById("monthly").checked:
                    recurrencePeriod = 30;
                    break;
                case document.getElementById("yearly").checked:
                    recurrencePeriod = 365;
                    break;
                default:
                    recurrencePeriod = recurrencePeriod || null;
                    break;
            }

            console.log(`Recurrence Period: ${recurrencePeriod} days`);
        });
    });
}function generateRecurringTransactions() {
    const now = new Date();
    recurringTasks.forEach(transaction => {
        let nextDate = new Date(transaction.date);
        
        while (nextDate <= now) {
            const recurringTransaction = {
                ...transaction,
                date: new Date(nextDate).toISOString().split('T')[0]  // Ensure the date is updated
            };

            if (!transactionsList.some(t => t.description === recurringTransaction.description && t.date === recurringTransaction.date)) {
                transactionsList.unshift(recurringTransaction);
                updateTransactionBalances(recurringTransaction);
            }

            nextDate.setDate(nextDate.getDate() + transaction.recurrencePeriod);
        }
    });

    updateLocalStorage();
}


function getChartData() {
    const incomeTotal = transactionsList
        .filter(transaction => transaction.type === 'income')
        .reduce((total, transaction) => total + transaction.amount, 0);

    const outcomeTotal = transactionsList
        .filter(transaction => transaction.type !== 'income')
        .reduce((total, transaction) => total + transaction.amount, 0);

    return {
        labels: ['Incomes', 'Outcomes'],
        datasets: [{
            data: [incomeTotal, outcomeTotal],
            backgroundColor: ['#4CAF50', '#F44336'],  // Colors for the segments
        }]
    };
}

function renderChart() {
    const ctx = document.getElementById('transactionsChart').getContext('2d');
    const chartData = getChartData();

    // Destroy the existing chart if it exists
    if (transactionsChart) {
        transactionsChart.destroy();
    }

    transactionsChart = new Chart(ctx, {
        type: 'doughnut',  // You can also use 'bar', 'line', etc.
        data: chartData,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Income vs Outcomes'
                }
            }
        },
    });
}

// Function to toggle between the list and the chart
function toggleView(view) {
    const listContainer = document.getElementById("list-container");
    const chartContainer = document.getElementById("chart-container");
    
    const buttonsDate = document.getElementById("buttonsDate");

    if (view === "list") {
        listContainer.style.display = "block";
        chartContainer.style.display = "none";
        buttonsDate.style.display = "block";


    } else if (view === "chart") {
        listContainer.style.display = "none";
        buttonsDate.style.display = "none";

        chartContainer.style.display = "block";
        renderChart(); // Ensure the chart is rendered when switching to chart view
    }
}

// Event listeners for the switcher buttons
document.getElementById("showList").addEventListener("click", () => toggleView("list"));
document.getElementById("showChart").addEventListener("click", () => toggleView("chart"));

// Ensure the default view is the list
toggleView("list");

// Categories: Either from localStorage or default ones
let categories = JSON.parse(localStorage.getItem('categories')) || [
    "Income", "Housing", "Transportation", "Food & Dining", "Health & Fitness",
    "Entertainment", "Personal Care", "Shopping", "Travel", "Education", "Insurance", 
    "Savings & Investments", "Miscellaneous"
];

// DOM elements
const typesSelect = document.getElementById('types');
const editButton = document.getElementById('editTypes');
const categoryModal = document.getElementById('categoryModal');
const categoryList = document.getElementById('categoryList');
const newCategoryInput = document.getElementById('newCategory');
const addCategoryButton = document.getElementById('addCategory');
const closeModalButton = document.getElementById('closeModal');

// Function to populate the <select> element with categories
function populateCategories() {
    typesSelect.innerHTML = '<option value="">Please select</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.toLowerCase();
        option.textContent = category;
        typesSelect.appendChild(option);
    });
}

// Show the modal for editing categories
editButton.addEventListener('click', () => {
    categoryModal.style.display = 'block';
    updateCategoryList();
});

// Close the modal
closeModalButton.addEventListener('click', () => {
    categoryModal.style.display = 'none';
});
function updateCategoryList() {
    categoryList.innerHTML = '';
    categories.forEach((category, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = category;

        // Create a div to wrap the buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('button-container'); // Add a class for styling

        // Create delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => deleteCategory(index));

        // Create edit button
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', () => editCategory(index));

        // Append buttons to the buttonContainer
        buttonContainer.appendChild(editButton);
        buttonContainer.appendChild(deleteButton);

        // Append the buttonContainer to the listItem
        listItem.appendChild(buttonContainer);
        categoryList.appendChild(listItem);
    });
}


// Function to delete a category
function deleteCategory(index) {
    categories.splice(index, 1); // Remove the category
    updateCategoryList();        // Update the list in the modal
    populateCategories();        // Update the <select> element
    localStorage.setItem('categories', JSON.stringify(categories)); // Update localStorage
}

// Function to edit a category
function editCategory(index) {
    const newName = prompt("Edit the category name:", categories[index]);
    if (newName && newName.trim()) {
        categories[index] = newName.trim();
        updateCategoryList();
        populateCategories();
        localStorage.setItem('categories', JSON.stringify(categories));
    }
}

// Function to add a new category
addCategoryButton.addEventListener('click', () => {
    const newCategory = newCategoryInput.value.trim();
    if (newCategory) {
        categories.push(newCategory);
        newCategoryInput.value = ''; // Clear the input
        updateCategoryList();
        populateCategories();
        localStorage.setItem('categories', JSON.stringify(categories));
    }
});

// Initialize by populating the categories on page load
populateCategories();
function loadRecurringTasks() {
    const recurringList = document.getElementById('recurringList');
    recurringList.innerHTML = ''; // Clear list

    recurringTasks.forEach((transaction, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${transaction.description} - Recurs every ${transaction.recurrencePeriod} days`;

        // Create a div to wrap the buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('button-container'); // Add a class for styling

        // Stop button
        const stopButton = document.createElement('button');
        stopButton.textContent = 'Stop';
        stopButton.addEventListener('click', () => stopRecurringTask(index));

        // Edit button
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', () => editRecurringTask(transaction, index));

        // Append buttons to the buttonContainer
        buttonContainer.appendChild(stopButton);
        buttonContainer.appendChild(editButton);

        // Append the buttonContainer to the listItem
        listItem.appendChild(buttonContainer);
        recurringList.appendChild(listItem);
    });
}

// Stop a recurring task
function stopRecurringTask(index) {
    if (confirm("Are you sure you want to stop this recurring task?")) {
        recurringTasks.splice(index, 1);  // Remove from the recurring tasks list
        localStorage.setItem("recurringTasks", JSON.stringify(recurringTasks));
        loadRecurringTasks();  // Refresh the list
    }
}

// Edit a recurring task
function editRecurringTask(transaction, index) {
    const newPeriod = prompt("Enter new recurrence period (in days):", transaction.recurrencePeriod);
    if (newPeriod) {
        transaction.recurrencePeriod = Number(newPeriod);  // Update the recurrence period
        recurringTasks[index] = transaction;  // Update the task in the list
        localStorage.setItem("recurringTasks", JSON.stringify(recurringTasks));
        loadRecurringTasks();  // Refresh the list
    }
}

// Call this function on app initialization to load recurring tasks
loadRecurringTasks();
