import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createCandidate } from '../../lib/candidates';
import type { Candidate, Position } from '../../lib/db';
import { militaryStatusOptions } from '../../lib/utils';
import { db } from '../../lib/db';

interface FormData {
  collarType: 'blue' | 'white';
  fullName: string;
  birthDate: string;
  registeredCity: string;
  hometown: string;
  militaryStatus: string;
  experience: string;
  email: string;
  positionId: string;
  interviewDate: string;
  serviceLine: string;
  result: string;
  rejectionReason: string;
  invitationDate: string;
}

const CreateCandidate = () => {
  const navigate = useNavigate();
  const [positions, setPositions] = useState<Position[]>([]);
  const [formData, setFormData] = useState<FormData>({
    collarType: 'blue',
    fullName: '',
    birthDate: '',
    registeredCity: '',
    hometown: '',
    militaryStatus: '',
    experience: '',
    email: '',
    positionId: '',
    interviewDate: '',
    serviceLine: '',
    result: '',
    rejectionReason: '',
    invitationDate: '',
  });

  useEffect(() => {
    const loadPositions = async () => {
      try {
        // Fixed the query to properly filter active positions
        const activePositions = await db.positions
          .filter(position => position.isActive === true)
          .toArray();
        setPositions(activePositions);
      } catch (error) {
        console.error('Error loading positions:', error);
      }
    };
    loadPositions();
  }, []);

  const resultOptions = ['', 'Olumlu', 'Olumsuz'];
  const rejectionReasons = [
    'Tecrübe Yetersizliği',
    'Ücret Beklentisi',
    'Lokasyon',
    'Vardiya Uyumsuzluğu',
    'Diğer'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const candidateData: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'> = {
        collarType: formData.collarType,
        fullName: formData.fullName,
        birthDate: formData.birthDate,
        registeredCity: formData.registeredCity,
        hometown: formData.hometown,
        militaryStatus: formData.militaryStatus,
        experience: parseInt(formData.experience) || 0,
        email: formData.email,
        positionId: formData.positionId ? parseInt(formData.positionId) : null,
        interviewDate: formData.interviewDate || null,
        serviceLine: formData.serviceLine || null,
        result: (formData.result as 'Olumlu' | 'Olumsuz' | null) || null,
        rejectionReason: formData.result === 'Olumsuz' ? formData.rejectionReason : null,
        invitationDate: formData.result === 'Olumlu' ? formData.invitationDate : null,
      };

      await createCandidate(candidateData);
      navigate('/recruitment/all');
    } catch (error) {
      console.error('Error creating candidate:', error);
      alert('Aday oluşturulurken bir hata oluştu.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Collar Type Selection */}
          <div className="col-span-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">Pozisyon Türü</label>
            <div className="flex space-x-4">
              {[
                { value: 'blue', label: 'Mavi Yaka' },
                { value: 'white', label: 'Beyaz Yaka' }
              ].map(({ value, label }) => (
                <label key={value} className="flex items-center">
                  <input
                    type="radio"
                    name="collarType"
                    value={value}
                    checked={formData.collarType === value}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Position Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pozisyon
            </label>
            <select
              name="positionId"
              value={formData.positionId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            >
              <option value="">Seçiniz</option>
              {positions.map(position => (
                <option key={position.id} value={position.id}>
                  {position.name}
                </option>
              ))}
            </select>
          </div>

          {/* Personal Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ad Soyad
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Doğum Tarihi
            </label>
            <div className="relative">
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nüfusa Kayıtlı İl
            </label>
            <input
              type="text"
              name="registeredCity"
              value={formData.registeredCity}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Memleket
            </label>
            <input
              type="text"
              name="hometown"
              value={formData.hometown}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Askerlik Durumu
            </label>
            <select
              name="militaryStatus"
              value={formData.militaryStatus}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Seçiniz</option>
              {militaryStatusOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Toplam Tecrübe (Yıl)
            </label>
            <input
              type="number"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              min="0"
              max="50"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-posta Adresi
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Görüşme Tarihi
            </label>
            <div className="relative">
              <input
                type="date"
                name="interviewDate"
                value={formData.interviewDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Servis Güzergahı
            </label>
            <input
              type="text"
              name="serviceLine"
              value={formData.serviceLine}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sonuç
            </label>
            <select
              name="result"
              value={formData.result}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {resultOptions.map(option => (
                <option key={option} value={option}>{option || 'Seçiniz'}</option>
              ))}
            </select>
          </div>

          {formData.result === 'Olumsuz' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Olumsuzluk Sebebi
              </label>
              <select
                name="rejectionReason"
                value={formData.rejectionReason}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              >
                <option value="">Seçiniz</option>
                {rejectionReasons.map(reason => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
            </div>
          )}

          {formData.result === 'Olumlu' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Davet Tarihi
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="invitationDate"
                  value={formData.invitationDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Kaydet
        </button>
      </div>
    </form>
  );
};

export default CreateCandidate;