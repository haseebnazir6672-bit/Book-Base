import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

const COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#e11d48']

function BorrowPieChart({ data }) {
  return (
    <article className="rounded-2xl border border-slate-200 p-4">
      <h3 className="text-base font-semibold text-slate-900">Borrowed Books by Category</h3>
      <div className="mt-4 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} label>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </article>
  )
}

export default BorrowPieChart
