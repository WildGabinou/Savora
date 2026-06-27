import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, Users, ChefHat, Trash2, Pencil } from 'lucide-react'
import { useApp } from '../context/AppContext'

function formatQty(qty, unit) {
  if (qty === null || qty === undefined) return ''
  const rounded = Math.round(qty * 100) / 100
  if (unit === 'g' && rounded >= 1000) return `${Math.round(rounded / 100) / 10} kg`
  if (unit === 'cl' && rounded >= 100) return `${Math.round(rounded / 10) / 10} L`
  if (unit === 'ml' && rounded >= 1000) return `${Math.round(rounded / 100) / 10} L`
  return `${rounded}`
}

export default function RecipeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getRecipeById, deleteRecipe } = useApp()
  const recipe = getRecipeById(id)

  const [servings, setServings] = useState(recipe?.servings || 4)

  if (!recipe) {
    return (
      <div className="p-5 text-center py-20 text-stone-400">
        <p className="text-4xl mb-3">😕</p>
        <p>Recette introuvable</p>
        <button onClick={() => navigate('/catalogue')} className="btn-primary mt-4">Retour au catalogue</button>
      </div>
    )
  }

  const ratio = servings / recipe.servings

  function handleDelete() {
    if (confirm(`Supprimer "${recipe.name}" ?`)) {
      deleteRecipe(recipe.id)
      navigate('/catalogue')
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-5">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-stone-500 hover:text-stone-900 mb-5 text-sm"
      >
        <ArrowLeft size={16} />
        Retour
      </button>

      {/* Header */}
      <div className="card p-6 mb-5">
        <div className="flex items-start gap-4">
          <span className="text-5xl">{recipe.emoji || '🍽️'}</span>
          <div className="flex-1">
            <span className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-full font-medium">
              {recipe.category}
            </span>
            <h1 className="text-2xl font-bold text-stone-900 mt-2">{recipe.name}</h1>
            {recipe.description && (
              <p className="text-stone-500 text-sm mt-1">{recipe.description}</p>
            )}
            {recipe.source && (
              <a href={recipe.source} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline mt-1 block">
                Source
              </a>
            )}
          </div>
        </div>

        <div className="flex items-center gap-5 mt-5 pt-5 border-t border-stone-100 text-sm text-stone-500">
          {recipe.prepTime > 0 && (
            <div className="flex items-center gap-1.5">
              <Clock size={15} />
              <span>Prép. {recipe.prepTime} min</span>
            </div>
          )}
          {recipe.cookTime > 0 && (
            <div className="flex items-center gap-1.5">
              <ChefHat size={15} />
              <span>Cuisson {recipe.cookTime} min</span>
            </div>
          )}
        </div>

        {/* Servings adjuster */}
        <div className="flex items-center gap-3 mt-5 pt-5 border-t border-stone-100">
          <Users size={16} className="text-stone-400" />
          <span className="text-sm text-stone-600">Personnes :</span>
          <button
            onClick={() => setServings(Math.max(1, servings - 1))}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 font-bold flex items-center justify-center"
          >−</button>
          <span className="w-8 text-center font-bold text-lg">{servings}</span>
          <button
            onClick={() => setServings(servings + 1)}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 font-bold flex items-center justify-center"
          >+</button>
        </div>
      </div>

      {/* Ingredients */}
      <div className="card p-5 mb-5">
        <h2 className="font-semibold text-stone-900 mb-4">Ingrédients</h2>
        <ul className="space-y-2">
          {recipe.ingredients.map((ing, i) => {
            if (typeof ing === 'string') {
              return (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <span className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />
                  <span className="text-stone-700">{ing}</span>
                </li>
              )
            }
            const scaledQty = ing.quantity * ratio
            return (
              <li key={i} className="flex items-center gap-3 text-sm">
                <span className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />
                <span className="font-semibold text-orange-600 w-20 shrink-0">
                  {formatQty(scaledQty, ing.unit)} {ing.unit}
                </span>
                <span className="text-stone-700">{ing.name}</span>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Instructions */}
      {recipe.instructions?.length > 0 && (
        <div className="card p-5 mb-5">
          <h2 className="font-semibold text-stone-900 mb-4">Préparation</h2>
          <ol className="space-y-4">
            {recipe.instructions.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-stone-700 leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Tags */}
      {recipe.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {recipe.tags.map(tag => (
            <span key={tag} className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-xs">#{tag}</span>
          ))}
        </div>
      )}

      {/* Actions for custom recipes */}
      {recipe.isCustom && (
        <div className="flex gap-3">
          <button onClick={() => navigate(`/modifier/${recipe.id}`)} className="btn-secondary flex items-center gap-2 flex-1">
            <Pencil size={15} /> Modifier
          </button>
          <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-colors flex-1 justify-center">
            <Trash2 size={15} /> Supprimer
          </button>
        </div>
      )}
    </div>
  )
}
