import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UserPlus, FileText, Settings } from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { icon: LayoutDashboard, text: 'Dashboard', path: '/' },
    { icon: UserPlus, text: 'İşe Alım', path: '/recruitment' },
    { icon: FileText, text: 'Özlük', path: '/personnel' },
    { icon: Settings, text: 'Ayarlar', path: '/settings' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 px-3 py-4 flex flex-col">
      <div className="mb-8 px-4">
        <h1 className="text-xl font-bold text-gray-800">HR Management</h1>
      </div>
      <nav className="flex-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-gray-700 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'hover:bg-gray-100'
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            <span className="font-medium">{item.text}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default Sidebar;