import React, { useState, useEffect } from 'react';
import { db, type Candidate, type Position, type Reference } from '../../lib/db';
import { Pencil, Trash2, Search, ChevronDown, ChevronUp } from 'lucide-react';
import EditCandidateModal from './EditCandidateModal';
import { showSuccess, showError, showConfirm } from '../../lib/toast';
import { formatDate } from '../../lib/utils';

interface CandidateWithReferences extends Candidate {
  references?: Reference[];
}

const AllCandidates: React.FC = () => {
  const [candidates, setCandidates] = useState<CandidateWithReferences[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [expandedCandidate, setExpandedCandidate] = useState<number | null>(null);

  const loadCandidates = async () => {
    try {
      const allCandidates = await db.candidates.orderBy('createdAt').reverse().toArray();
      
      const candidatesWithReferences = await Promise.all(
        allCandidates.map(async (candidate) => {
          if (candidate.id) {
            const references = await db.references
              .where('candidateId')
              .equals(candidate.id)
              .toArray();
            return { ...candidate, references };
          }
          return candidate;
        })
      );
      
      setCandidates(candidatesWithReferences);
    } catch (error) {
      console.error('Error loading candidates:', error);
      showError('Adaylar yüklenirken bir hata oluştu');
    }
  };

  const loadPositions = async () => {
    try {
      const allPositions = await db.positions.toArray();
      setPositions(allPositions);
    } catch (error) {
      console.error('Error loading positions:', error);
      showError('Pozisyonlar yüklenirken bir hata oluştu');
    }
  };

  useEffect(() => {
    loadCandidates();
    loadPositions();
  }, []);

  const handleDelete = async (id: number) => {
    const confirmed = await showConfirm(
      'Adayı Sil',
      'Bu adayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.'
    );

    if (confirmed) {
      try {
        await db.candidates.delete(id);
        showSuccess('Aday başarıyla silindi');
        loadCandidates();
      } catch (error) {
        console.error('Error deleting candidate:', error);
        showError('Aday silinirken bir hata oluştu');
      }
    }
  };

  const handleEdit = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setShowEditModal(true);
  };

  const getPositionName = (positionId: number | null | undefined) => {
    if (!positionId) return '-';
    const position = positions.find(p => p.id === positionId);
    return position?.name || '-';
  };

  const filteredCandidates = candidates.filter(candidate =>
    candidate.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpand = (candidateId: number) => {
    setExpandedCandidate(expandedCandidate === candidateId ? null : candidateId);
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <input
          type="text"
          placeholder="Aday Ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-8 px-6 py-3"></th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ad Soyad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pozisyon
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pozisyon Türü
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tecrübe
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sonuç
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCandidates.map((candidate) => (
              <React.Fragment key={candidate.id}>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <button
                      onClick={() => candidate.id && toggleExpand(candidate.id)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {expandedCandidate === candidate.id ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{candidate.fullName}</div>
                    <div className="text-sm text-gray-500">{candidate.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {getPositionName(candidate.positionId)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      candidate.collarType === 'blue' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {candidate.collarType === 'blue' ? 'Mavi Yaka' : 'Beyaz Yaka'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {candidate.experience} Yıl
                  </td>
                  <td className="px-6 py-4">
                    {candidate.result ? (
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        candidate.result === 'Olumlu'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {candidate.result}
                      </span>
                    ) : (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Beklemede
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEdit(candidate)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Düzenle"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => candidate.id && handleDelete(candidate.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Sil"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedCandidate === candidate.id && (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 bg-gray-50">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Referans Bilgileri</h3>
                        {candidate.references && candidate.references.length > 0 ? (
                          <div className="grid gap-4">
                            {candidate.references.map((reference) => (
                              <div
                                key={reference.id}
                                className="bg-white p-4 rounded-lg border border-gray-200"
                              >
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                      Referans Veren
                                    </label>
                                    <div className="mt-1 text-sm text-gray-900">
                                      {reference.referrerName}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                      Şuanki Firma
                                    </label>
                                    <div className="mt-1 text-sm text-gray-900">
                                      {reference.referrerCurrentCompany}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                      Birlikte Çalışılan Firma
                                    </label>
                                    <div className="mt-1 text-sm text-gray-900">
                                      {reference.workedTogether}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                      Çalışma Süresi
                                    </label>
                                    <div className="mt-1 text-sm text-gray-900">
                                      {reference.yearsWorkedTogether}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                      Adayın Pozisyonu
                                    </label>
                                    <div className="mt-1 text-sm text-gray-900">
                                      {reference.candidatePosition}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                      Ayrılma Sebebi
                                    </label>
                                    <div className="mt-1 text-sm text-gray-900">
                                      {reference.reasonForLeaving}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                      Referans Sonucu
                                    </label>
                                    <div className="mt-1 text-sm text-gray-900">
                                      {reference.referenceResult}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                      Referans Tarihi
                                    </label>
                                    <div className="mt-1 text-sm text-gray-900">
                                      {formatDate(reference.referenceDate.toString())}
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-4">
                                  <label className="block text-sm font-medium text-gray-700">
                                    Referans Yorumu
                                  </label>
                                  <div className="mt-1 text-sm text-gray-900">
                                    {reference.referenceNotes}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">Henüz referans bilgisi girilmemiş.</p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {filteredCandidates.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'Arama kriterlerine uygun aday bulunamadı.' : 'Henüz hiç aday eklenmemiş.'}
          </div>
        )}
      </div>

      {showEditModal && selectedCandidate && (
        <EditCandidateModal
          candidate={selectedCandidate}
          positions={positions}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCandidate(null);
          }}
          onUpdate={loadCandidates}
        />
      )}
    </div>
  );
};

export default AllCandidates;