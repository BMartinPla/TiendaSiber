import React, { useState, useEffect, useRef } from 'react'
import { ChevronDown, X } from 'lucide-react'

export default function CategorySelect({ value, onChange, categories }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedName, setSelectedName] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    const cat = categories.find((c) => String(c.id) === String(value))
    setSelectedName(cat ? cat.name : '')
  }, [value, categories])

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filtered = categories.filter((c) => {
    if (!c.active) return false
    const q = query.trim().toLowerCase()
    return !q || c.name.toLowerCase().includes(q)
  })

  function handleSelect(cat) {
    setSelectedName(cat.name)
    setQuery('')
    onChange(String(cat.id))
    setOpen(false)
  }

  function handleClear() {
    setSelectedName('')
    setQuery('')
    onChange('')
  }

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        <input
          placeholder="Buscar o escribir categoría..."
          value={open ? query : selectedName}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => { setOpen(true); setQuery('') }}
          className="w-full px-4 py-2.5 pr-9 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
        {selectedName ? (
          <button type="button" onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-4 h-4" />
          </button>
        ) : (
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        )}
      </div>
      {open && (
        <div className="absolute z-10 top-full mt-1 left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-48 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500">Sin resultados</div>
          ) : (
            filtered.map((c) => (
              <button key={c.id} type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(c)}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${String(c.id) === String(value) ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-200'}`}>
                {c.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
