import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Trash2, Link, ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { INGREDIENT_CATEGORIES, RECIPE_CATEGORIES, UNITS } from '../data/recipes'

const EMOJIS = ['🍗', '🥩', '🐟', '🥗', '🍝', '🍕', '🍳', '🥘', '🍜', '🍛', '🥞', '🥧', '🍵', '🧆', '🦪', '🍄', '🥙', '🍔', '🌮', '🫕', '🐟', '🍎', '🥗']

function emptyIngredient() {
  return { name: '', quantity: '', unit: 'g', category: 'Légumes' }
}

function generateId() {
  return `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export default function AddRecipe() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { addRecipe, updateRecipe, getRecipeById } = useApp()
  const isEdit = !!id

  const [tab, setTab] = useState(isEdit ? 'manual' : 'url')
  const [url, setUrl] = useState('')
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState('')

  const [form, setForm] = useState({
    name: '',
    category: 'Plat principal',
    emoji: '🍽️',
    description: '',
    prepTime: '',
    cookTime: '',
    servings: 4,
    ingredients: [emptyIngredient()],
    instructions: [''],
    tags: '',
    source: '',
  })

  useEffect(() => {
    if (isEdit) {
      const recipe = getRecipeById(id)
      if (recipe && recipe.isCustom) {
        setForm({
          name: recipe.name,
          category: recipe.category,
          emoji: recipe.emoji || '🍽️',
          description: recipe.description || '',
          prepTime: recipe.prepTime || '',
          cookTime: recipe.cookTime || '',
          servings: recipe.servings,
          ingredients: recipe.ingredients.map(ing =>
            typeof ing === 'string'
              ? { name: ing, quantity: '', unit: '', category: 'Autre' }
              : ing
          ),
          instructions: recipe.instructions || [''],
          tags: recipe.tags?.join(', ') || '',
          source: recipe.source || '',
        })
      }
    }
  }, [id])

  async function handleImport() {
    if (!url.trim()) return
    setImporting(true)
    setImportError('')
    try {
      const res = await fetch('/api/scrape-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || 'Erreur inconnue')

      const r = data.recipe
      setForm(f => ({
        ...f,
        name: r.name || '',
        description: r.description || '',
        prepTime: r.prepTime || '',
        cookTime: r.cookTime || '',
        servings: r.servings || 4,
        ingredients: r.ingredients?.length
          ? r.ingredients.map(ing => ({ name: ing.raw || ing.name || ing, quantity: '', unit: '', category: 'Autre' }))
          : [emptyIngredient()],
        instructions: r.instructions?.length ? r.instructions : [''],
        source: url.trim(),
      }))
      setTab('manual')
    } catch (err) {
      setImportError(err.message || "Impossible de récupérer la recette.")
    } finally {
      setImporting(false)
    }
  }

  function setField(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function setIngredient(i, key, val) {
    setForm(f => {
      const ings = [...f.ingredients]
      ings[i] = { ...ings[i], [key]: val }
      return { ...f, ingredients: ings }
    })
  }

  function addIngredient() {
    setForm(f => ({ ...f, ingredients: [...f.ingredients, emptyIngredient()] }))
  }

  function removeIngredient(i) {
    setForm(f => ({ ...f, ingredients: f.ingredients.filter((_, idx) => idx !== i) }))
  }

  function setInstruction(i, val) {
    setForm(f => {
      const steps = [...f.instructions]
      steps[i] = val
      return { ...f, instructions: steps }
    })
  }

  function addInstruction() {
    setForm(f => ({ ...f, instructions: [...f.instructions, ''] }))
  }

  function removeInstruction(i) {
    setForm(f => ({ ...f, instructions: f.instructions.filter((_, idx) => idx !== i) }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return

    const recipe = {
      id: isEdit ? id : generateId(),
      name: form.name.trim(),
      category: form.category,
      emoji: form.emoji,
      description: form.description.trim(),
      prepTime: Number(form.prepTime) || 0,
      cookTime: Number(form.cookTime) || 0,
      servings: Number(form.servings) || 4,
      ingredients: form.ingredients.filter(i => i.name.trim()).map(i => ({
        name: i.name.trim(),
        quantity: Number(i.quantity) || 0,
        unit: i.unit,
        category: i.category,
      })),
      instructions: form.instructions.filter(s => s.trim()),
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      isCustom: true,
      source: form.source || null,
    }

    if (isEdit) updateRecipe(recipe)
    else addRecipe(recipe)
    navigate(`/catalogue/${recipe.id}`)
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-stone-500 hover:text-stone-900 mb-5 text-sm">
        <ArrowLeft size={16} /> Retour
      </button>

      <h1 className="text-2xl font-bold text-stone-900 mb-5">
        {isEdit ? 'Modifier la recette' : 'Ajouter une recette'}
      </h1>

      {/* Tabs */}
      {!isEdit && (
        <div className="flex gap-2 mb-6 bg-stone-100 rounded-xl p-1">
          <button
            onClick={() => setTab('url')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'url' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500'
            }`}
          >
            <Link size={15} /> Depuis un lien
          </button>
          <button
            onClick={() => setTab('manual')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'manual' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500'
            }`}
          >
            <Plus size={15} /> Manuellement
          </button>
        </div>
      )}

      {/* URL import */}
      {tab === 'url' && (
        <div className="card p-5">
          <p className="text-sm text-stone-600 mb-4">
            Collez le lien d'une page web contenant une recette (Marmiton, 750g, AllRecipes…). Les informations seront extraites automatiquement.
          </p>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://www.marmiton.org/recettes/..."
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="input flex-1"
              onKeyDown={e => e.key === 'Enter' && handleImport()}
            />
            <button onClick={handleImport} disabled={importing || !url.trim()} className="btn-primary flex items-center gap-2 shrink-0">
              {importing ? <Loader2 size={15} className="animate-spin" /> : <Link size={15} />}
              {importing ? 'Import...' : 'Importer'}
            </button>
          </div>
          {importError && (
            <div className="flex items-start gap-2 mt-3 text-sm text-red-600 bg-red-50 rounded-xl p-3">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <p>{importError}</p>
            </div>
          )}
          <p className="text-xs text-stone-400 mt-3">
            Si l'import échoue, vous pouvez ajouter la recette manuellement.
          </p>
        </div>
      )}

      {/* Manual form */}
      {tab === 'manual' && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Basic info */}
          <div className="card p-5 flex flex-col gap-4">
            <h2 className="font-semibold text-stone-900">Informations générales</h2>

            {/* Emoji picker */}
            <div>
              <label className="label">Emoji</label>
              <div className="flex flex-wrap gap-2">
                {EMOJIS.map(e => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setField('emoji', e)}
                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-colors ${
                      form.emoji === e ? 'bg-orange-100 ring-2 ring-orange-400' : 'bg-stone-50 hover:bg-stone-100'
                    }`}
                  >
                    {e}
                  </button>
                ))}
                <input
                  type="text"
                  value={form.emoji}
                  onChange={e => setField('emoji', e.target.value)}
                  className="input w-16 text-center text-xl"
                  placeholder="🍽️"
                />
              </div>
            </div>

            <div>
              <label className="label">Nom de la recette *</label>
              <input type="text" required value={form.name} onChange={e => setField('name', e.target.value)} className="input" placeholder="Poulet rôti..." />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Catégorie</label>
                <select value={form.category} onChange={e => setField('category', e.target.value)} className="input">
                  {RECIPE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Personnes (base)</label>
                <input type="number" min="1" value={form.servings} onChange={e => setField('servings', e.target.value)} className="input" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Préparation (min)</label>
                <input type="number" min="0" value={form.prepTime} onChange={e => setField('prepTime', e.target.value)} className="input" placeholder="15" />
              </div>
              <div>
                <label className="label">Cuisson (min)</label>
                <input type="number" min="0" value={form.cookTime} onChange={e => setField('cookTime', e.target.value)} className="input" placeholder="30" />
              </div>
            </div>

            <div>
              <label className="label">Description courte</label>
              <textarea value={form.description} onChange={e => setField('description', e.target.value)} className="input resize-none" rows={2} placeholder="Un plat délicieux..." />
            </div>
          </div>

          {/* Ingredients */}
          <div className="card p-5 flex flex-col gap-3">
            <h2 className="font-semibold text-stone-900">Ingrédients</h2>
            {form.ingredients.map((ing, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={ing.name}
                    onChange={e => setIngredient(i, 'name', e.target.value)}
                    className="input col-span-2"
                    placeholder="Ingrédient"
                  />
                  <div className="flex gap-1">
                    <input
                      type="number"
                      value={ing.quantity}
                      onChange={e => setIngredient(i, 'quantity', e.target.value)}
                      className="input w-20"
                      placeholder="Qté"
                      step="any"
                    />
                    <select value={ing.unit} onChange={e => setIngredient(i, 'unit', e.target.value)} className="input flex-1">
                      {UNITS.map(u => <option key={u}>{u}</option>)}
                    </select>
                  </div>
                  <select value={ing.category} onChange={e => setIngredient(i, 'category', e.target.value)} className="input">
                    {INGREDIENT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <button type="button" onClick={() => removeIngredient(i)} className="p-2 text-stone-300 hover:text-red-400 mt-0.5">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            <button type="button" onClick={addIngredient} className="btn-secondary flex items-center gap-2 justify-center text-sm">
              <Plus size={15} /> Ajouter un ingrédient
            </button>
          </div>

          {/* Instructions */}
          <div className="card p-5 flex flex-col gap-3">
            <h2 className="font-semibold text-stone-900">Étapes de préparation</h2>
            {form.instructions.map((step, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 font-bold text-xs flex items-center justify-center shrink-0 mt-2">
                  {i + 1}
                </span>
                <textarea
                  value={step}
                  onChange={e => setInstruction(i, e.target.value)}
                  className="input flex-1 resize-none"
                  rows={2}
                  placeholder={`Étape ${i + 1}...`}
                />
                <button type="button" onClick={() => removeInstruction(i)} className="p-2 text-stone-300 hover:text-red-400 mt-1">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            <button type="button" onClick={addInstruction} className="btn-secondary flex items-center gap-2 justify-center text-sm">
              <Plus size={15} /> Ajouter une étape
            </button>
          </div>

          {/* Tags & source */}
          <div className="card p-5 flex flex-col gap-3">
            <div>
              <label className="label">Tags (séparés par des virgules)</label>
              <input type="text" value={form.tags} onChange={e => setField('tags', e.target.value)} className="input" placeholder="rapide, végétarien, été..." />
            </div>
            <div>
              <label className="label">Source (URL)</label>
              <input type="url" value={form.source} onChange={e => setField('source', e.target.value)} className="input" placeholder="https://..." />
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Annuler</button>
            <button type="submit" className="btn-primary flex-1">{isEdit ? 'Enregistrer' : 'Ajouter au catalogue'}</button>
          </div>
        </form>
      )}
    </div>
  )
}
