// Calculate total income, expense and balance
export const calculateTotals = (transactions) => {
  let income = 0;
  let expense = 0;

  transactions.forEach((t) => {
    if (t.type === "income") {
      income += t.amount;
    } else {
      expense += t.amount;
    }
  });

  return {
    income,
    expense,
    balance: income - expense,
  };
};

export const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export const formatDate = (value) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

// Category wise expense breakdown
export const getCategoryBreakdown = (transactions) => {
  const breakdown = {};

  transactions.forEach((t) => {
    if (t.type === "expense") {
      breakdown[t.category] =
        (breakdown[t.category] || 0) + t.amount;
    }
  });

  return breakdown;
};

export const getHighestSpendingCategory = (transactions) => {
  const breakdown = getCategoryBreakdown(transactions);
  const entries = Object.entries(breakdown);

  if (entries.length === 0) {
    return null;
  }

  return entries.sort((a, b) => b[1] - a[1])[0];
};

export const getMonthlyComparison = (transactions) => {
  const trend = getMonthlyTrend(transactions);
  const sortedMonths = Object.keys(trend).sort();

  if (sortedMonths.length === 0) {
    return null;
  }

  const latestMonth = sortedMonths[sortedMonths.length - 1];
  const previousMonth = sortedMonths[sortedMonths.length - 2];
  const latest = trend[latestMonth];
  const previous = previousMonth ? trend[previousMonth] : { income: 0, expense: 0 };

  return {
    month: latestMonth,
    income: latest.income,
    expense: latest.expense,
    incomeChange: latest.income - previous.income,
    expenseChange: latest.expense - previous.expense,
  };
};

// Monthly trend (income vs expense)
export const getMonthlyTrend = (transactions) => {
  const trend = {};

  transactions.forEach((t) => {
    const month = t.date.slice(0, 7);

    if (!trend[month]) {
      trend[month] = { income: 0, expense: 0 };
    }

    if (t.type === "income") {
      trend[month].income += t.amount;
    } else {
      trend[month].expense += t.amount;
    }
  });

  return trend;
};