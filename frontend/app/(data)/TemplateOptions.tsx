export interface OptionType {
  label: string;
  value: string;
}

export interface OptionDataType {
  [key: string]: OptionType[];
}

export interface ModelsByProviderType {
  [provider: string]: OptionType[];
}

const TemplateOptions: OptionDataType = {
  // Assessment options
  frequency: [
    { label: "Daily", value: "daily" },
    { label: "Weekly", value: "weekly" },
    { label: "Bi-weekly", value: "biweekly" },
    { label: "Monthly", value: "monthly" },
  ],
  deliveryMethod: [
    { label: "Email", value: "email" },
    { label: "WhatsApp", value: "whatsapp" },
    { label: "Both", value: "both" },
  ],
  questionTypes: [
    { label: "Multiple Choice", value: "multiple-choice" },
    { label: "True/False", value: "true-false" },
    { label: "Short Answer", value: "short-answer" },
    { label: "Flashcard", value: "flashcard" },
    { label: "Fill in the Blanks", value: "fill-blanks" },
    { label: "Oral", value: "oral" },
  ],
  difficulty: [
    { label: "Easy", value: "easy" },
    { label: "Medium", value: "medium" },
    { label: "Hard", value: "hard" },
    { label: "Expert", value: "expert" },
  ],

  level: [
    { label: "Low", value: "low" },
    { label: "Medium", value: "medium" },
    { label: "High", value: "high" },
  ],
  academic_paper_type: [
    { label: "Essay", value: "essay" },
    { label: "Report", value: "report" },
    { label: "Literature Review", value: "literature-review" },
    { label: "Research Proposal", value: "research-proposal" },
    { label: "Research Paper", value: "research-paper" },
    { label: "Thesis", value: "thesis" },
    { label: "Dissertation", value: "dissertation" },
    { label: "Literature Analysis Assistant", value: "literature-analysis" },
  ],
  learning_goals: [
    { label: "Understand the Basics", value: "understand-basics" },
    { label: "Get a General Overview", value: "general-overview" },
    { label: "Prepare for an Exam/Test", value: "prepare-exam" },
    { label: "Deep Dive / Master the Topic", value: "deep-dive" },
    { label: "Apply to a Project", value: "project-application" },
    { label: "Learn a Specific Skill", value: "skill-mastery" },
    { label: "Just Curious", value: "curiosity" },
  ],
  knowledge_levels: [
    { label: "Beginner (No prior knowledge)", value: "beginner" },
    { label: "Novice (Basic understanding)", value: "novice" },
    { label: "Intermediate (Some practical familiarity)", value: "intermediate" },
    { label: "Advanced (Solid understanding, some gaps)", value: "advanced" },
    { label: "Expert (Deep knowledge)", value: "expert" },
  ],
  learning_styles: [
    { label: "Visual (Diagrams, images, charts)", value: "visual" },
    { label: "Auditory (Verbal explanations, discussion prompts)", value: "auditory" },
    { label: "Reading/Writing (Text summaries, notes)", value: "reading-writing" },
    { label: "Kinaesthetic (Practical examples, exercises)", value: "kinaesthetic" },
    { label: "Conceptual (Analogies, metaphors, big picture)", value: "conceptual" },
    { label: "Detailed/Sequential (Step-by-step instructions)", value: "detailed" },
    { label: "Problem-Based (Focus on solving specific problems)", value: "problem-based" },
    { label: "Learning Schedule / Roadmap", value: "learning-schedule" },
    { label: "Course Outline / Syllabus", value: "course-outline" },
    { label: "Detailed Lesson Plan", value: "lesson-plan" },
    { label: "Project Ideas / Steps", value: "project-ideas" },
  ],
  learning_paces: [
    { label: "Relaxed (No pressure)", value: "relaxed" },
    { label: "Standard (Moderate pace)", value: "standard" },
    { label: "Focused (Consistent progress)", value: "focused" },
    { label: "Intensive (Fast-paced)", value: "intensive" },
  ],
  display_type: [ 
    { label: "Text", value: "text" },
    { label: "Video", value: "video" },
    { label: "Image", value: "image" },
    { label: "Chart", value: "chart" },
    { label: "Flash Card", value: "flash_card" },
    { label: "Infographic", value: "infographic" },
    { label: "Mind Map", value: "mind_map" },
    { label: "Game", value: "game" },
    { label: "Grid", value: "grid" },
    { label: "Timeline", value: "timeline" },
    { label: "Flowchart", value: "flow_chart" },
    { label: "Interactive Slider", value: "interactive_slider" },
    { label: "Canvas", value: "canvas" },
    { label: "Chat Page", value: "chat_page" },

  ],
  paper_type: [
    { label: "Essay", value: "essay" },
    { label: "Report", value: "report" },
    { label: "Literature Review", value: "literature-review" },
    { label: "Research Proposal", value: "research-proposal" },
    { label: "Research Paper", value: "research-paper" },
    { label: "Thesis", value: "thesis" },
    { label: "Dissertation", value: "dissertation" },
    { label: "Feedback Answers", value: "feedback-answers" },
  ],
  proposal_type: [
    { label: "Job Application", value: "job-application" },
    { label: "Grant Application", value: "grant-application" },
    { label: "Consulting Proposal", value: "consulting-proposal" },
  ],
  processing_type: [
    { label: "Transcription", value: "transcription" },
    { label: "Translation", value: "translation" },
  ],
  artificial_intelligence_course: [
    { label: "Foundations of Artificial Intelligence", value: "foundations-of-ai" },
    { label: "Generative AI", value: "generative-ai" },
    { label: "Prompt Engineering", value: "prompt-engineering" },
    { label: "AI Data Analysis", value: "ai-data-analysis" }, 
    { label: "Machine Learning", value: "machine-learning" },
    { label: "Deep Learning", value: "deep-learning" },
    { label: "Neural Networks", value: "neural-networks" },
    { label: "Natural Language Processing", value: "nlp" },
    { label: "Computer Vision", value: "computer-vision" },
    { label: "Reinforcement Learning", value: "reinforcement-learning" },
    { label: "AI Ethics", value: "ai-ethics" },
  ],
  
  dashboard_categories: [
    { label: "Academic Papers", value: "academic-papers" },
    { label: "STEM Courses", value: "stem-courses" },
    { label: "SEN Courses", value: "sen-courses" },
    { label: "General Courses", value: "general-courses" },
    { label: "Assessment", value: "assessment" },
    { label: "Maps", value: "maps" },
  ],
  sen: [
    { label: "Auditory", value: "auditory" },
    { label: "Speech", value: "speech" },
    { label: "Language", value: "language" },
    { label: "Mathematics", value: "mathematics" }, 
  ],

  // ----- NEW: High-Level STEM Categories (As provided) -----
  stem: [
    { label: "Science", value: "science" },
    { label: "Technology", value: "technology" },
    { label: "Engineering", value: "engineering" },
    { label: "Mathematics", value: "mathematics" }, 
  ],

  // ----- NEW: Template Options Grouped by Category -----

  // Academic Paper Templates
  academic_papers: [
     { label: "Academic Writer", value: "academic-writer" },
     { label: "Essay Outline Generator", value: "essay-outline-generator" },
     { label: "Literature Analysis Assistant", value: "literature-analysis" },
  ],

  // STEM - Science Templates
  stem_science: [
    { label: "Science Experiment Designer", value: "science-experiment-designer" },
    { label: "Chemistry Reaction Predictor", value: "chemistry-reaction-predictor" },
  ],

  // STEM - Technology Templates
  stem_technology: [
    { label: "Computer Science Algorithm Visualizer", value: "algorithm-visualizer" },
    // Add other Technology templates here if any
  ],

   // STEM - Engineering Templates
  stem_engineering: [
    // Add Engineering templates here if any (currently none from the list)
  ],

  // STEM - Mathematics Templates
  stem_mathematics: [
     { label: "Math Problem Solver", value: "math-problem-solver" },
     // Add other Mathematics templates here if any
  ],

  // SEN Course Templates (Currently empty based on provided templates)
  sen_courses: [
     // Add SEN specific templates here if any
  ],
  // Maps options
  depth: [
    { label: "Shallow", value: "shallow" },
    { label: "Medium", value: "medium" },
    { label: "Deep", value: "deep" },
  ],
  
  // File types for upload
  fileTypes: [
    { label: "Text (.txt)", value: "txt" },
    { label: "PDF (.pdf)", value: "pdf" },
    { label: "Word (.docx)", value: "docx" },
    { label: "PowerPoint (.pptx)", value: "power point" },
    { label: "Excel (.xlsx)", value: "excel" },
    { label: "Markdown (.md)", value: "md" },
    { label: "CSV (.csv)", value: "csv" },
    { label: "JSON (.json)", value: "json" },
    { label: "Images (.jpg, .png, etc)", value: "images" },
    { label: "Audio (.mp3, .wav, etc)", value: "audio" },
    { label: "Video (.mp4, .mov, etc)", value: "video" },
    { label: "ZIP (.zip)", value: "zip" },
  ],
  
  // Common options that might be used across templates
  audience: [
    { label: "Elementary School", value: "elementary" },
    { label: "Middle School", value: "middle" },
    { label: "High School", value: "high" },
    { label: "Undergraduate", value: "undergraduate" },
    { label: "Graduate", value: "graduate" },
    { label: "Professional", value: "professional" },
  ],
  
  // Used for Knowledge Drop templates - maps to same options as audience
  student_level: [
    { label: "Elementary School", value: "elementary" },
    { label: "Middle School", value: "middle" },
    { label: "High School", value: "high" },
    { label: "Undergraduate", value: "undergraduate" },
    { label: "Graduate", value: "graduate" },
    { label: "Professional", value: "professional" },
  ],
  
  // Tutor categories - extracted from Templates.tsx
  categories: [
    { label: "Writing", value: "writing" },
    { label: "English Literature", value: "english-literature" },
    { label: "Mathematics", value: "mathematics" },
    { label: "Science", value: "science" },
    { label: "History", value: "history" },
    { label: "Languages", value: "languages" },
    { label: "Critical Thinking", value: "critical-thinking" },
    { label: "Chemistry", value: "chemistry" },
    { label: "Art History", value: "art-history" },
    { label: "Economics", value: "economics" },
    { label: "Computer Science", value: "computer-science" },
    { label: "Psychology", value: "psychology" },
    { label: "Assessment", value: "assessment" },
    { label: "Maps", value: "maps" },
  ],
  
  // AI providers
  providers: [
    { label: "OpenAI", value: "openai" },
    { label: "Anthropic", value: "anthropic" },
    { label: "Google", value: "google" },
    { label: "DeepSeek", value: "deepseek" },
    { label: "Grok", value: "grok" },
  ],
};

// Models organized by provider
export const modelsByProvider: ModelsByProviderType = {
  openai: [
    { label: "GPT-4o", value: "gpt-4o" },
    { label: "GPT-4.5", value: "gpt-4.5" },
    { label: "o1", value: "o1" },
    { label: "o1-pro", value: "o1-pro" },
    { label: "o3-mini", value: "o3-mini" },
    { label: "o3-mini-high", value: "o3-mini-high" },
  ],
  anthropic: [
    { label: "Claude 3 Opus", value: "claude-3-opus" },
    { label: "Claude 3 Sonnet", value: "claude-3-sonnet" },
    { label: "Claude 3 Haiku", value: "claude-3-haiku" },
  ],
  google: [
    { label: "Gemini 2.5 Flash", value: "gemini-2.5-flash" },
    { label: "Gemini 2.0 Flash-Lite", value: "gemini-2.0-flash-lite" },
    { label: "Gemini 2.5 Pro", value: "gemini-2.5-pro" },
  ],
  deepseek: [
    { label: "DeepSeek-V3", value: "deepseek-v3" },
    { label: "DeepSeek-R1", value: "deepseek-r1" },
  ],
  grok: [
    { label: "Grok 3", value: "grok-3" },
    { label: "Grok 3 Mini", value: "grok-3-mini" },
  ],

};

// Helper function to get models based on selected provider
export const getModelsByProvider = (provider: string): OptionType[] => {
  return modelsByProvider[provider] || [];
};

export default TemplateOptions;
