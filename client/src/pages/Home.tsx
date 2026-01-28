import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { BarChart3, FileText, Brain, TrendingUp, School, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                مرحباً بك في منصة تحليل الاستبيانات التعليمية
              </h1>
              <p className="text-xl text-gray-600">
                {user?.name ? `أهلاً ${user.name}` : "أهلاً بك"}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Link href="/dashboard">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <School className="w-6 h-6 text-primary" />
                      لوحة التحكم
                    </CardTitle>
                    <CardDescription>
                      إدارة المدارس والاستبيانات والتحليلات
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      الوصول إلى جميع مدارسك واستبياناتك ونتائج التحليلات
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/schools/new">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <School className="w-6 h-6 text-primary" />
                      إضافة مدرسة جديدة
                    </CardTitle>
                    <CardDescription>
                      ابدأ بإضافة بيانات مدرستك
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      أدخل معلومات المدرسة والإدارة لإنشاء استبيانات مخصصة
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    تحليل إحصائي متقدم
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    حساب النسب المئوية والمتوسطات والانحراف المعياري لكل سؤال
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Brain className="w-5 h-5 text-purple-600" />
                    تفسير تربوي ذكي
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    تحليل تربوي احترافي مدعوم بالذكاء الاصطناعي لكل نتيجة
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="w-5 h-5 text-green-600" />
                    عروض وتقارير احترافية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    إنشاء عروض تقديمية وتقارير تفسيرية جاهزة للطباعة
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container py-16">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-block mb-6 px-4 py-2 bg-primary/10 rounded-full">
              <span className="text-primary font-semibold">منصة تحليل الاستبيانات التعليمية</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              حوّل بيانات استبياناتك إلى
              <span className="text-primary"> قرارات تربوية</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              منصة متكاملة لإنشاء الاستبيانات التعليمية، جمع الإجابات، وتحليلها إحصائياً وتربوياً
              بواسطة الذكاء الاصطناعي، مع إنشاء عروض تقديمية وتقارير احترافية تلقائياً
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" asChild className="text-lg px-8">
                <a href={getLoginUrl()}>
                  ابدأ الآن
                  <ArrowLeft className="mr-2 h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <Card className="border-2">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <School className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>إدارة متعددة المدارس</CardTitle>
                <CardDescription>
                  دعم إدخال بيانات مدارس مختلفة مع معلومات الإدارة الكاملة
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>أنواع أسئلة متنوعة</CardTitle>
                <CardDescription>
                  دعم الاختيار المتعدد، مقياس ليكرت، الأسئلة النصية، والتقييمات
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>تحليل إحصائي شامل</CardTitle>
                <CardDescription>
                  حساب النسب المئوية، المتوسطات، الانحراف المعياري، وتوزيع التكرارات
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle>تفسير تربوي ذكي</CardTitle>
                <CardDescription>
                  تحليل تربوي متخصص لكل سؤال مع رؤى تعليمية قابلة للتطبيق
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle>عروض تقديمية احترافية</CardTitle>
                <CardDescription>
                  إنشاء عروض تقديمية HTML/PDF تلقائياً مع الشعارات والبيانات الرسمية
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-pink-600" />
                </div>
                <CardTitle>تقارير تفسيرية مفصلة</CardTitle>
                <CardDescription>
                  تقارير شاملة تتضمن نقاط القوة، التحسين، والمقترحات العملية
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-primary/5 rounded-2xl p-12 border-2 border-primary/20">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              جاهز لتحويل بياناتك إلى قرارات؟
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              انضم إلى المنصة الآن وابدأ في إنشاء استبياناتك التعليمية
            </p>
            <Button size="lg" asChild className="text-lg px-8">
              <a href={getLoginUrl()}>
                ابدأ مجاناً
                <ArrowLeft className="mr-2 h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
