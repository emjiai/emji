'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, BarChart, BookOpenText, ListChecks, Home, Award, PlaySquare } from 'lucide-react';
import PracticeBoard from './PracticeBoard';

interface ActivityType {
  name: string;
  description: string;
  frequency: string;
  materials?: string[];
  steps?: string[];
}

interface ProgressPoint {
  date: string;
  milestone: string;
  notes: string;
}

interface SpeechData {
  childProfile: {
    name: string;
    age: string;
    developmentalStage: string;
    currentAbilities: string;
    areasOfFocus: string[];
  };
  assessmentResults: {
    date: string;
    provider: string;
    summary: string;
    scores: {
      category: string;
      score: string;
      interpretation: string;
    }[];
    recommendations: string[];
  };
  developmentPlan: {
    goals: {
      shortTerm: string[];
      longTerm: string[];
    };
    activities: ActivityType[];
    resources: {
      title: string;
      type: string;
      link?: string;
      description: string;
    }[];
  };
  progressTracking: {
    baseline: {
      date: string;
      observations: string[];
    };
    milestones: ProgressPoint[];
    nextAssessmentDate: string;
  };
  homeSupport: {
    dailyActivities: string[];
    environment: string[];
    parentingTips: string[];
  };
}

interface SpeechDevelopmentDisplayProps {
  speechData: SpeechData;
  onReset: () => void;
}

const SpeechDevelopmentDisplay: React.FC<SpeechDevelopmentDisplayProps> = ({
  speechData,
  onReset
}) => {
  const [activeSection, setActiveSection] = useState<string>('profile');
  const [expandedActivity, setExpandedActivity] = useState<number | null>(null);
  const [expandedMilestone, setExpandedMilestone] = useState<number | null>(null);

  const toggleSection = (section: string) => {
    setActiveSection(section);
  };

  const toggleActivity = (index: number) => {
    setExpandedActivity(expandedActivity === index ? null : index);
  };

  const toggleMilestone = (index: number) => {
    setExpandedMilestone(expandedMilestone === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      {/* Navigation Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => toggleSection('profile')}
          className={`flex items-center justify-center px-4 py-3 font-medium text-sm w-1/6 ${
            activeSection === 'profile' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <BookOpenText className="mr-2 h-4 w-4" /> Profile
        </button>
        <button
          onClick={() => toggleSection('assessment')}
          className={`flex items-center justify-center px-4 py-3 font-medium text-sm w-1/6 ${
            activeSection === 'assessment' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <BarChart className="mr-2 h-4 w-4" /> Assessment
        </button>
        <button
          onClick={() => toggleSection('development')}
          className={`flex items-center justify-center px-4 py-3 font-medium text-sm w-1/6 ${
            activeSection === 'development' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <ListChecks className="mr-2 h-4 w-4" /> Plan
        </button>
        <button
          onClick={() => toggleSection('practice')}
          className={`flex items-center justify-center px-4 py-3 font-medium text-sm w-1/6 ${
            activeSection === 'practice' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <PlaySquare className="mr-2 h-4 w-4" /> Practice
        </button>
        <button
          onClick={() => toggleSection('progress')}
          className={`flex items-center justify-center px-4 py-3 font-medium text-sm w-1/6 ${
            activeSection === 'progress' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Award className="mr-2 h-4 w-4" /> Progress
        </button>
        <button
          onClick={() => toggleSection('home')}
          className={`flex items-center justify-center px-4 py-3 font-medium text-sm w-1/6 ${
            activeSection === 'home' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Home className="mr-2 h-4 w-4" /> Home
        </button>
      </div>

      {/* Content Area */}
      <div className="p-6">
        {/* Profile Section */}
        {activeSection === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Child Profile
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Basic Information</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Name:</dt>
                      <dd className="text-gray-900 font-medium">{speechData.childProfile.name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Age:</dt>
                      <dd className="text-gray-900 font-medium">{speechData.childProfile.age}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Developmental Stage:</dt>
                      <dd className="text-gray-900 font-medium">{speechData.childProfile.developmentalStage}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Current Abilities</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-700">{speechData.childProfile.currentAbilities}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Areas of Focus</h3>
              <div className="bg-blue-50 p-4 rounded-md">
                <ul className="list-disc pl-5 space-y-1">
                  {speechData.childProfile.areasOfFocus.map((area, index) => (
                    <li key={index} className="text-gray-700">{area}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {/* Assessment Section */}
        {activeSection === 'assessment' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Speech and Language Assessment
            </h2>

            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium text-gray-900">Assessment Overview</h3>
                <span className="text-sm text-gray-500">{speechData.assessmentResults.date}</span>
              </div>
              <div className="mb-4">
                <p className="text-gray-700 mb-2"><span className="font-medium">Provider:</span> {speechData.assessmentResults.provider}</p>
                <p className="text-gray-700">{speechData.assessmentResults.summary}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Assessment Scores</h3>
              <div className="bg-white border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Interpretation
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {speechData.assessmentResults.scores.map((score, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {score.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {score.score}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {score.interpretation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Recommendations</h3>
              <div className="bg-green-50 p-4 rounded-md">
                <ul className="list-disc pl-5 space-y-2">
                  {speechData.assessmentResults.recommendations.map((recommendation, index) => (
                    <li key={index} className="text-gray-700">{recommendation}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Development Plan Section */}
        {activeSection === 'development' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Development Plan
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Short-Term Goals</h3>
                <div className="bg-blue-50 p-4 rounded-md">
                  <ul className="list-disc pl-5 space-y-2">
                    {speechData.developmentPlan.goals.shortTerm.map((goal, index) => (
                      <li key={index} className="text-gray-700">{goal}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Long-Term Goals</h3>
                <div className="bg-purple-50 p-4 rounded-md">
                  <ul className="list-disc pl-5 space-y-2">
                    {speechData.developmentPlan.goals.longTerm.map((goal, index) => (
                      <li key={index} className="text-gray-700">{goal}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Recommended Activities</h3>
              <div className="space-y-3">
                {speechData.developmentPlan.activities.map((activity, index) => (
                  <div key={index} className="border rounded-md overflow-hidden">
                    <div 
                      className="bg-gray-50 px-4 py-3 flex justify-between items-center cursor-pointer"
                      onClick={() => toggleActivity(index)}
                    >
                      <h4 className="font-medium text-gray-800">{activity.name}</h4>
                      {expandedActivity === index ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    {expandedActivity === index && (
                      <div className="p-4 bg-white">
                        <p className="text-gray-700 mb-3">{activity.description}</p>
                        <p className="text-sm text-gray-500 mb-2">Frequency: {activity.frequency}</p>
                        
                        {activity.materials && (
                          <div className="mb-3">
                            <h5 className="text-sm font-medium text-gray-700 mb-1">Materials</h5>
                            <ul className="list-disc pl-5 text-sm text-gray-600">
                              {activity.materials.map((material, i) => (
                                <li key={i}>{material}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {activity.steps && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-1">Steps</h5>
                            <ol className="list-decimal pl-5 text-sm text-gray-600 space-y-1">
                              {activity.steps.map((step, i) => (
                                <li key={i}>{step}</li>
                              ))}
                            </ol>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Resources</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {speechData.developmentPlan.resources.map((resource, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-md">
                    <h4 className="font-medium text-gray-800 mb-1">{resource.title}</h4>
                    <div className="mb-2">
                      <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-xs font-semibold text-gray-700">
                        {resource.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
                    {resource.link && (
                      <a 
                        href={resource.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Access Resource →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Practice Board Section */}
        {activeSection === 'practice' && (
          <PracticeBoard speechData={speechData} />
        )}

        {/* Progress Tracking Section */}
        {activeSection === 'progress' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Progress Tracking
            </h2>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium text-gray-900">Baseline Assessment</h3>
                <div className="text-sm text-gray-500">
                  {speechData.progressTracking.baseline.date}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <ul className="list-disc pl-5 space-y-2">
                  {speechData.progressTracking.baseline.observations.map((observation, index) => (
                    <li key={index} className="text-gray-700">{observation}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium text-gray-900">Progress Milestones</h3>
                <div className="text-sm text-gray-500">
                  Next Assessment: {speechData.progressTracking.nextAssessmentDate}
                </div>
              </div>
              
              <div className="space-y-3">
                {speechData.progressTracking.milestones.map((milestone, index) => (
                  <div key={index} className="border rounded-md overflow-hidden">
                    <div 
                      className="bg-gray-50 px-4 py-3 flex justify-between items-center cursor-pointer"
                      onClick={() => toggleMilestone(index)}
                    >
                      <div className="flex items-center">
                        <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded mr-3">
                          {milestone.date}
                        </div>
                        <h4 className="font-medium text-gray-800">{milestone.milestone}</h4>
                      </div>
                      {expandedMilestone === index ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    {expandedMilestone === index && (
                      <div className="p-4 bg-white">
                        <p className="text-gray-700">{milestone.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Home Support Section */}
        {activeSection === 'home' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Home Support Plan
            </h2>

            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Daily Activities</h3>
              <div className="bg-yellow-50 p-4 rounded-md">
                <ul className="list-disc pl-5 space-y-2">
                  {speechData.homeSupport.dailyActivities.map((activity, index) => (
                    <li key={index} className="text-gray-700">{activity}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Environment Setup</h3>
              <div className="bg-blue-50 p-4 rounded-md">
                <ul className="list-disc pl-5 space-y-2">
                  {speechData.homeSupport.environment.map((tip, index) => (
                    <li key={index} className="text-gray-700">{tip}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Parenting Tips</h3>
              <div className="bg-green-50 p-4 rounded-md">
                <ul className="list-disc pl-5 space-y-2">
                  {speechData.homeSupport.parentingTips.map((tip, index) => (
                    <li key={index} className="text-gray-700">{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end mt-8">
          <Button 
            variant="outline" 
            onClick={onReset}
            className="mr-3"
          >
            Start Over
          </Button>
          <Button onClick={() => window.print()}>
            Print Plan
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SpeechDevelopmentDisplay;
