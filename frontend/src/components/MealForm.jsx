import React, { useState } from 'react';
import { Plus, Zap, Package, Camera, X, AlertCircle } from 'lucide-react';
import BarcodeScanner from './BarcodeScanner';
import CameraAnalyzer from './CameraAnalyzer';

const MealForm = ({ onMealAdded, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showCameraAnalyzer, setShowCameraAnalyzer] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAiAnalysis = async () => {
    if (!formData.name.trim()) {
      setError('يرجى إدخال اسم الطعام أولاً');
      return;
    }

    setAiAnalyzing(true);
    setError('');

    try {
      const response = await fetch('/api/ai/analyze-food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('vita_auth_token')}`,
        },
        body: JSON.stringify({ 
          food_description: formData.name + (formData.description ? ' ' + formData.description : '')
        }),
      });

      if (!response.ok) {
        throw new Error('فشل في التحليل الذكي');
      }

      const result = await response.json();
      
      setFormData(prev => ({
        ...prev,
        calories: result.calories.toString(),
        protein: result.protein.toString(),
        carbs: result.carbs.toString(),
        fat: result.fat.toString()
      }));

    } catch (err) {
      setError('فشل في التحليل الذكي. يرجى إدخال القيم يدوياً.');
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleProductFound = (product) => {
    setFormData({
      name: product.name,
      description: product.description || '',
      calories: product.calories.toString(),
      protein: product.protein.toString(),
      carbs: product.carbs.toString(),
      fat: product.fat.toString()
    });
    setShowBarcodeScanner(false);
    setError('');
  };

  const handleFoodAnalyzed = (food) => {
    setFormData({
      name: food.name,
      description: food.description || '',
      calories: food.calories.toString(),
      protein: food.protein.toString(),
      carbs: food.carbs.toString(),
      fat: food.fat.toString()
    });
    setShowCameraAnalyzer(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('اسم الطعام مطلوب');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/meals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('vita_auth_token')}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          calories: parseFloat(formData.calories) || 0,
          protein: parseFloat(formData.protein) || 0,
          carbs: parseFloat(formData.carbs) || 0,
          fat: parseFloat(formData.fat) || 0
        }),
      });

      if (!response.ok) {
        throw new Error('فشل في إضافة الوجبة');
      }

      const result = await response.json();
      onMealAdded(result.meal);
      onClose();

    } catch (err) {
      setError(err.message || 'حدث خطأ في إضافة الوجبة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <Plus className="w-5 h-5 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">إضافة وجبة جديدة</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Smart Input Methods */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setShowBarcodeScanner(true)}
                className="flex flex-col items-center gap-2 p-4 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors border border-teal-200"
              >
                <Package className="w-6 h-6 text-teal-600" />
                <span className="text-xs font-medium text-teal-700">مسح باركود</span>
              </button>
              
              <button
                type="button"
                onClick={() => setShowCameraAnalyzer(true)}
                className="flex flex-col items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors border border-purple-200"
              >
                <Camera className="w-6 h-6 text-purple-600" />
                <span className="text-xs font-medium text-purple-700">تصوير الطعام</span>
              </button>
              
              <button
                type="button"
                onClick={handleAiAnalysis}
                disabled={aiAnalyzing || !formData.name.trim()}
                className="flex flex-col items-center gap-2 p-4 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors border border-orange-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {aiAnalyzing ? (
                  <div className="w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Zap className="w-6 h-6 text-orange-600" />
                )}
                <span className="text-xs font-medium text-orange-700">تحليل ذكي</span>
              </button>
            </div>

            {/* Food Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم الطعام *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="مثال: كوب حليب، قطعة دجاج مشوي"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                وصف إضافي (اختياري)
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="مثال: متوسط الحجم، مطبوخ بالزيت"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Nutrition Values Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  السعرات الحرارية
                </label>
                <input
                  type="number"
                  name="calories"
                  value={formData.calories}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البروتين (جرام)
                </label>
                <input
                  type="number"
                  name="protein"
                  value={formData.protein}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الكربوهيدرات (جرام)
                </label>
                <input
                  type="number"
                  name="carbs"
                  value={formData.carbs}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الدهون (جرام)
                </label>
                <input
                  type="number"
                  name="fat"
                  value={formData.fat}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="w-full bg-emerald-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  جاري الإضافة...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  إضافة الوجبة
                </>
              )}
            </button>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-medium text-blue-900 mb-2">نصائح سريعة:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• استخدم مسح الباركود للمنتجات المعبأة</li>
                <li>• جرب تصوير الطعام للتحليل التلقائي</li>
                <li>• اكتب وصف دقيق للحصول على تحليل ذكي أفضل</li>
              </ul>
            </div>
          </form>
        </div>
      </div>

      {/* Barcode Scanner Modal */}
      {showBarcodeScanner && (
        <BarcodeScanner
          onProductFound={handleProductFound}
          onClose={() => setShowBarcodeScanner(false)}
        />
      )}

      {/* Camera Analyzer Modal */}
      {showCameraAnalyzer && (
        <CameraAnalyzer
          onFoodAnalyzed={handleFoodAnalyzed}
          onClose={() => setShowCameraAnalyzer(false)}
        />
      )}
    </>
  );
};

export default MealForm;

