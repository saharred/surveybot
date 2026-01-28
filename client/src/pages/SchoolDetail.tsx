import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Loader2, School, ArrowRight, Plus, FileText, Users, BarChart3 } from "lucide-react";
import { useLocation, useParams } from "wouter";

export default function SchoolDetail() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams<{ schoolId: string }>();
  const schoolId = params.schoolId ? parseInt(params.schoolId) : 0;

  const { data: school, isLoading: schoolLoading } = trpc.school.getById.useQuery(
    { schoolId },
    { enabled: schoolId > 0 && isAuthenticated }
  );

  const { data: surveys, isLoading: surveysLoading } = trpc.survey.list.useQuery(
    { schoolId },
    { enabled: schoolId > 0 && isAuthenticated }
  );

  if (authLoading || schoolLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  if (!school) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">المدرسة غير موجودة</h2>
          <Button onClick={() => setLocation("/dashboard")}>العودة إلى لوحة التحكم</Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      draft: { label: "مسودة", variant: "secondary" as const },
      active: { label: "نشط", variant: "default" as const },
      closed: { label: "مغلق", variant: "outline" as const },
      analyzed: { label: "تم التحليل", variant: "default" as const },
    };
    const config = statusMap[status as keyof typeof statusMap] || statusMap.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => setLocation("/dashboard")}
              className="mb-4"
            >
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة إلى لوحة التحكم
            </Button>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                  <School className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">{school.schoolName}</h1>
                  <p className="text-gray-600">العام الأكاديمي: {school.academicYear}</p>
                </div>
              </div>
              <Button size="lg" onClick={() => setLocation(`/schools/${schoolId}/surveys/new`)}>
                <Plus className="ml-2 h-5 w-5" />
                إنشاء استبيان جديد
              </Button>
            </div>
          </div>

          {/* School Info */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>معلومات الإدارة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">المديرة</p>
                  <p className="text-lg font-medium">{school.principalName}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">النائبة الأكاديمية</p>
                  <p className="text-lg font-medium">{school.academicDeputyName}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">النائبة الإدارية</p>
                  <p className="text-lg font-medium">{school.administrativeDeputyName}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Surveys List */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">الاستبيانات</h2>
          </div>

          {surveysLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !surveys || surveys.length === 0 ? (
            <Card className="text-center py-12">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">لا توجد استبيانات بعد</CardTitle>
                <CardDescription className="text-lg">
                  ابدأ بإنشاء استبيانك الأول لهذه المدرسة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button size="lg" onClick={() => setLocation(`/schools/${schoolId}/surveys/new`)}>
                  <Plus className="ml-2 h-5 w-5" />
                  إنشاء استبيان
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {surveys.map((survey) => (
                <Card
                  key={survey.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary"
                  onClick={() => setLocation(`/surveys/${survey.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      {getStatusBadge(survey.status)}
                    </div>
                    <CardTitle className="text-xl">{survey.title}</CardTitle>
                    {survey.description && (
                      <CardDescription className="line-clamp-2">{survey.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {survey.targetAudience && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>الفئة المستهدفة: {survey.targetAudience}</span>
                        </div>
                      )}
                      <div className="text-muted-foreground">
                        تاريخ الإنشاء: {new Date(survey.createdAt).toLocaleDateString("ar-SA")}
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocation(`/surveys/${survey.id}`);
                        }}
                      >
                        <FileText className="ml-2 h-4 w-4" />
                        عرض التفاصيل
                      </Button>
                      {survey.status === "closed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLocation(`/surveys/${survey.id}/analysis`);
                          }}
                        >
                          <BarChart3 className="ml-2 h-4 w-4" />
                          التحليل
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
