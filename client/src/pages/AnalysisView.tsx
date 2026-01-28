import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Loader2, ArrowRight, FileText, Download, BarChart3, AlertCircle, PlayCircle } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";

export default function AnalysisView() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams<{ surveyId: string }>();
  const surveyId = params.surveyId ? parseInt(params.surveyId) : 0;

  const { data: surveyData, isLoading: surveyLoading } = trpc.survey.getById.useQuery(
    { surveyId },
    { enabled: surveyId > 0 }
  );

  const { data: analysis, isLoading: analysisLoading, refetch: refetchAnalysis } = trpc.analysis.getBySurveyId.useQuery(
    { surveyId },
    { enabled: surveyId > 0, refetchInterval: (query) => {
      // Poll every 5 seconds if processing
      return query.state.data?.status === "processing" ? 5000 : false;
    }}
  );

  const startAnalysisMutation = trpc.analysis.startAnalysis.useMutation({
    onSuccess: () => {
      toast.success("بدأ التحليل... سيتم إشعارك عند الانتهاء");
      refetchAnalysis();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء بدء التحليل");
    },
  });

  if (authLoading || surveyLoading) {
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

  if (!surveyData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">الاستبيان غير موجود</h2>
          <Button onClick={() => setLocation("/dashboard")}>العودة إلى لوحة التحكم</Button>
        </div>
      </div>
    );
  }

  const { survey } = surveyData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => setLocation(`/surveys/${surveyId}`)}
              className="mb-4"
            >
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة إلى الاستبيان
            </Button>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">تحليل الاستبيان</h1>
                <p className="text-gray-600">{survey.title}</p>
              </div>
            </div>
          </div>

          {/* Analysis Status */}
          {analysisLoading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">جاري تحميل حالة التحليل...</p>
              </CardContent>
            </Card>
          ) : !analysis ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                  لم يتم إجراء التحليل بعد
                </CardTitle>
                <CardDescription>
                  يجب إغلاق الاستبيان وجمع الإجابات قبل بدء التحليل
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  size="lg"
                  onClick={() => startAnalysisMutation.mutate({ surveyId })}
                  disabled={startAnalysisMutation.isPending || survey.status !== "closed"}
                >
                  {startAnalysisMutation.isPending ? (
                    <>
                      <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                      جاري البدء...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="ml-2 h-5 w-5" />
                      بدء التحليل
                    </>
                  )}
                </Button>
                {survey.status !== "closed" && (
                  <p className="text-sm text-muted-foreground mt-4">
                    يجب إغلاق الاستبيان أولاً قبل بدء التحليل
                  </p>
                )}
              </CardContent>
            </Card>
          ) : analysis.status === "processing" ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">جاري التحليل...</h3>
                <p className="text-muted-foreground">
                  يتم الآن تحليل البيانات وإنشاء العروض التقديمية والتقارير. قد يستغرق هذا بضع دقائق.
                </p>
                <Badge variant="secondary" className="mt-4">معالجة</Badge>
              </CardContent>
            </Card>
          ) : analysis.status === "failed" ? (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="w-6 h-6" />
                  فشل التحليل
                </CardTitle>
                <CardDescription>
                  {analysis.errorMessage || "حدث خطأ أثناء التحليل"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  onClick={() => startAnalysisMutation.mutate({ surveyId })}
                  disabled={startAnalysisMutation.isPending}
                >
                  إعادة المحاولة
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Analysis Complete */}
              <Card className="mb-8 border-2 border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-900">
                    <BarChart3 className="w-6 h-6" />
                    اكتمل التحليل بنجاح
                  </CardTitle>
                  <CardDescription className="text-green-800">
                    تم الانتهاء من التحليل الإحصائي والتربوي. العروض التقديمية والتقارير جاهزة للعرض والتحميل.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Downloads */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {analysis.presentationUrl && (
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <CardTitle>العرض التقديمي</CardTitle>
                      <CardDescription>
                        عرض تقديمي احترافي HTML يتضمن جميع النتائج والتحليلات
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-2">
                      <Button asChild className="flex-1">
                        <a href={analysis.presentationUrl} target="_blank" rel="noopener noreferrer">
                          <FileText className="ml-2 h-4 w-4" />
                          عرض
                        </a>
                      </Button>
                      <Button variant="outline" asChild>
                        <a href={analysis.presentationUrl} download>
                          <Download className="ml-2 h-4 w-4" />
                          تحميل
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {analysis.reportUrl && (
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <FileText className="w-6 h-6 text-purple-600" />
                      </div>
                      <CardTitle>التقرير التفسيري</CardTitle>
                      <CardDescription>
                        تقرير مفصل يتضمن التفسيرات التربوية والتوصيات
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-2">
                      <Button asChild className="flex-1">
                        <a href={analysis.reportUrl} target="_blank" rel="noopener noreferrer">
                          <FileText className="ml-2 h-4 w-4" />
                          عرض
                        </a>
                      </Button>
                      <Button variant="outline" asChild>
                        <a href={analysis.reportUrl} download>
                          <Download className="ml-2 h-4 w-4" />
                          تحميل
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Summary */}
              {analysis.overallSummary && (
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>الملخص العام</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg leading-relaxed">{analysis.overallSummary}</p>
                  </CardContent>
                </Card>
              )}

              {/* Strengths and Improvements */}
              <div className="grid md:grid-cols-2 gap-6">
                {analysis.strengths && analysis.strengths.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-green-700">نقاط القوة</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.strengths.map((strength, index) => (
                          <li key={index} className="flex gap-2">
                            <span className="text-green-600 font-bold">✓</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {analysis.improvements && analysis.improvements.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-orange-700">نقاط التحسين</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.improvements.map((improvement, index) => (
                          <li key={index} className="flex gap-2">
                            <span className="text-orange-600 font-bold">→</span>
                            <span>{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
