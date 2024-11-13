import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import CreateCandidate from './recruitment/CreateCandidate';
import CreateInterview from './recruitment/CreateInterview';
import CreateReference from './recruitment/CreateReference';
import ApprovalForm from './recruitment/ApprovalForm';
import AllCandidates from './recruitment/AllCandidates';

const Recruitment = () => {
  const tabs = [
    { path: '', text: 'Aday Oluştur' },
    { path: 'interview', text: 'Görüşme Oluştur' },
    { path: 'reference', text: 'Referans Oluştur' },
    { path: 'approval', text: 'Aday Onay Formu' },
    { path: 'all', text: 'Tüm Adaylar' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">İşe Alım Yönetimi</h1>
      
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
        <Route path="" element={<CreateCandidate />} />
        <Route path="interview" element={<CreateInterview />} />
        <Route path="reference" element={<CreateReference />} />
        <Route path="approval" element={<ApprovalForm />} />
        <Route path="all" element={<AllCandidates />} />
      </Routes>
    </div>
  );
}

export default Recruitment;