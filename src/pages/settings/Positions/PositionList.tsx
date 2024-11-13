import React from 'react';
import { Check, X, Pencil, Trash2 } from 'lucide-react';
import type { Position } from '../../../lib/db';

interface PositionListProps {
  positions: Position[];
  onDelete: (id: number) => void;
  onEdit: (position: Position) => void;
  onToggleStatus: (position: Position) => void;
}

const PositionList = ({ positions, onDelete, onEdit, onToggleStatus }: PositionListProps) => {
  return (
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
                    onClick={() => onToggleStatus(position)}
                    className={`${
                      position.isActive ? 'text-green-600' : 'text-red-600'
                    } hover:text-gray-900`}
                    title={position.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                  >
                    {position.isActive ? <Check size={18} /> : <X size={18} />}
                  </button>
                  <button
                    onClick={() => onEdit(position)}
                    className="text-blue-600 hover:text-blue-900"
                    title="Düzenle"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => position.id && onDelete(position.id)}
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
  );
};

export default PositionList;