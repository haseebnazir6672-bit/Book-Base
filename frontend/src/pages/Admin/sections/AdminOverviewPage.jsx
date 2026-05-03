import StatCard from '../../../components/common/StatCard'
import BooksBarChart from '../../../components/charts/BooksBarChart'
import BorrowPieChart from '../../../components/charts/BorrowPieChart'
import DailyBorrowLineChart from '../../../components/charts/DailyBorrowLineChart'

function AdminOverviewPage({ totalBooks, totalDepartments, availableBooks, stats }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
        <p className="text-sm text-slate-500">Home &gt; Dashboard</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Books" value={totalBooks} helper="Updated this week" color="indigo" />
        <StatCard title="Departments" value={totalDepartments} helper="Academic programs" color="emerald" />
        <StatCard title="Available Copies" value={availableBooks} helper="Ready to issue" color="amber" />
        <StatCard title="Books Issued" value={stats.active} helper="Currently active" color="rose" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <BooksBarChart data={stats.monthlyStats} />
        <BorrowPieChart data={stats.categoryStats} />
      </div>

      <DailyBorrowLineChart data={stats.dailyStats} departments={stats.departments} />
    </div>
  )
}

export default AdminOverviewPage
