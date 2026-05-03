import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts'

const COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#e11d48', '#8b5cf6', '#f97316', '#ec4899']

function DailyBorrowLineChart({ data, departments }) {
  const formattedData = data?.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  })) || []

  const chartDepartments = departments || (formattedData.length > 0 
    ? Object.keys(formattedData[0]).filter(key => key !== 'date')
    : [])

  return (
    <article className="rounded-2xl border border-slate-200 p-4">
      <h3 className="text-base font-semibold text-slate-900">Daily Book Borrowing by Department (Last 30 Days)</h3>
      <div className="mt-4 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            {chartDepartments.map((dept, index) => (
              <Line
                key={dept}
                type="monotone"
                dataKey={dept}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                name={dept}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </article>
  )
}

export default DailyBorrowLineChart
