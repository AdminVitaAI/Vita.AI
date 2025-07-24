from flask import Blueprint, jsonify, request, session
from src.models.user import User, WeightLog, db
from datetime import datetime, date

user_bp = Blueprint('user', __name__)

@user_bp.route('/users/register', methods=['POST'])
def register():
    try:
        data = request.json
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'البريد الإلكتروني مستخدم بالفعل'}), 400
        
        # Create new user
        user = User(
            name=data['name'],
            email=data['email'],
            age=data.get('age'),
            height=data.get('height'),
            weight=data.get('weight'),
            goal=data.get('goal'),
            activity_level=data.get('activity_level'),
            plan='free'
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Log initial weight if provided
        if data.get('weight'):
            weight_log = WeightLog(
                user_id=user.id,
                weight=data['weight']
            )
            db.session.add(weight_log)
            db.session.commit()
        
        # Set session
        session['user_id'] = user.id
        
        return jsonify({
            'message': 'تم إنشاء الحساب بنجاح',
            'user': user.to_dict(),
            'token': f'session_{user.id}'  # Simple token for frontend
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ في إنشاء الحساب'}), 500

@user_bp.route('/users/login', methods=['POST'])
def login():
    try:
        data = request.json
        user = User.query.filter_by(email=data['email']).first()
        
        if user and user.check_password(data['password']):
            session['user_id'] = user.id
            return jsonify({
                'message': 'تم تسجيل الدخول بنجاح',
                'user': user.to_dict(),
                'token': f'session_{user.id}'  # Simple token for frontend
            }), 200
        else:
            return jsonify({'error': 'البريد الإلكتروني أو كلمة المرور غير صحيحة'}), 401
            
    except Exception as e:
        return jsonify({'error': 'حدث خطأ في تسجيل الدخول'}), 500

@user_bp.route('/auth/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'تم تسجيل الخروج بنجاح'}), 200

@user_bp.route('/auth/me', methods=['GET'])
def get_current_user():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'غير مسجل الدخول'}), 401
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'المستخدم غير موجود'}), 404
    
    return jsonify(user.to_dict()), 200

@user_bp.route('/users/profile', methods=['PUT'])
def update_profile():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'غير مسجل الدخول'}), 401
    
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'المستخدم غير موجود'}), 404
        
        data = request.json
        
        # Update user fields
        if 'name' in data:
            user.name = data['name']
        if 'age' in data:
            user.age = data['age']
        if 'height' in data:
            user.height = data['height']
        if 'weight' in data:
            user.weight = data['weight']
            # Log new weight
            weight_log = WeightLog(
                user_id=user.id,
                weight=data['weight']
            )
            db.session.add(weight_log)
        if 'goal' in data:
            user.goal = data['goal']
        if 'activity_level' in data:
            user.activity_level = data['activity_level']
        
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'تم تحديث الملف الشخصي بنجاح',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ في تحديث الملف الشخصي'}), 500

@user_bp.route('/users/weight', methods=['POST'])
def log_weight():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'غير مسجل الدخول'}), 401
    
    try:
        data = request.json
        weight = data.get('weight')
        
        if not weight:
            return jsonify({'error': 'الوزن مطلوب'}), 400
        
        # Check if weight already logged today
        today = date.today()
        existing_log = WeightLog.query.filter_by(
            user_id=user_id,
            log_date=today
        ).first()
        
        if existing_log:
            existing_log.weight = weight
            existing_log.created_at = datetime.utcnow()
        else:
            weight_log = WeightLog(
                user_id=user_id,
                weight=weight,
                log_date=today
            )
            db.session.add(weight_log)
        
        # Update user's current weight
        user = User.query.get(user_id)
        user.weight = weight
        user.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'تم تسجيل الوزن بنجاح',
            'weight_log': weight_log.to_dict() if not existing_log else existing_log.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ في تسجيل الوزن'}), 500

@user_bp.route('/users/weight-history', methods=['GET'])
def get_weight_history():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'غير مسجل الدخول'}), 401
    
    try:
        weight_logs = WeightLog.query.filter_by(user_id=user_id)\
                                   .order_by(WeightLog.log_date.desc())\
                                   .limit(30).all()
        
        return jsonify([log.to_dict() for log in weight_logs]), 200
        
    except Exception as e:
        return jsonify({'error': 'حدث خطأ في جلب تاريخ الوزن'}), 500

@user_bp.route('/users/stats', methods=['GET'])
def get_user_stats():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'غير مسجل الدخول'}), 401
    
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'المستخدم غير موجود'}), 404
        
        # Get today's meals
        today = date.today()
        from src.models.user import Meal
        today_meals = Meal.query.filter_by(user_id=user_id, meal_date=today).all()
        
        # Calculate today's totals
        total_calories = sum(meal.calories for meal in today_meals)
        total_protein = sum(meal.protein for meal in today_meals)
        total_carbs = sum(meal.carbs for meal in today_meals)
        total_fat = sum(meal.fat for meal in today_meals)
        
        # Get weight progress
        weight_logs = WeightLog.query.filter_by(user_id=user_id)\
                                   .order_by(WeightLog.log_date.desc())\
                                   .limit(2).all()
        
        weight_change = 0
        if len(weight_logs) >= 2:
            weight_change = weight_logs[0].weight - weight_logs[1].weight
        
        return jsonify({
            'daily_calories_goal': user.calculate_daily_calories(),
            'today_calories': total_calories,
            'today_protein': total_protein,
            'today_carbs': total_carbs,
            'today_fat': total_fat,
            'current_weight': user.weight,
            'weight_change': weight_change,
            'meals_count': len(today_meals)
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'حدث خطأ في جلب الإحصائيات'}), 500

