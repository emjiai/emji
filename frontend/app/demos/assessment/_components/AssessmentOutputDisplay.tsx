'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Download, ExternalLink, Bookmark } from 'lucide-react';

interface LearningObjective {
  text: string;
}

interface RubricCriterion {
  criterionId: string;
  name: string;
  description: string;
  maxScore: number;
  score: number;
  feedback: string;
}

interface Resource {
  title: string;
  type: string;
  link: string;
}

interface AssessmentData {
  id: string;
  title: string;
  subject: string;
  studentLevel: string;
  submissionDate: string;
  overallScore: number;
  passingScore: number;
  learningObjectives: string[];
  rubric: RubricCriterion[];
  feedback: {
    strengths: string[];
    areasForImprovement: string[];
    summary: string;
  };
  nextSteps: {
    recommendedResources: Resource[];
    practiceActivities: string[];
  };
}

interface AssessmentOutputDisplayProps {
  assessment: AssessmentData;
  onReset: () => void;
}

const AssessmentOutputDisplay: React.FC<AssessmentOutputDisplayProps> = ({ 
  assessment,
  onReset
}) => {
  const [expandedCriterion, setExpandedCriterion] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string[]>(['rubric', 'feedback', 'next-steps']);
  
  const toggleCriterionExpand = (criterionId: string) => {
    if (expandedCriterion === criterionId) {
      setExpandedCriterion(null);
    } else {
      setExpandedCriterion(criterionId);
    }
  };
  
  const toggleSectionExpand = (section: string) => {
    if (expandedSection.includes(section)) {
      setExpandedSection(expandedSection.filter(s => s !== section));
    } else {
      setExpandedSection([...expandedSection, section]);
    }
  };
  
  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 85) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getTotalScoreColor = (score: number, passingScore: number) => {
    if (score >= 90) return 'bg-green-600';
    if (score >= passingScore) return 'bg-blue-600';
    return 'bg-red-600';
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      {/* Assessment Header */}
      <div className="p-6 border-b bg-gray-50">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{assessment.title}</h2>
            <p className="text-gray-600">{assessment.subject} | {assessment.studentLevel}</p>
            <p className="text-sm text-gray-500 mt-1">Submitted on {assessment.submissionDate}</p>
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${getTotalScoreColor(assessment.overallScore, assessment.passingScore)} text-white`}>
              <span className="text-2xl font-bold">{assessment.overallScore}%</span>
            </div>
            <p className="text-sm mt-1">
              Passing: {assessment.passingScore}%
            </p>
          </div>
        </div>
        
        {/* Learning Objectives */}
        <div className="mt-4">
          <h3 className="font-semibold text-gray-700 mb-2">Learning Objectives</h3>
          <ul className="list-disc pl-5 space-y-1">
            {assessment.learningObjectives.map((objective, index) => (
              <li key={index} className="text-gray-700">{objective}</li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Rubric Section */}
      <div className="border-b">
        <div 
          className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
          onClick={() => toggleSectionExpand('rubric')}
        >
          <h3 className="text-lg font-semibold">Assessment Rubric</h3>
          {expandedSection.includes('rubric') ? <ChevronUp /> : <ChevronDown />}
        </div>
        
        {expandedSection.includes('rubric') && (
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Criterion
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assessment.rubric.map((criterion) => (
                    <tr key={criterion.criterionId}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{criterion.name}</div>
                        <div className="text-sm text-gray-500">{criterion.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getScoreColor(criterion.score, criterion.maxScore)}`}>
                          {criterion.score}/{criterion.maxScore}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCriterionExpand(criterion.criterionId);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {expandedCriterion === criterion.criterionId ? 'Hide' : 'Show'} Feedback
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Expanded criterion feedback */}
            {expandedCriterion && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2">{assessment.rubric.find(c => c.criterionId === expandedCriterion)?.name} Feedback</h4>
                <p>{assessment.rubric.find(c => c.criterionId === expandedCriterion)?.feedback}</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Feedback Section */}
      <div className="border-b">
        <div 
          className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
          onClick={() => toggleSectionExpand('feedback')}
        >
          <h3 className="text-lg font-semibold">Feedback & Analysis</h3>
          {expandedSection.includes('feedback') ? <ChevronUp /> : <ChevronDown />}
        </div>
        
        {expandedSection.includes('feedback') && (
          <div className="p-4">
            <div className="mb-4">
              <h4 className="font-semibold text-green-700 mb-2">Strengths</h4>
              <ul className="list-disc pl-5 space-y-1">
                {assessment.feedback.strengths.map((strength, index) => (
                  <li key={index} className="text-gray-700">{strength}</li>
                ))}
              </ul>
            </div>
            
            <div className="mb-4">
              <h4 className="font-semibold text-amber-700 mb-2">Areas for Improvement</h4>
              <ul className="list-disc pl-5 space-y-1">
                {assessment.feedback.areasForImprovement.map((area, index) => (
                  <li key={index} className="text-gray-700">{area}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Summary</h4>
              <p className="text-gray-700">{assessment.feedback.summary}</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Next Steps Section */}
      <div className="border-b">
        <div 
          className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
          onClick={() => toggleSectionExpand('next-steps')}
        >
          <h3 className="text-lg font-semibold">Next Steps & Resources</h3>
          {expandedSection.includes('next-steps') ? <ChevronUp /> : <ChevronDown />}
        </div>
        
        {expandedSection.includes('next-steps') && (
          <div className="p-4">
            <div className="mb-4">
              <h4 className="font-semibold text-gray-700 mb-2">Recommended Resources</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {assessment.nextSteps.recommendedResources.map((resource, index) => (
                  <div key={index} className="border rounded-lg p-3 hover:bg-gray-50">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        {resource.type === 'Article' && <ExternalLink className="h-5 w-5 text-blue-500" />}
                        {resource.type === 'Online Course' && <Bookmark className="h-5 w-5 text-green-500" />}
                        {resource.type === 'Research Paper' && <Download className="h-5 w-5 text-purple-500" />}
                      </div>
                      <div className="ml-3">
                        <h5 className="text-sm font-medium">{resource.title}</h5>
                        <p className="text-xs text-gray-500">{resource.type}</p>
                        <a 
                          href={resource.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline mt-1 block"
                        >
                          View Resource
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Practice Activities</h4>
              <ul className="list-disc pl-5 space-y-1">
                {assessment.nextSteps.practiceActivities.map((activity, index) => (
                  <li key={index} className="text-gray-700">{activity}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="p-4 flex justify-end">
        <Button onClick={onReset} variant="outline" className="mr-2">
          Try Another Assessment
        </Button>
        <Button>
          Download Report
        </Button>
      </div>
    </div>
  );
};

export default AssessmentOutputDisplay;
