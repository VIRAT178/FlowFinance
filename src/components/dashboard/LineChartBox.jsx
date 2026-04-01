import { useContext } from "react";
import { FinanceContext } from "../../context/FinanceContext";
import { getMonthlyTrend } from "../../utils/finance";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

const LineChartBox = () => {
  const { currentTransactions } = useContext(FinanceContext);

  const trendData = Object.entries(
    getMonthlyTrend(currentTransactions)
  ).map(([month, value]) => ({
    month,
    income: value.income,
    expense: value.expense,
  }));

  return (
    <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.5)] backdrop-blur">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Monthly Trend</h2>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 12 }} />
            <YAxis tick={{ fill: "#475569", fontSize: 12 }} />
            <Tooltip />
            <Legend />

            <Line type="monotone" dataKey="income" stroke="#16a34a" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="expense" stroke="#dc2626" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LineChartBox;