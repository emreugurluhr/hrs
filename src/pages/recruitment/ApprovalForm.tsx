import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { db } from '../../lib/db';
import { showSuccess, showError } from '../../lib/toast';
import type { Candidate, Position, Interview, Reference } from '../../lib/db';

interface CandidateWithDetails extends Candidate {
  position?: Position;
  interview?: Interview;
  references?: Reference[];
}

const ApprovalForm: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateWithDetails | null>(null);
  const [showResults, setShowResults] = useState(false);

  const searchCandidates = async () => {
    if (!searchTerm.trim()) {
      setShowResults(false);
      return;
    }

    try {
      const searchTermLower = searchTerm.toLowerCase();
      const results = await db.candidates
        .filter(candidate => {
          const fullNameMatch = candidate.fullName.toLowerCase().includes(searchTermLower);
          const emailMatch = candidate.email.toLowerCase().includes(searchTermLower);
          return fullNameMatch || emailMatch;
        })
        .toArray();

      setCandidates(results);
      setShowResults(true);
    } catch (error) {
      console.error('Error searching candidates:', error);
      showError('Aday araması sırasında bir hata oluştu');
    }
  };

  const loadCandidateDetails = async (candidate: Candidate) => {
    try {
      const position = candidate.positionId 
        ? await db.positions.get(candidate.positionId) 
        : undefined;

      const interview = await db.interviews
        .where('candidateId')
        .equals(candidate.id!)
        .first();

      const references = await db.references
        .where('candidateId')
        .equals(candidate.id!)
        .toArray();

      setSelectedCandidate({
        ...candidate,
        position,
        interview,
        references,
      });
    } catch (error) {
      console.error('Error loading candidate details:', error);
      showError('Aday detayları yüklenirken bir hata oluştu');
    }
  };

  useEffect(() => {
    if (searchTerm.trim()) {
      const delayDebounce = setTimeout(() => {
        searchCandidates();
      }, 300);

      return () => clearTimeout(delayDebounce);
    } else {
      setShowResults(false);
    }
  }, [searchTerm]);

  const handleCandidateSelect = (candidate: Candidate) => {
    loadCandidateDetails(candidate);
    setShowResults(false);
    setSearchTerm('');
  };

  return (
    <div className="space-y-6">
      {/* Candidate Search Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Aday Bilgileri</h2>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Aday Ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <Search 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" 
            size={20}
          />
        </div>

        {showResults && (
          <div className="mt-2 bg-white border border-gray-200 rounded-md shadow-sm max-h-60 overflow-y-auto">
            {candidates.length > 0 ? (
              candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  onClick={() => handleCandidateSelect(candidate)}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                >
                  <div className="font-medium text-gray-900">{candidate.fullName}</div>
                  <div className="text-sm text-gray-500">{candidate.email}</div>
                  <div className="text-sm text-gray-500">
                    {candidate.collarType === 'blue' ? 'Mavi Yaka' : 'Beyaz Yaka'}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 text-gray-500 text-center">Aday bulunamadı</div>
            )}
          </div>
        )}

        {selectedCandidate && (
          <div className="mt-6 space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Temel Bilgiler</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ad Soyad</label>
                  <div className="mt-1 text-gray-900">{selectedCandidate.fullName}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">E-posta</label>
                  <div className="mt-1 text-gray-900">{selectedCandidate.email}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pozisyon Türü</label>
                  <div className="mt-1">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      selectedCandidate.collarType === 'blue' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {selectedCandidate.collarType === 'blue' ? 'Mavi Yaka' : 'Beyaz Yaka'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pozisyon</label>
                  <div className="mt-1 text-gray-900">
                    {selectedCandidate.position?.name || '-'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tecrübe</label>
                  <div className="mt-1 text-gray-900">{selectedCandidate.experience} Yıl</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Görüşme Durumu</label>
                  <div className="mt-1">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      selectedCandidate.result === 'Olumlu'
                        ? 'bg-green-100 text-green-800'
                        : selectedCandidate.result === 'Olumsuz'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedCandidate.result || 'Beklemede'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interview Information */}
            {selectedCandidate.interview && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Görüşme Bilgileri</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Eğitim</label>
                    <div className="mt-1 text-gray-900">{selectedCandidate.interview.education}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Teklif Edilen Ücret</label>
                    <div className="mt-1 text-gray-900">{selectedCandidate.interview.offeredSalary}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Başvuru Kaynağı</label>
                    <div className="mt-1 text-gray-900">{selectedCandidate.interview.applicationSource}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Reference Information */}
            {selectedCandidate.references && selectedCandidate.references.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Referans Bilgileri</h3>
                {selectedCandidate.references.map((reference, index) => (
                  <div key={reference.id} className="mb-4 last:mb-0">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Referans Veren</label>
                        <div className="mt-1 text-gray-900">{reference.referrerName}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Şirket</label>
                        <div className="mt-1 text-gray-900">{reference.referrerCurrentCompany}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Referans Sonucu</label>
                        <div className="mt-1 text-gray-900">{reference.referenceResult}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovalForm;