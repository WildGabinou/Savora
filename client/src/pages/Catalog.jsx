import { useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { useApp } from '../context/AppContext'
import RecipeCard from '../components/RecipeCard'
import { RECIPE_CATEGORIES } from '../data/recipes'

const ALL = 'Tous'

export default function Catalog() {
  const { recipes } = useApp()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState(ALL)

  const categories = [ALL, ...RECIPE_CATEGORIES]

  const filtered = recipes.filter(r => {
    const matchQuery = r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.tags?.some(t => t.toLowerCase().includes(query.toLowerCase()))
    const matchCat = category === ALL || r.category === category
    return matchQuery && matchCat
  })

  return (
    <div className="p-5 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-stone-900 mb-5">Catalogue de recettes</h1>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          placeholder="Rechercher..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="input pl-9"
        />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium shrink-0 transition-colors ${
              category === cat
                ? 'bg-orange-500 text-white'
                : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-sm text-stone-400 mb-4">{filtered.length} recette{filtered.length > 1 ? 's' : ''}</p>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map(recipe => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-stone-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-medium">Aucune recette trouvée</p>
          <p className="text-sm mt-1">Essayez d'autres mots-clés</p>
        </div>
      )}
    </div>
  )
}
