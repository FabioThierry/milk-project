import React from 'react';
import { Home, Users, ShoppingCart, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const items = [
  { to: '/', label: 'Início', icon: Home, end: true },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/vendas', label: 'Vendas', icon: ShoppingCart },
  { to: '/configuracoes', label: 'Ajustes', icon: Settings },
];

const Navbar = () => {
  return (
    <nav
      aria-label="Navegação principal"
      className="bottom-nav fixed inset-x-0 bottom-0 z-50 w-full border-t border-slate-200 bg-white shadow-[0_-8px_30px_rgba(15,23,42,0.08)]"
    >
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1 px-1 pt-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))] sm:gap-2 sm:px-2">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${
                isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex h-7 w-9 items-center justify-center rounded-lg ${
                    isActive ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/25' : ''
                  }`}
                >
                  <Icon size={21} strokeWidth={isActive ? 2.5 : 2} aria-hidden="true" />
                </span>
                <span className="truncate text-[11px] font-bold sm:text-xs">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
