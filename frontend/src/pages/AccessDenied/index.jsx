import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

export default function AccessDeniedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
        <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
        
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Không có quyền truy cập</h1>
        <p className="text-gray-600 mb-6">Bạn không có quyền để truy cập trang này. Vui lòng quay lại.</p>
        
        <div className="flex gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition"
          >
            ← Quay lại
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition"
          >
            Dashboard →
          </button>
        </div>
      </div>
    </div>
  );
}
