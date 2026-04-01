import SummaryCards from "../components/dashboard/SummaryCards";
import LineChartBox from "../components/dashboard/LineChartBox";
import PieChartBox from "../components/dashboard/PieChartBox";
import { useContext } from "react";
import { FinanceContext } from "../context/FinanceContext";
import {
  calculateTotals,
  getHighestSpendingCategory,
  getMonthlyComparison,
  formatCurrency,
} from "../utils/finance";

const Dashboard = () => {
  const { currentUser, currentTransactions } = useContext(FinanceContext);
  const totals = calculateTotals(currentTransactions);
  const highestSpending = getHighestSpendingCategory(currentTransactions);
  const monthlyComparison = getMonthlyComparison(currentTransactions);
  const monthlyGoal = currentUser?.profile.monthlyGoal ?? 0;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-[0_30px_80px_-35px_rgba(15,23,42,0.75)] sm:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.26em] text-sky-300">Welcome back</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl">
              {currentUser?.profile.displayName || currentUser?.profile.fullName || "Your finance portal"}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Track your income, spending, and goals in one private workspace. Everything you add stays under your account.
            </p>
          </div>

          <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200 backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <span>Balance</span>
              <span className="font-semibold text-white">{formatCurrency(totals.balance)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Income</span>
              <span className="font-semibold text-emerald-300">{formatCurrency(totals.income)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Expenses</span>
              <span className="font-semibold text-rose-300">{formatCurrency(totals.expense)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Monthly goal</span>
              <span className="font-semibold text-sky-200">{formatCurrency(monthlyGoal)}</span>
            </div>
          </div>
        </div>
      </section>

      <SummaryCards />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.5)] backdrop-blur">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Highest spending</p>
          <h3 className="mt-3 text-2xl font-semibold text-slate-900">
            {highestSpending ? highestSpending[0] : "No expenses"}
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            {highestSpending ? formatCurrency(highestSpending[1]) : "Add transactions to see spending patterns."}
          </p>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.5)] backdrop-blur">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Latest month</p>
          <h3 className="mt-3 text-2xl font-semibold text-slate-900">
            {monthlyComparison ? monthlyComparison.month : "No data"}
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            {monthlyComparison
              ? `Income ${monthlyComparison.incomeChange >= 0 ? "rose" : "fell"} by ${formatCurrency(Math.abs(monthlyComparison.incomeChange))} while expenses ${monthlyComparison.expenseChange >= 0 ? "rose" : "fell"} by ${formatCurrency(Math.abs(monthlyComparison.expenseChange))}.`
              : "Monthly comparison appears once data spans multiple months."}
          </p>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.5)] backdrop-blur">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Account view</p>
          <h3 className="mt-3 text-2xl font-semibold text-slate-900">Private account view</h3>
          <p className="mt-2 text-sm text-slate-600">
            Your dashboard, transactions, and profile are scoped to the signed-in email.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <LineChartBox />
        <PieChartBox />
      </div>
    </div>
  );
};

export default Dashboard;