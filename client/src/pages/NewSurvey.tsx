import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Loader2, FileText, ArrowRight, Plus, Trash2, GripVertical } from "lucide-react";
import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";

type QuestionType = "multiple_choice" | "likert_scale" | "text" | "rating";

interface Question {
  id: string;
  questionText: string;
  questionType: QuestionType;
  options: string[];
  isRequired: boolean;
}

export default function NewSurvey() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams<{ schoolId: string }>();
  const schoolId = params.schoolId ? parseInt(params.schoolId) : 0;

  const { data: school, isLoading: schoolLoading } = trpc.school.getById.useQuery(
    { schoolId },
    { enabled: schoolId > 0 && isAuthenticated }
  );

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    purpose: "",
    targetAudience: "teachers" as string,
  });

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: crypto.randomUUID(),
      questionText: "",
      questionType: "multiple_choice",
      options: ["", ""],
      isRequired: true,
    },
  ]);

  const createSurveyMutation = trpc.survey.create.useMutation({
    onSuccess: (data) => {
      toast.success("تم إنشاء الاستبيان بنجاح");
      setLocation(`/schools/${schoolId}/surveys`);
    },
    onError: (error) => {
      toast.error("حدث خطأ أثناء إنشاء الاستبيان");
      console.error(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title) {
      toast.error("يرجى إدخال عنوان الاستبيان");
      return;
    }

    const validQuestions = questions.filter(q => q.questionText.trim());
    if (validQuestions.length === 0) {
      toast.error("يرجى إضافة سؤال واحد على الأقل");
      return;
    }

    const questionsData = validQuestions.map((q, index) => ({
      questionText: q.questionText,
      questionType: q.questionType,
      options: ["multiple_choice", "likert_scale"].includes(q.questionType)
        ? q.options.filter(o => o.trim())
        : undefined,
      isRequired: q.isRequired,
      orderIndex: index,
    }));

    createSurveyMutation.mutate({
      schoolId,
      ...formData,
      questions: questionsData,
    });
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: crypto.randomUUID(),
        questionText: "",
        questionType: "multiple_choice",
        options: ["", ""],
        isRequired: true,
      },
    ]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length === 1) {
      toast.error("يجب أن يحتوي الاستبيان على سؤال واحد على الأقل");
      return;
    }
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(questions.map(q => {
      if (q.id === id) {
        if (field === "questionType") {
          // Reset options when changing question type
          const newOptions = value === "likert_scale"
            ? ["موافق بشدة", "موافق", "محايد", "غير موافق", "غير موافق بشدة"]
            : ["", ""];
          return { ...q, [field]: value, options: newOptions };
        }
        return { ...q, [field]: value };
      }
      return q;
    }));
  };

  const addOption = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return { ...q, options: [...q.options, ""] };
      }
      return q;
    }));
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options.length > 2) {
        const newOptions = q.options.filter((_, i) => i !== optionIndex);
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

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
    return <div>المدرسة غير موجودة</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => setLocation(`/schools/${schoolId}`)}
              className="mb-4"
            >
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة إلى المدرسة
            </Button>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">إنشاء استبيان جديد</h1>
                <p className="text-gray-600">{school.schoolName}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>معلومات الاستبيان</CardTitle>
                <CardDescription>أدخل التفاصيل الأساسية للاستبيان</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">عنوان الاستبيان *</Label>
                  <Input
                    id="title"
                    placeholder="مثال: استبيان رضا المعلمين عن بيئة العمل"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">وصف الاستبيان</Label>
                  <Textarea
                    id="description"
                    placeholder="وصف مختصر عن الاستبيان وأهدافه"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose">هدف الاستبيان</Label>
                  <Textarea
                    id="purpose"
                    placeholder="الهدف من إجراء هذا الاستبيان"
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAudience">الفئة المستهدفة</Label>
                  <Select
                    value={formData.targetAudience}
                    onValueChange={(value) => setFormData({ ...formData, targetAudience: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="teachers">المعلمون</SelectItem>
                      <SelectItem value="students">الطلاب</SelectItem>
                      <SelectItem value="parents">أولياء الأمور</SelectItem>
                      <SelectItem value="staff">الموظفون الإداريون</SelectItem>
                      <SelectItem value="all">الجميع</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Questions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">الأسئلة</h2>
                <Button type="button" onClick={addQuestion} variant="outline">
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة سؤال
                </Button>
              </div>

              {questions.map((question, qIndex) => (
                <Card key={question.id} className="border-2">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-5 h-5 text-muted-foreground" />
                        <span className="text-sm font-semibold text-muted-foreground">
                          السؤال {qIndex + 1}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(question.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>نص السؤال *</Label>
                      <Textarea
                        placeholder="اكتب السؤال هنا"
                        value={question.questionText}
                        onChange={(e) => updateQuestion(question.id, "questionText", e.target.value)}
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>نوع السؤال</Label>
                      <Select
                        value={question.questionType}
                        onValueChange={(value) => updateQuestion(question.id, "questionType", value as QuestionType)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple_choice">اختيار متعدد</SelectItem>
                          <SelectItem value="likert_scale">مقياس ليكرت</SelectItem>
                          <SelectItem value="text">نص حر</SelectItem>
                          <SelectItem value="rating">تقييم (1-5)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Options for multiple choice and likert */}
                    {["multiple_choice", "likert_scale"].includes(question.questionType) && (
                      <div className="space-y-2">
                        <Label>الخيارات</Label>
                        <div className="space-y-2">
                          {question.options.map((option, oIndex) => (
                            <div key={oIndex} className="flex gap-2">
                              <Input
                                placeholder={`الخيار ${oIndex + 1}`}
                                value={option}
                                onChange={(e) => updateOption(question.id, oIndex, e.target.value)}
                              />
                              {question.options.length > 2 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeOption(question.id, oIndex)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addOption(question.id)}
                          >
                            <Plus className="ml-2 h-4 w-4" />
                            إضافة خيار
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <Button
                type="submit"
                size="lg"
                className="flex-1"
                disabled={createSurveyMutation.isPending}
              >
                {createSurveyMutation.isPending ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  "إنشاء الاستبيان"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setLocation(`/schools/${schoolId}`)}
                disabled={createSurveyMutation.isPending}
              >
                إلغاء
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
