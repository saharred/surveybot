import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import NewSchool from "./pages/NewSchool";
import SchoolDetail from "./pages/SchoolDetail";
import NewSurvey from "./pages/NewSurvey";
import SurveyResponse from "./pages/SurveyResponse";
import AnalysisView from "./pages/AnalysisView";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/schools/new" component={NewSchool} />
      <Route path="/schools/:schoolId" component={SchoolDetail} />
      <Route path="/schools/:schoolId/surveys/new" component={NewSurvey} />
      <Route path="/surveys/:surveyId" component={SurveyResponse} />
      <Route path="/surveys/:surveyId/analysis" component={AnalysisView} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster position="top-center" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
