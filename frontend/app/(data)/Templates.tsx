export default [
  {
    name: "Personalised Courses", // Renamed for clarity
    desc: "Leverage Generative AI to create a personalized learning plan or course module tailored to your subject, goals, knowledge level, and preferred learning style.", // Updated Description
    category: "Personalised Courses", // New Category
    icon: "https://img.icons8.com/external-kiranshastry-gradient-kiranshastry/64/external-edit-interface-kiranshastry-gradient-kiranshastry-1.png", // Updated Icon (Example: Learning Path)
    aiPrompt:
      "Generate a personalized learning experience. Specify the Subject/Topic. Detail your Learning Goal (e.g., 'pass exam', 'build a project'), Current Knowledge Level (beginner, intermediate, advanced), preferred Learning Style(s) (e.g., visual, practical, detailed), desired Output Type (e.g., course outline, lesson plan, explanation), desired Pace (optional), and any specific Areas to Focus On or Interests to incorporate (optional) for relatable examples.", // Updated AI Prompt
    slug: "personalised-courses", // Updated Slug
    form: [ // Updated Form Fields for Personalization
      {
        label: "Subject / Topic",
        field: "input", // Or 'textarea' if longer descriptions are expected
        name: "subject_topic",
        required: true,
        placeholder: "e.g., Introduction to Python Programming, World War II History"
      },
      {
        label: "Learning Goal",
        field: "input",
        name: "learning_goals",
        required: false,
      },
      {
        label: "Current Knowledge Level",
        field: "input",
        name: "knowledge_levels",
        required: false,
      },
      {
        label: "Preferred Learning Style(s)",
        field: "input",
        name: "learning_styles",
        required: false,
      },
      {
        label: "Desired Output Type",
        field: "input",
        name: "display_type",
        required: true,
      },
      {
        label: "Desired Pace (Optional)",
        field: "input",
        name: "learning_paces",
        required: false,
      },
      {
        label: "Specific Focus or Challenges (Optional)",
        field: "textarea",
        name: "lesson_description",
        required: true,
        placeholder: "e.g., Focus on loops and functions, Difficulty with dates and names"
      },
      {
        label: "Interests for Analogies (Optional)",
        field: "input",
        name: "interests",
        required: false,
        placeholder: "e.g., Football, cooking, sci-fi movies"
      },
    ],
  },
  {
    name: "Academic Papers",
    desc: "An AI tool that helps students create structured academic papers based on their topic and key points.",
    category: "Academic Writing",
    icon: "https://img.icons8.com/external-kiranshastry-gradient-kiranshastry/64/external-edit-interface-kiranshastry-gradient-kiranshastry-1.png",
    aiPrompt:
      "Create a detailed academic paper with introduction, main points, and conclusion based on the given topic and key ideas. Provide explanations for each section to guide the student in expanding their thoughts.",
    slug: "academic-writer",
    form: [
      {
        label: "Type of Paper",
        field: "input",
        name: "paper_type",
        required: true,
      },
      {
        label: "Topic",
        field: "input",
        name: "topic",
        required: true,
      },
      {
        label: "Key Ideas (comma-separated)",
        field: "input",
        name: "keyIdeas",
        required: true,
      },
      {
        label: "Prompt",
        field: "textarea",
        name: "prompt",
        required: false,
        placeholder: "Specify any additional instructions or requirements for your paper"
      },
      {
        label: "Marking Criteria",
        field: "file",
        name: "marking_criteria_file",
        required: false,
      },
      {
        label: "Additional Information",
        field: "textarea",
        name: "additional_info",
        required: false,
        placeholder: "Any other relevant information for your academic paper"
      },
    ],
  },

  // Updated STEM Courses Template
 {
  name: "STEM Courses",
  desc: "Explore STEM concepts, solve problems, or design projects across Science, Technology, Engineering, and Mathematics.", // Updated Description
  category: "STEM", // Assuming a top-level STEM category exists or is intended
  icon: "https://img.icons8.com/external-kiranshastry-gradient-kiranshastry/64/external-edit-interface-kiranshastry-gradient-kiranshastry-1.png", // Kept Icon
  aiPrompt:
    "Specify a STEM topic, problem, or concept you need help with (e.g., 'explain photosynthesis', 'solve this physics equation', 'design a simple circuit', 'explain Pythagorean theorem'). Provide details for a tailored explanation or solution.", // Updated AI Prompt
  slug: "stem-courses",
  form: [ // Updated Form
    {
      label: "Category",
      field: "input",
      name: "stem",
      required: true,
    },
    {
      label: "STEM Topic, Problem, or Concept",
      field: "textarea", // Changed field type
      name: "stem_query", // Changed name
      required: true,
    },
     {
      label: "Subject Area (e.g., Physics, Biology, Calculus, Programming)", // Optional clarification
      field: "input",
      name: "subject_area",
      required: false, // Making optional as query might be specific enough
    },
  ],
},

// Updated SEN Courses Template
{
  name: "SEN Courses",
  desc: "Access learning support tailored for Special Educational Needs, focusing on areas like auditory processing, speech, language, or math adaptations.", // Updated Description
  category: "SEN", // Assuming a top-level SEN category exists or is intended
  icon: "https://img.icons8.com/pulsar-gradient/96/literature-1.png", // Kept Icon
  aiPrompt:
    "Describe the specific SEN learning challenge or topic you need assistance with (e.g., 'strategies for dyslexia in reading', 'visual aids for math concepts', 'breaking down instructions for auditory processing difficulties'). Provide context about the learner's needs for better support.", // Updated AI Prompt
  slug: "sen-courses",
  form: [ // Updated Form
    {
      label: "Category",
      field: "input",
      name: "sen",
      required: true,
    },
    {
      label: "Learning Challenge or Topic",
      field: "textarea", // Changed field type
      name: "sen_query", // Changed name
      required: true,
    },
    {
      label: "Specific Needs or Context (Optional)",
      field: "textarea",
      name: "sen_context",
      required: false,
    },
  ],
},



// Updated Artificial Intelligence Courses Template
{
  name: "Live Class",
  desc: "Participate in a live class about courses, asking questions and exploring concepts in real-time.", // Updated Description
  category: "Live Class", // Or potentially "STEM" depending on your structure
  icon: "https://img.icons8.com/nolan/96/math.png", // Kept Icon (Consider changing to a more AI-related icon if available)
  aiPrompt:
    "Ask about an AI topic, algorithm, or concept (e.g., 'explain machine learning', 'describe how neural networks work', 'what are the ethics of AI?', 'compare supervised vs. unsupervised learning'). Provide specifics for a detailed explanation.", // Updated AI Prompt
  slug: "live-class",
  form: [ // Updated Form
    {
      label: "Course",
      field: "input",
      name: "live_class",
      required: true,
    },
    {
      label: "AI Topic, Algorithm, or Question", // Updated label
      field: "textarea",
      name: "ai_query", // Changed name
      required: true,
    },
    {
      label: "Specific Aspect to Focus On (Optional)", // Changed label
      field: "input",
      name: "ai_focus", // Changed name
      required: false,
    },
  ],
},
  {
    name: "Quiz Generator",
    desc: "Create comprehensive multiple-choice or short answer quizzes on any subject with answer keys.",
    category: "Assessment",
    icon: "https://img.icons8.com/external-kiranshastry-gradient-kiranshastry/64/external-edit-interface-kiranshastry-gradient-kiranshastry-1.png",
    aiPrompt:
      "Generate a comprehensive quiz on the given topic with the specified number of questions. Include a mix of multiple-choice, true/false, and short answer questions as requested. Provide an answer key with explanations for each correct answer.",
    slug: "quiz-generator",
    form: [
      {
        label: "Topic",
        field: "input",
        name: "topic",
        required: true,
      },
      {
        label: "Prompt",
        field: "textarea",
        name: "prompt",
        required: true,
      },
      {
        label: "Number of Questions",
        field: "input",
        name: "questionCount",
        required: true,
      },
      {
        label: "Question Types",
        field: "input",
        name: "questionTypes",
        required: true,
      },
      {
        label: "Difficulty Level",
        field: "input",
        name: "difficulty",
        required: true,
      },
    ],
  },
  {
    name: "Formative Assessment",
    desc: "Design formative assessments to check understanding during the learning process with targeted feedback.",
    category: "Assessment",
    icon: "https://img.icons8.com/color/96/test-partial-passed.png",
    aiPrompt:
      "Create a formative assessment for the specified learning objective that helps gauge student understanding during the learning process. Include a variety of question types, provide clear instructions for administration, and suggest specific feedback strategies based on common misconceptions or errors.",
    slug: "formative-assessment",
    form: [
      {
        label: "Assessment Title", 
        field: "input",           
        name: "title",
        required: true,
      },
      {
        label: "Assessment Question(s)",
        field: "textarea",
        name: "question_text",
        required: true,
      },
      {
        label: "Maximum Mark (Default: 100)", 
        field: "input",           
        name: "max_mark",
        required: false,          
      },
      {
        label: "Assessment Strictness", 
        field: "input",           
        name: "level",            
        required: true,           
      },
      {
        label: "Grading Criteria (Optional)", 
        field: "textarea",       
        name: "grading_criteria",
        required: false,
      }
    ],
  },
  {
    name: "Summative Assessment",
    desc: "Design summative assessments to check understanding during the learning process with targeted feedback.",
    category: "Assessment",
    icon: "https://img.icons8.com/color/96/test-partial-passed.png",
    aiPrompt:
      "Create a summative assessment for the specified learning objective that helps gauge student understanding during the learning process. Include a variety of question types, provide clear instructions for administration, and suggest specific feedback strategies based on common misconceptions or errors.",
    slug: "summative-assessment",
    form: [
      {
        label: "Assessment Title", 
        field: "input",           
        name: "title",
        required: true,
      },
      {
        label: "Assessment Question(s)",
        field: "textarea",
        name: "question_text",
        required: true,
      },
      {
        label: "Maximum Mark (Default: 100)", 
        field: "input",           
        name: "max_mark",
        required: false,          
      },
      {
        label: "Assessment Strictness", 
        field: "input",           
        name: "level",            
        required: true,           
      },
      {
        label: "Grading Criteria (Optional)", 
        field: "textarea",       
        name: "grading_criteria",
        required: false,
      }
    ],
  },
  {
    name: "Process Map Creator",
    desc: "Visualize and explain complex processes with step-by-step flowcharts and explanations to understand the process better.",
    category: "Maps",
    icon: "https://img.icons8.com/color/96/process.png",
    aiPrompt:
      "Create a detailed process map for the given topic. Break down the process into clear sequential steps, identify decision points, and highlight key actions. Provide descriptions for each step and explain connections between them. Include tips for effectively implementing or understanding the process.",
    slug: "process-map-creator",
    form: [
      {
        label: "Process Name",
        field: "input",
        name: "process",
        required: true,
      },
      {
        label: "Purpose of the Process",
        field: "textarea",
        name: "purpose",
        required: true,
      },
      {
        label: "Starting Point and End Goal",
        field: "textarea",
        name: "endpoints",
        required: true,
      },
      {
        label: "Key Stakeholders (if applicable)",
        field: "input",
        name: "stakeholders",
        required: false,
      },
    ],
  },
  {
    name: "Knowledge Map Generator",
    desc: "Create comprehensive knowledge maps connecting concepts, terms, and ideas for enhanced understanding.",
    category: "Maps",
    icon: "https://img.icons8.com/color/96/mind-map.png",
    aiPrompt:
      "Generate a knowledge map for the specified subject area that shows connections between key concepts, terms, and ideas. Identify central concepts and their relationships to subordinate ideas. Include brief explanations of each concept and describe how they connect to form a comprehensive understanding of the subject.",
    slug: "knowledge-map-generator",
    form: [
      {
        label: "Subject Area",
        field: "input",
        name: "subject",
        required: true,
      },
      {
        label: "Main Concepts (comma-separated)",
        field: "input",
        name: "mainConcepts",
        required: true,
      },
      {
        label: "Depth Level",
        field: "input",
        name: "depth",
        required: true,
      },
      {
        label: "Focus Areas",
        field: "textarea",
        name: "focus",
        required: false,
      },
    ],
  },
  {
    name: "Spot Quiz",
    desc: "Create knowledge quizzes that can be delivered on a schedule to reinforce key concepts and track understanding.",
    category: "Assessment",
    icon: "https://img.icons8.com/color/96/knowledge-sharing.png",
    aiPrompt:
      "Create an engaging knowledge quiz based on the specified course topic. Generate quiz questions that reinforce key concepts while challenging the student's understanding. Include explanations for correct answers to enhance learning.",
    slug: "knowledge-drop-quiz",
    form: [
      {
        label: "Title",
        field: "input",
        name: "title",
        required: true,
      },
      {
        label: "Course or Subject Title",
        field: "input",
        name: "course_title",
        required: true,
      },
      {
        label: "Key Topics (comma-separated)",
        field: "textarea",
        name: "key_topics",
        required: true,
      },
      {
        label: "Student Level",
        field: "input",
        name: "student_level",
        required: true,
      },
      {
        label: "Delivery Frequency",
        field: "input",
        name: "frequency",
        required: true,
      },
      {
        label: "Recipient Email",
        field: "input",
        name: "recipient_email",
        required: true,
      },
      {
        label: "Recipient Name",
        field: "input",
        name: "recipient_name",
        required: true,
      },
      {
        label: "Content Source (Optional)",
        field: "textarea",
        name: "content_source",
      },
      {
        label: "File Upload (Optional)",
        field: "file",
        name: "file",
      },
      {
        label: "Delivery Method",
        field: "input",
        name: "delivery_method",
        required: true,
      },
    ],
  },
  {
    name: "Knowledge Drops",
    desc: "Deliver concise, bite-sized learning tips and insights on a scheduled basis to reinforce understanding during the learning process, complemented by targeted feedback.",
    category: "Assessment",
    icon: "https://img.icons8.com/color/96/questions.png",
    aiPrompt:
      "Create a formative assessment knowledge drop for the specified course topic. Design questions that help gauge student understanding during the learning process. Include clear instructions and specific feedback strategies based on expected responses.",
    slug: "knowledge-drop-formative",
    form: [
      {
        label: "Title",
        field: "input",
        name: "title",
        required: true,
      },
      {
        label: "Course or Subject Title",
        field: "input",
        name: "course_title",
        required: true,
      },
      {
        label: "Key Topics (comma-separated)",
        field: "textarea",
        name: "key_topics",
        required: true,
      },
      {
        label: "Student Level",
        field: "input",
        name: "student_level",
        required: true,
      },
      {
        label: "Delivery Frequency",
        field: "input",
        name: "frequency",
        required: true,
      },
      {
        label: "Recipient Email",
        field: "input",
        name: "recipient_email",
        required: true,
      },
      {
        label: "Recipient Name",
        field: "input",
        name: "recipient_name",
        required: true,
      },
      {
        label: "Content Source (Optional)",
        field: "textarea",
        name: "content_source",
      },
      {
        label: "File Upload (Optional)",
        field: "file",
        name: "file",
      },
      {
        label: "Delivery Method",
        field: "input",
        name: "delivery_method",
        required: true,
      },
    ],
  },
  {
    name: "Proposal Writer",
    desc: "An AI tool that helps students create structured proposals based on their topic and key points.",
    category: "Proposal Writing",
    icon: "https://img.icons8.com/external-kiranshastry-gradient-kiranshastry/64/external-edit-interface-kiranshastry-gradient-kiranshastry-1.png",
    aiPrompt:
      "Create a detailed proposal with introduction, main points, and conclusion based on the given topic and key ideas. Provide explanations for each section to guide the student in expanding their thoughts.",
    slug: "proposal-writer",
    form: [
      {
        label: "Type of Proposal",
        field: "input",
        name: "proposal_type",
        required: true,
      },
      {
        label: "Topic",
        field: "input",
        name: "topic",
        required: true,
      },
      {
        label: "Prompt",
        field: "textarea",
        name: "prompt",
        required: true,
      },
      {
        label: "Start Date",
        field: "input",
        name: "start_date",
        required: true,
      },
      {
        label: "End Date",
        field: "input",
        name: "end_date",
        required: true,
      },
      {
        label: "Search Term",
        field: "input",
        name: "search_term",
        required: true,
      },
      {
        label: "Location",
        field: "input",
        name: "location",
        required: false,
        placeholder: "Specify any additional instructions or requirements for your proposal"
      },
      {
        label: "Experience",
        field: "input",
        name: "experience",
        required: false,
        placeholder: "Any other relevant information for your proposal"
      },
      {
        label: "Job Type",
        field: "input",
        name: "job_type",
        required: false,
        placeholder: "Any other relevant information for your proposal"
      },
    ],
  },
    // Updated STEM Courses Template
 {
  name: "Document Processing",
  desc: "Extract text from documents, translate, and process them for better understanding.", // Updated Description
  category: "Document Processing", // Assuming a top-level STEM category exists or is intended
  icon: "https://img.icons8.com/external-kiranshastry-gradient-kiranshastry/64/external-edit-interface-kiranshastry-gradient-kiranshastry-1.png", // Kept Icon
  aiPrompt:
    "Specify a STEM topic, problem, or concept you need help with (e.g., 'explain photosynthesis', 'solve this physics equation', 'design a simple circuit', 'explain Pythagorean theorem'). Provide details for a tailored explanation or solution.", // Updated AI Prompt
  slug: "document-processing",
  form: [ // Updated Form
    {
      label: "Category",
      field: "input",
      name: "processing_type",
      required: true,
    },
    {
      label: "Prompt",
      field: "textarea", // Changed field type
      name: "prompt", // Changed name
      required: false,
    },
     {
      label: "Target Language", // Optional clarification
      field: "input",
      name: "target_language",
      required: false, // Making optional as query might be specific enough
    },
  ],
},

{
  name: "Document Summarizer",
  desc: "Get summaries of documents, translate, and process them for better understanding.", // Updated Description
  category: "Document Summarizer", // Assuming a top-level STEM category exists or is intended
  icon: "https://img.icons8.com/external-kiranshastry-gradient-kiranshastry/64/external-edit-interface-kiranshastry-gradient-kiranshastry-1.png", // Kept Icon
  aiPrompt:
    "Summarize the given document.", // Updated AI Prompt
  slug: "document-summarizer",
  form: [ // Updated Form
    {
      label: "Category",
      field: "input",
      name: "processing_type",
      required: true,
    },
    {
      label: "Prompt",
      field: "textarea", // Changed field type
      name: "prompt", // Changed name
      required: false,
    },
     {
      label: "Target Language", // Optional clarification
      field: "input",
      name: "target_language",
      required: false, // Making optional as query might be specific enough
    },
  ],
},

{
  name: "Deep Research",
  desc: "Generate in-depth research reports on any topic or task in just a few minutes.", // Updated Description
  category: "Deep Research", // Assuming a top-level STEM category exists or is intended
  icon: "https://img.icons8.com/external-kiranshastry-gradient-kiranshastry/64/external-edit-interface-kiranshastry-gradient-kiranshastry-1.png", // Kept Icon
  aiPrompt:
    "Summarize the given document.", // Updated AI Prompt
  slug: "deep-research",
  form: [ // Updated Form
    {
      label: "Category",
      field: "input",
      name: "processing_type",
      required: true,
    },
    {
      label: "Prompt",
      field: "textarea", // Changed field type
      name: "prompt", // Changed name
      required: false,
    },
     {
      label: "Target Language", // Optional clarification
      field: "input",
      name: "target_language",
      required: false, // Making optional as query might be specific enough
    },
  ],
},
{
  name: "Ebook",
  desc: "Generate detailed ebooks on any topic or task in just a few minutes.", // Updated Description
  category: "Ebook", // Assuming a top-level STEM category exists or is intended
  icon: "https://img.icons8.com/external-kiranshastry-gradient-kiranshastry/64/external-edit-interface-kiranshastry-gradient-kiranshastry-1.png", // Kept Icon
  aiPrompt:
    "Generate an ebook on the given topic.", // Updated AI Prompt
  slug: "ebook",
  form: [ // Updated Form
    {
      label: "Category",
      field: "input",
      name: "processing_type",
      required: true,
    },
    {
      label: "Prompt",
      field: "textarea", // Changed field type
      name: "prompt", // Changed name
      required: false,
    },
     {
      label: "Target Language", // Optional clarification
      field: "input",
      name: "target_language",
      required: false, // Making optional as query might be specific enough
    },
  ],
},
];


