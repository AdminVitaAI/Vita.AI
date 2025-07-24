import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  TrendingUp, 
  Smartphone, 
  Users, 
  Shield, 
  Heart,
  Star,
  Check,
  ArrowRight,
  Zap
} from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: <Brain className="h-8 w-8 text-emerald-600" />,
      title: "ذكاء اصطناعي متقدم",
      description: "اكتب 'كوب حليب' وسيحسب لك السعرات تلقائياً بدقة عالية"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-emerald-600" />,
      title: "تتبع التقدم الذكي",
      description: "راقب وزنك وتقدمك الأسبوعي بتقارير مفصلة وتحليلات عميقة"
    },
    {
      icon: <Smartphone className="h-8 w-8 text-emerald-600" />,
      title: "متوافق مع جميع الأجهزة",
      description: "استخدم التطبيق على الهاتف والكمبيوتر بسلاسة تامة"
    },
    {
      icon: <Users className="h-8 w-8 text-emerald-600" />,
      title: "مجتمع داعم",
      description: "انضم لآلاف المستخدمين في رحلة الصحة والعافية"
    },
    {
      icon: <Shield className="h-8 w-8 text-emerald-600" />,
      title: "خصوصية وأمان",
      description: "بياناتك محمية بأعلى معايير الأمان والتشفير"
    },
    {
      icon: <Heart className="h-8 w-8 text-emerald-600" />,
      title: "صحة شاملة",
      description: "ليس فقط السعرات، بل نمط حياة صحي متكامل"
    }
  ];

  const testimonials = [
    {
      name: "أحمد محمد",
      role: "مهندس برمجيات",
      content: "فقدت 15 كيلو في 3 أشهر بفضل Vita.ai. التطبيق سهل جداً ومحفز!",
      rating: 5
    },
    {
      name: "فاطمة علي",
      role: "طبيبة",
      content: "أحب ميزة الذكاء الاصطناعي. لا أحتاج لحساب السعرات بنفسي.",
      rating: 5
    },
    {
      name: "محمد سالم",
      role: "مدرب رياضي",
      content: "التقارير الأسبوعية تساعدني كثيراً في متابعة تقدم عملائي.",
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: "الخطة المجانية",
      price: "0",
      period: "مجاناً للأبد",
      description: "مثالية للمبتدئين",
      features: [
        "تتبع 3 وجبات يومياً",
        "حساب السعرات الأساسي",
        "تتبع الوزن",
        "تقارير أسبوعية بسيطة"
      ],
      buttonText: "ابدأ مجاناً",
      buttonVariant: "outline",
      popular: false
    },
    {
      name: "الخطة الاحترافية",
      price: "29",
      period: "ريال/شهر",
      description: "للجادين في تحقيق أهدافهم",
      features: [
        "وجبات غير محدودة",
        "ذكاء اصطناعي متقدم",
        "تقارير مفصلة",
        "خطط وجبات مخصصة",
        "دعم فني أولوية",
        "تحليلات متقدمة"
      ],
      buttonText: "ابدأ التجربة المجانية",
      buttonVariant: "default",
      popular: true
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-emerald-100 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Vita.ai
              </span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
              <a href="#features" className="text-gray-600 hover:text-emerald-600 transition-colors">المميزات</a>
              <a href="#testimonials" className="text-gray-600 hover:text-emerald-600 transition-colors">آراء العملاء</a>
              <a href="#pricing" className="text-gray-600 hover:text-emerald-600 transition-colors">الأسعار</a>
              <Link to="/login" className="text-gray-600 hover:text-emerald-600 transition-colors">تسجيل الدخول</Link>
              <Link to="/signup">
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                  ابدأ مجاناً
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-6 bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
            <Zap className="h-4 w-4 mr-2" />
            الآن مع الذكاء الاصطناعي المتقدم
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent leading-tight">
            حياة صحية
            <br />
            <span className="text-gray-800">ذكية ومبسطة</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            تتبع نظامك الغذائي ووزنك بسهولة مع الذكاء الاصطناعي. 
            <br className="hidden md:block" />
            اكتب <span className="font-semibold text-emerald-600">"كوب حليب"</span> وسنحسب لك السعرات تلقائياً!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-lg px-8 py-6">
                ابدأ رحلتك المجانية
                <ArrowRight className="mr-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-emerald-200 hover:bg-emerald-50">
              شاهد العرض التوضيحي
            </Button>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center">
              <Check className="h-4 w-4 text-emerald-500 mr-2" />
              مجاني لمدة 30 يوم
            </div>
            <div className="flex items-center">
              <Check className="h-4 w-4 text-emerald-500 mr-2" />
              بدون بطاقة ائتمان
            </div>
            <div className="flex items-center">
              <Check className="h-4 w-4 text-emerald-500 mr-2" />
              إلغاء في أي وقت
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">لماذا Vita.ai؟</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              نحن لا نقدم مجرد تطبيق لتتبع السعرات، بل رفيق ذكي في رحلة صحتك
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-emerald-100 hover:border-emerald-200 transition-colors hover:shadow-lg">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl text-gray-800">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 bg-gradient-to-br from-emerald-50 to-teal-100">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">ماذا يقول عملاؤنا؟</h2>
            <p className="text-xl text-gray-600">آراء حقيقية من مستخدمين حققوا نتائج مذهلة</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white border-emerald-100 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <CardDescription className="text-gray-700 text-base leading-relaxed">
                    "{testimonial.content}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <CardTitle className="text-lg text-gray-800">{testimonial.name}</CardTitle>
                    <p className="text-emerald-600 text-sm">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">خطط بسيطة وواضحة</h2>
            <p className="text-xl text-gray-600">ابدأ مجاناً، وترقى عندما تحتاج المزيد</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-emerald-500 shadow-lg scale-105' : 'border-emerald-100'}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-600">
                    الأكثر شعبية
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-gray-800">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-800">{plan.price}</span>
                    <span className="text-gray-600 mr-2">{plan.period}</span>
                  </div>
                  <CardDescription className="text-gray-600 mt-2">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className="h-5 w-5 text-emerald-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/signup" className="block">
                    <Button 
                      className={`w-full ${plan.popular ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700' : ''}`}
                      variant={plan.buttonVariant}
                      size="lg"
                    >
                      {plan.buttonText}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">ابدأ رحلتك الصحية اليوم</h2>


          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            انضم لآلاف المستخدمين الذين غيروا حياتهم مع Vita.ai
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50 text-lg px-8 py-6">
              ابدأ مجاناً الآن
              <ArrowRight className="mr-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-white">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">Vita.ai</span>
          </div>
          <p className="text-gray-400">&copy; 2025 Vita.ai. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

