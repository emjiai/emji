'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Save, ChevronDown, ChevronRight, BookOpen, FileText, Plus, Trash2, List } from 'lucide-react';

interface EditContentViewProps {
  content: any;
  onContentUpdate?: (section: string, path: string, content: string) => void;
}

const EditContentView: React.FC<EditContentViewProps> = ({ content, onContentUpdate }) => {
  // Use raw content directly - no transformation needed
  const [ebookData, setEbookData] = useState<any>(content || {});
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['metadata']));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Extract content from final_response wrapper if it exists
    const actualContent = content?.final_response || content || {};
    setEbookData(actualContent);
    console.log('EditContentView received content:', content);
    console.log('EditContentView extracted actualContent:', actualContent);
  }, [content]);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const updateField = (path: string, value: any) => {
    const keys = path.split('.');
    const newData = { ...ebookData };
    let current = newData;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (key.includes('[') && key.includes(']')) {
        const arrayKey = key.substring(0, key.indexOf('['));
        const index = parseInt(key.substring(key.indexOf('[') + 1, key.indexOf(']')));
        if (!current[arrayKey]) current[arrayKey] = [];
        if (!current[arrayKey][index]) current[arrayKey][index] = {};
        current = current[arrayKey][index];
      } else {
        if (!current[key]) current[key] = {};
        current = current[key];
      }
    }
    
    const lastKey = keys[keys.length - 1];
    if (lastKey.includes('[') && lastKey.includes(']')) {
      const arrayKey = lastKey.substring(0, lastKey.indexOf('['));
      const index = parseInt(lastKey.substring(lastKey.indexOf('[') + 1, lastKey.indexOf(']')));
      if (!current[arrayKey]) current[arrayKey] = [];
      current[arrayKey][index] = value;
    } else {
      current[lastKey] = value;
    }
    
    setEbookData(newData);
    
    if (onContentUpdate) {
      onContentUpdate('ebook', path, value);
    }
  };

  const saveContent = async () => {
    setIsSaving(true);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || '';
      const response = await fetch(`${API_BASE_URL}/api/v1/save_ebook_content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ebookData)
      });
      
      if (response.ok) {
        const result = await response.json();
        // Update local markdown with the regenerated version from backend
        if (result.markdown_document) {
          setEbookData({ ...ebookData, markdown_document: result.markdown_document });
        }
        console.log('Content saved successfully');
      }
    } catch (error) {
      console.error('Error saving content:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Helper components for cleaner code
  const SectionHeader = ({ id, icon: Icon, title, onToggle, actions }: any) => (
    <button
      onClick={() => onToggle(id)}
      className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-gray-500" />
        <span className="font-medium text-gray-700">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        {actions}
        {expandedSections.has(id) ? 
          <ChevronDown className="h-5 w-5 text-gray-500" /> : 
          <ChevronRight className="h-5 w-5 text-gray-500" />}
      </div>
    </button>
  );

  const EditField = ({ label, value, onChange, multiline = false, rows = 4, placeholder = '' }: any) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-600 mb-1">
        {label}
      </label>
      {multiline ? (
        <Textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="w-full bg-white border-gray-200 focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
          placeholder={placeholder}
        />
      ) : (
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white border-gray-200 focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
          placeholder={placeholder}
        />
      )}
    </div>
  );
  
  // Helper function to parse nested content
  const parseNestedContent = (content: any): string => {
    if (!content) return '';
    
    if (typeof content === 'string') return content;
    
    if (Array.isArray(content)) {
      return content
        .map((item) => {
          if (typeof item === 'string') return item;
          if (typeof item === 'object') {
            if (item.type === 'heading') {
              return `${'\n'.repeat(item.level === 2 ? 2 : 1)}${'#'.repeat(item.level)} ${item.text}\n`;
            } else if (item.type === 'key_takeaway') {
              return `\n> **${item.text}**\n`;
            } else if (item.type === 'case_study' || item.type === 'real_world_example') {
              return `\n### ${item.title || 'Example'}\n${item.text || item.content || ''}\n`;
            }
            return JSON.stringify(item);
          }
          return '';
        })
        .filter(Boolean)
        .join('\n\n');
    }
    
    return JSON.stringify(content);
  };

  // Chapter management functions
  const addChapter = () => {
    const chapters = [...(ebookData.chapters || [])];
    chapters.push({
      id: `chapter_${chapters.length + 1}`,
      title: 'New Chapter',
      goal: '',
      sections: [],
      key_takeaways: []
    });
    updateField('chapters', chapters);
  };

  const deleteChapter = (index: number) => {
    const chapters = [...(ebookData.chapters || [])];
    chapters.splice(index, 1);
    updateField('chapters', chapters);
  };

  const addSection = (chapterIndex: number) => {
    const chapters = [...(ebookData.chapters || [])];
    if (!chapters[chapterIndex].sections) chapters[chapterIndex].sections = [];
    chapters[chapterIndex].sections.push({
      heading: 'New Section',
      content: [],
      subsections: []
    });
    updateField('chapters', chapters);
  };

  const deleteSection = (chapterIndex: number, sectionIndex: number) => {
    const chapters = [...(ebookData.chapters || [])];
    chapters[chapterIndex].sections.splice(sectionIndex, 1);
    updateField('chapters', chapters);
  };

  // Show raw data structure if no recognizable format
  if (!ebookData || Object.keys(ebookData).length === 0) {
    return (
      <div className="h-full bg-gray-50 overflow-auto">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">No Content Available</h2>
            <p className="text-gray-600">No content data received or content is still loading.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 overflow-auto">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-800">Edit Content</h2>
            <Button 
              onClick={saveContent} 
              disabled={isSaving}
              className="bg-gray-700 hover:bg-gray-800 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <details>
              <summary className="cursor-pointer text-yellow-800 font-medium">
                Debug: Raw Content Structure
              </summary>
              <pre className="text-xs mt-2 bg-yellow-100 p-3 rounded max-h-64 overflow-auto">
                {JSON.stringify(ebookData, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {/* Metadata Section - works for both ebook and course formats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-4">
          <SectionHeader 
            id="metadata" 
            icon={BookOpen} 
            title="Metadata" 
            onToggle={toggleSection}
          />
          
          {expandedSections.has('metadata') && (
            <div className="p-6 pt-0 space-y-4">
              <EditField 
                label="Title" 
                value={ebookData.title} 
                onChange={(val: string) => updateField('title', val)}
              />
              
              {/* Show subtitle if it exists (ebook format) */}
              {ebookData.subtitle !== undefined && (
                <EditField 
                  label="Subtitle" 
                  value={ebookData.subtitle} 
                  onChange={(val: string) => updateField('subtitle', val)}
                />
              )}
              
              {/* Show tagline if it exists (ebook format) */}
              {ebookData.tagline !== undefined && (
                <EditField 
                  label="Tagline" 
                  value={ebookData.tagline} 
                  onChange={(val: string) => updateField('tagline', val)}
                  multiline={true}
                  rows={2}
                />
              )}
              
              {/* Show abstract if it exists (course format) */}
              {ebookData.abstract !== undefined && (
                <EditField 
                  label="Abstract" 
                  value={ebookData.abstract} 
                  onChange={(val: string) => updateField('abstract', val)}
                  multiline={true}
                  rows={4}
                />
              )}
              
              {/* Publication details for ebook format */}
              {ebookData.publication_details && (
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-3">Publication Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <EditField 
                      label="Publisher" 
                      value={ebookData.publication_details?.publisher} 
                      onChange={(val: string) => updateField('publication_details.publisher', val)}
                    />
                    <EditField 
                      label="Publication Date" 
                      value={ebookData.publication_details?.publication_date} 
                      onChange={(val: string) => updateField('publication_details.publication_date', val)}
                    />
                  </div>
                  <EditField 
                    label="Target Audience" 
                    value={ebookData.publication_details?.audience} 
                    onChange={(val: string) => updateField('publication_details.audience', val)}
                    multiline={true}
                    rows={2}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Table of Contents */}
        {ebookData.table_of_contents && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-4">
            <SectionHeader 
              id="toc" 
              icon={List} 
              title="Table of Contents" 
              onToggle={toggleSection}
            />
            
            {expandedSections.has('toc') && (
              <div className="p-6 pt-0">
                {Array.isArray(ebookData.table_of_contents) ? (
                  ebookData.table_of_contents.map((item: any, index: number) => (
                    <div key={index} className="mb-2">
                      <EditField 
                        label={`Item ${index + 1}`} 
                        value={item.title || item.section_title || JSON.stringify(item)} 
                        onChange={(val: string) => {
                          if (item.title !== undefined) {
                            updateField(`table_of_contents[${index}].title`, val);
                          } else if (item.section_title !== undefined) {
                            updateField(`table_of_contents[${index}].section_title`, val);
                          }
                        }}
                      />
                    </div>
                  ))
                ) : (
                  <EditField 
                    label="Table of Contents" 
                    value={typeof ebookData.table_of_contents === 'string' ? ebookData.table_of_contents : JSON.stringify(ebookData.table_of_contents)} 
                    onChange={(val: string) => updateField('table_of_contents', val)}
                    multiline={true}
                    rows={6}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Introduction */}
        {ebookData.introduction !== undefined && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-4">
            <SectionHeader 
              id="introduction" 
              icon={FileText} 
              title="Introduction" 
              onToggle={toggleSection}
            />
            
            {expandedSections.has('introduction') && (
              <div className="p-6 pt-0">
                {typeof ebookData.introduction === 'object' && ebookData.introduction.heading ? (
                  <>
                    <EditField 
                      label="Heading" 
                      value={ebookData.introduction.heading} 
                      onChange={(val: string) => updateField('introduction.heading', val)}
                    />
                    <EditField 
                      label="Content" 
                      value={parseNestedContent(ebookData.introduction.content)}
                      onChange={(val: string) => {
                        const content = val.split('\n\n').filter(s => s.trim());
                        updateField('introduction.content', content);
                      }}
                      multiline={true}
                      rows={8}
                      placeholder="Enter introduction content..."
                    />
                  </>
                ) : (
                  <EditField 
                    label="Introduction" 
                    value={typeof ebookData.introduction === 'string' ? ebookData.introduction : JSON.stringify(ebookData.introduction)}
                    onChange={(val: string) => updateField('introduction', val)}
                    multiline={true}
                    rows={6}
                    placeholder="Enter introduction content..."
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Chapters (for ebook format) */}
        {ebookData.chapters && Array.isArray(ebookData.chapters) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-4">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-gray-500" />
                  <span className="font-medium text-gray-700">Chapters</span>
                </div>
                <Button
                  onClick={addChapter}
                  size="sm"
                  variant="outline"
                  className="border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Chapter
                </Button>
              </div>
            </div>
            
            {ebookData.chapters.map((chapter: any, chapterIndex: number) => (
              <div key={chapter.id || chapterIndex} className="border-b border-gray-100 last:border-b-0">
                <SectionHeader 
                  id={`chapter-${chapterIndex}`}
                  icon={() => null}
                  title={`Chapter ${chapterIndex + 1}: ${chapter.title || 'Untitled'}`}
                  onToggle={toggleSection}
                  actions={
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChapter(chapterIndex);
                      }}
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  }
                />
                
                {expandedSections.has(`chapter-${chapterIndex}`) && (
                  <div className="p-6 pt-0 bg-gray-50">
                    <EditField 
                      label="Chapter Title" 
                      value={chapter.title} 
                      onChange={(val: string) => updateField(`chapters[${chapterIndex}].title`, val)}
                    />
                    <EditField 
                      label="Chapter Goal" 
                      value={chapter.goal} 
                      onChange={(val: string) => updateField(`chapters[${chapterIndex}].goal`, val)}
                      multiline={true}
                      rows={2}
                    />
                    
                    {/* Chapter Sections */}
                    {chapter.sections && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-600">Sections</label>
                          <Button
                            onClick={() => addSection(chapterIndex)}
                            size="sm"
                            variant="ghost"
                            className="text-gray-600 hover:bg-white"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Section
                          </Button>
                        </div>
                        
                        {chapter.sections.map((section: any, sectionIndex: number) => (
                          <div key={sectionIndex} className="bg-white rounded p-4 mb-2 border border-gray-200">
                            <div className="flex items-start justify-between mb-2">
                              <EditField 
                                label="Section Heading" 
                                value={section.heading} 
                                onChange={(val: string) => updateField(`chapters[${chapterIndex}].sections[${sectionIndex}].heading`, val)}
                              />
                              <Button
                                onClick={() => deleteSection(chapterIndex, sectionIndex)}
                                size="sm"
                                variant="ghost"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 ml-2"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Key Takeaways */}
                    <EditField 
                      label="Key Takeaways (one per line)" 
                      value={chapter.key_takeaways?.join('\n') || ''} 
                      onChange={(val: string) => {
                        const takeaways = val.split('\n').filter(s => s.trim());
                        updateField(`chapters[${chapterIndex}].key_takeaways`, takeaways);
                      }}
                      multiline={true}
                      rows={4}
                      placeholder="Enter key takeaways, one per line..."
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Main Body (for course format) */}
        {ebookData.main_body && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-4">
            <SectionHeader 
              id="main_body" 
              icon={FileText} 
              title="Main Body" 
              onToggle={toggleSection}
            />
            
            {expandedSections.has('main_body') && (
              <div className="p-6 pt-0">
                <EditField 
                  label="Course Title" 
                  value={ebookData.main_body.course_title} 
                  onChange={(val: string) => updateField('main_body.course_title', val)}
                />
                <EditField 
                  label="Course Number" 
                  value={ebookData.main_body.course_number} 
                  onChange={(val: string) => updateField('main_body.course_number', val)}
                />
                
                {/* Display other main_body fields as JSON if they exist */}
                {Object.keys(ebookData.main_body).filter(key => !['course_title', 'course_number'].includes(key)).map(key => (
                  <div key={key}>
                    <EditField 
                      label={key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')} 
                      value={typeof ebookData.main_body[key] === 'string' ? ebookData.main_body[key] : JSON.stringify(ebookData.main_body[key], null, 2)}
                      onChange={(val: string) => updateField(`main_body.${key}`, val)}
                      multiline={typeof ebookData.main_body[key] !== 'string'}
                      rows={6}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Conclusion */}
        {ebookData.conclusion !== undefined && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-4">
            <SectionHeader 
              id="conclusion" 
              icon={FileText} 
              title="Conclusion" 
              onToggle={toggleSection}
            />
            
            {expandedSections.has('conclusion') && (
              <div className="p-6 pt-0">
                {typeof ebookData.conclusion === 'object' && ebookData.conclusion.heading ? (
                  <>
                    <EditField 
                      label="Heading" 
                      value={ebookData.conclusion.heading} 
                      onChange={(val: string) => updateField('conclusion.heading', val)}
                    />
                    <EditField 
                      label="Content" 
                      value={parseNestedContent(ebookData.conclusion.content)}
                      onChange={(val: string) => {
                        const content = val.split('\n\n').filter(s => s.trim());
                        updateField('conclusion.content', content);
                      }}
                      multiline={true}
                      rows={8}
                      placeholder="Enter conclusion content..."
                    />
                  </>
                ) : (
                  <EditField 
                    label="Conclusion" 
                    value={typeof ebookData.conclusion === 'string' ? ebookData.conclusion : JSON.stringify(ebookData.conclusion)}
                    onChange={(val: string) => updateField('conclusion', val)}
                    multiline={true}
                    rows={6}
                    placeholder="Enter conclusion content..."
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Next Steps (for course format) */}
        {ebookData.next_steps && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-4">
            <SectionHeader 
              id="next_steps" 
              icon={FileText} 
              title="Next Steps" 
              onToggle={toggleSection}
            />
            
            {expandedSections.has('next_steps') && (
              <div className="p-6 pt-0">
                {Object.keys(ebookData.next_steps).map(key => (
                  <div key={key}>
                    <EditField 
                      label={key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')} 
                      value={typeof ebookData.next_steps[key] === 'string' ? ebookData.next_steps[key] : JSON.stringify(ebookData.next_steps[key], null, 2)}
                      onChange={(val: string) => updateField(`next_steps.${key}`, val)}
                      multiline={true}
                      rows={4}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* References */}
        {ebookData.references && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-4">
            <SectionHeader 
              id="references" 
              icon={FileText} 
              title="References" 
              onToggle={toggleSection}
            />
            
            {expandedSections.has('references') && (
              <div className="p-6 pt-0">
                <EditField 
                  label="References" 
                  value={Array.isArray(ebookData.references) ? ebookData.references.join('\n') : JSON.stringify(ebookData.references, null, 2)}
                  onChange={(val: string) => {
                    try {
                      const refs = val.split('\n').filter(s => s.trim());
                      updateField('references', refs);
                    } catch {
                      updateField('references', val);
                    }
                  }}
                  multiline={true}
                  rows={6}
                  placeholder="Enter references, one per line..."
                />
              </div>
            )}
          </div>
        )}

        {/* Appendices (for ebook format) */}
        {ebookData.appendices && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-4">
            <SectionHeader 
              id="appendices" 
              icon={FileText} 
              title="Appendices" 
              onToggle={toggleSection}
            />
            
            {expandedSections.has('appendices') && (
              <div className="p-6 pt-0">
                {ebookData.appendices.heading && (
                  <EditField 
                    label="Appendices Heading" 
                    value={ebookData.appendices.heading} 
                    onChange={(val: string) => updateField('appendices.heading', val)}
                  />
                )}
                
                {ebookData.appendices.content && (
                  <EditField 
                    label="Appendices Content" 
                    value={Array.isArray(ebookData.appendices.content) ? ebookData.appendices.content.join('\n\n') : ebookData.appendices.content}
                    onChange={(val: string) => {
                      const content = val.split('\n\n').filter(s => s.trim());
                      updateField('appendices.content', content);
                    }}
                    multiline={true}
                    rows={6}
                  />
                )}
                
                {ebookData.appendices.sections?.map((section: any, index: number) => (
                  <div key={index} className="mb-4 p-4 bg-gray-50 rounded">
                    <EditField 
                      label="Section Title" 
                      value={section.heading} 
                      onChange={(val: string) => updateField(`appendices.sections[${index}].heading`, val)}
                    />
                    <EditField 
                      label="Section Content" 
                      value={Array.isArray(section.content) ? section.content.join('\n\n') : section.content || ''}
                      onChange={(val: string) => {
                        const content = val.split('\n\n').filter(s => s.trim());
                        updateField(`appendices.sections[${index}].content`, content);
                      }}
                      multiline={true}
                      rows={4}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Markdown Document (if available) */}
        {ebookData.markdown_document && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-4">
            <SectionHeader 
              id="markdown" 
              icon={FileText} 
              title="Markdown Document" 
              onToggle={toggleSection}
            />
            
            {expandedSections.has('markdown') && (
              <div className="p-6 pt-0">
                <EditField 
                  label="Markdown Content" 
                  value={ebookData.markdown_document}
                  onChange={(val: string) => updateField('markdown_document', val)}
                  multiline={true}
                  rows={20}
                  placeholder="Markdown content..."
                />
              </div>
            )}
          </div>
        )}

        {/* Show any additional fields that weren't covered above */}
        {Object.keys(ebookData).filter(key => 
          !['title', 'subtitle', 'tagline', 'abstract', 'publication_details', 'table_of_contents', 
            'introduction', 'chapters', 'main_body', 'conclusion', 'next_steps', 'references', 
            'appendices', 'markdown_document', 'document', 'id', 'processedDate'].includes(key)
        ).map(key => (
          <div key={key} className="bg-white rounded-lg shadow-sm border border-gray-100 mb-4">
            <SectionHeader 
              id={key} 
              icon={FileText} 
              title={key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')} 
              onToggle={toggleSection}
            />
            
            {expandedSections.has(key) && (
              <div className="p-6 pt-0">
                <EditField 
                  label={key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')} 
                  value={typeof ebookData[key] === 'string' ? ebookData[key] : JSON.stringify(ebookData[key], null, 2)}
                  onChange={(val: string) => updateField(key, val)}
                  multiline={typeof ebookData[key] !== 'string'}
                  rows={6}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditContentView;