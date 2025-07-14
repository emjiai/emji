'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

interface AssessmentResult {
    criteriaFeedback?: {
        [key: string]: {
            feedback: string;
            score?: number;
            max_score?: number;
        };
    };
    overallFeedback?: string;
    score?: number;
    maxMark?: number;
    question?: string;
    title?: string;
    error?: string;
    original_response?: string;
}

interface FormativeAssessmentResultProps {
    assessmentId: string;
    assessmentTitle: string;
    score: number;
    maxScore: number;
    results: AssessmentResult;
    onRetake?: () => void;
    onContinue?: () => void;
}

// Helper interface to track expanded sections
interface ExpandedSections {
    [key: string]: boolean;
}

const FormativeAssessmentResult: React.FC<FormativeAssessmentResultProps> = ({
    assessmentId,
    assessmentTitle,
    score,
    maxScore,
    results,
    onRetake,
    onContinue,
}) => {
    const [showDetails, setShowDetails] = useState(false);
    const [parsedResponse, setParsedResponse] = useState<any>(null);
    const [expandedSections, setExpandedSections] = useState<ExpandedSections>({});
    
    // Ensure score and maxScore have valid values to prevent division by zero
    const safeScore = typeof results.score === 'number' ? results.score : score;
    const safeMaxScore = typeof results.maxMark === 'number' ? results.maxMark : maxScore;
    const percentage = safeMaxScore > 0 ? Math.round((safeScore / safeMaxScore) * 100) : 0;

    // Function to clean and parse JSON from original_response
    useEffect(() => {
        if (results.original_response) {
            try {
                // Remove markdown code blocks and other formatting
                let cleanedResponse = results.original_response;
                
                // Remove ```json and ``` markers
                cleanedResponse = cleanedResponse.replace(/```json\n/g, '').replace(/```/g, '');
                
                // Attempt to parse the JSON
                const parsed = JSON.parse(cleanedResponse);
                setParsedResponse(parsed);
                
                // Initialize expandedSections with all sections collapsed
                const initialExpandedState: ExpandedSections = {};
                Object.keys(parsed).forEach(key => {
                    initialExpandedState[key] = false;
                });
                setExpandedSections(initialExpandedState);
                
                console.log("Successfully parsed response:", parsed);
            } catch (error) {
                console.error("Error parsing original_response:", error);
                setParsedResponse(null);
            }
        }
    }, [results.original_response]);

    // Toggle section expansion
    const toggleSection = (sectionKey: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionKey]: !prev[sectionKey]
        }));
    };

    // Helper function to format category names
    const formatCategoryName = (name: string): string => {
        return name
            .replace(/_/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // Function to determine the color based on the achieved level
    const getLevelColor = (level: string): string => {
        switch(level.toUpperCase()) {
            case 'A': return 'bg-green-100 text-green-800';
            case 'B': return 'bg-blue-100 text-blue-800';
            case 'C': return 'bg-yellow-100 text-yellow-800';
            case 'D': return 'bg-orange-100 text-orange-800';
            case 'F': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Function to render a list of items
    const renderList = (items: string[] | undefined, className: string, heading: string) => {
        if (!items || !Array.isArray(items) || items.length === 0) return null;
        
        return (
            <div className={`mt-3 ${className}`}>
                <h4 className="font-medium">{heading}</h4>
                <ul className="list-disc pl-5 mt-1 text-sm space-y-1">
                    {items.map((item: string, index: number) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>
            </div>
        );
    };

    // Function to render error items
    const renderErrorItems = (errors: any[] | undefined) => {
        if (!errors || !Array.isArray(errors) || errors.length === 0) return null;
        
        return (
            <div className="mt-2 space-y-4">
                {errors.map((error, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded border">
                        {error.excerpt && (
                            <div className="mb-2 italic text-sm bg-gray-100 p-2 rounded">
                                "{error.excerpt}"
                            </div>
                        )}
                        <div className="flex flex-wrap gap-2 mb-2">
                            {error.issue_type && (
                                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                    {error.issue_type}
                                </span>
                            )}
                        </div>
                        {error.explanation && (
                            <p className="text-sm mb-2">{error.explanation}</p>
                        )}
                        {error.suggestion && (
                            <div className="text-sm text-blue-700">
                                <span className="font-medium">Suggestion: </span>
                                {error.suggestion}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    // Function to render score information
    const renderScoreInfo = (scoreInfo: any) => {
        if (!scoreInfo) return null;
        
        // Check for various score info formats
        if (typeof scoreInfo === 'object') {
            const scoreKeys = Object.keys(scoreInfo);
            
            if (scoreKeys.includes('total') || scoreKeys.includes('out_of') || 
                scoreKeys.includes('percentage') || scoreKeys.includes('grade')) {
                // Format 1: { total, out_of, percentage, grade }
                return (
                    <div className="mt-2 grid grid-cols-2 gap-4">
                        {scoreInfo.total !== undefined && (
                            <div className="bg-gray-50 p-3 rounded text-center">
                                <span className="text-sm text-gray-600">Total Score</span>
                                <p className="text-2xl font-bold">{scoreInfo.total}</p>
                            </div>
                        )}
                        {scoreInfo.out_of !== undefined && (
                            <div className="bg-gray-50 p-3 rounded text-center">
                                <span className="text-sm text-gray-600">Out of</span>
                                <p className="text-2xl font-bold">{scoreInfo.out_of}</p>
                            </div>
                        )}
                        {scoreInfo.percentage !== undefined && (
                            <div className="bg-gray-50 p-3 rounded text-center">
                                <span className="text-sm text-gray-600">Percentage</span>
                                <p className="text-2xl font-bold">{scoreInfo.percentage}%</p>
                            </div>
                        )}
                        {scoreInfo.grade !== undefined && (
                            <div className="bg-gray-50 p-3 rounded text-center">
                                <span className="text-sm text-gray-600">Grade</span>
                                <p className="text-2xl font-bold">{scoreInfo.grade}</p>
                            </div>
                        )}
                    </div>
                );
            }
        }
        
        // If format is unknown, display raw data
        return (
            <pre className="mt-2 whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded overflow-auto max-h-60">
                {JSON.stringify(scoreInfo, null, 2)}
            </pre>
        );
    };

    // Function to render score adjustment
    const renderScoreAdjustment = (adjustment: any) => {
        if (!adjustment) return null;
        
        return (
            <div className="mt-2">
                <div className="grid grid-cols-1 gap-3">
                    {adjustment.base_score !== undefined && (
                        <div className="bg-gray-50 p-3 rounded">
                            <span className="text-sm text-gray-600">Base Score</span>
                            <p className="text-xl font-bold">{adjustment.base_score}</p>
                        </div>
                    )}
                    {adjustment.strictness_deduction && (
                        <div className="bg-gray-50 p-3 rounded">
                            <span className="text-sm text-gray-600">Deduction Reason</span>
                            <p className="text-sm">{adjustment.strictness_deduction}</p>
                        </div>
                    )}
                    {adjustment.final_score !== undefined && (
                        <div className="bg-gray-50 p-3 rounded">
                            <span className="text-sm text-gray-600">Final Score</span>
                            <p className="text-xl font-bold">{adjustment.final_score}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Function to determine whether section should display as table, list, or custom format
    const getSectionDisplayType = (content: any) => {
        if (Array.isArray(content)) {
            return 'list';
        } else if (typeof content === 'object') {
            // Check if this looks like a score breakdown (contains scores and possibly descriptions)
            const keys = Object.keys(content);
            const hasScores = keys.some(key => 
                typeof content[key] === 'object' && 
                (content[key].score !== undefined || content[key].feedback !== undefined)
            );
            
            if (hasScores) {
                return 'score-breakdown';
            }
            
            // Check if this matches score adjustment pattern
            if ((content.base_score !== undefined || content.final_score !== undefined) && 
                content.strictness_deduction !== undefined) {
                return 'score-adjustment';
            }
            
            // Check common section patterns
            if (content.strengths || content.weaknesses || content.met_requirements) {
                return 'multi-list';
            }
            
            // For objects that don't fit specific patterns
            return 'generic-object';
        }
        
        // Default for simple values
        return 'text';
    };

    // Dynamic renderer for content sections
    const renderContentSection = (sectionKey: string, content: any) => {
        // Skip rendering if content is empty or not an object/array
        if (!content || (typeof content !== 'object' && !Array.isArray(content))) return null;
        
        const formattedTitle = formatCategoryName(sectionKey);
        const isExpanded = expandedSections[sectionKey];
        
        // Create section header with toggle button
        const sectionHeader = (
            <div 
                className="flex items-center justify-between cursor-pointer py-3"
                onClick={() => toggleSection(sectionKey)}
            >
                <h3 className="font-medium text-lg">{formattedTitle}</h3>
                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
        );
        
        // Determine section content based on section type
        let sectionContent = null;
        
        if (isExpanded) {
            switch(sectionKey) {
                case 'rubric_scheme_compliance':
                    sectionContent = (
                        <>
                            {renderList(
                                content.met_requirements,
                                "text-green-700",
                                "Met Requirements:"
                            )}
                            {renderList(
                                content.missed_requirements || content.not_met_requirements,
                                "text-red-700",
                                "Missed Requirements:"
                            )}
                            {renderList(
                                content.partially_met_requirements,
                                "text-yellow-700",
                                "Partially Met Requirements:"
                            )}
                        </>
                    );
                    break;
                
                case 'error_analysis':
                    sectionContent = renderErrorItems(content);
                    break;
                
                case 'writing_quality':
                    sectionContent = (
                        <>
                            {renderList(content.strengths, "text-green-700", "Strengths:")}
                            {renderList(content.weaknesses, "text-red-700", "Weaknesses:")}
                        </>
                    );
                    break;
                
                case 'score_breakdown':
                    sectionContent = (
                        <div className="mt-2 space-y-4">
                            {Object.entries(content).map(([category, details]: [string, any]) => (
                                <div key={category} className="border rounded p-3">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-medium capitalize">{formatCategoryName(category)}</h4>
                                        {details.score !== undefined && (
                                            <span className="text-sm font-bold">
                                                {details.score}
                                                {details.max_score !== undefined ? `/${details.max_score}` : ''}
                                            </span>
                                        )}
                                    </div>
                                    {details.description && (
                                        <p className="text-xs text-gray-600 mt-1">{details.description}</p>
                                    )}
                                    {details.feedback && typeof details.feedback === 'object' && details.feedback[category] && (
                                        <div className="mt-2 bg-blue-50 text-blue-700 text-sm p-2 rounded">
                                            {details.feedback[category]}
                                        </div>
                                    )}
                                    {details.feedback && typeof details.feedback === 'string' && (
                                        <div className="mt-2 bg-blue-50 text-blue-700 text-sm p-2 rounded">
                                            {details.feedback}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    );
                    break;
                
                case 'assessment_summary':
                    sectionContent = (
                        <>
                            {content.level_achieved && (
                                <div className="mt-2 flex items-center">
                                    <span className="font-medium mr-2">Level Achieved:</span>
                                    <span className={`font-bold text-lg px-2 py-1 rounded ${getLevelColor(content.level_achieved)}`}>
                                        {content.level_achieved}
                                    </span>
                                </div>
                            )}
                            
                            {renderList(content.key_recommendations, "text-blue-700", "Key Recommendations:")}
                            {renderList(content.exemplar_excerpts, "text-green-700", "Exemplar Elements:")}
                        </>
                    );
                    break;
                
                case 'score':
                    sectionContent = renderScoreInfo(content);
                    break;
                
                case 'score_adjustment':
                    sectionContent = renderScoreAdjustment(content);
                    break;
                
                case 'evaluator_feedback':
                    sectionContent = (
                        <>
                            {renderList(content.strengths, "text-green-700", "Strengths:")}
                            {renderList(content.areas_for_improvement, "text-red-700", "Areas for Improvement:")}
                            {renderList(content.weaknesses, "text-red-700", "Weaknesses:")}
                            {renderList(content.recommendations, "text-blue-700", "Recommendations:")}
                            {renderList(content.suggestions, "text-blue-700", "Suggestions:")}
                        </>
                    );
                    break;
                
                default:
                    // Check display type for this content
                    const displayType = getSectionDisplayType(content);
                    
                    switch(displayType) {
                        case 'list':
                            if (Array.isArray(content) && content.every(item => typeof item === 'string')) {
                                sectionContent = renderList(content, "text-gray-700", "Items:");
                            } else {
                                sectionContent = (
                                    <pre className="mt-2 whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded overflow-auto max-h-60">
                                        {JSON.stringify(content, null, 2)}
                                    </pre>
                                );
                            }
                            break;
                        
                        case 'multi-list':
                            sectionContent = (
                                <>
                                    {renderList(content.strengths, "text-green-700", "Strengths:")}
                                    {renderList(content.weaknesses, "text-red-700", "Weaknesses:")}
                                    {renderList(content.met_requirements, "text-green-700", "Met Requirements:")}
                                    {renderList(content.missed_requirements, "text-red-700", "Missed Requirements:")}
                                    {renderList(content.recommendations, "text-blue-700", "Recommendations:")}
                                    {renderList(content.improvements, "text-blue-700", "Improvements:")}
                                </>
                            );
                            break;
                            
                        case 'score-adjustment':
                            sectionContent = renderScoreAdjustment(content);
                            break;
                            
                        default:
                            // Fallback for any other type of content
                            sectionContent = (
                                <pre className="mt-2 whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded overflow-auto max-h-60">
                                    {JSON.stringify(content, null, 2)}
                                </pre>
                            );
                            break;
                    }
                    break;
            }
        }
        
        return (
            <div className="p-4 border-b">
                {sectionHeader}
                {isExpanded && sectionContent && (
                    <div className="mt-2">
                        {sectionContent}
                    </div>
                )}
            </div>
        );
    };

    // Function to parse text-based assessment data
    const parseTextBasedResponse = (text: string) => {
        if (!text || typeof text !== 'string') return null;
        
        // Create a structured object from the text
        const sections: { [key: string]: any } = {};
        let currentSection = '';
        let currentSubsection = '';
        let lines = text.split('\n');
        
        // Process line by line
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Skip empty lines
            if (!line) continue;
            
            // Check for main section headers (no indentation, usually ends with a colon)
            if (!line.startsWith(' ') && !line.startsWith('\t')) {
                // If it's "Hide Detailed Feedback" or similar, skip
                if (line.toLowerCase().includes('hide') && line.toLowerCase().includes('feedback')) {
                    continue;
                }
                
                // Check if this is a main section header
                const colonIndex = line.indexOf(':');
                if (colonIndex > 0) {
                    currentSection = line.substring(0, colonIndex).trim().toLowerCase().replace(/\s+/g, '_');
                    sections[currentSection] = {};
                    
                    // Check if there's content after the colon
                    const afterColon = line.substring(colonIndex + 1).trim();
                    if (afterColon) {
                        if (currentSection.toLowerCase().includes('level')) {
                            sections[currentSection] = afterColon;
                        } else if (!isNaN(Number(afterColon))) {
                            sections[currentSection] = Number(afterColon);
                        } else {
                            sections[currentSection] = afterColon;
                        }
                    }
                    
                    currentSubsection = '';
                } else {
                    currentSection = line.toLowerCase().replace(/\s+/g, '_');
                    sections[currentSection] = {};
                    currentSubsection = '';
                }
                continue;
            }
            
            // Handle subsections
            if (currentSection && line.includes(':')) {
                const parts = line.split(':');
                currentSubsection = parts[0].trim().toLowerCase().replace(/\s+/g, '_');
                
                if (!sections[currentSection]) {
                    sections[currentSection] = {};
                }
                
                // Initialize subsection if not empty
                if (typeof sections[currentSection] !== 'object') {
                    const oldValue = sections[currentSection];
                    sections[currentSection] = { value: oldValue };
                }
                
                const afterColon = parts.slice(1).join(':').trim();
                if (afterColon) {
                    sections[currentSection][currentSubsection] = afterColon;
                } else {
                    sections[currentSection][currentSubsection] = [];
                }
                
                continue;
            }
            
            // Handle list items
            if (currentSection && currentSubsection && line.startsWith('-') || line.startsWith('•')) {
                const item = line.substring(1).trim();
                
                if (Array.isArray(sections[currentSection][currentSubsection])) {
                    sections[currentSection][currentSubsection].push(item);
                } else {
                    sections[currentSection][currentSubsection] = [item];
                }
                
                continue;
            }
            
            // Handle JSON blocks
            if (line.startsWith('{') && line.includes('}')) {
                try {
                    const jsonStr = lines.slice(i).join('\n');
                    const closingBraceIndex = jsonStr.indexOf('}') + 1;
                    const jsonBlock = jsonStr.substring(0, closingBraceIndex);
                    const parsedJson = JSON.parse(jsonBlock);
                    
                    if (currentSection) {
                        if (typeof sections[currentSection] !== 'object') {
                            sections[currentSection] = {};
                        }
                        
                        if (currentSubsection) {
                            sections[currentSection][currentSubsection] = parsedJson;
                        } else {
                            // Merge JSON into the section
                            Object.assign(sections[currentSection], parsedJson);
                        }
                    }
                    
                    // Skip processed lines
                    const linesToSkip = jsonBlock.split('\n').length - 1;
                    i += linesToSkip;
                    continue;
                } catch (e) {
                    // Not valid JSON, continue normal processing
                }
            }
            
            // Handle continuation of text
            if (currentSection) {
                if (currentSubsection && typeof sections[currentSection] === 'object') {
                    if (typeof sections[currentSection][currentSubsection] === 'string') {
                        sections[currentSection][currentSubsection] += ' ' + line;
                    } else if (!Array.isArray(sections[currentSection][currentSubsection])) {
                        sections[currentSection][currentSubsection] = line;
                    }
                } else if (typeof sections[currentSection] === 'string') {
                    sections[currentSection] += ' ' + line;
                } else if (typeof sections[currentSection] === 'object' && Object.keys(sections[currentSection]).length === 0) {
                    sections[currentSection] = line;
                }
            }
        }
        
        return sections;
    };

    // Function to render the parsed response content
    const renderParsedContent = () => {
        if (!parsedResponse && results.original_response && !results.original_response.includes('{') && !results.original_response.includes('[')) {
            // Try to parse text-based response
            const textParsed = parseTextBasedResponse(results.original_response);
            if (textParsed) {
                return (
                    <div className="mt-4 border rounded-lg divide-y">
                        {Object.entries(textParsed).map(([key, content]) => {
                            // Skip metadata if present
                            if (key === 'evaluation_metadata') return null;
                            
                            return renderContentSection(key, content);
                        })}
                    </div>
                );
            }
        }
        
        if (!parsedResponse) return null;

        return (
            <div className="mt-4 border rounded-lg divide-y">
                {Object.entries(parsedResponse).map(([key, content]) => {
                    // Skip metadata if present
                    if (key === 'evaluation_metadata') return null;
                    
                    return renderContentSection(key, content);
                })}
            </div>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                    {results.title || assessmentTitle} - Results
                </h2>
                <p className="text-gray-600 mt-1">Your performance summary</p>
            </div>

            {/* Display error if present */}
            {results.error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
                    <h3 className="font-bold mb-2">Error Processing Assessment</h3>
                    <p>{results.error}</p>
                </div>
            )}

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-medium">Your Score</span>
                    <span className="text-2xl font-bold">{safeScore}/{safeMaxScore}</span>
                </div>

                <Progress value={percentage} className="h-3 mb-2" />

                <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">{percentage}%</span>
                    <span className="font-semibold">
                        {parsedResponse?.assessment_summary?.level_achieved ? 
                            `Grade: ${parsedResponse.assessment_summary.level_achieved}` : 
                            (parsedResponse?.score?.grade ? 
                                `Grade: ${parsedResponse.score.grade}` : 
                                (results.overallFeedback || "No overall feedback available"))}
                    </span>
                </div>

                {showDetails && (
                    <div className="mt-4">
                        {results.criteriaFeedback && Object.keys(results.criteriaFeedback).length > 0 ? (
                            <div className="border rounded-lg divide-y">
                                {Object.entries(results.criteriaFeedback).map(([criteriaName, details]) => (
                                    <div key={criteriaName} className="p-4">
                                        <p className="font-medium">{criteriaName}</p>
                                        {details.feedback && (
                                            <div className="mt-2 p-3 bg-blue-50 text-blue-700 text-sm rounded">
                                                {details.feedback}
                                            </div>
                                        )}
                                        {details.score !== undefined && details.max_score !== undefined && (
                                            <p className="text-sm mt-1">Score: {details.score}/{details.max_score}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            renderParsedContent() || (
                                <div className="border rounded-lg p-4">
                                    <p className="font-medium text-gray-700">No structured feedback available</p>
                                    {results.original_response && (
                                        <div className="mt-2">
                                            <p className="text-sm font-medium text-gray-600 mb-1">Original AI Response:</p>
                                            <div className="max-h-80 overflow-y-auto p-3 bg-gray-100 text-gray-700 text-sm rounded whitespace-pre-wrap">
                                                {results.original_response}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>

            <div className="mb-6">
                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center justify-between w-full p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    <span className="font-medium">
                        {showDetails ? "Hide Detailed Feedback" : "View Detailed Feedback"}
                    </span>
                    {showDetails ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-6">
                {onRetake && (
                    <Button
                        variant="outline"
                        className="flex items-center justify-center"
                        onClick={onRetake}
                    >
                        <RotateCcw size={16} className="mr-2" />
                        Retake Assessment
                    </Button>
                )}

                {onContinue && (
                    <Button
                        className="flex items-center justify-center"
                        onClick={onContinue}
                    >
                        Continue
                        <ArrowRight size={16} className="ml-2" />
                    </Button>
                )}
            </div>
        </div>
    );
};

export default FormativeAssessmentResult;