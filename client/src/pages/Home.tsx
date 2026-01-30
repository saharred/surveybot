import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, FileSpreadsheet, AlertTriangle, CheckCircle2, BarChart3, FileText, Image } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        toast.error("يرجى اختيار ملف Excel فقط (.xlsx أو .xls)");
        return;
      }
      setSelectedFile(file);
    }
  };

  const analyzeMutation = trpc.excel.analyze.useMutation({
    onSuccess: (data) => {
      if (data.success && data.presentationUrl) {
        toast.success("تم التحليل بنجاح!");
        // Open presentation in new tab
        window.open(data.presentationUrl, '_blank');
        
        // Show report link if available
        if (data.reportUrl) {
          toast.success("يمكنك تحميل التقرير المفصل", {
            action: {
              label: "تحميل",
              onClick: () => window.open(data.reportUrl, '_blank'),
            },
            duration: 10000,
          });
        }
      } else {
        toast.error(data.error || "حدث خطأ أثناء التحليل");
      }
      setIsUploading(false);
      setSelectedFile(null);
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
      setIsUploading(false);
    },
  });

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("يرجى اختيار ملف أولاً");
      return;
    }

    setIsUploading(true);
    toast.info("جاري رفع وتحليل الملف... قد يستغرق بضع دقائق");
    
    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        // Remove data:application/... prefix
        const fileBase64 = base64.split(',')[1] || base64;
        
        // Call API
        analyzeMutation.mutate({ fileBase64 });
      };
      reader.onerror = () => {
        toast.error("حدث خطأ أثناء قراءة الملف");
        setIsUploading(false);
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      toast.error("حدث خطأ أثناء رفع الملف");
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container py-16">
          <div className="max-w-4xl mx-auto text-center">
            {/* Hero Section */}
            <div className="mb-12">
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-5xl font-bold text-gray-900 mb-4">
                محلل الاستبيانات التعليمية
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                حلّل استبياناتك من Microsoft Forms واحصل على عروض تقديمية احترافية بالذكاء الاصطناعي
              </p>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="text-right">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mr-auto">
                    <Upload className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle>رفع بسيط</CardTitle>
                  <CardDescription>
                    ارفع ملف Excel من MS Forms مباشرة
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-right">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mr-auto">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle>تحليل ذكي</CardTitle>
                  <CardDescription>
                    تحليل إحصائي وتربوي متقدم بالذكاء الاصطناعي
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-right">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mr-auto">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle>عروض احترافية</CardTitle>
                  <CardDescription>
                    عروض تقديمية جاهزة مع صور بالطابع القطري
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* CTA */}
            <Button size="lg" asChild className="text-lg px-8 py-6">
              <a href={getLoginUrl()}>
                ابدأ الآن - تسجيل الدخول
              </a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              مرحباً {user?.name || "بك"}
            </h1>
            <p className="text-gray-600">
              ارفع ملف Excel من Microsoft Forms للحصول على تحليل شامل وعرض تقديمي احترافي
            </p>
          </div>

          {/* Privacy Warning */}
          <Alert className="mb-8 border-2 border-orange-200 bg-orange-50">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <AlertTitle className="text-orange-900 font-bold text-lg">
              ⚠️ تنبيه مهم - الخصوصية والأمان
            </AlertTitle>
            <AlertDescription className="text-orange-800 space-y-2 mt-2">
              <p className="font-semibold">يرجى عدم رفع ملفات تحتوي على:</p>
              <ul className="list-disc list-inside space-y-1 mr-4">
                <li>أسماء الطلاب الحقيقية أو أي بيانات شخصية</li>
                <li>معلومات سرية أو حساسة</li>
                <li>بيانات يمكن تتبعها لأفراد محددين</li>
              </ul>
              <p className="font-semibold mt-3">
                ✅ النظام سيقوم بتحليل الإجابات فقط دون حفظ أي بيانات شخصية
              </p>
            </AlertDescription>
          </Alert>

          {/* Upload Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="w-6 h-6" />
                رفع ملف Excel
              </CardTitle>
              <CardDescription>
                اختر ملف Excel المُصدّر من Microsoft Forms (.xlsx أو .xls)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="excel-file">ملف Excel</Label>
                <Input
                  id="excel-file"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  className="cursor-pointer"
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    تم اختيار: {selectedFile.name}
                  </p>
                )}
              </div>

              <Button
                size="lg"
                className="w-full"
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                    جاري التحليل...
                  </>
                ) : (
                  <>
                    <Upload className="ml-2 h-5 w-5" />
                    رفع وتحليل الاستبيان
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* What You'll Get */}
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle>ماذا ستحصل عليه؟</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">تحليل إحصائي شامل</h3>
                  <p className="text-sm text-muted-foreground">
                    نسب مئوية، متوسطات، انحراف معياري، ورسوم بيانية لكل سؤال
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">تفسير تربوي بالذكاء الاصطناعي</h3>
                  <p className="text-sm text-muted-foreground">
                    تفسير تربوي متخصص، نقاط القوة، نقاط التحسين، وتوصيات عملية
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Image className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">عرض تقديمي احترافي</h3>
                  <p className="text-sm text-muted-foreground">
                    عرض HTML جاهز للطباعة مع صور مولّدة بالذكاء الاصطناعي تتماشى مع الثقافة القطرية
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
