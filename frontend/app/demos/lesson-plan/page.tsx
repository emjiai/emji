'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2Icon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import DemoHeader from '../_components/DemoHeader';
import LessonPlanGridDisplay from './_components/LessonPlanGridDisplay';
import lessonPlanData from '../_data/lesson-plan-data.json';

// Mock template data (would come from _data/DemoTemplates in production)
const demoLessonPlanTemplate = {
  name: "Lesson Plan Generator",
  slug: "lesson-plan",
  desc: "Create comprehensive, custom lesson plans for any topic or subject. Perfect for teachers, tutors, and educational professionals.",
  form: [
    {
      label: "Subject/Topic",
      field: "input",
      name: "subject",
      required: true,
      placeholder: "E.g., Mathematics, History, Science, Language Arts"
    },
    {
      label: "Grade Level",
      field: "input",
      name: "gradeLevel",
      required: true,
      placeholder: "E.g., 3rd Grade, High School, College"
    },
    {
      label: "Learning Objectives",
      field: "textarea",
      name: "objectives",
      required: true,
      placeholder: "What should students learn from this lesson? List the key objectives..."
    },
    {
      label: "Duration",
      field: "select",
      name: "duration",
      required: true,
      options: [
        { value: "day", label: "Single Day" },
        { value: "week", label: "Week-Long" },
        { value: "month", label: "Month-Long" }
      ]
    },
    {
      label: "Additional Requirements",
      field: "textarea",
      name: "additionalRequirements",
      required: false,
      placeholder: "Any specific activities, resources, or accommodations needed?"
    }
  ]
};

// Interface for lesson plan data
interface LessonPlanDay {
  day: string;
  topic: string;
  activities: string[];
  materials: string[];
  assessment: string;
  todaysLearning?: string;
}

interface LessonPlanResult {
  title: string;
  subject: string;
  gradeLevel: string;
  duration: string;
  overview: string;
  learningObjectives: string[];
  dailyPlans: LessonPlanDay[];
  resources: string[];
  differentiation: {
    struggling: string;
    advanced: string;
    ell: string;
  };
  assessment: {
    formative: string;
    summative: string;
    ongoing: string;
  };
}

// Mock function to generate a lesson plan (would be an API call in production)
const generateLessonPlan = async (formData: FormData): Promise<LessonPlanResult> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return mock data
  return mockLessonPlanResponse as LessonPlanResult;
};

const mockLessonPlanResponse = {
  title: "Introduction to Fractions - Week-Long Plan",
  subject: "Mathematics",
  gradeLevel: "4th Grade",
  duration: "Week-Long",
  overview: "This week-long lesson plan introduces students to the concept of fractions, their representation, and basic operations. Students will develop a conceptual understanding of fractions as parts of a whole and as numbers on a number line.",
  learningObjectives: [
    "Understand fractions as parts of a whole",
    "Represent fractions on a number line",
    "Compare fractions with the same denominator",
    "Identify equivalent fractions",
    "Solve simple word problems involving fractions"
  ],
  dailyPlans: [
    {
      day: "Day 1",
      topic: "Introduction to Fractions",
      todaysLearning: "Today, students will be introduced to the concept of fractions as parts of a whole. Through hands-on activities and visual representations, they will develop an understanding of what fractions represent and how they are written.",
      activities: [
        "Warm-up: Show students various objects divided into equal parts",
        "Direct Instruction: Introduce fraction terminology (numerator, denominator)",
        "Group Activity: Use fraction manipulatives to represent different fractions",
        "Independent Practice: Worksheet on identifying fractions from visual models",
        "Exit Ticket: Draw a model to represent a given fraction"
      ],
      materials: [
        "Fraction manipulatives",
        "Fraction circles and bars",
        "Worksheets",
        "Colored pencils",
        "Exit ticket slips"
      ],
      assessment: "Exit Ticket: Students will draw a visual model to represent 3/4"
    },
    {
      day: "Day 2",
      topic: "Fractions on a Number Line",
      todaysLearning: "Today, students will learn how to place fractions on a number line. They will understand how fractions can be represented on a number line and how to compare fractions with the same denominator.",
      activities: [
        "Warm-up: Review previous day's concepts with quick visual examples",
        "Direct Instruction: Demonstrate how to place fractions on a number line",
        "Partner Activity: Creating number lines and placing fraction cards",
        "Independent Practice: Worksheet on placing fractions on number lines",
        "Reflection: Journal entry about connections between fractions and number lines"
      ],
      materials: [
        "Number line templates",
        "Fraction cards",
        "Journals",
        "Colored pencils"
      ],
      assessment: "Number line worksheet accuracy and journal reflections"
    },
    {
      day: "Day 3",
      topic: "Comparing Fractions",
      todaysLearning: "Today, students will learn how to compare fractions with the same denominator. They will understand how to use comparison symbols to compare fractions and how to explain their reasoning.",
      activities: [
        "Warm-up: Quick review of fractions on a number line",
        "Direct Instruction: Strategies for comparing fractions with the same denominator",
        "Group Activity: Fraction comparison card game",
        "Independent Practice: Worksheet on comparing fractions",
        "Exit Ticket: Compare two given fractions and explain your reasoning"
      ],
      materials: [
        "Comparison symbols cards",
        "Fraction comparison worksheets",
        "Game cards",
        "Colored pencils"
      ],
      assessment: "Exit ticket responses and game performance observations"
    },
    {
      day: "Day 4",
      topic: "Equivalent Fractions",
      todaysLearning: "Today, students will learn about equivalent fractions. They will understand how to identify equivalent fractions and how to explain their reasoning.",
      activities: [
        "Warm-up: Review fraction comparisons",
        "Direct Instruction: Introduce the concept of equivalent fractions",
        "Partner Activity: Matching equivalent fractions using fraction tiles",
        "Independent Practice: Worksheet on identifying equivalent fractions",
        "Digital Activity: Interactive fraction tiles on tablets/computers"
      ],
      materials: [
        "Fraction tiles",
        "Matching cards",
        "Digital devices",
        "Colored pencils"
      ],
      assessment: "Matching game accuracy and worksheet completion"
    },
    {
      day: "Day 5",
      topic: "Fractions in Word Problems",
      todaysLearning: "Today, students will learn how to solve word problems involving fractions. They will understand how to apply fraction concepts to real-world scenarios and how to explain their reasoning.",
      activities: [
        "Warm-up: Review of key concepts from the week",
        "Direct Instruction: Strategies for solving word problems with fractions",
        "Group Activity: Collaborative problem-solving with fraction scenarios",
        "Independent Practice: Mixed review of the week's concepts",
        "Assessment: Final quiz and reflection on fraction learning",
        "Reflection: Share one important thing learned about fractions this week"
      ],
      materials: [
        "Word problem examples",
        "Quiz papers",
        "Reflection cards",
        "Colored pencils"
      ],
      assessment: "Final quiz and student reflections"
    }
  ],
  resources: [
    "Fraction manipulatives (circles, bars, and number lines)",
    "Visual fraction posters for classroom display",
    "Interactive digital fraction tools",
    "Differentiated worksheet packets",
    "Children's books about fractions",
    "Online fraction games for reinforcement"
  ],
  differentiation: {
    struggling: "Provide simpler fractions, additional visual supports, and more concrete manipulatives. Consider pre-teaching key vocabulary and concepts in small groups.",
    advanced: "Extend activities to include comparing fractions with different denominators, adding fractions, and more complex word problems requiring multiple steps.",
    ell: "Provide visual supports, vocabulary cards with images, and sentence frames for mathematical discussions. Allow for native language support when possible."
  },
  assessment: {
    formative: "Daily exit tickets, worksheets, observations of group work",
    summative: "End-of-week comprehensive fractions quiz",
    ongoing: "Tracking of student participation and understanding during discussions and activities"
  }
};

export default function LessonPlanDemo() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({
    subject: '',
    gradeLevel: '',
    objectives: '',
    duration: 'week',
    additionalRequirements: ''
  });
  const [lessonPlan, setLessonPlan] = useState<LessonPlanResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [useTestData, setUseTestData] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
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
      // If using test data, generate a mock lesson plan
      if (useTestData) {
        const result = await generateLessonPlan(new FormData());
        setLessonPlan(result);
      } else {
        // Use the API endpoint for real data
        const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
        const apiEndpoint = `${API_BASE_URL}/api/v1/load_lesson_plan_data`;

        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data);
        setLessonPlan(data);
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Handle reset to create a new lesson plan
  const handleReset = () => {
    setLessonPlan(null);
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
        {!lessonPlan ? (
          // Lesson Plan Generation Form
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between mb-6">
                <h2 className="text-xl font-semibold">Create Your Lesson Plan</h2>
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
                  <p className="mb-4">Using sample lesson plan data for a 7th grade science class covering cells and body systems.</p>
                  <Button
                    onClick={handleSubmit}
                    className="w-full py-6"
                    disabled={loading}
                  >
                    {loading && <Loader2Icon className="animate-spin mr-2" />}
                    Load Sample Lesson Plan
                  </Button>
                </div>
              ) : (
                <div>
                  {demoLessonPlanTemplate.form.map((field, index) => (
                    <div key={index} className="mb-4">
                      <label className="block font-medium mb-1">{field.label}</label>
                      {field.field === 'file' ? (
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
                            <p className="text-sm text-gray-500">Upload a curriculum or standards document (optional)</p>
                          )}
                        </div>
                      ) : field.field === 'textarea' ? (
                        <Textarea
                          name={field.name}
                          required={field.required}
                          placeholder={field.placeholder}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          className="min-h-[100px]"
                        />
                      ) : field.field === 'select' ? (
                        <select
                          name={field.name}
                          required={field.required}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          className="w-full border border-gray-300 rounded-md p-2"
                        >
                          <option value="">Select {field.label}</option>
                          {field.options?.map((option, i) => (
                            <option key={i} value={option.value}>{option.label}</option>
                          ))}
                        </select>
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

                  {/* Optional file upload if not already in template */}
                  {!demoLessonPlanTemplate.form.some(field => field.field === 'file') && (
                    <div className="mb-6">
                      <label className="block font-medium mb-1">Reference Document (Optional)</label>
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
                          <p className="text-sm text-gray-500">Upload a curriculum or standards document</p>
                        )}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleSubmit}
                    className="w-full py-6"
                    disabled={loading}
                  >
                    {loading && <Loader2Icon className="animate-spin mr-2" />}
                    Generate Lesson Plan
                  </Button>
                </div>
              )}

              {loading && (
                <div className="mt-6 flex items-center justify-center">
                  <Loader2Icon className="animate-spin mr-2" size={24} />
                  <span>Creating your lesson plan...</span>
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
          // Display the generated lesson plan using the LessonPlanGridDisplay component
          // for both test data and API data since they have the same structure
          <LessonPlanGridDisplay
            lessonPlan={useTestData ? lessonPlanData : lessonPlan as any}
            onReset={handleReset}
          />
        )}
      </div>
    </>
  );
}