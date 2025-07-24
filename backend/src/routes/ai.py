from flask import Blueprint, jsonify, request, session
import openai
import json
import re

ai_bp = Blueprint('ai', __name__)

def analyze_food_with_ai(food_name, food_description):
    """
    Use OpenAI to analyze food and estimate nutritional values
    """
    try:
        prompt = f"""
        أنت خبير تغذية متخصص. قم بتحليل الطعام التالي وتقدير القيم الغذائية بدقة:

        اسم الطعام: {food_name}
        وصف الطعام: {food_description}

        يرجى تقدير القيم الغذائية التالية وإرجاعها في صيغة JSON فقط:
        {{
            "calories": [عدد السعرات الحرارية],
            "protein": [البروتين بالجرام],
            "carbs": [الكربوهيدرات بالجرام],
            "fat": [الدهون بالجرام],
            "confidence": [مستوى الثقة من 1-10],
            "notes": "[ملاحظات إضافية باللغة العربية]"
        }}

        تأكد من أن التقديرات واقعية ومبنية على الكميات المذكورة في الوصف.
        """

        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "أنت خبير تغذية متخصص في تحليل الأطعمة وتقدير القيم الغذائية بدقة."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=300,
            temperature=0.3
        )

        # Extract JSON from response
        content = response.choices[0].message.content.strip()
        
        # Try to extract JSON from the response
        json_match = re.search(r'\{.*\}', content, re.DOTALL)
        if json_match:
            json_str = json_match.group()
            nutrition_data = json.loads(json_str)
            
            # Validate and clean the data
            return {
                'calories': max(0, float(nutrition_data.get('calories', 0))),
                'protein': max(0, float(nutrition_data.get('protein', 0))),
                'carbs': max(0, float(nutrition_data.get('carbs', 0))),
                'fat': max(0, float(nutrition_data.get('fat', 0))),
                'confidence': min(10, max(1, int(nutrition_data.get('confidence', 5)))),
                'notes': nutrition_data.get('notes', '')
            }
        else:
            # Fallback if JSON parsing fails
            return estimate_nutrition_fallback(food_name, food_description)
            
    except Exception as e:
        print(f"AI analysis error: {e}")
        return estimate_nutrition_fallback(food_name, food_description)

def estimate_nutrition_fallback(food_name, food_description):
    """
    Fallback nutrition estimation based on common foods
    """
    # Simple keyword-based estimation
    calories = 200  # Default
    protein = 10
    carbs = 25
    fat = 8
    
    description_lower = food_description.lower()
    name_lower = food_name.lower()
    
    # Adjust based on keywords
    if any(word in description_lower for word in ['كوب', 'cup']):
        if any(word in description_lower for word in ['حليب', 'milk', 'لبن']):
            calories = 150
            protein = 8
            carbs = 12
            fat = 8
        elif any(word in description_lower for word in ['قهوة', 'coffee']):
            calories = 50
            protein = 1
            carbs = 8
            fat = 2
        elif any(word in description_lower for word in ['عصير', 'juice']):
            calories = 120
            protein = 1
            carbs = 30
            fat = 0
    
    if any(word in description_lower for word in ['دجاج', 'chicken']):
        calories += 100
        protein += 15
    
    if any(word in description_lower for word in ['أرز', 'rice']):
        calories += 80
        carbs += 20
    
    if any(word in description_lower for word in ['خبز', 'bread']):
        calories += 70
        carbs += 15
        protein += 3
    
    return {
        'calories': calories,
        'protein': protein,
        'carbs': carbs,
        'fat': fat,
        'confidence': 6,
        'notes': 'تقدير تلقائي بناءً على الكلمات المفتاحية'
    }

@ai_bp.route('/ai/analyze-food', methods=['POST'])
def analyze_food():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'غير مسجل الدخول'}), 401
    
    try:
        data = request.json
        food_name = data.get('name', '').strip()
        food_description = data.get('description', '').strip()
        
        if not food_name or not food_description:
            return jsonify({'error': 'اسم الطعام والوصف مطلوبان'}), 400
        
        # Analyze with AI
        nutrition_data = analyze_food_with_ai(food_name, food_description)
        
        return jsonify({
            'success': True,
            'nutrition': nutrition_data,
            'message': 'تم تحليل الطعام بنجاح'
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'حدث خطأ في تحليل الطعام'}), 500

@ai_bp.route('/ai/suggest-meals', methods=['POST'])
def suggest_meals():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'غير مسجل الدخول'}), 401
    
    try:
        from src.models.user import User
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'المستخدم غير موجود'}), 404
        
        data = request.json
        meal_type = data.get('meal_type', 'lunch')
        dietary_preferences = data.get('preferences', [])
        
        # Calculate remaining calories for the day
        daily_goal = user.calculate_daily_calories()
        
        # Get today's meals to calculate remaining calories
        from datetime import date
        from src.models.user import Meal
        today_meals = Meal.query.filter_by(user_id=user_id, meal_date=date.today()).all()
        consumed_calories = sum(meal.calories for meal in today_meals)
        remaining_calories = max(200, daily_goal - consumed_calories)
        
        prompt = f"""
        أنت خبير تغذية. اقترح 3 وجبات صحية مناسبة للمعايير التالية:

        نوع الوجبة: {meal_type}
        السعرات المتبقية: {remaining_calories}
        هدف المستخدم: {user.goal}
        مستوى النشاط: {user.activity_level}
        التفضيلات الغذائية: {', '.join(dietary_preferences) if dietary_preferences else 'لا توجد'}

        أرجع النتيجة في صيغة JSON:
        {{
            "suggestions": [
                {{
                    "name": "اسم الوجبة",
                    "description": "وصف مفصل للوجبة والمكونات",
                    "estimated_calories": عدد السعرات,
                    "benefits": "فوائد هذه الوجبة",
                    "preparation_time": "وقت التحضير بالدقائق"
                }}
            ]
        }}
        """

        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "أنت خبير تغذية متخصص في اقتراح وجبات صحية."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=800,
            temperature=0.7
        )

        content = response.choices[0].message.content.strip()
        
        # Try to extract JSON
        json_match = re.search(r'\{.*\}', content, re.DOTALL)
        if json_match:
            json_str = json_match.group()
            suggestions_data = json.loads(json_str)
            
            return jsonify({
                'success': True,
                'suggestions': suggestions_data.get('suggestions', []),
                'remaining_calories': remaining_calories,
                'message': 'تم إنشاء اقتراحات الوجبات بنجاح'
            }), 200
        else:
            # Fallback suggestions
            fallback_suggestions = [
                {
                    "name": "سلطة الدجاج المشوي",
                    "description": "صدر دجاج مشوي + خضار ورقية + طماطم + خيار + زيت زيتون",
                    "estimated_calories": min(400, remaining_calories // 2),
                    "benefits": "غنية بالبروتين والفيتامينات",
                    "preparation_time": "15 دقيقة"
                },
                {
                    "name": "شوفان بالفواكه",
                    "description": "نصف كوب شوفان + موز + توت + ملعقة عسل",
                    "estimated_calories": min(300, remaining_calories // 3),
                    "benefits": "غنية بالألياف والطاقة الطبيعية",
                    "preparation_time": "5 دقائق"
                }
            ]
            
            return jsonify({
                'success': True,
                'suggestions': fallback_suggestions,
                'remaining_calories': remaining_calories,
                'message': 'تم إنشاء اقتراحات الوجبات بنجاح'
            }), 200
        
    except Exception as e:
        print(f"Meal suggestion error: {e}")
        return jsonify({'error': 'حدث خطأ في اقتراح الوجبات'}), 500

@ai_bp.route('/ai/nutrition-tips', methods=['GET'])
def get_nutrition_tips():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'غير مسجل الدخول'}), 401
    
    try:
        from src.models.user import User
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'المستخدم غير موجود'}), 404
        
        # Get user's recent eating patterns
        from datetime import date, timedelta
        from src.models.user import Meal
        
        last_week = date.today() - timedelta(days=7)
        recent_meals = Meal.query.filter(
            Meal.user_id == user_id,
            Meal.meal_date >= last_week
        ).all()
        
        avg_calories = sum(meal.calories for meal in recent_meals) / max(1, len(recent_meals))
        daily_goal = user.calculate_daily_calories()
        
        # Generate personalized tips
        tips = []
        
        if avg_calories < daily_goal * 0.8:
            tips.append({
                "type": "warning",
                "title": "زيادة السعرات الحرارية",
                "message": "أنت تتناول سعرات أقل من المطلوب. تأكد من تناول وجبات منتظمة."
            })
        elif avg_calories > daily_goal * 1.2:
            tips.append({
                "type": "info",
                "title": "تقليل السعرات",
                "message": "حاول تقليل أحجام الوجبات أو اختيار أطعمة أقل في السعرات."
            })
        
        if user.goal == 'lose_weight':
            tips.append({
                "type": "success",
                "title": "نصيحة لفقدان الوزن",
                "message": "اشرب الماء قبل الوجبات وركز على البروتين والخضار."
            })
        
        tips.append({
            "type": "info",
            "title": "نصيحة عامة",
            "message": "تناول 5 حصص من الفواكه والخضار يومياً لصحة أفضل."
        })
        
        return jsonify({
            'success': True,
            'tips': tips,
            'user_stats': {
                'avg_daily_calories': round(avg_calories, 1),
                'daily_goal': daily_goal,
                'goal': user.goal
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'حدث خطأ في جلب النصائح'}), 500

