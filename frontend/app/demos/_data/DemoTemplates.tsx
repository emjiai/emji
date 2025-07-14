// Demo templates configuration for demo pages
// These templates use the same structure as the main Templates.tsx but with simplified fields

export const demoQuizTemplate = {
  name: "Demo Quiz Generator",
  desc: "Create interactive quizzes on any subject with different question types and instant feedback.",
  category: "Assessment",
  icon: "https://img.icons8.com/color/96/ask-question.png",
  aiPrompt:
    "Create a comprehensive quiz with a mix of question types (multiple choice, true/false, short answer) on the given topic. Include explanations for each answer.",
  slug: "demo-quiz-generator",
  form: [
    {
      label: "Quiz Topic",
      field: "input",
      name: "topic",
      required: true,
      placeholder: "e.g., Ancient Rome, Basic Algebra, Climate Change"
    },
    {
      label: "Number of Questions",
      field: "input",
      name: "questionCount",
      required: true,
      placeholder: "e.g., 5, 10"
    },
    {
      label: "Question Types",
      field: "select",
      name: "questionTypes",
      required: true,
      placeholder: "Select question types",
      options: [
        { label: "Multiple Choice", value: "multiple-choice" },
        { label: "True/False", value: "true-false" },
        { label: "Short Answer", value: "short-answer" },
        { label: "Flash Card", value: "flash-card" },
        { label: "Matching", value: "matching" },
        { label: "Sequence Ordering", value: "step-ordering" },
        { label: "Multiple Answer", value: "multiple-answer" },
        { label: "Case Study", value: "case-study" },
        { label: "Fill in the Blanks", value: "fill-in-the-blanks" },
        { label: "Viva (Voice Interview)", value: "viva" },
      ]
    },
    {
      label: "Difficulty Level",
      field: "select",
      name: "difficulty",
      required: true,
      placeholder: "Select difficulty level",
      options: [
        { label: "Beginner", value: "beginner" },
        { label: "Intermediate", value: "intermediate" },
        { label: "Advanced", value: "advanced" }
      ]
    },
    {
      label: "Additional Information (Optional)",
      field: "textarea",
      name: "additionalInfo",
      required: false,
      placeholder: "Provide any specific topics, instructions, or context for the quiz (optional)"
    }
  ],
};

export const demoAssessmentTemplate = {
  name: "Demo Formative Assessment",
  desc: "Create a comprehensive formative assessment with detailed feedback for learning improvement.",
  category: "Assessment",
  icon: "https://img.icons8.com/color/96/test-partial-passed.png",
  aiPrompt:
    "Create a formative assessment with detailed feedback on the given topic. Include scoring criteria and improvement suggestions.",
  slug: "demo-formative-assessment",
  form: [
    {
      label: "Assessment Topic",
      field: "input",
      name: "topic",
      required: true,
      placeholder: "e.g., Ancient Rome, Basic Algebra, Climate Change"
    },
    {
      label: "Your Response",
      field: "textarea",
      name: "response",
      required: true,
      placeholder: "Write your response to the topic..."
    },
    {
      label: "Learning Level",
      field: "input",
      name: "level",
      required: true,
      placeholder: "e.g., beginner, intermediate, advanced"
    }
  ],
};

export const demoDocumentTemplate = {
  name: "Demo Document Reader",
  desc: "Upload any document to get an AI-powered summary and analysis.",
  category: "Document Summarizer",
  icon: "https://img.icons8.com/color/96/document--v1.png",
  aiPrompt:
    "Analyze and summarize the given document with key points, insights, and main takeaways.",
  slug: "demo-document-reader",
  form: [
    {
      label: "Topic",
      field: "input",
      name: "topic",
      required: true,
      placeholder: "What is the main topic or subject of your document?"
    },
    {
      label: "Custom Prompt",
      field: "textarea",
      name: "prompt",
      required: true,
      placeholder: "Describe how you want the document to be analyzed and summarized."
    },
    {
      label: "Document",
      field: "file",
      name: "file",
      required: false,
      fileAccept: ".pdf,.docx,.txt"
    },
    {
      label: "Document URL",
      field: "input",
      name: "file_url",
      required: false,
      placeholder: "https://example.com/document.pdf"
    },
    {
      label: "File Type",
      field: "select",
      name: "file_type",
      required: false,
      options: [
        { label: "PDF", value: "pdf" },
        { label: "Word Document", value: "docx" },
        { label: "Text File", value: "txt" },
        { label: "Other", value: "other" }
      ]
    },
    {
      label: "AI Provider",
      field: "select",
      name: "provider",
      required: false,
      defaultValue: "google",
      options: [
        { label: "Google", value: "google" },
        { label: "OpenAI", value: "openai" },
        { label: "Anthropic", value: "anthropic" }
      ]
    },
    {
      label: "AI Model",
      field: "select",
      name: "model",
      required: false,
      defaultValue: "gemini-2.5-flash-preview-05-20",
      options: [
        { label: "Gemini 2.5 Flash", value: "gemini-2.5-flash-preview-05-20" },
        { label: "GPT-4", value: "gpt-4.1-mini" },
        { label: "Claude 3.5 Sonnet", value: "claude-3-5-sonnet" }
      ]
    },
    {
      label: "Analysis Level",
      field: "select",
      name: "level",
      required: false,
      defaultValue: "intermediate",
      options: [
        { label: "Basic", value: "basic" },
        { label: "Intermediate", value: "intermediate" },
        { label: "Advanced", value: "advanced" }
      ]
    },
    {
      label: "Content Types",
      field: "multiselect",
      name: "content_types",
      required: false,
      defaultValue: "summary,mind_map,flash_card,infographic,post_it,podcast,citation",
      options: [
        { label: "Summary", value: "summary" },
        { label: "Mind Map", value: "mind_map" },
        { label: "Flash Cards", value: "flash_card" },
        { label: "Infographic", value: "infographic" },
        { label: "Post-it Notes", value: "post_it" },
        { label: "Podcast Script", value: "podcast" },
        { label: "Citations", value: "citation" }
      ]
    }
  ],
};
