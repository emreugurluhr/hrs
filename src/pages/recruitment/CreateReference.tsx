import React, { useState, useEffect } from 'react';
import { Search, Calendar } from 'lucide-react';
import { db } from '../../lib/db';
import { showSuccess, showError } from '../../lib/toast';
import type { Candidate, Reference } from '../../lib/db';

const CreateReference: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [existingReference, setExistingReference] = useState<Reference | null>(null);
  const [formData, setFormData] = useState<Partial<Reference>>({
    referrerName: '',
    referrerCurrentCompany: '',
    workedTogether: '',
    yearsWorkedTogether: '',
    candidatePosition: '',
    reasonForLeaving: '',
    referrerPosition: '',
    referenceResult: '',
    referenceDate: new Date().toISOString().split('T')[0],
    referenceNotes: '',
  });

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

  const loadExistingReference = async (candidateId: number) => {
    try {
      const reference = await db.references
        .where('candidateId')
        .equals(candidateId)
        .first();
      
      if (reference) {
        setExistingReference(reference);
        setFormData({
          referrerName: reference.referrerName,
          referrerCurrentCompany: reference.referrerCurrentCompany,
          workedTogether: reference.workedTogether,
          yearsWorkedTogether: reference.yearsWorkedTogether,
          candidatePosition: reference.candidatePosition,
          reasonForLeaving: reference.reasonForLeaving,
          referrerPosition: reference.referrerPosition,
          referenceResult: reference.referenceResult,
          referenceDate: new Date(reference.referenceDate).toISOString().split('T')[0],
          referenceNotes: reference.referenceNotes,
        });
      } else {
        setExistingReference(null);
        setFormData({
          referrerName: '',
          referrerCurrentCompany: '',
          workedTogether: '',
          yearsWorkedTogether: '',
          candidatePosition: '',
          reasonForLeaving: '',
          referrerPosition: '',
          referenceResult: '',
          referenceDate: new Date().toISOString().split('T')[0],
          referenceNotes: '',
        });
      }
    } catch (error) {
      console.error('Error loading reference:', error);
      showError('Referans bilgileri yüklenirken bir hata oluştu');
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
    setSelectedCandidate(candidate);
    setShowResults(false);
    setSearchTerm('');
    if (candidate.id) {
      loadExistingReference(candidate.id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate?.id) {
      showError('Lütfen önce bir aday seçin');
      return;
    }

    try {
      if (existingReference?.id) {
        // Update existing reference
        await db.references.update(existingReference.id, {
          ...formData,
          updatedAt: new Date(),
        });
        showSuccess('Referans bilgileri başarıyla güncellendi');
      } else {
        // Create new reference
        await db.references.add({
          ...formData,
          candidateId: selectedCandidate.id,
          createdAt: new Date(),
        } as Reference);
        showSuccess('Referans bilgileri başarıyla kaydedildi');
      }

      // Reset form and selections
      setFormData({
        referrerName: '',
        referrerCurrentCompany: '',
        workedTogether: '',
        yearsWorkedTogether: '',
        candidatePosition: '',
        reasonForLeaving: '',
        referrerPosition: '',
        referenceResult: '',
        referenceDate: new Date().toISOString().split('T')[0],
        referenceNotes: '',
      });
      setSelectedCandidate(null);
      setExistingReference(null);
    } catch (error) {
      console.error('Error saving reference:', error);
      showError('Referans kaydedilirken bir hata oluştu');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
                </div>
              ))
            ) : (
              <div className="p-3 text-gray-500 text-center">Aday bulunamadı</div>
            )}
          </div>
        )}

        {selectedCandidate && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Ad Soyad</label>
                <div className="mt-1 text-gray-900">{selectedCandidate.fullName}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">E-posta</label>
                <div className="mt-1 text-gray-900">{selectedCandidate.email}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reference Form */}
      {selectedCandidate && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {existingReference ? 'Referans Bilgilerini Güncelle' : 'Yeni Referans Bilgileri'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referans Ad Soyad
              </label>
              <input
                type="text"
                name="referrerName"
                value={formData.referrerName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referansın Şuanki Firması
              </label>
              <input
                type="text"
                name="referrerCurrentCompany"
                value={formData.referrerCurrentCompany}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Birlikte Çalışılan Firma
              </label>
              <input
                type="text"
                name="workedTogether"
                value={formData.workedTogether}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Birlikte Çalışılan Yıllar
              </label>
              <input
                type="text"
                name="yearsWorkedTogether"
                value={formData.yearsWorkedTogether}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adayın Pozisyonu
              </label>
              <input
                type="text"
                name="candidatePosition"
                value={formData.candidatePosition}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aday Ayrılma Sebebi
              </label>
              <input
                type="text"
                name="reasonForLeaving"
                value={formData.reasonForLeaving}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referansın Pozisyonu
              </label>
              <input
                type="text"
                name="referrerPosition"
                value={formData.referrerPosition}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referans Sonucu
              </label>
              <input
                type="text"
                name="referenceResult"
                value={formData.referenceResult}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referans Araştırma Tarihi
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="referenceDate"
                  value={formData.referenceDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referans Yorumu
              </label>
              <textarea
                name="referenceNotes"
                value={formData.referenceNotes}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {existingReference ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreateReference;