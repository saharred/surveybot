import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { trpc } from "@/lib/trpc";
import { Loader2, FileText, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useParams } from "wouter";
import { toast } from "sonner";

export default function SurveyResponse() {
  const params = useParams<{ surveyId: string }>();
  const surveyId = params.surveyId ? parseInt(params.surveyId) : 0;

  const { data, isLoading } = trpc.survey.getById.useQuery(
    { surveyId },
    { enabled: surveyId > 0 }
  );

  const [respondentId] = useState(() => `respondent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [responses, setResponses] = useState<Record<number, { text?: string; option?: string; value?: number }>>({});
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = trpc.response.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("تم إرسال إجاباتك بنجاح");
    },
    onError: (error) => {
      toast.error("حدث خطأ أثناء إرسال الإجابات");
      console.error(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!data) return;

    // Validate required questions
    const requiredQuestions = data.questions.filter(q => q.isRequired);
    const missingAnswers = requiredQuestions.filter(q => !responses[q.id]);

    if (missingAnswers.length > 0) {
      toast.error("يرجى الإجابة على جميع الأسئلة المطلوبة");
      return;
    }

    const responsesData = Object.entries(responses).map(([questionId, answer]) => ({
      questionId: parseInt(questionId),
      answerText: answer.text || undefined,
      answerOption: answer.option || undefined,
      answerValue: answer.value || undefined,
    }));

    submitMutation.mutate({
      surveyId,
      respondentId,
      responses: responsesData,
    });
  };

  const updateResponse = (questionId: number, data: { text?: string; option?: string; value?: number }) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: data,
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!data || !data.survey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">الاستبيان غير موجود</h2>
        </div>
      </div>
    );
  }

  if (data.survey.status !== "active") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>الاستبيان غير متاح</CardTitle>
            <CardDescription>
              هذا الاستبيان غير نشط حالياً ولا يمكن الإجابة عليه
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Card className="max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">شكراً لمشاركتك!</CardTitle>
            <CardDescription className="text-lg">
              تم إرسال إجاباتك بنجاح. نقدر وقتك ومساهمتك في تحسين العملية التعليمية.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <Card className="mb-8 border-2 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-3xl">{data.survey.title}</CardTitle>
                  {data.survey.description && (
                    <CardDescription className="text-base mt-2">
                      {data.survey.description}
                    </CardDescription>
                  )}
                </div>
              </div>
              {data.survey.purpose && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm font-semibold text-blue-900 mb-1">هدف الاستبيان:</p>
                  <p className="text-sm text-blue-800">{data.survey.purpose}</p>
                </div>
              )}
            </CardHeader>
          </Card>

          {/* Questions Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {data.questions.map((question, index) => (
              <Card key={question.id} className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {index + 1}. {question.questionText}
                    {question.isRequired && <span className="text-destructive mr-1">*</span>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {question.questionType === "multiple_choice" && question.options && (
                    <RadioGroup
                      value={responses[question.id]?.option || ""}
                      onValueChange={(value) => updateResponse(question.id, { option: value })}
                    >
                      <div className="space-y-3">
                        {question.options.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center space-x-2 space-x-reverse">
                            <RadioGroupItem value={option} id={`q${question.id}_o${oIndex}`} />
                            <Label htmlFor={`q${question.id}_o${oIndex}`} className="cursor-pointer flex-1">
                              {option}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  )}

                  {question.questionType === "likert_scale" && question.options && (
                    <RadioGroup
                      value={responses[question.id]?.option || ""}
                      onValueChange={(value) => updateResponse(question.id, { option: value })}
                    >
                      <div className="space-y-3">
                        {question.options.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center space-x-2 space-x-reverse">
                            <RadioGroupItem value={option} id={`q${question.id}_o${oIndex}`} />
                            <Label htmlFor={`q${question.id}_o${oIndex}`} className="cursor-pointer flex-1">
                              {option}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  )}

                  {question.questionType === "text" && (
                    <Textarea
                      placeholder="اكتب إجابتك هنا..."
                      value={responses[question.id]?.text || ""}
                      onChange={(e) => updateResponse(question.id, { text: e.target.value })}
                      rows={4}
                    />
                  )}

                  {question.questionType === "rating" && (
                    <RadioGroup
                      value={responses[question.id]?.value?.toString() || ""}
                      onValueChange={(value) => updateResponse(question.id, { value: parseInt(value) })}
                    >
                      <div className="flex gap-4 justify-center">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <div key={rating} className="flex flex-col items-center">
                            <RadioGroupItem value={rating.toString()} id={`q${question.id}_r${rating}`} />
                            <Label htmlFor={`q${question.id}_r${rating}`} className="cursor-pointer mt-2">
                              {rating}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <p className="text-center text-sm text-muted-foreground mt-2">
                        1 = ضعيف جداً، 5 = ممتاز
                      </p>
                    </RadioGroup>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Submit Button */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={submitMutation.isPending}
                >
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    "إرسال الإجابات"
                  )}
                </Button>
                <p className="text-sm text-center text-muted-foreground mt-4">
                  * الحقول المطلوبة
                </p>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}
