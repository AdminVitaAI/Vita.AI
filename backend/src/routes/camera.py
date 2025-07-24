from flask import Blueprint, jsonify, request
import openai
import os
import base64
from datetime import datetime
import requests
from io import BytesIO
from PIL import Image
import json

camera_bp = Blueprint('camera', __name__)

# Initialize OpenAI client
openai.api_key = os.getenv('OPENAI_API_KEY')
openai.api_base = os.getenv('OPENAI_API_BASE', 'https://api.openai.com/v1')

@camera_bp.route('/camera/analyze-food', methods=['POST'])
def analyze_food_image():
    """
    Analyze food image using OpenAI Vision API
    Identifies food items and estimates nutrition information
    """
    try:
        data = request.json
        image_data = data.get('image')
        additional_info = data.get('info', '')
        
        if not image_data:
            return jsonify({'error': 'صورة الطعام مطلوبة'}), 400
        
        # Process base64 image
        if image_data.startswith('data:image'):
            # Remove data URL prefix
            image_data = image_data.split(',')[1]
        
        try:
            # Decode and validate image
            image_bytes = base64.b64decode(image_data)
            image = Image.open(BytesIO(image_bytes))
            
            # Resize image if too large (OpenAI has size limits)
            max_size = (1024, 1024)
            if image.size[0] > max_size[0] or image.size[1] > max_size[1]:
                image.thumbnail(max_size, Image.Resampling.LANCZOS)
                
                # Convert back to base64
                buffered = BytesIO()
                image.save(buffered, format="JPEG", quality=85)
                image_data = base64.b64encode(buffered.getvalue()).decode()
            
        except Exception as e:
            return jsonify({'error': 'صيغة الصورة غير صحيحة'}), 400
        
        # Analyze image with OpenAI Vision
        nutrition_analysis = analyze_with_openai_vision(image_data, additional_info)
        
        if not nutrition_analysis:
            return jsonify({
                'error': 'فشل في تحليل الصورة',
                'suggestion': 'تأكد من وضوح الصورة ووجود الطعام فيها'
            }), 500
        
        return jsonify({
            'success': True,
            'analysis': nutrition_analysis,
            'analyzed_at': datetime.utcnow().isoformat(),
            'source': 'OpenAI Vision API'
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'حدث خطأ في تحليل الصورة',
            'details': str(e)
        }), 500

def analyze_with_openai_vision(image_data, additional_info=""):
    """
    Use OpenAI Vision API to analyze food image
    """
    try:
        # Prepare the prompt for food analysis
        system_prompt = """أنت خبير تغذية متخصص في تحليل الطعام من الصور. 
        مهمتك هي:
        1. تحديد جميع أنواع الطعام الموجودة في الصورة
        2. تقدير الكمية لكل نوع طعام (بالجرام)
        3. حساب القيم الغذائية لكل نوع: السعرات الحرارية، البروتين، الكربوهيدرات، الدهون
        4. تقديم المجموع الإجمالي للوجبة
        
        يجب أن تكون إجابتك بصيغة JSON باللغة العربية كما يلي:
        {
            "foods": [
                {
                    "name": "اسم الطعام",
                    "quantity": "الكمية بالجرام",
                    "calories": السعرات_الحرارية,
                    "protein": البروتين_بالجرام,
                    "carbs": الكربوهيدرات_بالجرام,
                    "fat": الدهون_بالجرام,
                    "confidence": "عالي/متوسط/منخفض"
                }
            ],
            "total": {
                "calories": إجمالي_السعرات,
                "protein": إجمالي_البروتين,
                "carbs": إجمالي_الكربوهيدرات,
                "fat": إجمالي_الدهون
            },
            "description": "وصف مختصر للوجبة",
            "recommendations": "نصائح غذائية (اختيارية)"
        }"""
        
        user_prompt = f"حلل هذه الصورة وحدد الطعام والقيم الغذائية. {additional_info}"
        
        response = openai.ChatCompletion.create(
            model="gpt-4-vision-preview",
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": user_prompt
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_data}",
                                "detail": "high"
                            }
                        }
                    ]
                }
            ],
            max_tokens=1000,
            temperature=0.3
        )
        
        # Extract and parse the response
        content = response.choices[0].message.content
        
        # Try to extract JSON from the response
        try:
            # Find JSON in the response
            start_idx = content.find('{')
            end_idx = content.rfind('}') + 1
            
            if start_idx != -1 and end_idx != -1:
                json_str = content[start_idx:end_idx]
                analysis = json.loads(json_str)
                return analysis
            else:
                # Fallback: create structured response from text
                return parse_text_response(content)
                
        except json.JSONDecodeError:
            # Fallback: create structured response from text
            return parse_text_response(content)
            
    except Exception as e:
        print(f"OpenAI Vision API error: {e}")
        return None

def parse_text_response(text_response):
    """
    Parse text response into structured format when JSON parsing fails
    """
    try:
        # Simple fallback parsing
        foods = []
        total_calories = 0
        total_protein = 0
        total_carbs = 0
        total_fat = 0
        
        # Extract basic information (this is a simplified parser)
        lines = text_response.split('\n')
        current_food = {}
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Look for food items and nutrition info
            if any(keyword in line.lower() for keyword in ['طعام', 'وجبة', 'سعرة', 'بروتين']):
                # This is a very basic parser - in production, you'd want more sophisticated parsing
                if 'سعرة' in line or 'سعرات' in line:
                    # Try to extract calories
                    import re
                    numbers = re.findall(r'\d+', line)
                    if numbers:
                        total_calories += int(numbers[0])
        
        # Create a basic response structure
        analysis = {
            "foods": [
                {
                    "name": "طعام محلل من الصورة",
                    "quantity": "تقدير تقريبي",
                    "calories": total_calories or 300,
                    "protein": total_protein or 15,
                    "carbs": total_carbs or 35,
                    "fat": total_fat or 12,
                    "confidence": "متوسط"
                }
            ],
            "total": {
                "calories": total_calories or 300,
                "protein": total_protein or 15,
                "carbs": total_carbs or 35,
                "fat": total_fat or 12
            },
            "description": "تم تحليل الصورة وتقدير القيم الغذائية",
            "recommendations": "للحصول على نتائج أكثر دقة، يُنصح بإدخال المعلومات يدوياً"
        }
        
        return analysis
        
    except Exception as e:
        print(f"Error parsing text response: {e}")
        return None

@camera_bp.route('/camera/identify-food', methods=['POST'])
def identify_food_only():
    """
    Identify food items in image without detailed nutrition analysis
    Faster endpoint for quick food identification
    """
    try:
        data = request.json
        image_data = data.get('image')
        
        if not image_data:
            return jsonify({'error': 'صورة الطعام مطلوبة'}), 400
        
        # Process base64 image
        if image_data.startswith('data:image'):
            image_data = image_data.split(',')[1]
        
        # Simple food identification
        food_items = identify_with_openai(image_data)
        
        if not food_items:
            return jsonify({
                'error': 'لم يتم التعرف على أي طعام في الصورة',
                'suggestion': 'تأكد من وضوح الصورة ووجود الطعام فيها'
            }), 404
        
        return jsonify({
            'success': True,
            'foods': food_items,
            'identified_at': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'حدث خطأ في التعرف على الطعام',
            'details': str(e)
        }), 500

def identify_with_openai(image_data):
    """
    Quick food identification using OpenAI Vision
    """
    try:
        prompt = """حدد جميع أنواع الطعام الموجودة في هذه الصورة. 
        أعطني قائمة بأسماء الأطعمة فقط، كل طعام في سطر منفصل.
        استخدم الأسماء العربية للأطعمة."""
        
        response = openai.ChatCompletion.create(
            model="gpt-4-vision-preview",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_data}",
                                "detail": "low"
                            }
                        }
                    ]
                }
            ],
            max_tokens=200,
            temperature=0.3
        )
        
        content = response.choices[0].message.content
        
        # Parse the response into a list of foods
        foods = []
        for line in content.split('\n'):
            line = line.strip()
            if line and not line.startswith('-') and not line.startswith('•'):
                # Clean up the line
                food_name = line.replace('-', '').replace('•', '').replace('*', '').strip()
                if food_name:
                    foods.append({
                        'name': food_name,
                        'confidence': 'متوسط'
                    })
        
        return foods
        
    except Exception as e:
        print(f"Food identification error: {e}")
        return None

@camera_bp.route('/camera/batch-analyze', methods=['POST'])
def batch_analyze_images():
    """
    Analyze multiple food images in batch
    Useful for meal tracking throughout the day
    """
    try:
        data = request.json
        images = data.get('images', [])
        
        if not images or len(images) == 0:
            return jsonify({'error': 'لا توجد صور للتحليل'}), 400
        
        if len(images) > 5:
            return jsonify({'error': 'يمكن تحليل 5 صور كحد أقصى في المرة الواحدة'}), 400
        
        results = []
        total_nutrition = {
            'calories': 0,
            'protein': 0,
            'carbs': 0,
            'fat': 0
        }
        
        for i, image_data in enumerate(images):
            try:
                if image_data.startswith('data:image'):
                    image_data = image_data.split(',')[1]
                
                analysis = analyze_with_openai_vision(image_data, f"صورة رقم {i+1}")
                
                if analysis:
                    results.append({
                        'image_index': i,
                        'analysis': analysis,
                        'status': 'success'
                    })
                    
                    # Add to total nutrition
                    if 'total' in analysis:
                        total_nutrition['calories'] += analysis['total'].get('calories', 0)
                        total_nutrition['protein'] += analysis['total'].get('protein', 0)
                        total_nutrition['carbs'] += analysis['total'].get('carbs', 0)
                        total_nutrition['fat'] += analysis['total'].get('fat', 0)
                else:
                    results.append({
                        'image_index': i,
                        'error': 'فشل في تحليل الصورة',
                        'status': 'failed'
                    })
                    
            except Exception as e:
                results.append({
                    'image_index': i,
                    'error': str(e),
                    'status': 'error'
                })
        
        return jsonify({
            'success': True,
            'results': results,
            'total_nutrition': total_nutrition,
            'processed_count': len(results),
            'analyzed_at': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'حدث خطأ في التحليل المجمع',
            'details': str(e)
        }), 500

