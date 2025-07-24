from flask import Blueprint, jsonify, request, session
from src.models.user import User, Meal, db
from datetime import datetime, date

meals_bp = Blueprint('meals', __name__)

@meals_bp.route('/meals', methods=['GET'])
def get_meals():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'غير مسجل الدخول'}), 401
    
    try:
        # Get date from query params, default to today
        meal_date = request.args.get('date')
        if meal_date:
            meal_date = datetime.strptime(meal_date, '%Y-%m-%d').date()
        else:
            meal_date = date.today()
        
        meals = Meal.query.filter_by(user_id=user_id, meal_date=meal_date)\
                         .order_by(Meal.created_at.desc()).all()
        
        return jsonify([meal.to_dict() for meal in meals]), 200
        
    except Exception as e:
        return jsonify({'error': 'حدث خطأ في جلب الوجبات'}), 500

@meals_bp.route('/meals', methods=['POST'])
def add_meal():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'غير مسجل الدخول'}), 401
    
    try:
        data = request.json
        
        # Validate required fields
        if not data.get('name') or not data.get('description'):
            return jsonify({'error': 'اسم الوجبة والوصف مطلوبان'}), 400
        
        meal = Meal(
            user_id=user_id,
            name=data['name'],
            description=data['description'],
            meal_type=data.get('meal_type', 'snack'),
            calories=data.get('calories', 0),
            protein=data.get('protein', 0),
            carbs=data.get('carbs', 0),
            fat=data.get('fat', 0),
            meal_date=date.today()
        )
        
        db.session.add(meal)
        db.session.commit()
        
        return jsonify({
            'message': 'تم إضافة الوجبة بنجاح',
            'meal': meal.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ في إضافة الوجبة'}), 500

@meals_bp.route('/meals/<int:meal_id>', methods=['PUT'])
def update_meal(meal_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'غير مسجل الدخول'}), 401
    
    try:
        meal = Meal.query.filter_by(id=meal_id, user_id=user_id).first()
        if not meal:
            return jsonify({'error': 'الوجبة غير موجودة'}), 404
        
        data = request.json
        
        # Update meal fields
        if 'name' in data:
            meal.name = data['name']
        if 'description' in data:
            meal.description = data['description']
        if 'meal_type' in data:
            meal.meal_type = data['meal_type']
        if 'calories' in data:
            meal.calories = data['calories']
        if 'protein' in data:
            meal.protein = data['protein']
        if 'carbs' in data:
            meal.carbs = data['carbs']
        if 'fat' in data:
            meal.fat = data['fat']
        
        db.session.commit()
        
        return jsonify({
            'message': 'تم تحديث الوجبة بنجاح',
            'meal': meal.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ في تحديث الوجبة'}), 500

@meals_bp.route('/meals/<int:meal_id>', methods=['DELETE'])
def delete_meal(meal_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'غير مسجل الدخول'}), 401
    
    try:
        meal = Meal.query.filter_by(id=meal_id, user_id=user_id).first()
        if not meal:
            return jsonify({'error': 'الوجبة غير موجودة'}), 404
        
        db.session.delete(meal)
        db.session.commit()
        
        return jsonify({'message': 'تم حذف الوجبة بنجاح'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ في حذف الوجبة'}), 500

@meals_bp.route('/meals/daily-summary', methods=['GET'])
def get_daily_summary():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'غير مسجل الدخول'}), 401
    
    try:
        # Get date from query params, default to today
        meal_date = request.args.get('date')
        if meal_date:
            meal_date = datetime.strptime(meal_date, '%Y-%m-%d').date()
        else:
            meal_date = date.today()
        
        meals = Meal.query.filter_by(user_id=user_id, meal_date=meal_date).all()
        
        # Calculate totals
        total_calories = sum(meal.calories for meal in meals)
        total_protein = sum(meal.protein for meal in meals)
        total_carbs = sum(meal.carbs for meal in meals)
        total_fat = sum(meal.fat for meal in meals)
        
        # Group meals by type
        meals_by_type = {
            'breakfast': [],
            'lunch': [],
            'dinner': [],
            'snack': []
        }
        
        for meal in meals:
            if meal.meal_type in meals_by_type:
                meals_by_type[meal.meal_type].append(meal.to_dict())
        
        # Get user's daily calorie goal
        user = User.query.get(user_id)
        daily_goal = user.calculate_daily_calories() if user else 2000
        
        return jsonify({
            'date': meal_date.isoformat(),
            'total_calories': total_calories,
            'total_protein': total_protein,
            'total_carbs': total_carbs,
            'total_fat': total_fat,
            'daily_goal': daily_goal,
            'progress_percentage': (total_calories / daily_goal * 100) if daily_goal > 0 else 0,
            'meals_by_type': meals_by_type,
            'meals_count': len(meals)
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'حدث خطأ في جلب ملخص اليوم'}), 500

@meals_bp.route('/meals/weekly-summary', methods=['GET'])
def get_weekly_summary():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'غير مسجل الدخول'}), 401
    
    try:
        from datetime import timedelta
        
        # Get the last 7 days
        end_date = date.today()
        start_date = end_date - timedelta(days=6)
        
        meals = Meal.query.filter(
            Meal.user_id == user_id,
            Meal.meal_date >= start_date,
            Meal.meal_date <= end_date
        ).all()
        
        # Group by date
        daily_summaries = {}
        for i in range(7):
            current_date = start_date + timedelta(days=i)
            daily_summaries[current_date.isoformat()] = {
                'date': current_date.isoformat(),
                'calories': 0,
                'protein': 0,
                'carbs': 0,
                'fat': 0,
                'meals_count': 0
            }
        
        for meal in meals:
            date_key = meal.meal_date.isoformat()
            if date_key in daily_summaries:
                daily_summaries[date_key]['calories'] += meal.calories
                daily_summaries[date_key]['protein'] += meal.protein
                daily_summaries[date_key]['carbs'] += meal.carbs
                daily_summaries[date_key]['fat'] += meal.fat
                daily_summaries[date_key]['meals_count'] += 1
        
        # Calculate weekly averages
        total_days = len(daily_summaries)
        avg_calories = sum(day['calories'] for day in daily_summaries.values()) / total_days
        avg_protein = sum(day['protein'] for day in daily_summaries.values()) / total_days
        avg_carbs = sum(day['carbs'] for day in daily_summaries.values()) / total_days
        avg_fat = sum(day['fat'] for day in daily_summaries.values()) / total_days
        
        return jsonify({
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
            'daily_summaries': list(daily_summaries.values()),
            'weekly_averages': {
                'calories': round(avg_calories, 1),
                'protein': round(avg_protein, 1),
                'carbs': round(avg_carbs, 1),
                'fat': round(avg_fat, 1)
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'حدث خطأ في جلب ملخص الأسبوع'}), 500

