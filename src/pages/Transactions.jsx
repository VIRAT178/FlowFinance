import { useContext, useMemo, useState } from "react";
import { FinanceContext } from "../context/FinanceContext";
import { formatCurrency, formatDate } from "../utils/finance";

const initialFormState = {
  date: new Date().toISOString().slice(0, 10),
  category: "",
  amount: "",
  type: "expense",
};

const Transactions = () => {
  const {
    state,
    currentUser,
    currentTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    setFilter,
  } = useContext(FinanceContext);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredTransactions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const matchingTransactions = currentTransactions.filter((transaction) => {
      const searchTarget = `${transaction.category} ${transaction.date} ${transaction.type}`.toLowerCase();
      const matchesSearch = searchTarget.includes(normalizedSearch);
      const matchesFilter = state.filter === "all" || transaction.type === state.filter;

      return matchesSearch && matchesFilter;
    });

    return [...matchingTransactions].sort((a, b) => {
      if (sortBy === "amount-desc") {
        return b.amount - a.amount;
      }

      if (sortBy === "amount-asc") {
        return a.amount - b.amount;
      }

      if (sortBy === "date-asc") {
        return new Date(a.date) - new Date(b.date);
      }

      return new Date(b.date) - new Date(a.date);
    });
  }, [currentTransactions, search, sortBy, state.filter]);

  const resetForm = () => {
    setEditingTransaction(null);
    setFormData(initialFormState);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const transactionPayload = {
      id: editingTransaction?.id,
      date: formData.date,
      category: formData.category.trim(),
      amount: Number(formData.amount),
      type: formData.type,
    };

    if (!transactionPayload.category || Number.isNaN(transactionPayload.amount)) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingTransaction) {
        await updateTransaction(transactionPayload);
      } else {
        await addTransaction(transactionPayload);
      }

      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      date: transaction.date,
      category: transaction.category,
      amount: String(transaction.amount),
      type: transaction.type,
    });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.45)] backdrop-blur sm:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.26em] text-sky-600">Transactions</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">Explore and manage activity</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Search, sort, and filter the records stored in your own account.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900 px-4 py-3 text-sm text-slate-200">
            {filteredTransactions.length} records shown
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.45)] backdrop-blur">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">
                Search
                <input
                  type="text"
                  placeholder="Search category, date, or type"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Type filter
                <select
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400"
                  value={state.filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </label>

              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Sort by
                <select
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="date-desc">Newest first</option>
                  <option value="date-asc">Oldest first</option>
                  <option value="amount-desc">Highest amount</option>
                  <option value="amount-asc">Lowest amount</option>
                </select>
              </label>
            </div>
          </section>

          <section className="rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
            Signed in as {currentUser?.profile.displayName || currentUser?.profile.fullName}. Your filters only affect your own data.
          </section>
        </div>

        <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.45)] backdrop-blur">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-slate-900">
              {editingTransaction ? "Edit transaction" : "Add transaction"}
            </h2>
            {editingTransaction && (
              <button
                onClick={resetForm}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
              >
                Cancel edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl bg-slate-50 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Date
                <input
                  type="date"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-400"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Type
                <select
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-400"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Category
                <input
                  type="text"
                  placeholder="Salary, Food, Rent..."
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-400"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Amount
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-400"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Saving..." : editingTransaction ? "Update transaction" : "Add transaction"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
              >
                Reset
              </button>
            </div>
          </form>
        </section>

        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.45)] backdrop-blur xl:col-span-2">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Transaction list</h2>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="px-6 py-14 text-center text-slate-500">
              No transactions match the current filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Category</th>
                    <th className="px-6 py-4 font-medium">Amount</th>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-t border-slate-100 transition hover:bg-slate-50/80">
                      <td className="px-6 py-4 text-slate-600">{formatDate(transaction.date)}</td>

                      <td className="px-6 py-4 font-medium text-slate-900">{transaction.category}</td>

                      <td className={`px-6 py-4 font-semibold ${transaction.type === "income" ? "text-emerald-600" : "text-rose-600"}`}>
                        {formatCurrency(transaction.amount)}
                      </td>

                      <td className="px-6 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${transaction.type === "income" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                          {transaction.type}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => startEdit(transaction)}
                            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteTransaction(transaction.id)}
                            className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:border-rose-300 hover:text-rose-700"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Transactions;