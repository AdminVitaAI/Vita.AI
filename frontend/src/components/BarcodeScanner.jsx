import React, { useState, useRef } from 'react';
import { Camera, Search, Package, AlertCircle, CheckCircle, X } from 'lucide-react';

const BarcodeScanner = ({ onProductFound, onClose }) => {
  const [barcode, setBarcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [product, setProduct] = useState(null);
  const [scanMode, setScanMode] = useState('manual'); // 'manual' or 'camera'
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleManualScan = async () => {
    if (!barcode.trim()) {
      setError('يرجى إدخال رقم الباركود');
      return;
    }

    setLoading(true);
    setError('');
    setProduct(null);

    try {
      const response = await fetch('/api/barcode/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('vita_auth_token')}`,
        },
        body: JSON.stringify({ barcode: barcode.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل في مسح الباركود');
      }

      const result = await response.json();
      setProduct(result.product);
      
    } catch (err) {
      setError(err.message || 'فشل في مسح الباركود. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseProduct = () => {
    if (product && onProductFound) {
      onProductFound({
        name: product.name,
        description: `${product.brand} - ${product.categories}`,
        calories: Math.round(product.calories),
        protein: Math.round(product.protein),
        carbs: Math.round(product.carbs),
        fat: Math.round(product.fat),
        source: 'barcode'
      });
    }
  };

  const validateBarcode = async () => {
    if (!barcode.trim()) return;

    try {
      const response = await fetch('/api/barcode/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ barcode: barcode.trim() }),
      });

      const result = await response.json();
      if (!result.valid) {
        setError('تنسيق الباركود غير صحيح');
      } else {
        setError('');
      }
    } catch (err) {
      console.error('Barcode validation error:', err);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScanMode('camera');
      }
    } catch (err) {
      setError('لا يمكن الوصول للكاميرا. يرجى استخدام الإدخال اليدوي.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setScanMode('manual');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
              <Package className="w-5 h-5 text-teal-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">مسح الباركود</h2>
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
                setScanMode('manual');
              }}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                scanMode === 'manual'
                  ? 'bg-teal-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              إدخال يدوي
            </button>
            <button
              onClick={startCamera}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                scanMode === 'camera'
                  ? 'bg-teal-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Camera className="w-4 h-4 inline mr-2" />
              كاميرا
            </button>
          </div>

          {/* Manual Input */}
          {scanMode === 'manual' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الباركود
                </label>
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  onBlur={validateBarcode}
                  placeholder="أدخل رقم الباركود (UPC/EAN)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleManualScan}
                disabled={loading || !barcode.trim()}
                className="w-full bg-teal-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري المسح...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    مسح الباركود
                  </>
                )}
              </button>
            </div>
          )}

          {/* Camera View */}
          {scanMode === 'camera' && (
            <div className="space-y-4">
              <div className="relative bg-gray-900 rounded-xl overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-64 object-cover"
                  playsInline
                  muted
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
                <div className="absolute inset-0 border-2 border-teal-400 rounded-xl pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-16 border-2 border-red-400 rounded-lg"></div>
                </div>
              </div>
              
              <div className="text-center text-sm text-gray-600">
                وجه الكاميرا نحو الباركود داخل الإطار الأحمر
              </div>

              <button
                onClick={stopCamera}
                className="w-full bg-gray-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-700 transition-colors"
              >
                إيقاف الكاميرا
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

          {/* Product Result */}
          {product && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <p className="text-green-700 text-sm font-medium">تم العثور على المنتج!</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div>
                  <h3 className="font-bold text-gray-900">{product.name}</h3>
                  {product.brand && (
                    <p className="text-sm text-gray-600">{product.brand}</p>
                  )}
                  {product.categories && (
                    <p className="text-xs text-gray-500">{product.categories}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="font-bold text-orange-600">{Math.round(product.calories)}</div>
                    <div className="text-gray-600">سعرة حرارية</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="font-bold text-blue-600">{Math.round(product.protein)}g</div>
                    <div className="text-gray-600">بروتين</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="font-bold text-green-600">{Math.round(product.carbs)}g</div>
                    <div className="text-gray-600">كربوهيدرات</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="font-bold text-purple-600">{Math.round(product.fat)}g</div>
                    <div className="text-gray-600">دهون</div>
                  </div>
                </div>

                {product.nutrition_grade && (
                  <div className="text-center">
                    <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                      تقييم غذائي: {product.nutrition_grade.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={handleUseProduct}
                className="w-full bg-teal-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-teal-700 transition-colors"
              >
                استخدام هذا المنتج
              </button>
            </div>
          )}

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-medium text-blue-900 mb-2">نصائح للحصول على أفضل النتائج:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• تأكد من وضوح الباركود</li>
              <li>• استخدم إضاءة جيدة</li>
              <li>• تأكد من صحة الأرقام عند الإدخال اليدوي</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;

