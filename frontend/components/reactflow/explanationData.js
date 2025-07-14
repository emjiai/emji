// Example Nodes and Edges for VisualExplanationDisplay

import { MarkerType, Position } from 'reactflow';

// --- Example Nodes ---
export const explanationNodes = [
  // Header
  {
    id: 'header',
    type: 'default', // Or use 'NodeHeader' if available and suitable
    data: { label: 'Generative AI in the Workplace: A Visual Guide' },
    position: { x: 0, y: 0 }, // Positioned by layout
    style: { width: 350, height: 50, background: '#dbeafe', fontWeight: 'bold', fontSize: '1.1em', textAlign: 'center', border: '1px solid #bfdbfe' },
    sourcePosition: Position.Bottom,
  },

  // --- What is GenAI Section ---
  {
    id: 'what-is-genai',
    type: 'default', // BaseNode or custom ConceptNode
    data: {
      label: 'What is Generative AI?',
      description: 'A smart assistant that CREATES new things (text, images, etc.) based on instructions ("prompts") after learning from lots of examples.',
    },
    position: { x: 0, y: 100 },
    style: { width: 300, background: '#fff', border: '1px solid #cbd5e1', padding: '10px' },
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  },
  {
    id: 'what-is-diagram',
    type: 'diagramPlaceholder', // Custom Node Type
    data: {
      label: 'Simple Analogy',
      description: 'Think: Input (Data) -> Brain (AI Model) -> Output (New Content)',
      // In a real component, this might include props for rendering a simple visual
    },
    position: { x: 0, y: 220 },
    style: { width: 300, height: 80, background: '#f0f9ff', border: '1px dashed #7dd3fc', textAlign: 'center' },
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  },

  // --- How it Works Section ---
   {
    id: 'how-it-works-group', // Group node to contain the steps
    type: 'group',
    data: { label: 'How it Works (Simplified)' },
    position: { x: -250, y: 350 },
    style: {
      width: 800, // Adjust width to contain children
      height: 200, // Adjust height
      backgroundColor: 'rgba(224, 242, 254, 0.3)', // Light blue background
       border: '1px solid #7dd3fc',
       borderRadius: '8px',
       paddingTop: '25px', // Space for the label
    },
     sourcePosition: Position.Bottom,
     targetPosition: Position.Top,
  },
  {
    id: 'data',
    type: 'conceptNode', // Custom Node Type
    data: { icon: 'Database', title: '1. Training Data', description: 'AI learns from vast amounts of examples (its library).' },
    position: { x: 50, y: 50 }, // Relative to parent
    parentNode: 'how-it-works-group', // Nest inside group
    extent: 'parent',
     style: { width: 150, height: 100, textAlign: 'center'},
     sourcePosition: Position.Right,
     targetPosition: Position.Left, // Might not be needed if first in flow
  },
  {
    id: 'model',
    type: 'conceptNode', // Custom Node Type
    data: { icon: 'Brain', title: '2. The Model', description: 'The "brain" that finds patterns in the data.' },
    position: { x: 250, y: 50 }, // Relative to parent
    parentNode: 'how-it-works-group',
    extent: 'parent',
    style: { width: 150, height: 100, textAlign: 'center'},
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: 'prompt',
    type: 'conceptNode', // Custom Node Type
    data: { icon: 'MessageSquare', title: '3. Your Prompt', description: 'Your instruction telling the AI what to do.' },
    position: { x: 450, y: 50 }, // Relative to parent
    parentNode: 'how-it-works-group',
    extent: 'parent',
    style: { width: 150, height: 100, textAlign: 'center'},
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: 'output',
    type: 'conceptNode', // Custom Node Type
    data: { icon: 'Sparkles', title: '4. The Output', description: 'The new content the AI creates!' },
    position: { x: 650, y: 50 }, // Relative to parent
    parentNode: 'how-it-works-group',
    extent: 'parent',
    style: { width: 150, height: 100, textAlign: 'center'},
    targetPosition: Position.Left,
  },

  // --- Examples Section ---
   {
    id: 'examples-header',
    type: 'default',
    data: { label: 'Examples in the Workplace' },
    position: { x: 0, y: 600 },
    style: { width: 300, height: 40, background: '#e0e7ff', fontWeight: 'bold', textAlign: 'center', border: '1px solid #c7d2fe' },
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  },
   {
    id: 'example-writing',
    type: 'conceptNode', // Custom Node Type
    data: { icon: 'Mail', title: 'Writing Help', description: 'Drafting emails, reports.' },
    position: { x: -300, y: 700 },
     style: { width: 150, height: 100, textAlign: 'center'},
     targetPosition: Position.Top,
  },
   {
    id: 'example-ideas',
    type: 'conceptNode', // Custom Node Type
    data: { icon: 'Lightbulb', title: 'Idea Generation', description: 'Brainstorming names, slogans.' },
    position: { x: -100, y: 700 },
     style: { width: 150, height: 100, textAlign: 'center'},
     targetPosition: Position.Top,
  },
   {
    id: 'example-summary',
    type: 'conceptNode', // Custom Node Type
    data: { icon: 'Scroll', title: 'Summarizing', description: 'Condensing long docs.' },
    position: { x: 100, y: 700 },
     style: { width: 150, height: 100, textAlign: 'center'},
     targetPosition: Position.Top,
  },
   {
    id: 'example-image',
    type: 'conceptNode', // Custom Node Type
    data: { icon: 'Image', title: 'Image Creation', description: 'Simple graphics (use carefully!).' },
    position: { x: 300, y: 700 },
     style: { width: 150, height: 100, textAlign: 'center'},
     targetPosition: Position.Top,
  },

  // --- Key Takeaway ---
   {
    id: 'takeaway',
    type: 'default', // Or Annotation
    data: { label: 'Key Takeaway: GenAI is a tool using learned patterns to create new content from your prompts, aiding workplace tasks.' },
    position: { x: 0, y: 850 },
    style: { width: 450, background: '#fefce8', border: '1px solid #fef08a', padding: '10px', textAlign: 'center', fontStyle: 'italic' },
    targetPosition: Position.Top,
  },
];


// --- Example Edges ---
export const explanationEdges = [
  { id: 'e-header-whatis', source: 'header', target: 'what-is-genai', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e-whatis-diagram', source: 'what-is-genai', target: 'what-is-diagram', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e-diagram-howitworks', source: 'what-is-diagram', target: 'how-it-works-group', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
  // Edges within the 'how it works' group
  { id: 'e-data-model', source: 'data', target: 'model', sourceHandle: 'right', targetHandle: 'left', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e-model-prompt', source: 'model', target: 'prompt', sourceHandle: 'right', targetHandle: 'left', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e-prompt-output', source: 'prompt', target: 'output', sourceHandle: 'right', targetHandle: 'left', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },

  // Edges to Examples
  { id: 'e-howitworks-examplesheader', source: 'how-it-works-group', target: 'examples-header', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e-examplesheader-writing', source: 'examples-header', target: 'example-writing', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e-examplesheader-ideas', source: 'examples-header', target: 'example-ideas', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e-examplesheader-summary', source: 'examples-header', target: 'example-summary', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e-examplesheader-image', source: 'examples-header', target: 'example-image', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },

   // Edge to Takeaway (connecting from examples header or the group)
   { id: 'e-examples-takeaway', source: 'examples-header', target: 'takeaway', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
];

// --- Auditory Nodes ---
const auditoryNodes = [
  // ... (Header node similar to Visual)
  {
    id: 'what-is-audio',
    type: 'audioPromptNode', // Use the custom node
    data: {
      title: 'Listen: What is GenAI?',
      type: 'explanation', // Indicate it's an explanation point
      text: "Imagine a helpful co-worker who doesn't just find information, but actually drafts new emails or suggests ideas based on things they've learned.",
    },
    position: { x: 0, y: 100 },
  },
  {
    id: 'discuss-prompt-1',
    type: 'audioPromptNode', // Use the custom node
    data: {
      title: 'Think About It:',
      type: 'prompt', // Indicate it's a discussion prompt
      text: "How is that different from a normal search engine like Google?",
    },
    position: { x: 0, y: 250 },
  },
  // ... (More nodes for 'How it Works', 'Examples' using AudioPromptNode)
];

const auditoryEdges = [
   { id: 'e-header-whatis', source: 'header', target: 'what-is-audio', markerEnd: { type: MarkerType.ArrowClosed } },
   { id: 'e-whatis-prompt1', source: 'what-is-audio', target: 'discuss-prompt-1', markerEnd: { type: MarkerType.ArrowClosed } },
   // ...
];

// --- DefinitionNode - Reading/Writing Nodes ---
const readingWritingNodes = [
  // ... (Header)
  {
    id: 'definition-genai',
    type: 'definitionNode', // Use the custom node
    data: {
      term: 'Generative AI',
      definition: 'A type of artificial intelligence capable of generating novel content (e.g., text, images, code) based on patterns learned from existing data and user-provided prompts.',
      keywords: 'Artificial Intelligence, Content Generation, Prompts, Machine Learning',
    },
    position: { x: 0, y: 100 },
  },
  {
     id: 'components-summary',
     type: 'default', // Or BaseNode
     data: {
         label: 'Key Components:\n• Training Data (Examples)\n• AI Model (Learns Patterns)\n• Prompt (User Instruction)\n• Output (Generated Content)'
     },
     position: { x: 0, y: 250 },
     style: { whiteSpace: 'pre-wrap', background: '#fff', border: '1px solid #d1d5db', padding: '10px' },
  },
  // ... (Nodes detailing each component and examples with text focus)
];

const readingWritingEdges = [
  { id: 'e-header-def', source: 'header', target: 'definition-genai', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e-def-comp', source: 'definition-genai', target: 'components-summary', markerEnd: { type: MarkerType.ArrowClosed } },
  // ...
];

// --- Exercise odes - Kinaesthetic Nodes ---
const kinaestheticNodes = [
  // ... (Header)
  {
    id: 'what-is-scenario',
    type: 'default',
    data: { label: 'Scenario: Imagine you need to write 5 different welcome email subject lines for new customers.' },
    position: { x: 0, y: 100 },
     style: { background: '#fff', border: '1px solid #cbd5e1', padding: '10px' },
  },
  {
    id: 'exercise-prompt',
    type: 'exerciseNode', // Use custom node
    data: {
      title: 'Exercise: Write a Prompt',
      prompt: 'What instruction (prompt) could you give a Generative AI to help with the welcome email subject lines scenario?',
      buttonText: 'See Example Prompt',
    },
    position: { x: 0, y: 220 },
  },
   // ... (Nodes showing example prompts, outputs, and maybe a 'refine the prompt' exercise)
];
 const kinaestheticEdges = [
   { id: 'e-header-scenario', source: 'header', target: 'what-is-scenario', markerEnd: { type: MarkerType.ArrowClosed } },
   { id: 'e-scenario-ex', source: 'what-is-scenario', target: 'exercise-prompt', markerEnd: { type: MarkerType.ArrowClosed } },
   // ...
];

// --- Step Nodes - Sequential Nodes ---
const sequentialNodes = [
  // ... (Header)
  {
    id: 'step1',
    type: 'stepNode', // Use custom node
    data: { step: 1, title: 'Provide Training Data', detail: 'The AI system is first trained on a large dataset relevant to the desired output (e.g., existing emails, reports, articles).' },
    position: { x: 0, y: 100 },
  },
  {
    id: 'step2',
    type: 'stepNode',
    data: { step: 2, title: 'Model Learns Patterns', detail: 'The AI model analyzes the training data to identify statistical patterns, structures, and relationships within the content.' },
    position: { x: 0, y: 200 },
  },
  {
    id: 'step3',
    type: 'stepNode',
    data: { step: 3, title: 'User Submits Prompt', detail: 'You provide a specific instruction (the prompt) detailing the desired output (e.g., "Summarize this text").' },
    position: { x: 0, y: 300 },
  },
  {
    id: 'step4',
    type: 'stepNode',
    data: { step: 4, title: 'AI Generates Output', detail: 'Based on its learned patterns and your prompt, the AI constructs and delivers the new content.' },
    position: { x: 0, y: 400 },
  },
  // ... (Could add nodes for 'Review & Refine')
];

// --- Step Edges - Sequential Edges ---
const sequentialEdges = [
  // Connect header to first step
  { id: 'e-h-s1', source: 'header', target: 'step1', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  // Connect steps sequentially
  { id: 'e-s1-s2', source: 'step1', target: 'step2', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e-s2-s3', source: 'step2', target: 'step3', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e-s3-s4', source: 'step3', target: 'step4', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  // ...
];