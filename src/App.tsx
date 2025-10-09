// src/App.tsx

import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PageTransition } from "./components/PageTransition";
import { InitialAppLoader } from "./components/InitialAppLoader";
import { BackgroundActivityPopup } from "./components/BackgroundActivityPopup";
import { ActivityProvider, useActivity } from "./contexts/ActivityContext";
import { setActivityTracker } from "./services/api";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Accounts from "./pages/Accounts";
import Success from "./pages/Success";
import Error from "./pages/Error";
import NotFound from "./pages/NotFound";
import ReviewContent from "./pages/ReviewContent";

const queryClient = new QueryClient();

// Inner app component that has access to activity context
const AppContent = () => {
  const [showInitialLoader, setShowInitialLoader] = useState(true);
  const { activities, removeActivity, addActivity, updateActivity, isPopupVisible } = useActivity();

  // Set up activity tracker for API service
  useEffect(() => {
    setActivityTracker({ addActivity, updateActivity, activities });
  }, [addActivity, updateActivity, activities]);

  if (showInitialLoader) {
    return <InitialAppLoader onComplete={() => setShowInitialLoader(false)} />;
  }

  return (
    <>
      <BrowserRouter>
        <PageTransition>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/review-content" element={<ReviewContent />} />
            <Route path="/success" element={<Success />} />
            <Route path="/error" element={<Error />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PageTransition>
      </BrowserRouter>
      
      {/* Background Activity Popup */}
      <BackgroundActivityPopup
        isVisible={isPopupVisible}
        onToggle={() => {}} // No-op since we don't want to hide it
        activities={activities}
        onRemoveActivity={removeActivity}
      />
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ActivityProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </ActivityProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
