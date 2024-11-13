import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Calendar, CheckCircle } from 'lucide-react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { db } from '../lib/db';

ChartJS.register(ArcElement, Tooltip, Legend);

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  change: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, change }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <div className="flex items-center">
      <div className="p-2 bg-blue-50 rounded-lg">
        <Icon className="h-6 w-6 text-blue-600" />
      </div>
      <div className="ml-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="mt-1 flex items-baseline">
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          <p className="ml-2 text-sm font-medium text-green-600">{change}</p>
        </div>
      </div>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [positionData, setPositionData] = useState<ChartData<'pie'> | null>(null);
  const [resultData, setResultData] = useState<ChartData<'pie'> | null>(null);
  const [successPositionData, setSuccessPositionData] = useState<ChartData<'pie'> | null>(null);
  const [rejectionData, setRejectionData] = useState<ChartData<'pie'> | null>(null);

  const stats = [
    { icon: Users, title: 'Toplam Çalışan', value: '248', change: '+4.75%' },
    { icon: UserPlus, title: 'Açık Pozisyonlar', value: '12', change: '+2' },
    { icon: Calendar, title: 'Bekleyen Görüşmeler', value: '8', change: '+3' },
    { icon: CheckCircle, title: 'Tamamlanan Görüşmeler', value: '24', change: '+12' },
  ];

  const loadChartData = async () => {
    try {
      let query = db.candidates;
      
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59);
        
        query = query.filter(candidate => {
          const interviewDate = new Date(candidate.interviewDate);
          return interviewDate >= start && interviewDate <= end;
        });
      }

      const candidates = await query.toArray();
      const positions = await db.positions.toArray();

      // Position Distribution
      const positionCounts: { [key: string]: number } = {};
      candidates.forEach(candidate => {
        const position = positions.find(p => p.id === candidate.positionId);
        if (position) {
          positionCounts[position.name] = (positionCounts[position.name] || 0) + 1;
        }
      });

      // Result Distribution
      const resultCounts = {
        Olumlu: candidates.filter(c => c.result === 'Olumlu').length,
        Olumsuz: candidates.filter(c => c.result === 'Olumsuz').length
      };

      // Successful Position Distribution
      const successPositionCounts: { [key: string]: number } = {};
      candidates
        .filter(c => c.result === 'Olumlu')
        .forEach(candidate => {
          const position = positions.find(p => p.id === candidate.positionId);
          if (position) {
            successPositionCounts[position.name] = (successPositionCounts[position.name] || 0) + 1;
          }
        });

      // Rejection Reasons Distribution
      const rejectionCounts: { [key: string]: number } = {};
      candidates
        .filter(c => c.result === 'Olumsuz')
        .forEach(candidate => {
          if (candidate.rejectionReason) {
            rejectionCounts[candidate.rejectionReason] = (rejectionCounts[candidate.rejectionReason] || 0) + 1;
          }
        });

      setPositionData({
        labels: Object.keys(positionCounts),
        datasets: [{
          data: Object.values(positionCounts),
          backgroundColor: [
            '#3B82F6',
            '#EF4444',
            '#10B981',
            '#F59E0B',
            '#6366F1'
          ]
        }]
      });

      setResultData({
        labels: ['Olumlu', 'Olumsuz'],
        datasets: [{
          data: [resultCounts.Olumlu, resultCounts.Olumsuz],
          backgroundColor: ['#10B981', '#EF4444']
        }]
      });

      setSuccessPositionData({
        labels: Object.keys(successPositionCounts),
        datasets: [{
          data: Object.values(successPositionCounts),
          backgroundColor: [
            '#3B82F6',
            '#10B981',
            '#F59E0B',
            '#6366F1',
            '#EC4899'
          ]
        }]
      });

      setRejectionData({
        labels: Object.keys(rejectionCounts),
        datasets: [{
          data: Object.values(rejectionCounts),
          backgroundColor: [
            '#EF4444',
            '#F59E0B',
            '#6366F1',
            '#EC4899',
            '#8B5CF6'
          ]
        }]
      });

    } catch (error) {
      console.error('Error loading chart data:', error);
    }
  };

  useEffect(() => {
    loadChartData();
  }, []);

  const chartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Başlangıç Tarihi
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bitiş Tarihi
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={loadChartData}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Raporla
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {positionData && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                Görüşülen Pozisyon Dağılımı
              </h3>
              <Pie data={positionData} options={chartOptions} />
            </div>
          )}

          {resultData && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                Olumlu/Olumsuz Dağılımı
              </h3>
              <Pie data={resultData} options={chartOptions} />
            </div>
          )}

          {successPositionData && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                Olumlu Pozisyon Dağılımı
              </h3>
              <Pie data={successPositionData} options={chartOptions} />
            </div>
          )}

          {rejectionData && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                Olumsuzluk Nedeni Dağılımı
              </h3>
              <Pie data={rejectionData} options={chartOptions} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;