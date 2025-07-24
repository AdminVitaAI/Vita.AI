from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    
    # Health information
    age = db.Column(db.Integer)
    height = db.Column(db.Float)  # in cm
    weight = db.Column(db.Float)  # in kg
    goal = db.Column(db.String(50))  # lose_weight, gain_weight, maintain_weight, etc.
    activity_level = db.Column(db.String(50))  # sedentary, light, moderate, active, very_active
    
    # Subscription info
    plan = db.Column(db.String(20), default='free')  # free, pro
    subscription_end = db.Column(db.DateTime)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    meals = db.relationship('Meal', backref='user', lazy=True, cascade='all, delete-orphan')
    weight_logs = db.relationship('WeightLog', backref='user', lazy=True, cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def calculate_bmr(self):
        """Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation"""
        if not all([self.age, self.height, self.weight]):
            return None
        
        # Assuming average gender distribution, using male formula as default
        # BMR = 10 * weight(kg) + 6.25 * height(cm) - 5 * age(years) + 5
        bmr = 10 * self.weight + 6.25 * self.height - 5 * self.age + 5
        return bmr

    def calculate_daily_calories(self):
        """Calculate daily calorie needs based on activity level"""
        bmr = self.calculate_bmr()
        if not bmr:
            return None
        
        activity_multipliers = {
            'sedentary': 1.2,
            'light': 1.375,
            'moderate': 1.55,
            'active': 1.725,
            'very_active': 1.9
        }
        
        multiplier = activity_multipliers.get(self.activity_level, 1.2)
        daily_calories = bmr * multiplier
        
        # Adjust based on goal
        if self.goal == 'lose_weight':
            daily_calories -= 500  # 500 calorie deficit for ~1 lb/week loss
        elif self.goal == 'gain_weight':
            daily_calories += 500  # 500 calorie surplus for weight gain
        
        return int(daily_calories)

    def __repr__(self):
        return f'<User {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'age': self.age,
            'height': self.height,
            'weight': self.weight,
            'goal': self.goal,
            'activity_level': self.activity_level,
            'plan': self.plan,
            'daily_calories': self.calculate_daily_calories(),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Meal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    meal_type = db.Column(db.String(50), nullable=False)  # breakfast, lunch, dinner, snack
    
    # Nutritional information
    calories = db.Column(db.Float, default=0)
    protein = db.Column(db.Float, default=0)  # in grams
    carbs = db.Column(db.Float, default=0)    # in grams
    fat = db.Column(db.Float, default=0)      # in grams
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    meal_date = db.Column(db.Date, default=datetime.utcnow().date)

    def __repr__(self):
        return f'<Meal {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'meal_type': self.meal_type,
            'calories': self.calories,
            'protein': self.protein,
            'carbs': self.carbs,
            'fat': self.fat,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'meal_date': self.meal_date.isoformat() if self.meal_date else None,
            'time': self.created_at.strftime('%H:%M') if self.created_at else None
        }


class WeightLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    weight = db.Column(db.Float, nullable=False)  # in kg
    log_date = db.Column(db.Date, default=datetime.utcnow().date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<WeightLog {self.weight}kg on {self.log_date}>'

    def to_dict(self):
        return {
            'id': self.id,
            'weight': self.weight,
            'log_date': self.log_date.isoformat() if self.log_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

