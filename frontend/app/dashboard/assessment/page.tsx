"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import SearchSection from "../_components/SearchSection";
import TemplateListSection from "../_components/TemplateListSection";
import Templates from "@/app/(data)/Templates";
import Quiz from "./_components/Quiz";

function AssessmentPage() {
  const [userSearchInput, setUserSearchInput] = useState<string>();
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizData, setQuizData] = useState<any>(null);
  const searchParams = useSearchParams();
  
  // Filter templates to only show Assessment category
  const assessmentTemplates = Templates.filter(
    template => template.category === "Assessment"
  );

  useEffect(() => {
    // Check if we're being redirected from the quiz generator
    const quizId = searchParams?.get("quizId");
    
    if (quizId === "latest") {
      // Load the quiz data from sessionStorage
      try {
        const storedQuizData = typeof window !== "undefined" ? 
          sessionStorage.getItem("generatedQuiz") : null;
          
        if (storedQuizData) {
          const parsedQuizData = JSON.parse(storedQuizData);
          setQuizData(parsedQuizData);
          setShowQuiz(true);
        }
      } catch (error) {
        console.error("Error loading quiz data:", error);
      }
    }
  }, [searchParams]);

  const handleBackToTemplates = () => {
    setShowQuiz(false);
  };

  if (showQuiz && quizData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Quiz 
          quizData={quizData} 
          onBack={handleBackToTemplates}
        />
      </div>
    );
  }

  return (
    <div className="h-full">
      {/* Search Section */}
      <SearchSection
        onSearchInput={(value: string) => setUserSearchInput(value)}
      />

      {/* Template List Section - Assessment only */}
      <div className="bg-slate-100 flex flex-col items-center justify-center py-5">
        <h1 className="text-3xl font-bold mb-2">Assessment Tools</h1>
        <p className="text-gray-600 mb-4">Create and manage assessments for your students</p>
      </div>
      
      <TemplateListSection 
        userSearchInput={userSearchInput} 
        customTemplates={assessmentTemplates} 
      />
    </div>
  );
}

export default AssessmentPage;
