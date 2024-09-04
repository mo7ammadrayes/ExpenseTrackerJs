# MoneyKeeper - Expense Tracker with Recurring Transactions

## Overview

**MoneyKeeper** is a dynamic and interactive web-based expense tracker designed to help users track their income and expenses efficiently. This project enables users to:
- Add, edit, and delete transactions.
- Manage categories for transactions.
- Handle recurring transactions that automatically repeat based on user-defined periods.
- Visualize income and expense data through charts using Chart.js.
- Filter and search transactions based on categories and date ranges.

This project uses HTML, CSS, and JavaScript, with data stored locally in the browser's `localStorage`.

## Features

### 1. Add/Edit/Delete Transactions
- Users can input transaction details (amount, name, date, category) and manage them directly.
- Transactions can be categorized under user-defined or pre-defined categories such as "Income," "Food & Dining," "Travel," etc.
- Transactions can be deleted or modified easily.

### 2. Manage Recurring Transactions
- Users can set transactions to recur automatically after a certain number of days (e.g., daily, weekly, monthly, or custom).
- Recurring transactions are automatically added to the transaction list on the appropriate day.
- Recurring tasks can be viewed, stopped, or edited at any time.

### 3. Transaction Filtering and Searching
- Users can filter transactions by time periods (current month, last 3 months, last 6 months, all time).
- Users can search transactions by name, amount, or category.

### 4. Data Visualization
- Income and expense data are visualized using Chart.js in the form of a doughnut chart.
- Users can toggle between viewing a list of transactions and the data visualization.

### 5. Category Management
- Users can create, edit, or delete categories for organizing their transactions.
- A user-friendly modal interface allows easy category management.

### 6. Local Storage
- All data (transactions, categories, and settings) are stored locally using `localStorage`, so user data persists between sessions.

## Technologies Used
- **HTML5**: Structure and layout of the application.
- **CSS3**: Styling and responsiveness.
- **JavaScript**: Functionality and dynamic content.
- **Chart.js**: Visualization of income and expense data.
- **localStorage**: For storing transactions, categories, and user preferences.

## How to Use

### 1. Add a Transaction
- Enter the transaction amount, name, date, and select a category.
- Choose whether the transaction is recurring or one-time.
- Click "Add" to add the transaction to the list.

### 2. View and Filter Transactions
- Use the buttons to filter transactions by time period (current month, last 3 months, last 6 months, or all).
- You can also search for transactions using the search bar.

### 3. View Charts
- Click "Show Chart" to view a doughnut chart of income vs. expenses.

### 4. Manage Categories
- Click "Edit Categories" to open the category management modal.
- Add new categories, edit existing categories, or delete categories.

### 5. Manage Recurring Transactions
- Recurring transactions are automatically managed based on their recurrence period.
- Recurring tasks can be viewed, edited, or stopped from the "Manage Recurring Transactions" section.

