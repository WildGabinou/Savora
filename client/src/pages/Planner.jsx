import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, X, Users } from 'lucide-react'
import { useApp, addWeeks, DAYS } from '../context/AppContext'
import RecipePickerModal from '../components/RecipePickerModal'

const DAY_LABELS = {
  lundi: 'Lun',
  mardi: 'Mar',
  mercredi: 'Mer',
  jeudi: 'Jeu',
  vendredi: 'Ven',
  samedi: 'Sam',
  dimanche: 'Dim',
}

const DAY_LABELS_FULL = {
  lundi: 'Lundi',
  mardi: 'Mardi',
  mercredi: 'Mercredi',
  jeudi: 'Jeudi',
  vendredi: 'Vendredi',
  samedi: 'Samedi',
  dimanche: 'Dimanche',
}

function formatWeekRange(key) {
  const monday = new Date(key)
  const sunday = new Date(key)
  sunday.setDate(sunday.getDate() + 6)
  const fmt = (d) => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  return `${fmt(monday)} — ${fmt(sunday)}`
}

function getDayDate(weekKey, dayIndex) {
  const d = new Date(weekKey)
  d.setDate(d.getDate() + dayIndex)
  return d.getDate()
}

export default function Planner() {
  const { currentWeekKey, currentWeekPlan, setCurrentWeek, getRecipeById, removeMeal } = useApp()
  const [modal, setModal] = useState(null) // { dayKey, moment }

  const isCurrentWeek = currentWeekKey === (() => {
    const d = new Date()
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    d.setDate(diff)
    d.setHours(0, 0, 0, 0)
    return d.toISOString().split('T')[0]
  })()

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Week nav */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Planning</h1>
          <p className="text-sm text-stone-500 mt-0.5">{formatWeekRange(currentWeekKey)}</p>
        </div>
        <div className="flex items-center gap-2">
          {!isCurrentWeek && (
            <button
              onClick={() => {
                const d = new Date()
                const day = d.getDay()
                const diff = d.getDate() - day + (day === 0 ? -6 : 1)
                d.setDate(diff)
                d.setHours(0, 0, 0, 0)
                setCurrentWeek(d.toISOString().split('T')[0])
              }}
              className="text-xs text-orange-500 font-medium px-3 py-1.5 rounded-full border border-orange-200 hover:bg-orange-50"
            >
              Aujourd'hui
            </button>
          )}
          <button onClick={() => setCurrentWeek(addWeeks(currentWeekKey, -1))} className="p-2 rounded-xl hover:bg-stone-100">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => setCurrentWeek(addWeeks(currentWeekKey, 1))} className="p-2 rounded-xl hover:bg-stone-100">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Desktop: 7-column grid */}
      <div className="hidden md:grid grid-cols-7 gap-3">
        {DAYS.map((day, i) => {
          const midi = currentWeekPlan[day]?.midi
          const soir = currentWeekPlan[day]?.soir
          const dayNum = getDayDate(currentWeekKey, i)

          return (
            <div key={day} className="flex flex-col gap-2">
              <div className="text-center">
                <p className="text-xs font-semibold text-stone-400">{DAY_LABELS[day]}</p>
                <p className="text-sm font-bold text-stone-700">{dayNum}</p>
              </div>
              <MealSlot meal={midi} label="Midi" dayKey={day} moment="midi"
                onAdd={() => setModal({ dayKey: day, moment: 'midi' })}
                onRemove={() => removeMeal(day, 'midi')}
                getRecipeById={getRecipeById}
              />
              <MealSlot meal={soir} label="Soir" dayKey={day} moment="soir"
                onAdd={() => setModal({ dayKey: day, moment: 'soir' })}
                onRemove={() => removeMeal(day, 'soir')}
                getRecipeById={getRecipeById}
              />
            </div>
          )
        })}
      </div>

      {/* Mobile: list */}
      <div className="md:hidden flex flex-col gap-4">
        {DAYS.map((day, i) => {
          const midi = currentWeekPlan[day]?.midi
          const soir = currentWeekPlan[day]?.soir
          const dayNum = getDayDate(currentWeekKey, i)

          return (
            <div key={day} className="card p-4">
              <p className="font-semibold text-stone-700 mb-3">
                {DAY_LABELS_FULL[day]} <span className="text-stone-400 font-normal">{dayNum}</span>
              </p>
              <div className="flex flex-col gap-2">
                <MealSlot meal={midi} label="Midi" dayKey={day} moment="midi"
                  onAdd={() => setModal({ dayKey: day, moment: 'midi' })}
                  onRemove={() => removeMeal(day, 'midi')}
                  getRecipeById={getRecipeById}
                  horizontal
                />
                <MealSlot meal={soir} label="Soir" dayKey={day} moment="soir"
                  onAdd={() => setModal({ dayKey: day, moment: 'soir' })}
                  onRemove={() => removeMeal(day, 'soir')}
                  getRecipeById={getRecipeById}
                  horizontal
                />
              </div>
            </div>
          )
        })}
      </div>

      {modal && (
        <RecipePickerModal
          dayKey={modal.dayKey}
          moment={modal.moment}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}

function MealSlot({ meal, label, onAdd, onRemove, getRecipeById, horizontal }) {
  const recipe = meal ? getRecipeById(meal.recipeId) : null

  if (horizontal) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-xs text-stone-400 w-8 shrink-0">{label}</span>
        {recipe ? (
          <div className="flex items-center gap-2 flex-1 bg-orange-50 rounded-xl px-3 py-2">
            <span className="text-lg">{recipe.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-stone-800 truncate">{recipe.name}</p>
              <p className="text-xs text-stone-400 flex items-center gap-1"><Users size={10} />{meal.servings}</p>
            </div>
            <button onClick={onRemove} className="text-stone-300 hover:text-stone-500 p-1">
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={onAdd}
            className="flex-1 border border-dashed border-stone-200 rounded-xl py-2 text-xs text-stone-400 hover:border-orange-300 hover:text-orange-400 transition-colors flex items-center justify-center gap-1"
          >
            <Plus size={12} /> Ajouter
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-stone-400 text-center">{label}</span>
      {recipe ? (
        <div className="relative bg-orange-50 rounded-xl p-2 border border-orange-100">
          <button onClick={onRemove} className="absolute top-1 right-1 text-stone-300 hover:text-stone-500 p-0.5">
            <X size={12} />
          </button>
          <div className="text-xl mb-1">{recipe.emoji}</div>
          <p className="text-xs font-medium text-stone-800 leading-tight line-clamp-2">{recipe.name}</p>
          <p className="text-xs text-stone-400 mt-1 flex items-center gap-1"><Users size={10} />{meal.servings}</p>
        </div>
      ) : (
        <button
          onClick={onAdd}
          className="border border-dashed border-stone-200 rounded-xl p-3 flex flex-col items-center gap-1 text-stone-300 hover:border-orange-300 hover:text-orange-400 transition-colors min-h-[80px] justify-center"
        >
          <Plus size={16} />
          <span className="text-xs">Ajouter</span>
        </button>
      )}
    </div>
  )
}
