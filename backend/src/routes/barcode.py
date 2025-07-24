from flask import Blueprint, jsonify, request
import requests
from datetime import datetime

barcode_bp = Blueprint('barcode', __name__)

@barcode_bp.route('/barcode/scan', methods=['POST'])
def scan_barcode():
    """
    Scan barcode and get nutrition information
    Supports multiple nutrition databases:
    1. Open Food Facts (free, comprehensive)
    2. USDA FoodData Central (fallback)
    """
    try:
        data = request.json
        barcode = data.get('barcode')
        
        if not barcode:
            return jsonify({'error': 'الباركود مطلوب'}), 400
        
        # Clean barcode (remove spaces, ensure proper format)
        barcode = str(barcode).strip().replace(' ', '')
        
        # Try Open Food Facts first (free and comprehensive)
        nutrition_data = get_nutrition_from_openfoodfacts(barcode)
        
        if not nutrition_data:
            # Fallback to USDA if Open Food Facts doesn't have the product
            nutrition_data = get_nutrition_from_usda(barcode)
        
        if not nutrition_data:
            return jsonify({
                'error': 'لم يتم العثور على معلومات غذائية لهذا المنتج',
                'barcode': barcode,
                'suggestions': 'تأكد من صحة الباركود أو أدخل المعلومات يدوياً'
            }), 404
        
        return jsonify({
            'success': True,
            'barcode': barcode,
            'product': nutrition_data,
            'source': nutrition_data.get('source', 'unknown'),
            'scanned_at': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'حدث خطأ في مسح الباركود',
            'details': str(e)
        }), 500

def get_nutrition_from_openfoodfacts(barcode):
    """
    Get nutrition data from Open Food Facts API
    Free and comprehensive database
    """
    try:
        # Open Food Facts API endpoint
        url = f"https://world.openfoodfacts.org/api/v2/product/{barcode}"
        params = {
            'fields': 'product_name,nutriments,nutrition_grades,brands,categories,serving_size,quantity'
        }
        
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get('status') == 1 and data.get('product'):
                product = data['product']
                nutriments = product.get('nutriments', {})
                
                # Extract nutrition information
                nutrition_info = {
                    'name': product.get('product_name', 'منتج غير معروف'),
                    'brand': product.get('brands', ''),
                    'categories': product.get('categories', ''),
                    'serving_size': product.get('serving_size', '100g'),
                    'quantity': product.get('quantity', ''),
                    'nutrition_grade': product.get('nutrition_grades', ''),
                    
                    # Macronutrients per 100g
                    'calories': nutriments.get('energy-kcal_100g', nutriments.get('energy-kcal', 0)),
                    'protein': nutriments.get('proteins_100g', nutriments.get('proteins', 0)),
                    'carbs': nutriments.get('carbohydrates_100g', nutriments.get('carbohydrates', 0)),
                    'fat': nutriments.get('fat_100g', nutriments.get('fat', 0)),
                    'fiber': nutriments.get('fiber_100g', nutriments.get('fiber', 0)),
                    'sugar': nutriments.get('sugars_100g', nutriments.get('sugars', 0)),
                    'sodium': nutriments.get('sodium_100g', nutriments.get('sodium', 0)),
                    'salt': nutriments.get('salt_100g', nutriments.get('salt', 0)),
                    
                    # Additional info
                    'source': 'Open Food Facts',
                    'barcode': barcode,
                    'confidence': 'high' if product.get('product_name') else 'medium'
                }
                
                return nutrition_info
                
    except requests.RequestException as e:
        print(f"Open Food Facts API error: {e}")
    except Exception as e:
        print(f"Error processing Open Food Facts data: {e}")
    
    return None

def get_nutrition_from_usda(barcode):
    """
    Get nutrition data from USDA FoodData Central
    Fallback option - requires API key but has good US product coverage
    """
    try:
        # Note: USDA doesn't directly support barcode lookup
        # This is a placeholder for potential future integration
        # You would need to implement barcode-to-USDA-ID mapping
        
        # For now, return None to indicate no data found
        return None
        
    except Exception as e:
        print(f"USDA API error: {e}")
        return None

@barcode_bp.route('/barcode/search', methods=['POST'])
def search_product():
    """
    Search for products by name when barcode scan fails
    """
    try:
        data = request.json
        query = data.get('query', '').strip()
        
        if not query:
            return jsonify({'error': 'نص البحث مطلوب'}), 400
        
        # Search in Open Food Facts
        url = "https://world.openfoodfacts.org/cgi/search.pl"
        params = {
            'search_terms': query,
            'search_simple': 1,
            'action': 'process',
            'json': 1,
            'page_size': 10,
            'fields': 'product_name,nutriments,nutrition_grades,brands,code'
        }
        
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            products = []
            
            for product in data.get('products', []):
                nutriments = product.get('nutriments', {})
                
                product_info = {
                    'name': product.get('product_name', 'منتج غير معروف'),
                    'brand': product.get('brands', ''),
                    'barcode': product.get('code', ''),
                    'nutrition_grade': product.get('nutrition_grades', ''),
                    'calories': nutriments.get('energy-kcal_100g', 0),
                    'protein': nutriments.get('proteins_100g', 0),
                    'carbs': nutriments.get('carbohydrates_100g', 0),
                    'fat': nutriments.get('fat_100g', 0)
                }
                products.append(product_info)
            
            return jsonify({
                'success': True,
                'query': query,
                'products': products,
                'count': len(products)
            }), 200
        
        return jsonify({
            'error': 'لم يتم العثور على منتجات',
            'query': query
        }), 404
        
    except Exception as e:
        return jsonify({
            'error': 'حدث خطأ في البحث',
            'details': str(e)
        }), 500

@barcode_bp.route('/barcode/validate', methods=['POST'])
def validate_barcode():
    """
    Validate barcode format (UPC, EAN, etc.)
    """
    try:
        data = request.json
        barcode = str(data.get('barcode', '')).strip()
        
        if not barcode:
            return jsonify({'valid': False, 'error': 'الباركود مطلوب'}), 400
        
        # Remove spaces and non-numeric characters
        clean_barcode = ''.join(filter(str.isdigit, barcode))
        
        # Check common barcode lengths
        valid_lengths = [8, 12, 13, 14]  # UPC-A, EAN-8, EAN-13, GTIN-14
        
        is_valid = len(clean_barcode) in valid_lengths
        
        barcode_type = None
        if len(clean_barcode) == 8:
            barcode_type = 'EAN-8'
        elif len(clean_barcode) == 12:
            barcode_type = 'UPC-A'
        elif len(clean_barcode) == 13:
            barcode_type = 'EAN-13'
        elif len(clean_barcode) == 14:
            barcode_type = 'GTIN-14'
        
        return jsonify({
            'valid': is_valid,
            'barcode': clean_barcode,
            'original': barcode,
            'type': barcode_type,
            'length': len(clean_barcode)
        }), 200
        
    except Exception as e:
        return jsonify({
            'valid': False,
            'error': 'حدث خطأ في التحقق من الباركود',
            'details': str(e)
        }), 500

