import { useNavigate } from 'react-router-dom'
import { Clock, Users } from 'lucide-react'

export default function RecipeCard({ recipe, onClick }) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (onClick) onClick(recipe)
    else navigate(`/catalogue/${recipe.id}`)
  }

  return (
    <button
      onClick={handleClick}
      className="card p-4 text-left hover:shadow-md transition-shadow w-full flex flex-col gap-3 hover:border-orange-200"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-4xl">{recipe.emoji || '🍽️'}</span>
        <span className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-full font-medium shrink-0">
          {recipe.category}
        </span>
      </div>
      <div>
        <h3 className="font-semibold text-stone-900 text-sm leading-snug">{recipe.name}</h3>
        {recipe.description && (
          <p className="text-xs text-stone-500 mt-1 line-clamp-2">{recipe.description}</p>
        )}
      </div>
      <div className="flex items-center gap-3 text-xs text-stone-400 mt-auto">
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {(recipe.prepTime || 0) + (recipe.cookTime || 0)} min
        </span>
        <span className="flex items-center gap-1">
          <Users size={12} />
          {recipe.servings} pers.
        </span>
        {recipe.isCustom && (
          <span className="ml-auto text-xs text-violet-500 font-medium">Perso</span>
        )}
      </div>
    </button>
  )
}
