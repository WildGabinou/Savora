import { useState } from 'react'
import { X, Search, Users } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function RecipePickerModal({ dayKey, moment, onClose }) {
  const { recipes, setMeal } = useApp()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [servings, setServings] = useState(4)

  const filtered = recipes.filter(r =>
    r.name.toLowerCase().includes(query.toLowerCase()) ||
    r.category.toLowerCase().includes(query.toLowerCase())
  )

  function handleSelect(recipe) {
    setSelected(recipe)
    setServings(recipe.servings)
  }

  function handleConfirm() {
    if (!selected) return
    setMeal(dayKey, moment, { recipeId: selected.id, servings })
    onClose()
  }

  const momentLabel = moment === 'midi' ? 'Déjeuner' : 'Dîner'

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white w-full md:max-w-2xl md:rounded-2xl rounded-t-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <div>
            <h2 className="font-semibold text-stone-900">Choisir une recette</h2>
            <p className="text-sm text-stone-500">{momentLabel}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-stone-100">
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-stone-100">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Rechercher une recette..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="input pl-9"
              autoFocus
            />
          </div>
        </div>

        {/* Recipe list */}
        <div className="overflow-y-auto flex-1 p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filtered.map(recipe => (
            <button
              key={recipe.id}
              onClick={() => handleSelect(recipe)}
              className={`p-3 rounded-xl border text-left transition-all ${
                selected?.id === recipe.id
                  ? 'border-orange-400 bg-orange-50'
                  : 'border-stone-100 bg-white hover:border-stone-300'
              }`}
            >
              <div className="text-2xl mb-1">{recipe.emoji || '🍽️'}</div>
              <div className="text-xs font-medium text-stone-800 leading-snug line-clamp-2">{recipe.name}</div>
              <div className="text-xs text-stone-400 mt-1">{recipe.category}</div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center text-stone-400 py-8 text-sm">Aucune recette trouvée</div>
          )}
        </div>

        {/* Footer with servings */}
        {selected && (
          <div className="border-t border-stone-100 p-5 flex items-center gap-4">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-2xl">{selected.emoji}</span>
              <span className="text-sm font-medium text-stone-800 truncate">{selected.name}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Users size={16} className="text-stone-400" />
              <button
                onClick={() => setServings(Math.max(1, servings - 1))}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 font-bold text-sm flex items-center justify-center"
              >−</button>
              <span className="w-6 text-center font-semibold text-sm">{servings}</span>
              <button
                onClick={() => setServings(servings + 1)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 font-bold text-sm flex items-center justify-center"
              >+</button>
            </div>
            <button onClick={handleConfirm} className="btn-primary text-sm">
              Ajouter
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
