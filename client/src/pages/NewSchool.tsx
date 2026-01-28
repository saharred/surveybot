import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Loader2, School, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function NewSchool() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const [formData, setFormData] = useState({
    schoolName: "",
    principalName: "",
    academicDeputyName: "",
    administrativeDeputyName: "",
    academicYear: "2025-2026",
  });

  const createSchoolMutation = trpc.school.create.useMutation({
    onSuccess: (data) => {
      toast.success("تم إضافة المدرسة بنجاح");
      setLocation(`/schools/${data.id}`);
    },
    onError: (error) => {
      toast.error("حدث خطأ أثناء إضافة المدرسة");
      console.error(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.schoolName || !formData.principalName || !formData.academicDeputyName || !formData.administrativeDeputyName) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    createSchoolMutation.mutate(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (authLoading) {
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
        <div className="max-w-2xl mx-auto">
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
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <School className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">إضافة مدرسة جديدة</h1>
                <p className="text-gray-600">أدخل معلومات المدرسة والإدارة</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>بيانات المدرسة</CardTitle>
              <CardDescription>
                جميع الحقول مطلوبة لإنشاء الاستبيانات والتقارير
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">اسم المدرسة *</Label>
                  <Input
                    id="schoolName"
                    placeholder="مثال: مدرسة عثمان بن عفان النموذجية"
                    value={formData.schoolName}
                    onChange={(e) => handleChange("schoolName", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="academicYear">العام الأكاديمي *</Label>
                  <Input
                    id="academicYear"
                    placeholder="مثال: 2025-2026"
                    value={formData.academicYear}
                    onChange={(e) => handleChange("academicYear", e.target.value)}
                    required
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">أعضاء الإدارة</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="principalName">اسم المديرة *</Label>
                      <Input
                        id="principalName"
                        placeholder="مثال: منيرة الهاجري"
                        value={formData.principalName}
                        onChange={(e) => handleChange("principalName", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="academicDeputyName">اسم النائبة الأكاديمية *</Label>
                      <Input
                        id="academicDeputyName"
                        placeholder="مثال: مريم القضع"
                        value={formData.academicDeputyName}
                        onChange={(e) => handleChange("academicDeputyName", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="administrativeDeputyName">اسم النائبة الإدارية *</Label>
                      <Input
                        id="administrativeDeputyName"
                        placeholder="مثال: دلال الفهيدية"
                        value={formData.administrativeDeputyName}
                        onChange={(e) => handleChange("administrativeDeputyName", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    size="lg"
                    className="flex-1"
                    disabled={createSchoolMutation.isPending}
                  >
                    {createSchoolMutation.isPending ? (
                      <>
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : (
                      "حفظ المدرسة"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => setLocation("/dashboard")}
                    disabled={createSchoolMutation.isPending}
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="mt-6 bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <p className="text-sm text-blue-900">
                <strong>ملاحظة:</strong> سيتم استخدام هذه المعلومات في إنشاء العروض التقديمية
                والتقارير الرسمية. تأكد من صحة البيانات قبل الحفظ.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
