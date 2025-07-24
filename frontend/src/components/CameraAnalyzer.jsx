import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, Zap, AlertCircle, CheckCircle, X, Image as ImageIcon } from 'lucide-react';

const CameraAnalyzer = ({ onFoodAnalyzed, onClose }) => {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [captureMode, setCaptureMode] = useState('upload'); // 'upload' or 'camera'
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: 1280, height: 720 } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCaptureMode('camera');
      }
    } catch (err) {
      setError('لا يمكن الوصول للكاميرا. يرجى استخدام رفع الصورة.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCaptureMode('upload');
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
      handleImageFile(file);
    }, 'image/jpeg', 0.8);

    stopCamera();
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const handleImageFile = (file) => {
    if (!file.type.startsWith('image/')) {
      setError('يرجى اختيار ملف صورة صحيح');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('حجم الصورة كبير جداً. يرجى اختيار صورة أصغر من 10MB');
      return;
    }

    setImage(file);
    setError('');
    setAnalysis(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!image) {
      setError('يرجى اختيار صورة أولاً');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Convert image to base64
      const base64 = await convertToBase64(image);

      const response = await fetch('/api/camera/analyze-food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('vita_auth_token')}`,
        },
        body: JSON.stringify({ 
          image: base64,
          info: 'تحليل شامل للوجبة'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل في تحليل الصورة');
      }

      const result = await response.json();
      setAnalysis(result.analysis);
      
    } catch (err) {
      setError(err.message || 'فشل في تحليل الصورة. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleUseFoods = () => {
    if (analysis && analysis.foods && onFoodAnalyzed) {
      analysis.foods.forEach(food => {
        onFoodAnalyzed({
          name: food.name,
          description: `${food.quantity} - ${food.confidence} الثقة`,
          calories: Math.round(food.calories),
          protein: Math.round(food.protein),
          carbs: Math.round(food.carbs),
          fat: Math.round(food.fat),
          source: 'camera'
        });
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">تحليل الطعام بالذكاء الاصطناعي</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Mode Selection */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                stopCamera();
                setCaptureMode('upload');
              }}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                captureMode === 'upload'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              رفع صورة
            </button>
            <button
              onClick={startCamera}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                captureMode === 'camera'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Camera className="w-4 h-4 inline mr-2" />
              التقاط صورة
            </button>
          </div>

          {/* Upload Mode */}
          {captureMode === 'upload' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors"
              >
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium mb-2">انقر لاختيار صورة الطعام</p>
                <p className="text-sm text-gray-500">PNG, JPG, JPEG حتى 10MB</p>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          {/* Camera Mode */}
          {captureMode === 'camera' && (
            <div className="space-y-4">
              <div className="relative bg-gray-900 rounded-xl overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-80 object-cover"
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={capturePhoto}
                  className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-purple-700 transition-colors"
                >
                  التقاط الصورة
                </button>
                <button
                  onClick={stopCamera}
                  className="px-6 py-3 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}

          {/* Image Preview */}
          {imagePreview && (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="معاينة الصورة"
                  className="w-full h-64 object-cover rounded-xl"
                />
                <button
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                    setAnalysis(null);
                  }}
                  className="absolute top-2 right-2 w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={analyzeImage}
                disabled={loading}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري التحليل...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    تحليل الطعام
                  </>
                )}
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Analysis Results */}
          {analysis && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <p className="text-green-700 text-sm font-medium">تم تحليل الصورة بنجاح!</p>
              </div>

              {/* Description */}
              {analysis.description && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="font-medium text-blue-900 mb-2">وصف الوجبة:</h4>
                  <p className="text-blue-700 text-sm">{analysis.description}</p>
                </div>
              )}

              {/* Individual Foods */}
              {analysis.foods && analysis.foods.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">الأطعمة المكتشفة:</h4>
                  {analysis.foods.map((food, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-bold text-gray-900">{food.name}</h5>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          food.confidence === 'عالي' ? 'bg-green-100 text-green-800' :
                          food.confidence === 'متوسط' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {food.confidence}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">الكمية: {food.quantity}</p>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-white rounded-lg p-2 text-center">
                          <div className="font-bold text-orange-600">{Math.round(food.calories)}</div>
                          <div className="text-gray-600 text-xs">سعرة</div>
                        </div>
                        <div className="bg-white rounded-lg p-2 text-center">
                          <div className="font-bold text-blue-600">{Math.round(food.protein)}g</div>
                          <div className="text-gray-600 text-xs">بروتين</div>
                        </div>
                        <div className="bg-white rounded-lg p-2 text-center">
                          <div className="font-bold text-green-600">{Math.round(food.carbs)}g</div>
                          <div className="text-gray-600 text-xs">كربوهيدرات</div>
                        </div>
                        <div className="bg-white rounded-lg p-2 text-center">
                          <div className="font-bold text-purple-600">{Math.round(food.fat)}g</div>
                          <div className="text-gray-600 text-xs">دهون</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Total Nutrition */}
              {analysis.total && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
                  <h4 className="font-bold text-purple-900 mb-3 text-center">إجمالي الوجبة</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-3 text-center">
                      <div className="font-bold text-orange-600 text-lg">{Math.round(analysis.total.calories)}</div>
                      <div className="text-gray-600 text-sm">سعرة حرارية</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <div className="font-bold text-blue-600 text-lg">{Math.round(analysis.total.protein)}g</div>
                      <div className="text-gray-600 text-sm">بروتين</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <div className="font-bold text-green-600 text-lg">{Math.round(analysis.total.carbs)}g</div>
                      <div className="text-gray-600 text-sm">كربوهيدرات</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <div className="font-bold text-purple-600 text-lg">{Math.round(analysis.total.fat)}g</div>
                      <div className="text-gray-600 text-sm">دهون</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {analysis.recommendations && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <h4 className="font-medium text-yellow-900 mb-2">نصائح غذائية:</h4>
                  <p className="text-yellow-700 text-sm">{analysis.recommendations}</p>
                </div>
              )}

              <button
                onClick={handleUseFoods}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-purple-700 transition-colors"
              >
                إضافة جميع الأطعمة للوجبة
              </button>
            </div>
          )}

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-medium text-blue-900 mb-2">نصائح للحصول على أفضل النتائج:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• تأكد من وضوح الطعام في الصورة</li>
              <li>• استخدم إضاءة جيدة</li>
              <li>• اجعل الطعام يملأ معظم الصورة</li>
              <li>• تجنب الظلال والانعكاسات</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraAnalyzer;

