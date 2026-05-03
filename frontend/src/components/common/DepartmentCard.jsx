function DepartmentCard({ department, selectedDepartment, onSelect }) {
  const selected = selectedDepartment === department

  return (
    <button
      type="button"
      onClick={() => onSelect(department)}
      className={`min-h-24 w-full rounded-xl border p-4 text-left transition sm:min-h-28 ${
        selected
          ? 'border-blue-700 bg-blue-700 text-white'
          : 'border-slate-200 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50'
      }`}
    >
      <p className="text-xs uppercase tracking-wide opacity-80">Department</p>
      <h3 className="mt-1 break-words text-sm font-semibold sm:text-base">{department}</h3>
    </button>
  )
}

export default DepartmentCard
