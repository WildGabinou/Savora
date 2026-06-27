import { NavLink } from 'react-router-dom'
import { BookOpen, Calendar, ShoppingCart, PlusCircle } from 'lucide-react'

const nav = [
  { to: '/catalogue', icon: BookOpen, label: 'Catalogue' },
  { to: '/planifier', icon: Calendar, label: 'Planifier' },
  { to: '/courses', icon: ShoppingCart, label: 'Courses' },
  { to: '/ajouter', icon: PlusCircle, label: 'Ajouter' },
]

// Le logo est une image 3-en-1 : on affiche uniquement le logo du milieu (S avec toque)
const LogoIcon = ({ size = 48 }) => (
  <div
    style={{
      width: size,
      height: size,
      backgroundImage: 'url(/logo.png)',
      backgroundSize: '300% auto',
      backgroundPosition: '50% 45%',
      backgroundRepeat: 'no-repeat',
      borderRadius: 8,
      flexShrink: 0,
    }}
  />
)

export default function Layout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-stone-100 shrink-0">
        <div className="flex items-center gap-3 px-5 py-5 border-b border-stone-100">
          <LogoIcon size={52} />
          <div>
            <p className="font-extrabold text-stone-900 text-2xl leading-tight tracking-tight">Savora</p>
            <p className="text-xs text-stone-400">Recettes & Planning</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-orange-50 text-orange-500'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Mascotte en bas de la sidebar */}
        <div className="px-3 pb-4">
          <div
            style={{
              width: '100%',
              height: 160,
              backgroundImage: 'url(/mascotte.png)',
              backgroundSize: '55% auto',
              backgroundPosition: '10% 15%',
              backgroundRepeat: 'no-repeat',
            }}
          />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {children}
      </main>

      {/* Bottom nav mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-100 flex z-50">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                isActive ? 'text-orange-500' : 'text-stone-400'
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
