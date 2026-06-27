import { useState } from 'react'
import { Check, ChevronDown, ChevronRight, ShoppingCart, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'

function formatQty(qty, unit) {
  if (qty === null || qty === undefined) return ''
  const rounded = Math.round(qty * 10) / 10
  if (unit === 'g' && rounded >= 1000) return `${Math.round(rounded / 100) / 10} kg`
  if (unit === 'cl' && rounded >= 100) return `${Math.round(rounded / 10) / 10} L`
  if (unit === 'ml' && rounded >= 1000) return `${Math.round(rounded / 100) / 10} L`
  return `${rounded}`
}

const CATEGORY_EMOJIS = {
  'Viandes & Charcuterie': '🥩',
  'Poissons & Fruits de mer': '🐟',
  'Légumes': '🥦',
  'Fruits': '🍎',
  'Produits laitiers': '🥛',
  'Épicerie sèche': '🌾',
  'Aromates & Épices': '🌿',
  'Boissons': '🍷',
  'Boulangerie & Pâtisserie': '🥖',
  'Autre': '📦',
}

export default function ShoppingList() {
  const { shoppingList, shoppingChecked, toggleShoppingItem } = useApp()
  const [collapsed, setCollapsed] = useState({})

  if (shoppingList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-5 text-center">
        <div
          style={{
            width: 180,
            height: 180,
            backgroundImage: 'url(/mascotte.png)',
            backgroundSize: '55% auto',
            backgroundPosition: '10% 15%',
            backgroundRepeat: 'no-repeat',
          }}
        />
        <h2 className="text-xl font-bold text-stone-700 mt-2">Liste vide !</h2>
        <p className="text-stone-400 text-sm mt-2 max-w-xs">Planifiez des repas pour la semaine et votre liste de courses apparaîtra ici.</p>
      </div>
    )
  }

  // Group by category
  const groups = {}
  for (const item of shoppingList) {
    const cat = item.category || 'Autre'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(item)
  }

  const total = shoppingList.length
  const checked = shoppingList.filter(i => shoppingChecked[i.key]).length

  function toggleCategory(cat) {
    setCollapsed(prev => ({ ...prev, [cat]: !prev[cat] }))
  }

  return (
    <div className="p-4 md:p-6 max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Liste de courses</h1>
          <p className="text-sm text-stone-400 mt-0.5">{checked}/{total} articles cochés</p>
        </div>
        <ShoppingCart size={24} className="text-orange-400" />
      </div>

      {/* Progress */}
      <div className="h-2 bg-stone-100 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-orange-400 rounded-full transition-all"
          style={{ width: `${total > 0 ? (checked / total) * 100 : 0}%` }}
        />
      </div>

      <div className="flex flex-col gap-3">
        {Object.entries(groups).map(([cat, items]) => {
          const isCollapsed = collapsed[cat]
          const emoji = CATEGORY_EMOJIS[cat] || '📦'
          const catChecked = items.filter(i => shoppingChecked[i.key]).length

          return (
            <div key={cat} className="card overflow-hidden">
              <button
                onClick={() => toggleCategory(cat)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-stone-50 border-b border-stone-100 hover:bg-stone-100 transition-colors"
              >
                <span className="text-lg">{emoji}</span>
                <span className="font-semibold text-stone-700 flex-1 text-left text-sm">{cat}</span>
                <span className="text-xs text-stone-400">{catChecked}/{items.length}</span>
                {isCollapsed ? <ChevronRight size={16} className="text-stone-400" /> : <ChevronDown size={16} className="text-stone-400" />}
              </button>

              {!isCollapsed && (
                <ul>
                  {items.map((item, i) => {
                    const isChecked = !!shoppingChecked[item.key]
                    return (
                      <li key={item.key} className={`flex items-center gap-3 px-4 py-3 ${i < items.length - 1 ? 'border-b border-stone-50' : ''}`}>
                        <button
                          onClick={() => toggleShoppingItem(item.key)}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                            isChecked ? 'bg-orange-400 border-orange-400' : 'border-stone-300 hover:border-orange-300'
                          }`}
                        >
                          {isChecked && <Check size={11} className="text-white" strokeWidth={3} />}
                        </button>
                        <span className={`flex-1 text-sm ${isChecked ? 'line-through text-stone-300' : 'text-stone-700'}`}>
                          {item.name}
                        </span>
                        {item.quantity !== null && (
                          <span className={`text-sm font-medium shrink-0 ${isChecked ? 'text-stone-300' : 'text-orange-600'}`}>
                            {formatQty(item.quantity, item.unit)} {item.unit}
                          </span>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
