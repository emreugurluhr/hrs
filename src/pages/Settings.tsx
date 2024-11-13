import React from 'react';
import { NavLink, Routes, Route } from 'react-router-dom';
import Positions from './settings/Positions';

const Settings = () => {
  const tabs = [
    { path: '', text: 'Genel Ayarlar' },
    { path: 'positions', text: 'Pozisyonlar' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Ayarlar</h1>
      
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.path === ''}
              className={({ isActive }) =>
                `py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`
              }
            >
              {tab.text}
            </NavLink>
          ))}
        </nav>
      </div>

      <Routes>
        <Route path="/" element={<GeneralSettings />} />
        <Route path="/positions" element={<Positions />} />
      </Routes>
    </div>
  );
};

const GeneralSettings = () => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <p className="text-gray-600">Sistem ayarları burada görüntülenecek</p>
  </div>
);

export default Settings;