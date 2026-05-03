import { useMemo } from 'react'

function AdminCategoriesPage({ books, searchTerm }) {
  const categories = useMemo(() => {
    const map = new Map()
    books.forEach((b) => {
      const key = b.category || 'Uncategorized'
      const prev = map.get(key) || { name: key, titles: 0, copies: 0 }
      map.set(key, {
        name: key,
        titles: prev.titles + 1,
        copies: prev.copies + (b.total || b.available || 0),
      })
    })
    const q = searchTerm.trim().toLowerCase()
    return Array.from(map.values()).filter((c) => !q || c.name.toLowerCase().includes(q))
  }, [books, searchTerm])

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Categories</h2>
        <p className="text-sm text-slate-500">Category-wise catalog breakdown</p>
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Titles</th>
                <th className="px-4 py-3 font-semibold">Copies</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.name} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-900">{c.name}</td>
                  <td className="px-4 py-3">{c.titles}</td>
                  <td className="px-4 py-3">{c.copies}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  )
}

export default AdminCategoriesPage
