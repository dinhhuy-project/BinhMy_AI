import React, { useState, useEffect } from 'react';
import { getStatistics } from '../services/apiService';

interface StatisticsData {
  totalResults: number;
  topQueries: Array<{
    _id: string;
    count: number;
  }>;
}

export const StatisticsPanel: React.FC = () => {
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getStatistics();
        if (response.success) {
          setStatistics(response.data);
        } else {
          setError('Failed to fetch statistics');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatistics();
    // Refresh mỗi 30 giây
    const interval = setInterval(fetchStatistics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading && !statistics) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-center text-gray-500">Đang tải thống kê...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg shadow-md p-6 border border-red-200">
        <p className="text-red-700">Lỗi: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">📊 Thống Kê Tìm Kiếm</h2>

      <div className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
            <p className="text-gray-600 text-sm font-semibold uppercase">Tổng Kết Quả</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {statistics?.totalResults || 0}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
            <p className="text-gray-600 text-sm font-semibold uppercase">Tìm Kiếm Khác Nhau</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {statistics?.topQueries.length || 0}
            </p>
          </div>
        </div>
      </div>

      {statistics?.topQueries && statistics.topQueries.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🔝 Top Tìm Kiếm</h3>
          <div className="space-y-3">
            {statistics.topQueries.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-4 flex-1">
                  <span className="font-bold text-lg text-gray-400 w-6 text-right">
                    #{index + 1}
                  </span>
                  <span className="text-gray-700 font-medium">{item._id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 rounded-full px-3 py-1">
                    <span className="text-sm font-bold text-blue-600">{item.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition duration-200"
        >
          🔄 Làm mới
        </button>
      </div>
    </div>
  );
};
