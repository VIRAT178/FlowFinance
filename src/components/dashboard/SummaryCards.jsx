import { useContext } from "react";
import { FinanceContext } from "../../context/FinanceContext";
import { calculateTotals, formatCurrency } from "../../utils/finance";

const Card = ({ title, value, color }) => {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.5)] backdrop-blur transition hover:-translate-y-1 hover:shadow-[0_24px_70px_-30px_rgba(15,23,42,0.6)]">
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">{title}</p>
      <h2 className={`mt-3 text-3xl font-semibold ${color}`}>{formatCurrency(value)}</h2>
      <div className="mt-4 h-1.5 w-20 rounded-full bg-slate-100">
        <div className={`h-1.5 rounded-full ${color.replace("text-", "bg-")}`} />
      </div>
    </div>
  );
};

const SummaryCards = () => {
  const { currentTransactions } = useContext(FinanceContext);
  const { income, expense, balance } = calculateTotals(currentTransactions);

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      <Card title="Total Balance" value={balance} color="text-gray-800" />
      <Card title="Income" value={income} color="text-green-600" />
      <Card title="Expenses" value={expense} color="text-red-600" />
    </div>
  );
};

export default SummaryCards;