import { useContext } from "react";
import { FinanceContext } from "../../context/FinanceContext";
import { getCategoryBreakdown } from "../../utils/finance";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#3b82f6", "#f59e0b", "#ef4444", "#10b981"];

const PieChartBox = () => {
  const { currentTransactions } = useContext(FinanceContext);

  const data = Object.entries(
    getCategoryBreakdown(currentTransactions)
  ).map(([category, value]) => ({
    name: category,
    value,
  }));

  return (
    <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.5)] backdrop-blur">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Spending Breakdown</h2>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              outerRadius={110}
              innerRadius={60}
              paddingAngle={4}
              label
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>

            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PieChartBox;