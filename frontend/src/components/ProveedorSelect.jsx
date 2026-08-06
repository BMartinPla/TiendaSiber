import React, { useState, useEffect, useRef } from 'react'
import { ChevronDown, X } from 'lucide-react'

export default function ProveedorSelect({ value, onChange, proveedores, placeholder = 'Buscar o escribir proveedor...' }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value || '')
  const ref = useRef(null)

  useEffect(() => {
    setQuery(value || '')
  }, [value])

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const q = query.trim().toLowerCase()
  const filtered = (proveedores || []).filter((p) => String(p).toLowerCase().includes(q))

  function handleSelect(p) {
    setQuery(p)
    onChange(p)
    setOpen(false)
  }

  function handleClear() {
    setQuery('')
    onChange('')
  }

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        <input
          placeholder={placeholder}
          value={query}
          onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          className="w-full px-4 py-2.5 pr-9 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
        {query ? (
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
            <div className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500">Sin resultados — podés escribir uno nuevo</div>
          ) : (
            filtered.map((p) => (
              <button key={String(p)} type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(String(p))}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${String(p).toLowerCase() === q ? 'bg-accent-50 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300' : 'text-gray-700 dark:text-gray-200'}`}>
                {String(p)}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
