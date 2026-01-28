import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { School, Plus, FileText, BarChart3, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { getLoginUrl } from "@/const";

export default function Dashboard() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const { data: schools, isLoading: schoolsLoading } = trpc.school.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (authLoading || schoolsLoading) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">لوحة التحكم</h1>
              <p className="text-gray-600">مرحباً {user?.name || "بك"}</p>
            </div>
            <Button asChild size="lg">
              <Link href="/schools/new">
                <Plus className="ml-2 h-5 w-5" />
                إضافة مدرسة جديدة
              </Link>
            </Button>
          </div>
        </div>

        {/* Schools List */}
        {!schools || schools.length === 0 ? (
          <Card className="text-center py-12">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <School className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">لا توجد مدارس بعد</CardTitle>
              <CardDescription className="text-lg">
                ابدأ بإضافة مدرستك الأولى لإنشاء الاستبيانات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="lg">
                <Link href="/schools/new">
                  <Plus className="ml-2 h-5 w-5" />
                  إضافة مدرسة
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schools.map((school) => (
              <Card
                key={school.id}
                className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary"
                onClick={() => setLocation(`/schools/${school.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <School className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-xl">{school.schoolName}</CardTitle>
                  <CardDescription>العام الأكاديمي: {school.academicYear}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-semibold text-gray-700">المديرة:</span>{" "}
                      <span className="text-gray-600">{school.principalName}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">النائبة الأكاديمية:</span>{" "}
                      <span className="text-gray-600">{school.academicDeputyName}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">النائبة الإدارية:</span>{" "}
                      <span className="text-gray-600">{school.administrativeDeputyName}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(`/schools/${school.id}/surveys`);
                      }}
                    >
                      <FileText className="ml-2 h-4 w-4" />
                      الاستبيانات
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(`/schools/${school.id}/surveys/new`);
                      }}
                    >
                      <Plus className="ml-2 h-4 w-4" />
                      استبيان جديد
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        {schools && schools.length > 0 && (
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  إجمالي المدارس
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{schools.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  الاستبيانات النشطة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">-</div>
                <p className="text-xs text-muted-foreground mt-1">قريباً</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  التحليلات المكتملة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">-</div>
                <p className="text-xs text-muted-foreground mt-1">قريباً</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
