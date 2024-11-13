import React, { useState, useEffect } from 'react';
import { Search, Calendar, Upload, FileText, RefreshCw } from 'lucide-react';
import { db } from '../../lib/db';
import { showSuccess, showError } from '../../lib/toast';
import type { Candidate, Interview } from '../../lib/db';
import { educationOptions, applicationSourceOptions } from '../../lib/utils';

const CreateInterview: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [existingInterview, setExistingInterview] = useState<Interview | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    education: '',
    offeredSalary: '',
    hasRelative: 'false',
    applicationSource: '',
    firstManager: '',
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

  const loadExistingInterview = async (candidateId: number) => {
    try {
      const interview = await db.interviews
        .where('candidateId')
        .equals(candidateId)
        .first();
      
      if (interview) {
        setExistingInterview(interview);
        setFormData({
          education: interview.education,
          offeredSalary: interview.offeredSalary,
          hasRelative: interview.hasRelative,
          applicationSource: interview.applicationSource,
          firstManager: interview.firstManager,
        });
      } else {
        setExistingInterview(null);
        setFormData({
          education: '',
          offeredSalary: '',
          hasRelative: 'false',
          applicationSource: '',
          firstManager: '',
        });
      }
    } catch (error) {
      console.error('Error loading interview:', error);
      showError('Görüşme bilgileri yüklenirken bir hata oluştu');
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
      loadExistingInterview(candidate.id);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showError('CV dosyası 10MB\'dan küçük olmalıdır');
        return;
      }

      if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
          .includes(file.type)) {
        showError('Sadece PDF, DOC veya DOCX dosyaları yüklenebilir');
        return;
      }

      setCvFile(file);
    }
  };

  const handleViewCV = () => {
    if (existingInterview?.cvFile) {
      window.open(existingInterview.cvFile, '_blank');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate?.id) {
      showError('Lütfen önce bir aday seçin');
      return;
    }

    try {
      let cvUrl = existingInterview?.cvFile;

      if (cvFile) {
        const reader = new FileReader();
        cvUrl = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(cvFile);
        });
      }

      const interviewData = {
        ...formData,
        candidateId: selectedCandidate.id,
        cvFile: cvUrl,
      };

      if (existingInterview?.id) {
        await db.interviews.update(existingInterview.id, {
          ...interviewData,
          updatedAt: new Date(),
        });
        showSuccess('Görüşme bilgileri başarıyla güncellendi');
      } else {
        await db.interviews.add({
          ...interviewData,
          createdAt: new Date(),
        });
        showSuccess('Görüşme bilgileri başarıyla kaydedildi');
      }

      // Reset form
      setFormData({
        education: '',
        offeredSalary: '',
        hasRelative: 'false',
        applicationSource: '',
        firstManager: '',
      });
      setSelectedCandidate(null);
      setCvFile(null);
      setExistingInterview(null);
    } catch (error) {
      console.error('Error saving interview:', error);
      showError('Görüşme kaydedilirken bir hata oluştu');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
              <div>
                <label className="block text-sm font-medium text-gray-700">Pozisyon Türü</label>
                <div className="mt-1 text-gray-900">
                  {selectedCandidate.collarType === 'blue' ? 'Mavi Yaka' : 'Beyaz Yaka'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interview Form */}
      {selectedCandidate && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {existingInterview ? 'Görüşme Bilgilerini Güncelle' : 'Yeni Görüşme Bilgileri'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Eğitim Durumu
              </label>
              <select
                name="education"
                value={formData.education}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              >
                <option value="">Seçiniz</option>
                {educationOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teklif Edilecek Ücret
              </label>
              <input
                type="text"
                name="offeredSalary"
                value={formData.offeredSalary}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fabrikada Tanıdığı Var Mı?
              </label>
              <select
                name="hasRelative"
                value={formData.hasRelative}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              >
                <option value="false">Hayır</option>
                <option value="true">Evet</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Başvuru Şekli
              </label>
              <select
                name="applicationSource"
                value={formData.applicationSource}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              >
                <option value="">Seçiniz</option>
                {applicationSourceOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İlk Amiri
              </label>
              <input
                type="text"
                name="firstManager"
                value={formData.firstManager}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CV
              </label>
              <div className="mt-1 flex flex-col space-y-2">
                {existingInterview?.cvFile ? (
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={handleViewCV}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FileText className="mr-2 h-5 w-5 text-gray-500" />
                      CV Görüntüle
                    </button>
                    <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                      <RefreshCw className="mr-2 h-5 w-5 text-gray-500" />
                      CV Güncelle
                      <input
                        type="file"
                        className="sr-only"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                ) : (
                  <label className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-gray-400">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <span className="relative rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          CV Yükle
                          <input
                            type="file"
                            className="sr-only"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                          />
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">PDF, DOC, DOCX (Max 10MB)</p>
                    </div>
                  </label>
                )}
                {cvFile && !existingInterview?.cvFile && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <FileText className="h-5 w-5" />
                    <span>Yeni CV yüklendi: {cvFile.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {existingInterview ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreateInterview;