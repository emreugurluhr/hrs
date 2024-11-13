import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { db, type Position } from '../../../lib/db';
import PositionModal from './PositionModal';
import PositionList from './PositionList';

const Positions = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);

  const loadPositions = async () => {
    try {
      const allPositions = await db.positions.orderBy('createdAt').reverse().toArray();
      setPositions(allPositions);
    } catch (error) {
      console.error('Error loading positions:', error);
      alert('Pozisyonlar yüklenirken bir hata oluştu.');
    }
  };

  useEffect(() => {
    loadPositions();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu pozisyonu silmek istediğinizden emin misiniz?')) {
      try {
        await db.positions.delete(id);
        await loadPositions();
      } catch (error) {
        console.error('Error deleting position:', error);
        alert('Pozisyon silinirken bir hata oluştu.');
      }
    }
  };

  const handleToggleStatus = async (position: Position) => {
    try {
      await db.positions.update(position.id!, {
        isActive: !position.isActive,
        updatedAt: new Date().toISOString(),
      });
      await loadPositions();
    } catch (error) {
      console.error('Error updating position status:', error);
      alert('Pozisyon durumu güncellenirken bir hata oluştu.');
    }
  };

  const handleEdit = (position: Position) => {
    setEditingPosition(position);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPosition(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Pozisyon Listesi</h2>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Yeni Pozisyon</span>
        </button>
      </div>

      <PositionList
        positions={positions}
        onDelete={handleDelete}
        onEdit={handleEdit}
        onToggleStatus={handleToggleStatus}
      />

      {showModal && (
        <PositionModal
          position={editingPosition || undefined}
          onClose={handleCloseModal}
          onSave={loadPositions}
        />
      )}
    </div>
  );
};

export default Positions;