import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  Target, 
  TrendingUp, 
  Plus, 
  Brain, 
  Calendar,
  Flame,
  Zap,
  Award,
  Clock,
  LogOut
} from 'lucide-react';
import { useAuth } from '../App';
import MealForm from './MealForm';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [showMealForm, setShowMealForm] = useState(false);
  const [meals, setMeals] = useState([]);
  const [dailySummary, setDailySummary] = useState({
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    mealsCount: 0
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockMeals = [
      {
        id: 1,
        name: "فطور صحي",
        description: "بيضتان مسلوقتان + خبز أسمر + جبن قريش",
        mealType: "breakfast",
        calories: 350,
        protein: 25,
        carbs: 30,
        fat: 15,
        time: "08:30"
      },
      {
        id: 2,
        name: "وجبة خفيفة",
        description: "تفاحة متوسطة + حفنة لوز",
        mealType: "snack",
        calories: 180,
        protein: 6,
        carbs: 25,
        fat: 8,
        time: "11:00"
      }
    ];

    setMeals(mockMeals);
    
    // Calculate daily summary
    const summary = mockMeals.reduce((acc, meal) => ({
      totalCalories: acc.totalCalories + meal.calories,
      totalProtein: acc.totalProtein + meal.protein,
      totalCarbs: acc.totalCarbs + meal.carbs,
      totalFat: acc.totalFat + meal.fat,
      mealsCount: acc.mealsCount + 1
    }), {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      mealsCount: 0
    });

    setDailySummary(summary);
  }, []);

  const getMealTypeLabel = (type) => {
    const labels = {
      breakfast: 'فطور',
      lunch: 'غداء',
      dinner: 'عشاء',
      snack: 'وجبة خفيفة'
    };
    return labels[type] || type;
  };

  const getMealTypeIcon = (type) => {
    const icons = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙',
      snack: '🍎'
    };
    return icons[type] || '🍽️';
  };

  const caloriesProgress = user?.dailyCalories ? (dailySummary.totalCalories / user.dailyCalories) * 100 : 0;
  const remainingCalories = user?.dailyCalories ? user.dailyCalories - dailySummary.totalCalories : 0;

  const handleMealAdded = (newMeal) => {
    setMeals(prev => [...prev, { ...newMeal, id: Date.now() }]);
    setShowMealForm(false);
  };

  const deleteMeal = (mealId) => {
    setMeals(prev => prev.filter(meal => meal.id !== mealId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      {/* Header */}
      <header className="bg-white border-b border-emerald-100 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">مرحباً، {user?.name}</h1>
                <p className="text-gray-600">تتبع نظامك الغذائي وحقق أهدافك الصحية</p>
              </div>
            </div>
            <Button 
              onClick={logout}
              variant="outline" 
              className="border-emerald-200 hover:bg-emerald-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-emerald-100 bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">السعرات اليوم</CardTitle>
                <Flame className="h-6 w-6" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{dailySummary.totalCalories}</div>
              <div className="text-emerald-100 text-sm">
                الهدف: {user?.dailyCalories || 2000} سعرة
              </div>
              <Progress 
                value={caloriesProgress} 
                className="mt-3 bg-emerald-400/30" 
              />
            </CardContent>
          </Card>

          <Card className="border-emerald-100 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-800">البروتين</CardTitle>
                <Zap className="h-6 w-6 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800 mb-2">{dailySummary.totalProtein}g</div>
              <div className="text-gray-600 text-sm">الهدف: 150g</div>
            </CardContent>
          </Card>

          <Card className="border-emerald-100 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-800">الكربوهيدرات</CardTitle>
                <Target className="h-6 w-6 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800 mb-2">{dailySummary.totalCarbs}g</div>
              <div className="text-gray-600 text-sm">الهدف: 250g</div>
            </CardContent>
          </Card>

          <Card className="border-emerald-100 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-800">الدهون</CardTitle>
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800 mb-2">{dailySummary.totalFat}g</div>
              <div className="text-gray-600 text-sm">الهدف: 65g</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Meals Section */}
          <div className="lg:col-span-2">
            <Card className="border-emerald-100 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl text-gray-800 flex items-center">
                      <Calendar className="h-6 w-6 mr-3 text-emerald-600" />
                      وجباتك اليوم
                    </CardTitle>
                    <CardDescription className="text-gray-600 mt-1">
                      تتبع وجباتك وحقق أهدافك الغذائية
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => setShowMealForm(true)}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    إضافة وجبة
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-5 mb-6">
                    <TabsTrigger value="all">الكل</TabsTrigger>
                    <TabsTrigger value="breakfast">فطور</TabsTrigger>
                    <TabsTrigger value="lunch">غداء</TabsTrigger>
                    <TabsTrigger value="dinner">عشاء</TabsTrigger>
                    <TabsTrigger value="snack">خفيفة</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="space-y-4">
                    {meals.length > 0 ? (
                      meals.map((meal) => (
                        <Card key={meal.id} className="border-emerald-50 hover:border-emerald-200 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                                <div className="text-2xl">{getMealTypeIcon(meal.mealType)}</div>
                                <div>
                                  <h4 className="font-semibold text-gray-800">{meal.name}</h4>
                                  <p className="text-gray-600 text-sm">{meal.description}</p>
                                  <div className="flex items-center space-x-4 rtl:space-x-reverse mt-2">
                                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                                      {getMealTypeLabel(meal.mealType)}
                                    </Badge>
                                    <div className="flex items-center text-sm text-gray-500">
                                      <Clock className="h-4 w-4 mr-1" />
                                      {meal.time}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-gray-800">{meal.calories} سعرة</div>
                                <div className="text-sm text-gray-600">
                                  {meal.protein}g بروتين • {meal.carbs}g كربوهيدرات • {meal.fat}g دهون
                                </div>
                                <Button 
                                  onClick={() => deleteMeal(meal.id)}
                                  variant="ghost" 
                                  size="sm"
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-2"
                                >
                                  حذف
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <Card className="border-dashed border-emerald-200 bg-emerald-50/50">
                        <CardContent className="p-8 text-center">
                          <div className="text-4xl mb-4">🍽️</div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">لم تضف أي وجبة اليوم</h3>
                          <p className="text-gray-600 mb-4">ابدأ بإضافة وجبتك الأولى لتتبع تقدمك</p>
                          <Button 
                            onClick={() => setShowMealForm(true)}
                            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            إضافة وجبة
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                  
                  {/* Individual meal type tabs */}
                  {['breakfast', 'lunch', 'dinner', 'snack'].map(mealType => (
                    <TabsContent key={mealType} value={mealType} className="space-y-4">
                      {meals.filter(meal => meal.mealType === mealType).length > 0 ? (
                        meals.filter(meal => meal.mealType === mealType).map((meal) => (
                          <Card key={meal.id} className="border-emerald-50 hover:border-emerald-200 transition-colors">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                                  <div className="text-2xl">{getMealTypeIcon(meal.mealType)}</div>
                                  <div>
                                    <h4 className="font-semibold text-gray-800">{meal.name}</h4>
                                    <p className="text-gray-600 text-sm">{meal.description}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-gray-800">{meal.calories} سعرة</div>
                                  <div className="text-sm text-gray-600">
                                    {meal.protein}g بروتين • {meal.carbs}g كربوهيدرات • {meal.fat}g دهون
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <Card className="border-dashed border-emerald-200 bg-emerald-50/50">
                          <CardContent className="p-8 text-center">
                            <div className="text-4xl mb-4">{getMealTypeIcon(mealType)}</div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                              لم تضف وجبة {getMealTypeLabel(mealType)} اليوم
                            </h3>
                            <p className="text-gray-600 mb-4">أضف وجبة {getMealTypeLabel(mealType)} لتتبع تقدمك</p>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
            <Card className="border-emerald-100 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800 flex items-center">
                  <Award className="h-5 w-5 mr-2 text-emerald-600" />
                  تقدمك اليوم
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">السعرات الحرارية</span>
                    <span className="font-semibold text-gray-800">
                      {dailySummary.totalCalories} / {user?.dailyCalories || 2000}
                    </span>
                  </div>
                  <Progress value={caloriesProgress} className="h-2" />
                  <div className="text-xs text-gray-500 mt-1">
                    {remainingCalories > 0 ? `متبقي ${remainingCalories} سعرة` : 'تم تجاوز الهدف!'}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-emerald-100">
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">{dailySummary.totalProtein}g</div>
                    <div className="text-xs text-gray-600">بروتين</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{dailySummary.totalCarbs}g</div>
                    <div className="text-xs text-gray-600">كربوهيدرات</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">{dailySummary.totalFat}g</div>
                    <div className="text-xs text-gray-600">دهون</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Tips Card */}
            <Card className="border-emerald-100 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800 flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-emerald-600" />
                  نصائح ذكية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-white rounded-lg border border-emerald-100">
                  <div className="flex items-start space-x-3 rtl:space-x-reverse">
                    <div className="text-green-500 text-lg">✅</div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">ممتاز!</p>
                      <p className="text-xs text-gray-600">أنت على الطريق الصحيح لتحقيق هدفك اليومي</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-emerald-100">
                  <div className="flex items-start space-x-3 rtl:space-x-reverse">
                    <div className="text-blue-500 text-lg">💡</div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">نصيحة</p>
                      <p className="text-xs text-gray-600">حاول إضافة المزيد من البروتين في وجبتك القادمة</p>
                    </div>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full border-emerald-200 hover:bg-emerald-50"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  المزيد من النصائح
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Meal Form Modal */}
      {showMealForm && (
        <MealForm
          onMealAdded={handleMealAdded}
          onClose={() => setShowMealForm(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;

