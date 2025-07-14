'use client';

import React, { useState, useEffect } from 'react';
import EditBox from '@/components/ui/edit-box';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Plus, Trash2, ChevronDown, ChevronRight, BookOpen, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface EditContentViewProps {
  content: any;
  onContentUpdate?: (section: string, path: string, content: string) => void;
}

/**
 * EditContentView component provides an editable interface for the course structure
 * Supports the modules/lessons format from the API
 */
const EditContentView: React.FC<EditContentViewProps> = ({
  content,
  onContentUpdate,
}) => {
  // Helper function to ensure modules is an array and properly structured
  const ensureModulesArray = (modules: any) => {
    if (Array.isArray(modules)) {
      return modules;
    }
    
    if (modules && typeof modules === 'object') {
      // If it's an object, convert to array
      return Object.values(modules);
    }
    
    return [];
  };

  // Create states for each content section based on API structure
  const [documentContent, setDocumentContent] = useState<any>({
    course_title: content?.main_body?.course_title || content?.title || '',
    course_number: content?.main_body?.course_number || '',
    modules: ensureModulesArray(content?.main_body?.modules),
    abstract: content?.abstract || '',
    introduction: content?.introduction || '',
    conclusion: content?.conclusion || ''
  });
  
  const [nextStepsContent, setNextStepsContent] = useState<any>(content?.next_steps || {});
  const [referencesContent, setReferencesContent] = useState<any>(content?.references || []);
  
  // Track active tab and expanded sections
  const [activeTab, setActiveTab] = useState('document');
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());
  
  // Update local state when content prop changes
  useEffect(() => {
    if (content) {
      setDocumentContent({
        course_title: content?.main_body?.course_title || content?.title || '',
        course_number: content?.main_body?.course_number || '',
        modules: ensureModulesArray(content?.main_body?.modules),
        abstract: content?.abstract || '',
        introduction: content?.introduction || '',
        conclusion: content?.conclusion || ''
      });
      setNextStepsContent(content.next_steps || {});
      setReferencesContent(content.references || []);
    }
  }, [content]);

  // Toggle module/lesson expansion
  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const toggleLesson = (lessonId: string) => {
    const newExpanded = new Set(expandedLessons);
    if (newExpanded.has(lessonId)) {
      newExpanded.delete(lessonId);
    } else {
      newExpanded.add(lessonId);
    }
    setExpandedLessons(newExpanded);
  };

  // Custom EditBox with markdown preview
  const MarkdownEditBox: React.FC<{
    id: string;
    title: string;
    content: string;
    isMarkdown?: boolean;
    onSave: (content: string) => void;
    initiallyExpanded?: boolean;
    placeholder?: string;
  }> = ({ id, title, content, isMarkdown = true, onSave, initiallyExpanded = false, placeholder }) => {
    const [showPreview, setShowPreview] = useState(false);
    
    if (!isMarkdown) {
      return (
        <EditBox
          id={id}
          title={title}
          content={content}
          onSave={onSave}
          initiallyExpanded={initiallyExpanded}
          placeholder={placeholder}
        />
      );
    }
    
    return (
      <div className="border rounded-lg p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm text-gray-700">
            {title} <span className="text-xs text-blue-600">(Markdown)</span>
          </h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? 'Edit' : 'Preview'}
            </Button>
          </div>
        </div>
        
        {showPreview ? (
          <div className="border rounded p-3 bg-gray-50 max-h-60 overflow-auto">
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content || '*No content to preview*'}
              </ReactMarkdown>
            </div>
          </div>
        ) : (
          <EditBox
            id={id}
            title=""
            content={content}
            onSave={onSave}
            initiallyExpanded={true}
            placeholder={placeholder || `Enter ${title.toLowerCase()} (supports markdown formatting)`}
          />
        )}
      </div>
    );
  };

  // Handle updates to modules structure
  const updateModule = (moduleIndex: number, field: string, value: any) => {
    setDocumentContent((prev: any) => {
      const newContent = { ...prev };
      const newModules = [...(newContent.modules || [])];
      
      if (!newModules[moduleIndex]) {
        newModules[moduleIndex] = {
          module_id: '',
          module_title: '',
          lessons: []
        };
      }
      
      newModules[moduleIndex][field] = value;
      newContent.modules = newModules;
      return newContent;
    });
  };

  // Handle updates to lessons structure
  const updateLesson = (moduleIndex: number, lessonIndex: number, field: string, value: any) => {
    setDocumentContent((prev: any) => {
      const newContent = { ...prev };
      const newModules = [...(newContent.modules || [])];
      
      if (!newModules[moduleIndex]) {
        newModules[moduleIndex] = {
          module_id: '',
          module_title: '',
          lessons: []
        };
      }
      
      if (!newModules[moduleIndex].lessons) {
        newModules[moduleIndex].lessons = [];
      }
      
      if (!newModules[moduleIndex].lessons[lessonIndex]) {
        newModules[moduleIndex].lessons[lessonIndex] = {
          lesson_id: '',
          lesson_title: '',
          timeBlock: '',
          objectives: [],
          activities: [],
          materials: [],
          assessment: '',
          homework: '',
          category: '',
          color: '',
          topics: []
        };
      }
      
      if (field === 'objectives' || field === 'activities' || field === 'materials') {
        // Handle arrays
        try {
          newModules[moduleIndex].lessons[lessonIndex][field] = 
            typeof value === 'string' ? JSON.parse(value) : value;
        } catch (e) {
          // If parsing fails, split by lines
          newModules[moduleIndex].lessons[lessonIndex][field] = 
            value.split('\n').filter((line: string) => line.trim() !== '');
        }
      } else {
        newModules[moduleIndex].lessons[lessonIndex][field] = value;
      }
      
      newContent.modules = newModules;
      return newContent;
    });
  };

  // Handle updates to topics within lessons
  const updateTopic = (moduleIndex: number, lessonIndex: number, topicIndex: number, field: string, value: any) => {
    setDocumentContent((prev: any) => {
      const newContent = { ...prev };
      const newModules = [...(newContent.modules || [])];
      
      if (!newModules[moduleIndex]?.lessons?.[lessonIndex]?.topics?.[topicIndex]) {
        return prev; // Don't update if structure doesn't exist
      }
      
      newModules[moduleIndex].lessons[lessonIndex].topics[topicIndex][field] = value;
      newContent.modules = newModules;
      return newContent;
    });
  };

  // Add new module
  const addModule = () => {
    setDocumentContent((prev: any) => {
      const newContent = { ...prev };
      const newModules = [...(newContent.modules || [])];
      newModules.push({
        module_id: (newModules.length + 1).toString(),
        module_title: 'New Module',
        lessons: []
      });
      newContent.modules = newModules;
      return newContent;
    });
  };

  // Add new lesson
  const addLesson = (moduleIndex: number) => {
    setDocumentContent((prev: any) => {
      const newContent = { ...prev };
      const newModules = [...(newContent.modules || [])];
      
      if (!newModules[moduleIndex].lessons) {
        newModules[moduleIndex].lessons = [];
      }
      
      const lessonCount = newModules[moduleIndex].lessons.length;
      newModules[moduleIndex].lessons.push({
        lesson_id: `${newModules[moduleIndex].module_id}.${lessonCount + 1}`,
        lesson_title: 'New Lesson',
        timeBlock: '50 minutes',
        objectives: [],
        activities: ['Reading', 'Discussion'],
        materials: ['Course Materials'],
        assessment: 'Participation',
        homework: '',
        category: 'Core Content',
        color: '#3B82F6',
        topics: [{
          topic_id: '1',
          topic_title: 'New Topic',
          content: ''
        }]
      });
      newContent.modules = newModules;
      return newContent;
    });
  };

  // Delete module
  const deleteModule = (moduleIndex: number) => {
    setDocumentContent((prev: any) => {
      const newContent = { ...prev };
      const newModules = [...(newContent.modules || [])];
      newModules.splice(moduleIndex, 1);
      newContent.modules = newModules;
      return newContent;
    });
  };

  // Delete lesson
  const deleteLesson = (moduleIndex: number, lessonIndex: number) => {
    setDocumentContent((prev: any) => {
      const newContent = { ...prev };
      const newModules = [...(newContent.modules || [])];
      newModules[moduleIndex].lessons.splice(lessonIndex, 1);
      newContent.modules = newModules;
      return newContent;
    });
  };

  // Handle other content updates
  const handleContentUpdate = (section: string, field: string, newContent: string) => {
    if (section === 'document') {
      setDocumentContent((prev: any) => ({
        ...prev,
        [field]: newContent
      }));
    } else if (section === 'nextSteps') {
      setNextStepsContent((prev: any) => ({
        ...prev,
        [field]: newContent
      }));
    } else if (section === 'references') {
      try {
        setReferencesContent(JSON.parse(newContent));
      } catch (e) {
        console.error('Invalid JSON for references', e);
      }
    }
    
    // Call the callback if provided
    if (onContentUpdate) {
      onContentUpdate(section, field, newContent);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <Tabs 
        defaultValue="document" 
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="document">Course Content</TabsTrigger>
          <TabsTrigger value="nextSteps">Next Steps</TabsTrigger>
          <TabsTrigger value="references">References</TabsTrigger>
        </TabsList>
        
        {/* Document Content */}
        <TabsContent value="document" className="space-y-4">
          <div className="flex justify-between items-center">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate All
            </Button>
          </div>
          
          <div className="space-y-6">
            {/* Course Information */}
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-medium text-lg">Course Information</h3>
              
              <MarkdownEditBox
                id="course-title"
                title="Course Title"
                content={documentContent.course_title || ''}
                onSave={(newContent) => handleContentUpdate('document', 'course_title', newContent)}
                placeholder="Enter course title..."
              />
              
              <MarkdownEditBox
                id="course-number"
                title="Course Number"
                content={documentContent.course_number || ''}
                onSave={(newContent) => handleContentUpdate('document', 'course_number', newContent)}
                placeholder="Enter course number..."
              />
              
              <MarkdownEditBox
                id="abstract"
                title="Abstract"
                content={documentContent.abstract || ''}
                onSave={(newContent) => handleContentUpdate('document', 'abstract', newContent)}
                placeholder="Enter course abstract..."
              />
              
              <MarkdownEditBox
                id="introduction"
                title="Introduction"
                content={documentContent.introduction || ''}
                onSave={(newContent) => handleContentUpdate('document', 'introduction', newContent)}
                placeholder="Enter course introduction..."
              />
            </div>
            
            {/* Modules and Lessons */}
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-lg">Modules & Lessons</h3>
                <Button onClick={addModule} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Module
                </Button>
              </div>
              
              {documentContent.modules && documentContent.modules.length > 0 ? (
                documentContent.modules.map((module: any, moduleIndex: number) => (
                  <div key={moduleIndex} className="border rounded-lg p-4 space-y-3 bg-blue-50">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => toggleModule(`module-${moduleIndex}`)}
                        className="flex items-center gap-2 text-left"
                      >
                        {expandedModules.has(`module-${moduleIndex}`) ? 
                          <ChevronDown className="h-4 w-4" /> : 
                          <ChevronRight className="h-4 w-4" />
                        }
                        <BookOpen className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-800">
                          Module {module.module_id || moduleIndex + 1}: {module.module_title || 'Untitled Module'}
                        </span>
                      </button>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => addLesson(moduleIndex)} 
                          size="sm" 
                          variant="outline"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button 
                          onClick={() => deleteModule(moduleIndex)} 
                          size="sm" 
                          variant="outline"
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {expandedModules.has(`module-${moduleIndex}`) && (
                      <div className="space-y-4">
                        {/* Module Title */}
                        <MarkdownEditBox
                          id={`module-title-${moduleIndex}`}
                          title="Module Title"
                          content={module.module_title || ''}
                          onSave={(newContent) => updateModule(moduleIndex, 'module_title', newContent)}
                          placeholder="Enter module title..."
                        />
                        
                        {/* Lessons */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm text-gray-700">Lessons</h4>
                          {module.lessons?.map((lesson: any, lessonIndex: number) => (
                            <div key={lessonIndex} className="border rounded p-3 bg-white space-y-3">
                              <div className="flex items-center justify-between">
                                <button
                                  onClick={() => toggleLesson(`lesson-${moduleIndex}-${lessonIndex}`)}
                                  className="flex items-center gap-2 text-left"
                                >
                                  {expandedLessons.has(`lesson-${moduleIndex}-${lessonIndex}`) ? 
                                    <ChevronDown className="h-3 w-3" /> : 
                                    <ChevronRight className="h-3 w-3" />
                                  }
                                  <FileText className="h-3 w-3 text-green-600" />
                                  <span className="font-medium text-sm">
                                    Lesson {lesson.lesson_id || `${moduleIndex + 1}.${lessonIndex + 1}`}: {lesson.lesson_title || 'Untitled Lesson'}
                                  </span>
                                </button>
                                <Button 
                                  onClick={() => deleteLesson(moduleIndex, lessonIndex)} 
                                  size="sm" 
                                  variant="outline"
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                              
                              {expandedLessons.has(`lesson-${moduleIndex}-${lessonIndex}`) && (
                                <div className="space-y-3 pl-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <MarkdownEditBox
                                      id={`lesson-title-${moduleIndex}-${lessonIndex}`}
                                      title="Lesson Title"
                                      content={lesson.lesson_title || ''}
                                      onSave={(newContent) => updateLesson(moduleIndex, lessonIndex, 'lesson_title', newContent)}
                                      placeholder="Enter lesson title..."
                                    />
                                    
                                    <EditBox
                                      id={`lesson-timeblock-${moduleIndex}-${lessonIndex}`}
                                      title="Time Block"
                                      content={lesson.timeBlock || ''}
                                      onSave={(newContent) => updateLesson(moduleIndex, lessonIndex, 'timeBlock', newContent)}
                                      placeholder="e.g., 50 minutes"
                                    />
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <EditBox
                                      id={`lesson-activities-${moduleIndex}-${lessonIndex}`}
                                      title="Activities"
                                      content={Array.isArray(lesson.activities) ? 
                                        lesson.activities.join('\n') : 
                                        JSON.stringify(lesson.activities || [], null, 2)
                                      }
                                      onSave={(newContent) => updateLesson(moduleIndex, lessonIndex, 'activities', newContent)}
                                      placeholder="Enter activities (one per line)..."
                                    />
                                    
                                    <EditBox
                                      id={`lesson-materials-${moduleIndex}-${lessonIndex}`}
                                      title="Materials"
                                      content={Array.isArray(lesson.materials) ? 
                                        lesson.materials.join('\n') : 
                                        JSON.stringify(lesson.materials || [], null, 2)
                                      }
                                      onSave={(newContent) => updateLesson(moduleIndex, lessonIndex, 'materials', newContent)}
                                      placeholder="Enter materials (one per line)..."
                                    />
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <EditBox
                                      id={`lesson-assessment-${moduleIndex}-${lessonIndex}`}
                                      title="Assessment"
                                      content={lesson.assessment || ''}
                                      onSave={(newContent) => updateLesson(moduleIndex, lessonIndex, 'assessment', newContent)}
                                      placeholder="Enter assessment method..."
                                    />
                                    
                                    <EditBox
                                      id={`lesson-homework-${moduleIndex}-${lessonIndex}`}
                                      title="Homework"
                                      content={lesson.homework || ''}
                                      onSave={(newContent) => updateLesson(moduleIndex, lessonIndex, 'homework', newContent)}
                                      placeholder="Enter homework assignment..."
                                    />
                                  </div>
                                  
                                  {/* Topics within lesson */}
                                  {lesson.topics?.map((topic: any, topicIndex: number) => (
                                    <div key={topicIndex} className="border rounded p-3 bg-gray-50">
                                      <h5 className="font-medium text-sm mb-2">Topic {topicIndex + 1}</h5>
                                      
                                      <MarkdownEditBox
                                        id={`topic-title-${moduleIndex}-${lessonIndex}-${topicIndex}`}
                                        title="Topic Title"
                                        content={topic.topic_title || ''}
                                        onSave={(newContent) => updateTopic(moduleIndex, lessonIndex, topicIndex, 'topic_title', newContent)}
                                        placeholder="Enter topic title..."
                                      />
                                      
                                      <MarkdownEditBox
                                        id={`topic-content-${moduleIndex}-${lessonIndex}-${topicIndex}`}
                                        title="Topic Content"
                                        content={topic.content || ''}
                                        onSave={(newContent) => updateTopic(moduleIndex, lessonIndex, topicIndex, 'content', newContent)}
                                        placeholder="Enter topic content..."
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p>No modules available. Click "Add Module" to get started.</p>
                </div>
              )}
            </div>
            
            {/* Conclusion */}
            <div className="border rounded-lg p-4">
              <MarkdownEditBox
                id="conclusion"
                title="Conclusion"
                content={documentContent.conclusion || ''}
                onSave={(newContent) => handleContentUpdate('document', 'conclusion', newContent)}
                placeholder="Enter course conclusion..."
              />
            </div>
          </div>
        </TabsContent>
        
        {/* Next Steps Content */}
        <TabsContent value="nextSteps" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Edit Next Steps</h2>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate All
            </Button>
          </div>
          <div className="text-sm text-gray-600 mb-4">
            Fields support markdown formatting including **bold**, *italic*, lists, and more.
          </div>
          <div className="space-y-4">
            {Object.entries(nextStepsContent).map(([key, value]) => (
              <MarkdownEditBox
                key={key}
                id={`next-${key}`}
                title={key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
                content={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                onSave={(newContent) => handleContentUpdate('nextSteps', key, newContent)}
              />
            ))}
          </div>
        </TabsContent>
        
        {/* References Content */}
        <TabsContent value="references" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Edit References</h2>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate References
            </Button>
          </div>
          <EditBox
            id="references-content"
            title="References"
            content={JSON.stringify(referencesContent, null, 2)}
            onSave={(newContent) => handleContentUpdate('references', 'references', newContent)}
            initiallyExpanded={true}
            placeholder="Enter references as JSON array..."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EditContentView;

// 'use client';

// import React, { useState, useEffect } from 'react';
// import EditBox from '@/components/ui/edit-box';
// import { Button } from '@/components/ui/button';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { RefreshCw } from 'lucide-react';
// import ReactMarkdown from 'react-markdown';
// import remarkGfm from 'remark-gfm';

// interface EditContentViewProps {
//   content: any;
//   onContentUpdate?: (section: string, path: string, content: string) => void;
// }

// /**
//  * EditContentView component provides an editable interface for content
//  * It allows users to edit document content, next steps, and references
//  * Now supports markdown in titles, topics, subtopics, and content
//  */
// const EditContentView: React.FC<EditContentViewProps> = ({
//   content,
//   onContentUpdate,
// }) => {
//   // Create states for each content section based on new API structure
//   const [documentContent, setDocumentContent] = useState<any>({
//     abstract: content?.abstract || '',
//     introduction: content?.introduction || '',
//     main_body: content?.main_body || {},
//     table_of_contents: content?.table_of_contents || '',
//     conclusion: content?.conclusion || ''
//   });
  
//   const [nextStepsContent, setNextStepsContent] = useState<any>(content?.next_steps || {});
//   const [referencesContent, setReferencesContent] = useState<any>(content?.references || []);
  
//   // Track active tab
//   const [activeTab, setActiveTab] = useState('document');
  
//   // Update local state when content prop changes
//   useEffect(() => {
//     if (content) {
//       setDocumentContent({
//         abstract: content.abstract || '',
//         introduction: content.introduction || '',
//         main_body: content.main_body || {},
//         table_of_contents: content.table_of_contents || '',
//         conclusion: content.conclusion || ''
//       });
//       setNextStepsContent(content.next_steps || {});
//       setReferencesContent(content.references || []);
//     }
//   }, [content]);

//   // Enhanced function to flatten nested JSON objects with markdown support
//   const flattenJsonForEditing = (obj: any, basePath = '', result: Array<{path: string, key: string, value: string, isMarkdown: boolean}> = []) => {
//     if (!obj) return result;
    
//     Object.entries(obj).forEach(([key, value]) => {
//       const currentPath = basePath ? `${basePath}.${key}` : key;
      
//       // Determine if this field typically contains markdown
//       const isMarkdownField = [
//         'abstract', 'introduction', 'conclusion', 'table_of_contents',
//         'content', 'topic_title', 'subtopic_title', 'module_title', 'lesson_title',
//         'implementation_plan', 'pilot_testing', 'evaluation_methodology', 'resources'
//       ].some(field => key.includes(field) || key === field);
      
//       if (typeof value === 'string') {
//         // For string values, create an edit box
//         result.push({
//           path: currentPath,
//           key: key.replace(/_/g, ' '),
//           value: value as string,
//           isMarkdown: isMarkdownField,
//         });
//       } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
//         // For nested objects, recurse
//         flattenJsonForEditing(value, currentPath, result);
//       } else if (Array.isArray(value)) {
//         // Handle arrays differently based on content type
//         if (value.length > 0 && typeof value[0] === 'object') {
//           // For arrays of objects (like topics, lessons), recurse into each item
//           value.forEach((item, index) => {
//             if (typeof item === 'object' && item !== null) {
//               flattenJsonForEditing(item, `${currentPath}[${index}]`, result);
//             } else {
//               result.push({
//                 path: `${currentPath}[${index}]`,
//                 key: `${key.replace(/_/g, ' ')} ${index + 1}`,
//                 value: String(item),
//                 isMarkdown: isMarkdownField,
//               });
//             }
//           });
//         } else {
//           // For simple arrays, stringify for editing
//           result.push({
//             path: currentPath,
//             key: key.replace(/_/g, ' '),
//             value: JSON.stringify(value, null, 2),
//             isMarkdown: false,
//           });
//         }
//       } else {
//         // For other types, convert to string
//         result.push({
//           path: currentPath,
//           key: key.replace(/_/g, ' '),
//           value: value !== null && value !== undefined ? String(value) : '',
//           isMarkdown: isMarkdownField,
//         });
//       }
//     });
    
//     return result;
//   };

//   // Function to handle updates to content
//   const handleContentUpdate = (section: string, path: string, newContent: string) => {
//     // Split path into parts (e.g., "main_body.course_title" -> ["main_body", "course_title"])
//     const pathParts = path.replace(/\[(\d+)\]/g, '.$1').split('.');
    
//     // Update based on which section is being edited
//     if (section === 'document') {
//       setDocumentContent((prevContent: any) => {
//         const newDocContent = JSON.parse(JSON.stringify(prevContent)); // Deep clone
//         let current: any = newDocContent;
        
//         // Navigate to the nested property
//         for (let i = 0; i < pathParts.length - 1; i++) {
//           const part = pathParts[i];
//           if (!isNaN(Number(part))) {
//             // Array index
//             current = current[Number(part)];
//           } else {
//             if (!current[part]) current[part] = {};
//             current = current[part];
//           }
//         }
        
//         // Set the value, try to parse as JSON if it looks like JSON
//         const lastPart = pathParts[pathParts.length - 1];
//         const lastKey = !isNaN(Number(lastPart)) ? Number(lastPart) : lastPart;
        
//         try {
//           if (typeof newContent === 'string' && 
//               (newContent.trim().startsWith('[') || newContent.trim().startsWith('{'))) {
//             current[lastKey] = JSON.parse(newContent);
//           } else {
//             current[lastKey] = newContent;
//           }
//         } catch (e) {
//           current[lastKey] = newContent;
//         }
        
//         return newDocContent;
//       });
//     } else if (section === 'nextSteps') {
//       setNextStepsContent((prevContent: any) => {
//         const newNextStepsContent = JSON.parse(JSON.stringify(prevContent)); // Deep clone
//         let current: any = newNextStepsContent;
        
//         // Navigate to the nested property
//         for (let i = 0; i < pathParts.length - 1; i++) {
//           const part = pathParts[i];
//           if (!isNaN(Number(part))) {
//             // Array index
//             current = current[Number(part)];
//           } else {
//             if (!current[part]) current[part] = {};
//             current = current[part];
//           }
//         }
        
//         // Set the value
//         const lastPart = pathParts[pathParts.length - 1];
//         const lastKey = !isNaN(Number(lastPart)) ? Number(lastPart) : lastPart;
        
//         try {
//           if (typeof newContent === 'string' && 
//               (newContent.trim().startsWith('[') || newContent.trim().startsWith('{'))) {
//             current[lastKey] = JSON.parse(newContent);
//           } else {
//             current[lastKey] = newContent;
//           }
//         } catch (e) {
//           current[lastKey] = newContent;
//         }
        
//         return newNextStepsContent;
//       });
//     } else if (section === 'references') {
//       // For references, which is an array, handle differently
//       try {
//         setReferencesContent(JSON.parse(newContent));
//       } catch (e) {
//         console.error('Invalid JSON for references', e);
//       }
//     }
    
//     // Call the callback if provided
//     if (onContentUpdate) {
//       onContentUpdate(section, path, newContent);
//     }
//   };

//   // Custom EditBox with markdown preview
//   const MarkdownEditBox: React.FC<{
//     id: string;
//     title: string;
//     content: string;
//     isMarkdown: boolean;
//     onSave: (content: string) => void;
//     initiallyExpanded?: boolean;
//   }> = ({ id, title, content, isMarkdown, onSave, initiallyExpanded = false }) => {
//     const [showPreview, setShowPreview] = useState(false);
    
//     if (!isMarkdown) {
//       return (
//         <EditBox
//           id={id}
//           title={title}
//           content={content}
//           onSave={onSave}
//           initiallyExpanded={initiallyExpanded}
//         />
//       );
//     }
    
//     return (
//       <div className="border rounded-lg p-4 space-y-2">
//         <div className="flex items-center justify-between">
//           <h3 className="font-medium text-sm text-gray-700">
//             {title} <span className="text-xs text-blue-600">(Markdown)</span>
//           </h3>
//           <div className="flex gap-2">
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => setShowPreview(!showPreview)}
//             >
//               {showPreview ? 'Edit' : 'Preview'}
//             </Button>
//           </div>
//         </div>
        
//         {showPreview ? (
//           <div className="border rounded p-3 bg-gray-50 max-h-60 overflow-auto">
//             <div className="prose prose-sm max-w-none">
//               <ReactMarkdown remarkPlugins={[remarkGfm]}>
//                 {content || '*No content to preview*'}
//               </ReactMarkdown>
//             </div>
//           </div>
//         ) : (
//           <EditBox
//             id={id}
//             title=""
//             content={content}
//             onSave={onSave}
//             initiallyExpanded={true}
//             placeholder={`Enter ${title.toLowerCase()} (supports markdown formatting)`}
//           />
//         )}
//       </div>
//     );
//   };

//   // Prepare edit boxes for each section
//   const documentEditBoxes = flattenJsonForEditing(documentContent);
//   const nextStepsEditBoxes = flattenJsonForEditing(nextStepsContent);
  
//   return (
//     <div className="p-4 space-y-4">
//       <Tabs 
//         defaultValue="document" 
//         className="w-full"
//         onValueChange={setActiveTab}
//       >
//         <TabsList className="mb-4">
//           <TabsTrigger value="document">Document</TabsTrigger>
//           <TabsTrigger value="nextSteps">Next Steps</TabsTrigger>
//           <TabsTrigger value="references">References</TabsTrigger>
//         </TabsList>
        
//         {/* Document Content */}
//         <TabsContent value="document" className="space-y-4">
//           <div className="flex justify-between items-center">
//             <h2 className="text-xl font-semibold">Edit Document Content</h2>
//             <Button variant="outline" size="sm">
//               <RefreshCw className="h-4 w-4 mr-2" />
//               Regenerate All
//             </Button>
//           </div>
//           <div className="text-sm text-gray-600 mb-4">
//             Fields marked with <span className="text-blue-600">(Markdown)</span> support markdown formatting including **bold**, *italic*, lists, and more.
//           </div>
//           <div className="space-y-4">
//             {documentEditBoxes.map((item) => (
//               <MarkdownEditBox
//                 key={item.path}
//                 id={`doc-${item.path}`}
//                 title={item.key.charAt(0).toUpperCase() + item.key.slice(1)}
//                 content={item.value}
//                 isMarkdown={item.isMarkdown}
//                 onSave={(newContent) => handleContentUpdate('document', item.path, newContent)}
//                 initiallyExpanded={false}
//               />
//             ))}
//           </div>
//         </TabsContent>
        
//         {/* Next Steps Content */}
//         <TabsContent value="nextSteps" className="space-y-4">
//           <div className="flex justify-between items-center">
//             <h2 className="text-xl font-semibold">Edit Next Steps</h2>
//             <Button variant="outline" size="sm">
//               <RefreshCw className="h-4 w-4 mr-2" />
//               Regenerate All
//             </Button>
//           </div>
//           <div className="text-sm text-gray-600 mb-4">
//             Fields marked with <span className="text-blue-600">(Markdown)</span> support markdown formatting including **bold**, *italic*, lists, and more.
//           </div>
//           <div className="space-y-4">
//             {nextStepsEditBoxes.map((item) => (
//               <MarkdownEditBox
//                 key={item.path}
//                 id={`next-${item.path}`}
//                 title={item.key.charAt(0).toUpperCase() + item.key.slice(1)}
//                 content={item.value}
//                 isMarkdown={item.isMarkdown}
//                 onSave={(newContent) => handleContentUpdate('nextSteps', item.path, newContent)}
//                 initiallyExpanded={false}
//               />
//             ))}
//           </div>
//         </TabsContent>
        
//         {/* References Content */}
//         <TabsContent value="references" className="space-y-4">
//           <div className="flex justify-between items-center">
//             <h2 className="text-xl font-semibold">Edit References</h2>
//             <Button variant="outline" size="sm">
//               <RefreshCw className="h-4 w-4 mr-2" />
//               Regenerate References
//             </Button>
//           </div>
//           <EditBox
//             id="references-content"
//             title="References"
//             content={JSON.stringify(referencesContent, null, 2)}
//             onSave={(newContent) => handleContentUpdate('references', 'references', newContent)}
//             initiallyExpanded={true}
//             placeholder="Enter references as JSON array..."
//           />
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// };

// export default EditContentView;