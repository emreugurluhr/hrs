import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Recruitment from '../pages/Recruitment';
import Personnel from '../pages/Personnel';
import Settings from '../pages/Settings';

const MainContent = () => {
  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/recruitment/*" element={<Recruitment />} />
          <Route path="/personnel" element={<Personnel />} />
          <Route path="/settings/*" element={<Settings />} />
        </Routes>
      </div>
    </div>
  );
}

export default MainContent;