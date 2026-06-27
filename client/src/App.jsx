import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Layout from './components/Layout'
import Catalog from './pages/Catalog'
import RecipeDetail from './pages/RecipeDetail'
import Planner from './pages/Planner'
import ShoppingList from './pages/ShoppingList'
import AddRecipe from './pages/AddRecipe'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/catalogue" replace />} />
            <Route path="/catalogue" element={<Catalog />} />
            <Route path="/catalogue/:id" element={<RecipeDetail />} />
            <Route path="/planifier" element={<Planner />} />
            <Route path="/courses" element={<ShoppingList />} />
            <Route path="/ajouter" element={<AddRecipe />} />
            <Route path="/modifier/:id" element={<AddRecipe />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  )
}
