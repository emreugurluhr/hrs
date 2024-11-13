import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { db, type Position } from '../../lib/db';
import { showSuccess, showError } from '../../lib/toast';

const Positions = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
  });

  const loadPositions = async () => {
    try {
      const allPositions = await db.positions.orderBy('createdAt').reverse().toArray();
      setPositions(allPositions);
    } catch (error) {
      console.error('Error loading positions:', error);
      showError('Pozisyonlar yüklenirken bir hata oluştu');
    }
  };

  useEffect(() => {
    loadPositions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPosition?.id) {
        await db.positions.update(editingPosition.id, {
          ...formData,
          updatedAt: new Date()
        });
        showSuccess('Pozisyon başarıyla güncellendi');
      } else {
        await db.positions.add({
          ...formData,
          createdAt: new Date()
        });
        showSuccess('Pozisyon başarıyla oluşturuldu');
      }
      setIsModalOpen(false);
      setEditingPosition(null);
      setFormData({ name: '', description: '', isActive: true });
      await loadPositions();
    } catch (error) {
      console.error('Error saving position:', error);
      showError('Pozisyon kaydedilirken bir hata oluştu');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu pozisyonu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      try {
        await db.positions.delete(id);
        showSuccess('Pozisyon başarıyla silindi');
        await loadPositions();
      } catch (error) {
        console.error('Error deleting position:', error);
        showError('Pozisyon silinirken bir hata oluştu');
      }
    }
  };

  const handleEdit = (position: Position) => {
    setEditingPosition(position);
    setFormData({
      name: position.name,
      description: position.description || '',
      isActive: position.isActive,
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (position: Position) => {
    try {
      await db.positions.update(position.id!, {
        isActive: !position.isActive,
      });
      showSuccess(`Pozisyon ${position.isActive ? 'pasif' : 'aktif'} duruma getirildi`);
      await loadPositions();
    } catch (error) {
      console.error('Error toggling position status:', error);
      showError('Pozisyon durumu güncellenirken bir hata oluştu');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Pozisyon Listesi</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Yeni Pozisyon</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pozisyon Adı
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Açıklama
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {positions.map((position) => (
              <tr key={position.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{position.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">{position.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      position.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {position.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleToggleStatus(position)}
                      className={`${
                        position.isActive ? 'text-green-600' : 'text-red-600'
                      } hover:text-gray-900`}
                      title={position.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                    >
                      {position.isActive ? <Check size={18} /> : <X size={18} />}
                    </button>
                    <button
                      onClick={() => handleEdit(position)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Düzenle"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => position.id && handleDelete(position.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Sil"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {positions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Henüz hiç pozisyon eklenmemiş.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingPosition ? 'Pozisyon Düzenle' : 'Yeni Pozisyon'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingPosition(null);
                  setFormData({ name: '', description: '', isActive: true });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pozisyon Adı
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows={4}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Aktif
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingPosition(null);
                    setFormData({ name: '', description: '', isActive: true });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {editingPosition ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Positions;