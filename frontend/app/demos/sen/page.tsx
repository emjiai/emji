'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2Icon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import DemoHeader from '../_components/DemoHeader';
import SpeechDevelopmentDisplay from './_components/SpeechDevelopmentDisplay';
import speechData from '../_data/speech-data.json';
import { cn } from '@/lib/utils';

// Mock template data (would come from _data/DemoTemplates in production)
const demoSENTemplate = {
  name: "Speech & Language Development Plan",
  slug: "sen-speech-language",
  desc: "Create personalized speech and language development plans for special educational needs. Ideal for SEN teachers, speech therapists, and parents.",
  form: [
    {
      label: "Student's Age",
      field: "input",
      name: "age",
      required: true,
      placeholder: "E.g., 5, 8, 12"
    },
    {
      label: "Current Speech & Language Abilities",
      field: "textarea",
      name: "currentAbilities",
      required: true,
      placeholder: "Describe the current speech and language abilities, challenges, and strengths..."
    },
    {
      label: "Specific Areas of Concern",
      field: "textarea",
      name: "areasOfConcern",
      required: true,
      placeholder: "E.g., articulation, vocabulary, sentence formation, social communication..."
    },
    {
      label: "Developmental Goals",
      field: "textarea",
      name: "goals",
      required: true,
      placeholder: "What specific improvements are you hoping to achieve?"
    },
    {
      label: "Additional Information",
      field: "textarea",
      name: "additionalInfo",
      required: false,
      placeholder: "Any diagnosis, medical history, or other relevant information that might help..."
    }
  ]
};

// Mock response for testing the UI
const mockSENResponse = {
  studentProfile: {
    age: "8 years",
    currentAbilities: "Can form basic sentences, has a vocabulary of approximately 200-300 words, struggles with articulation of complex sounds (r, th, s blends), shows interest in communication but becomes frustrated when not understood.",
    areasOfConcern: "Articulation difficulties, limited vocabulary for age, struggles with social communication in group settings, difficulty following multi-step instructions."
  },
  developmentalGoals: [
    "Improve articulation of r, th, and s-blend sounds",
    "Expand functional vocabulary by 100+ words",
    "Develop ability to follow 2-3 step instructions",
    "Enhance conversational turn-taking in social settings"
  ],
  assessmentRecommendations: [
    "Formal phonological assessment to identify specific sound pattern difficulties",
    "Vocabulary assessment using age-appropriate standardized measures",
    "Observation in social settings to evaluate pragmatic language skills",
    "Auditory processing screening to rule out additional challenges"
  ],
  interventionPlan: {
    articulation: {
      goals: "Master proper production of r, th, and s-blends in isolation, words, and conversational speech",
      activities: [
        "Sound isolation practice using visual cues and mirrors",
        "Minimal pairs exercises to differentiate similar sounds",
        "Progressive sound practice: isolation → syllables → words → phrases → sentences",
        "Speech sound games focusing on target sounds",
        "Daily 5-minute practice with caregiver using provided sound cards"
      ],
      frequency: "3 times per week, 20-minute focused sessions"
    },
    vocabulary: {
      goals: "Expand expressive and receptive vocabulary across everyday contexts",
      activities: [
        "Themed vocabulary building using visual supports",
        "Word categorization activities to develop semantic networks",
        "Word definition and description games",
        "Vocabulary journals with illustrations",
        "Daily reading with targeted vocabulary discussion"
      ],
      frequency: "Daily, integrated into regular activities and dedicated 15-minute sessions"
    },
    listening: {
      goals: "Improve ability to follow multi-step instructions",
      activities: [
        "Simon Says games with gradually increasing complexity",
        "Sequenced picture instructions for completing tasks",
        "Listen and draw activities",
        "Barrier games requiring careful listening to instructions",
        "Direction-following activities with manipulatives"
      ],
      frequency: "3-4 times per week, 10-15 minute sessions"
    },
    socialCommunication: {
      goals: "Develop turn-taking skills and improve pragmatic language use in conversations",
      activities: [
        "Structured conversation practice with visual supports",
        "Social stories for navigating common interactions",
        "Role-playing everyday social scenarios",
        "Video modeling of appropriate conversational exchanges",
        "Small group structured games requiring verbal interaction"
      ],
      frequency: "2 times per week in small group setting, plus daily practice opportunities"
    }
  },
  homeSupport: {
    generalRecommendations: "Consistent practice in natural environments is crucial for generalizing skills. Aim for short, frequent practice rather than long sessions.",
    activities: [
      "Daily reading with explicit focus on target sounds/words",
      "Narrated play activities where adult describes actions",
      "Silly sound games during routine activities",
      "Labeled picture albums of familiar people/objects",
      "Verbal routines that include target sounds/words"
    ],
    resources: [
      "Sound picture cards for articulation practice",
      "Visual sequence charts for daily routines",
      "Conversation starter prompt cards",
      "Apps recommended for home practice",
      "Progress tracking charts",
      "Instruction-following success rate tracking"
    ],
    timeline: "Comprehensive review every 8 weeks, with adjustments to plan as needed. Daily/weekly tracking using provided tools."
  },
  progressMonitoring: {
    methods: [
      "Weekly probe data on target sound production in structured activities",
      "Monthly vocabulary assessments using standardized word lists",
      "Biweekly tracking of successful responses to multi-step directions",
      "Video samples of conversational speech collected every 4 weeks",
      "Parent/caregiver logs of daily practice and observations"
    ],
    timeline: "Comprehensive review every 8 weeks, with adjustments to plan as needed. Daily/weekly tracking using provided tools."
  },
  professionalSupport: {
    recommended: "Speech-Language Pathologist sessions, 2x weekly initially, reducing as goals are achieved",
    collaboration: "Regular communication between SLP, teacher, and home using communication journal to ensure consistent approaches",
    training: "Caregiver training session recommended to ensure home practice uses optimal techniques"
  }
};

// Interface for SEN plan data
interface SENPlan {
  studentProfile: {
    age: string;
    currentAbilities: string;
    areasOfConcern: string;
  };
  developmentalGoals: string[];
  assessmentRecommendations: string[];
  interventionPlan: {
    articulation: {
      goals: string;
      activities: string[];
      frequency: string;
    };
    vocabulary: {
      goals: string;
      activities: string[];
      frequency: string;
    };
    listening: {
      goals: string;
      activities: string[];
      frequency: string;
    };
    socialCommunication: {
      goals: string;
      activities: string[];
      frequency: string;
    };
  };
  homeSupport: {
    generalRecommendations: string;
    activities: string[];
    resources: string[];
    timeline: string;
  };
  progressMonitoring: {
    methods: string[];
    timeline: string;
  };
  professionalSupport: {
    recommended: string;
    collaboration: string;
    training: string;
  };
}

// Mock function to generate a SEN plan (would be an API call in production)
const generateSENPlan = async (formData: FormData): Promise<SENPlan> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return mock data
  return mockSENResponse as SENPlan;
};

export default function SENDemo() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [useTestData, setUseTestData] = useState(false);
  const [senPlan, setSenPlan] = useState<SENPlan | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFormValues(prev => ({
        ...prev,
        document: file
      }));
    }
  };

  // Handle form input changes
  const handleInputChange = (name: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (useTestData) {
        // Use the sample test data
        setSenPlan({
          studentProfile: {
            age: speechData.targetAge,
            currentAbilities: speechData.studentProfile.strengths.join(", "),
            areasOfConcern: speechData.studentProfile.challengeAreas.join(", ")
          },
          developmentalGoals: speechData.focusAreas,
          assessmentRecommendations: speechData.activities.slice(0, 3).map(a => a.description),
          interventionPlan: {
            articulation: {
              goals: "Master proper production of key sounds in words and sentences",
              activities: speechData.activities.filter(a => a.title?.includes("Sound") || a.focusArea === "Articulation").map(a => a.description),
              frequency: "3 times per week, 20-minute focused sessions"
            },
            vocabulary: {
              goals: "Expand expressive and receptive vocabulary",
              activities: speechData.activities.filter(a => a.title?.includes("Vocabulary") || a.focusArea === "Vocabulary").map(a => a.description),
              frequency: "Daily, integrated into regular activities"
            },
            listening: {
              goals: "Improve auditory processing and comprehension",
              activities: speechData.activities.filter(a => a.title?.includes("Listening") || a.focusArea === "Listening").map(a => a.description),
              frequency: "3-4 times per week, 15 minute sessions"
            },
            socialCommunication: {
              goals: "Develop social language skills",
              activities: speechData.activities.filter(a => a.title?.includes("Social") || a.focusArea === "Social").map(a => a.description),
              frequency: "2 times per week plus daily opportunities"
            }
          },
          homeSupport: {
            generalRecommendations: "Consistent practice in natural environments is crucial for generalizing skills.",
            activities: speechData.activities.filter(a => a.homeActivity).map(a => a.homeActivity || ""),
            resources: speechData.activities.filter(a => a.materials).flatMap(a => a.materials || []).slice(0, 6),
            timeline: "Review progress every 8 weeks, with daily tracking."
          },
          progressMonitoring: {
            methods: speechData.progressTracker.skillAreas.map(area => `${area.name}: ${area.milestones[area.milestones.length-1].notes}`),
            timeline: "Next assessment: " + new Date(new Date().setDate(new Date().getDate() + 30)).toLocaleDateString()
          },
          professionalSupport: {
            recommended: "Speech-Language Pathologist sessions, 2x weekly initially",
            collaboration: "Regular communication between therapist, teachers, and home",
            training: "Caregiver training recommended for home practice techniques"
          }
        });
      } else {
        // Create FormData object for API submission
        const formData = new FormData();
        
        // Add all form values to the FormData
        Object.entries(formValues).forEach(([key, value]) => {
          formData.append(key, value as string);
        });
        
        // Call API to generate plan
        const result = await generateSENPlan(formData);
        setSenPlan(result);
      }
    } catch (err) {
      console.error("Error generating speech plan:", err);
      setError("Failed to generate the speech development plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle reset to create a new SEN plan
  const handleReset = () => {
    setSenPlan(null);
    setFormValues({});
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Toggle between API and test data
  const toggleDataSource = () => {
    setUseTestData(!useTestData);
  };

  return (
    <>
      <DemoHeader />
      
      <div className="container mx-auto pt-20 p-4">
        {!senPlan ? (
          // Form to generate a speech development plan
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between mb-6">
                <h2 className="text-xl font-semibold">Create a Speech Development Plan</h2>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={toggleDataSource}
                >
                  {useTestData ? "Use AI Generation" : "Use Sample Plan"}
                </Button>
              </div>
              
              {useTestData ? (
                <div className="mb-6">
                  <p className="mb-4">Using sample speech development data for a 5-year-old child working on phonological skills.</p>
                  <Button 
                    onClick={handleSubmit} 
                    className="w-full py-6" 
                    disabled={loading}
                  >
                    {loading && <Loader2Icon className="animate-spin mr-2" />}
                    Load Sample Speech Plan
                  </Button>
                </div>
              ) : (
                <div>
                  {demoSENTemplate.form.map((field, index) => (
                    <div key={index} className="mb-4">
                      <label className="block font-medium mb-1">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      {field.field === 'textarea' ? (
                        <Textarea
                          name={field.name}
                          required={field.required}
                          placeholder={field.placeholder}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          className="min-h-[100px]"
                        />
                      ) : (
                        <Input
                          name={field.name}
                          required={field.required}
                          placeholder={field.placeholder}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                  
                  {/* Optional file upload */}
                  <div className="mb-6">
                    <label className="block font-medium mb-1">Existing Assessment (Optional)</label>
                    <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".pdf,.docx,.txt"
                        onChange={handleFileChange}
                      />
                      <Button 
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        className="mb-2"
                      >
                        Choose File
                      </Button>
                      {selectedFile ? (
                        <p className="text-sm text-gray-600">{selectedFile.name}</p>
                      ) : (
                        <p className="text-sm text-gray-500">Upload any existing speech assessments</p>
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleSubmit} 
                    className="w-full py-6" 
                    disabled={loading}
                  >
                    {loading && <Loader2Icon className="animate-spin mr-2" />}
                    Generate Speech Development Plan
                  </Button>
                </div>
              )}
              
              {loading && (
                <div className="mt-6 flex items-center justify-center">
                  <Loader2Icon className="animate-spin mr-2" size={24} />
                  <span>Creating your speech development plan...</span>
                </div>
              )}
              
              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
            </div>
          </div>
        ) : (
          // Display the speech development plan
          useTestData ? (
            // Use our new component for displaying the speech data
            <SpeechDevelopmentDisplay
              speechData={{
                childProfile: {
                  name: "Sample Child",
                  age: speechData.targetAge,
                  developmentalStage: "Early Language Development",
                  currentAbilities: speechData.studentProfile.strengths.join(", "),
                  areasOfFocus: speechData.studentProfile.challengeAreas
                },
                assessmentResults: {
                  date: new Date().toLocaleDateString(),
                  provider: "EmJi AI Speech Assessment",
                  summary: "Child demonstrates age-appropriate skills in some areas with specific challenges in phonological awareness and articulation.",
                  scores: speechData.progressTracker.skillAreas.map(area => ({
                    category: area.name,
                    score: `${area.current}/5`,
                    interpretation: area.milestones[area.milestones.length-1].notes
                  })),
                  recommendations: speechData.activities.slice(0, 3).map(a => a.description)
                },
                developmentPlan: {
                  goals: {
                    shortTerm: speechData.focusAreas.slice(0, 2),
                    longTerm: speechData.focusAreas.slice(2)
                  },
                  activities: speechData.activities.map(a => ({
                    name: a.title,
                    description: a.description,
                    frequency: "2-3 times weekly",
                    materials: a.materials || []
                  })),
                  resources: speechData.activities.filter(a => a.materials).map(a => ({
                    title: a.title,
                    type: "Activity",
                    description: a.description,
                    link: ""
                  }))
                },
                progressTracking: {
                  baseline: {
                    date: speechData.progressTracker.startDate,
                    observations: speechData.progressTracker.skillAreas.map(a => 
                      `${a.name}: ${a.milestones[0].notes}`)
                  },
                  milestones: speechData.progressTracker.skillAreas.flatMap(area => 
                    area.milestones.map(m => ({
                      date: m.date,
                      milestone: `${area.name}: Level ${m.score}/5`,
                      notes: m.notes
                    }))
                  ),
                  nextAssessmentDate: new Date(new Date().setDate(new Date().getDate() + 30)).toLocaleDateString()
                },
                homeSupport: {
                  dailyActivities: speechData.activities
                    .filter(a => a.homeActivity)
                    .map(a => a.homeActivity || ""),
                  environment: speechData.activities
                    .filter(a => a.materials)
                    .flatMap(a => a.materials || []),
                  parentingTips: [
                    "Practice consistently in everyday situations",
                    "Use positive reinforcement when child attempts target sounds",
                    "Create a language-rich environment with lots of conversation"
                  ]
                }
              }}
              onReset={handleReset}
            />
          ) : (
            // Display the API-generated plan with the original format
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-6 border-b pb-4">
                  <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-bold">Speech & Language Development Plan</h2>
                    <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                      {senPlan.studentProfile.age}
                    </div>
                  </div>
                </div>
                
                {/* Student Profile */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3">Student Profile</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="font-medium text-gray-800 mb-2">Current Abilities</h4>
                      <p className="text-gray-700">{senPlan.studentProfile.currentAbilities}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="font-medium text-gray-800 mb-2">Areas of Concern</h4>
                      <p className="text-gray-700">{senPlan.studentProfile.areasOfConcern}</p>
                    </div>
                  </div>
                </div>
                
                {/* Goals & Assessment */}
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Developmental Goals</h3>
                      <ul className="list-disc pl-5 space-y-1 bg-green-50 p-4 rounded-md">
                        {senPlan.developmentalGoals.map((goal, index) => (
                          <li key={index} className="text-gray-700">{goal}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Assessment Recommendations</h3>
                      <ul className="list-disc pl-5 space-y-1 bg-yellow-50 p-4 rounded-md">
                        {senPlan.assessmentRecommendations.map((item, index) => (
                          <li key={index} className="text-gray-700">{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                
                {/* Intervention Plan */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3">Intervention Plan</h3>
                  <div className="space-y-4">
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-red-50 px-4 py-2 border-b">
                        <h4 className="text-lg font-medium text-red-800">Articulation</h4>
                      </div>
                      <div className="p-4">
                        <p className="font-medium mb-2">Goal: <span className="font-normal">{senPlan.interventionPlan.articulation.goals}</span></p>
                        <p className="font-medium mb-2">Activities:</p>
                        <ul className="list-disc pl-5 mb-2">
                          {senPlan.interventionPlan.articulation.activities.map((activity, index) => (
                            <li key={index} className="text-gray-700 mb-1">{activity}</li>
                          ))}
                        </ul>
                        <p className="font-medium">Recommended Frequency: <span className="font-normal">{senPlan.interventionPlan.articulation.frequency}</span></p>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-blue-50 px-4 py-2 border-b">
                        <h4 className="text-lg font-medium text-blue-800">Vocabulary</h4>
                      </div>
                      <div className="p-4">
                        <p className="font-medium mb-2">Goal: <span className="font-normal">{senPlan.interventionPlan.vocabulary.goals}</span></p>
                        <p className="font-medium mb-2">Activities:</p>
                        <ul className="list-disc pl-5 mb-2">
                          {senPlan.interventionPlan.vocabulary.activities.map((activity, index) => (
                            <li key={index} className="text-gray-700 mb-1">{activity}</li>
                          ))}
                        </ul>
                        <p className="font-medium">Recommended Frequency: <span className="font-normal">{senPlan.interventionPlan.vocabulary.frequency}</span></p>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-green-50 px-4 py-2 border-b">
                        <h4 className="text-lg font-medium text-green-800">Listening Skills</h4>
                      </div>
                      <div className="p-4">
                        <p className="font-medium mb-2">Goal: <span className="font-normal">{senPlan.interventionPlan.listening.goals}</span></p>
                        <p className="font-medium mb-2">Activities:</p>
                        <ul className="list-disc pl-5 mb-2">
                          {senPlan.interventionPlan.listening.activities.map((activity, index) => (
                            <li key={index} className="text-gray-700 mb-1">{activity}</li>
                          ))}
                        </ul>
                        <p className="font-medium">Recommended Frequency: <span className="font-normal">{senPlan.interventionPlan.listening.frequency}</span></p>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-purple-50 px-4 py-2 border-b">
                        <h4 className="text-lg font-medium text-purple-800">Social Communication</h4>
                      </div>
                      <div className="p-4">
                        <p className="font-medium mb-2">Goal: <span className="font-normal">{senPlan.interventionPlan.socialCommunication.goals}</span></p>
                        <p className="font-medium mb-2">Activities:</p>
                        <ul className="list-disc pl-5 mb-2">
                          {senPlan.interventionPlan.socialCommunication.activities.map((activity, index) => (
                            <li key={index} className="text-gray-700 mb-1">{activity}</li>
                          ))}
                        </ul>
                        <p className="font-medium">Recommended Frequency: <span className="font-normal">{senPlan.interventionPlan.socialCommunication.frequency}</span></p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Home Support */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3">Home Support Plan</h3>
                  <p className="mb-3 text-gray-700">{senPlan.homeSupport.generalRecommendations}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Recommended Activities</h4>
                      <ul className="list-disc pl-5">
                        {senPlan.homeSupport.activities.map((activity, index) => (
                          <li key={index} className="text-gray-700 mb-1">{activity}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Resources</h4>
                      <ul className="list-disc pl-5">
                        {senPlan.homeSupport.resources.map((resource, index) => (
                          <li key={index} className="text-gray-700 mb-1">{resource}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Progress Monitoring */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">Progress Monitoring</h3>
                  <p className="mb-2 text-gray-800 font-medium">Recommended Methods:</p>
                  <ul className="list-disc pl-5 mb-3">
                    {senPlan.progressMonitoring.methods.map((method, index) => (
                      <li key={index} className="text-gray-700 mb-1">{method}</li>
                    ))}
                  </ul>
                  <p className="text-gray-800"><span className="font-medium">Timeline: </span>{senPlan.progressMonitoring.timeline}</p>
                </div>

                {/* Professional Support */}
                <div className="mb-6 bg-gray-50 p-4 rounded-md">
                  <h3 className="text-xl font-semibold mb-2">Professional Support</h3>
                  <div className="space-y-2">
                    <p className="text-gray-800"><span className="font-medium">Recommended Support: </span>{senPlan.professionalSupport.recommended}</p>
                    <p className="text-gray-800"><span className="font-medium">Collaboration: </span>{senPlan.professionalSupport.collaboration}</p>
                    <p className="text-gray-800"><span className="font-medium">Training: </span>{senPlan.professionalSupport.training}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={handleReset}
                  >
                    Create a New Plan
                  </Button>
                  <Button onClick={() => window.print()}>
                    Print Development Plan
                  </Button>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </>
  );
}