import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { defaultRecipes } from '../data/recipes'

const AppContext = createContext(null)

const DAYS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']

function getMonday(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function weekKey(date) {
  return getMonday(date).toISOString().split('T')[0]
}

export function addWeeks(key, n) {
  const d = new Date(key)
  d.setDate(d.getDate() + n * 7)
  return weekKey(d)
}

export function emptyWeek() {
  return DAYS.reduce((acc, d) => {
    acc[d] = { midi: null, soir: null }
    return acc
  }, { shoppingChecked: {} })
}

function loadState() {
  try {
    const raw = localStorage.getItem('cuisine-app')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function buildInitialState() {
  const saved = loadState()
  return {
    customRecipes: saved?.customRecipes || [],
    weeklyPlans: saved?.weeklyPlans || {},
    currentWeekKey: weekKey(new Date()),
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_RECIPE':
      return { ...state, customRecipes: [...state.customRecipes, action.recipe] }
    case 'UPDATE_RECIPE':
      return {
        ...state,
        customRecipes: state.customRecipes.map(r => r.id === action.recipe.id ? action.recipe : r),
      }
    case 'DELETE_RECIPE':
      return { ...state, customRecipes: state.customRecipes.filter(r => r.id !== action.id) }
    case 'SET_MEAL': {
      const { dayKey, moment, entry } = action
      const week = state.weeklyPlans[state.currentWeekKey] || emptyWeek()
      return {
        ...state,
        weeklyPlans: {
          ...state.weeklyPlans,
          [state.currentWeekKey]: {
            ...week,
            [dayKey]: { ...week[dayKey], [moment]: entry },
          },
        },
      }
    }
    case 'REMOVE_MEAL': {
      const { dayKey, moment } = action
      const week = state.weeklyPlans[state.currentWeekKey] || emptyWeek()
      return {
        ...state,
        weeklyPlans: {
          ...state.weeklyPlans,
          [state.currentWeekKey]: {
            ...week,
            [dayKey]: { ...week[dayKey], [moment]: null },
          },
        },
      }
    }
    case 'SET_WEEK':
      return { ...state, currentWeekKey: action.key }
    case 'TOGGLE_SHOPPING_ITEM': {
      const week = state.weeklyPlans[state.currentWeekKey] || emptyWeek()
      const checked = week.shoppingChecked || {}
      return {
        ...state,
        weeklyPlans: {
          ...state.weeklyPlans,
          [state.currentWeekKey]: {
            ...week,
            shoppingChecked: { ...checked, [action.key]: !checked[action.key] },
          },
        },
      }
    }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, buildInitialState)

  useEffect(() => {
    localStorage.setItem('cuisine-app', JSON.stringify({
      customRecipes: state.customRecipes,
      weeklyPlans: state.weeklyPlans,
    }))
  }, [state.customRecipes, state.weeklyPlans])

  const allRecipes = [...defaultRecipes, ...state.customRecipes]

  const currentWeekPlan = state.weeklyPlans[state.currentWeekKey] || emptyWeek()

  const getRecipeById = useCallback((id) => allRecipes.find(r => r.id === id), [allRecipes])

  function computeShoppingList() {
    const items = {}
    for (const day of DAYS) {
      for (const moment of ['midi', 'soir']) {
        const meal = currentWeekPlan[day]?.[moment]
        if (!meal) continue
        const recipe = getRecipeById(meal.recipeId)
        if (!recipe) continue
        const ratio = meal.servings / recipe.servings
        for (const ing of recipe.ingredients) {
          if (typeof ing === 'string') {
            const k = ing.toLowerCase().trim()
            if (!items[k]) items[k] = { name: ing, quantity: null, unit: '', category: 'Autre', isRaw: true, key: k }
          } else {
            const k = `${ing.name.toLowerCase()}_${ing.unit}`
            if (items[k]) {
              items[k].quantity += ing.quantity * ratio
            } else {
              items[k] = { name: ing.name, quantity: ing.quantity * ratio, unit: ing.unit, category: ing.category || 'Autre', isRaw: false, key: k }
            }
          }
        }
      }
    }
    return Object.values(items)
  }

  const value = {
    recipes: allRecipes,
    customRecipes: state.customRecipes,
    currentWeekKey: state.currentWeekKey,
    currentWeekPlan,
    days: DAYS,
    getRecipeById,
    shoppingList: computeShoppingList(),
    shoppingChecked: currentWeekPlan.shoppingChecked || {},
    addRecipe: (recipe) => dispatch({ type: 'ADD_RECIPE', recipe }),
    updateRecipe: (recipe) => dispatch({ type: 'UPDATE_RECIPE', recipe }),
    deleteRecipe: (id) => dispatch({ type: 'DELETE_RECIPE', id }),
    setMeal: (dayKey, moment, entry) => dispatch({ type: 'SET_MEAL', dayKey, moment, entry }),
    removeMeal: (dayKey, moment) => dispatch({ type: 'REMOVE_MEAL', dayKey, moment }),
    setCurrentWeek: (key) => dispatch({ type: 'SET_WEEK', key }),
    toggleShoppingItem: (key) => dispatch({ type: 'TOGGLE_SHOPPING_ITEM', key }),
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export { DAYS }
