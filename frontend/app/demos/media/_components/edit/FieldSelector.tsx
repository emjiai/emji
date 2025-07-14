"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronDown, ChevronRight, FileText, Video, BarChart, Target, Users, Mic } from "lucide-react";
import type { EditableField } from "./type";

interface FieldSelectorProps {
  fields: EditableField[];
  selectedField: EditableField | null;
  onFieldSelect: (field: EditableField) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export default function FieldSelector({
  fields,
  selectedField,
  onFieldSelect,
  searchTerm,
  onSearchChange
}: FieldSelectorProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Podcast Info']));

  // Group fields by category
  const groupedFields = fields.reduce((acc, field) => {
    if (!acc[field.category]) {
      acc[field.category] = [];
    }
    acc[field.category].push(field);
    return acc;
  }, {} as Record<string, EditableField[]>);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, any> = {
      'Podcast Info': FileText,
      'Episodes': Video,
      'Learning Objectives': Target,
      'Topics': Users,
      'Slides': BarChart,
      'Audio Scripts': Mic,
      'Visual Content': BarChart,
      'Content Points': FileText,
      'Statistics': BarChart,
      'Chart Data': BarChart,
      'Media URLs': Video
    };
    
    const IconComponent = iconMap[category] || FileText;
    return <IconComponent className="h-4 w-4" />;
  };

  const getFieldTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      'text': 'bg-blue-100 text-blue-800',
      'textarea': 'bg-green-100 text-green-800',
      'number': 'bg-purple-100 text-purple-800',
      'date': 'bg-orange-100 text-orange-800',
      'url': 'bg-red-100 text-red-800'
    };
    return colorMap[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search - Fixed at top */}
      <div className="p-4 border-b bg-white flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search fields..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Categories and Fields - Scrollable area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {Object.entries(groupedFields).map(([category, categoryFields]) => (
            <div key={category} className="mb-2">
              {/* Category Header */}
              <Button
                variant="ghost"
                className="w-full justify-start p-2 h-auto sticky top-0 bg-white z-10 border-b"
                onClick={() => toggleCategory(category)}
              >
                {expandedCategories.has(category) ? (
                  <ChevronDown className="h-4 w-4 mr-2" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-2" />
                )}
                {getCategoryIcon(category)}
                <span className="ml-2 font-medium">{category}</span>
                <span className="ml-auto text-xs text-gray-500">
                  ({categoryFields.length})
                </span>
              </Button>

              {/* Category Fields */}
              {expandedCategories.has(category) && (
                <div className="ml-4 mt-1 space-y-1">
                  {categoryFields.map((field) => (
                    <div
                      key={field.id}
                      className={`p-3 rounded-md cursor-pointer transition-colors border ${
                        selectedField?.id === field.id
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                      onClick={() => onFieldSelect(field)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {field.label}
                          </p>
                          {field.context && (
                            <p className="text-xs text-gray-500 mt-1">
                              {field.context.episode && `${field.context.episode}`}
                              {field.context.slide && ` • ${field.context.slide}`}
                            </p>
                          )}
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {field.value.length > 60 
                              ? `${field.value.substring(0, 60)}...` 
                              : field.value
                            }
                          </p>
                        </div>
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full flex-shrink-0 ${getFieldTypeColor(field.type)}`}>
                          {field.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stats Footer - Fixed at bottom */}
      <div className="p-4 border-t bg-gray-50 flex-shrink-0">
        <div className="text-sm text-gray-600">
          <p>{fields.length} total fields</p>
          <p>{Object.keys(groupedFields).length} categories</p>
        </div>
      </div>
    </div>
  );
}

// "use client";

// import { useState } from "react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Search, ChevronDown, ChevronRight, FileText, Video, BarChart, Target, Users, Mic } from "lucide-react";
// import type { EditableField } from "./type";

// interface FieldSelectorProps {
//   fields: EditableField[];
//   selectedField: EditableField | null;
//   onFieldSelect: (field: EditableField) => void;
//   searchTerm: string;
//   onSearchChange: (term: string) => void;
// }

// export default function FieldSelector({
//   fields,
//   selectedField,
//   onFieldSelect,
//   searchTerm,
//   onSearchChange
// }: FieldSelectorProps) {
//   const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Podcast Info']));

//   // Group fields by category
//   const groupedFields = fields.reduce((acc, field) => {
//     if (!acc[field.category]) {
//       acc[field.category] = [];
//     }
//     acc[field.category].push(field);
//     return acc;
//   }, {} as Record<string, EditableField[]>);

//   const toggleCategory = (category: string) => {
//     const newExpanded = new Set(expandedCategories);
//     if (newExpanded.has(category)) {
//       newExpanded.delete(category);
//     } else {
//       newExpanded.add(category);
//     }
//     setExpandedCategories(newExpanded);
//   };

//   const getCategoryIcon = (category: string) => {
//     const iconMap: Record<string, any> = {
//       'Podcast Info': FileText,
//       'Episodes': Video,
//       'Learning Objectives': Target,
//       'Topics': Users,
//       'Slides': BarChart,
//       'Audio Scripts': Mic,
//       'Visual Content': BarChart,
//       'Content Points': FileText,
//       'Statistics': BarChart,
//       'Chart Data': BarChart,
//       'Media URLs': Video
//     };
    
//     const IconComponent = iconMap[category] || FileText;
//     return <IconComponent className="h-4 w-4" />;
//   };

//   const getFieldTypeColor = (type: string) => {
//     const colorMap: Record<string, string> = {
//       'text': 'bg-blue-100 text-blue-800',
//       'textarea': 'bg-green-100 text-green-800',
//       'number': 'bg-purple-100 text-purple-800',
//       'date': 'bg-orange-100 text-orange-800',
//       'url': 'bg-red-100 text-red-800'
//     };
//     return colorMap[type] || 'bg-gray-100 text-gray-800';
//   };

//   return (
//     <div className="h-full flex flex-col">
//       {/* Search */}
//       <div className="p-4 border-b">
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//           <Input
//             type="text"
//             placeholder="Search fields..."
//             value={searchTerm}
//             onChange={(e) => onSearchChange(e.target.value)}
//             className="pl-10"
//           />
//         </div>
//       </div>

//       {/* Categories and Fields */}
//       <div className="flex-1 overflow-y-auto">
//         <div className="p-2">
//           {Object.entries(groupedFields).map(([category, categoryFields]) => (
//             <div key={category} className="mb-2">
//               {/* Category Header */}
//               <Button
//                 variant="ghost"
//                 className="w-full justify-start p-2 h-auto"
//                 onClick={() => toggleCategory(category)}
//               >
//                 {expandedCategories.has(category) ? (
//                   <ChevronDown className="h-4 w-4 mr-2" />
//                 ) : (
//                   <ChevronRight className="h-4 w-4 mr-2" />
//                 )}
//                 {getCategoryIcon(category)}
//                 <span className="ml-2 font-medium">{category}</span>
//                 <span className="ml-auto text-xs text-gray-500">
//                   ({categoryFields.length})
//                 </span>
//               </Button>

//               {/* Category Fields */}
//               {expandedCategories.has(category) && (
//                 <div className="ml-4 mt-1 space-y-1">
//                   {categoryFields.map((field) => (
//                     <div
//                       key={field.id}
//                       className={`p-3 rounded-md cursor-pointer transition-colors border ${
//                         selectedField?.id === field.id
//                           ? 'bg-blue-50 border-blue-200'
//                           : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
//                       }`}
//                       onClick={() => onFieldSelect(field)}
//                     >
//                       <div className="flex items-start justify-between">
//                         <div className="flex-1 min-w-0">
//                           <p className="text-sm font-medium text-gray-900 truncate">
//                             {field.label}
//                           </p>
//                           {field.context && (
//                             <p className="text-xs text-gray-500 mt-1">
//                               {field.context.episode && `${field.context.episode}`}
//                               {field.context.slide && ` • ${field.context.slide}`}
//                             </p>
//                           )}
//                           <p className="text-xs text-gray-600 mt-1 line-clamp-2">
//                             {field.value.length > 60 
//                               ? `${field.value.substring(0, 60)}...` 
//                               : field.value
//                             }
//                           </p>
//                         </div>
//                         <span className={`ml-2 px-2 py-1 text-xs rounded-full flex-shrink-0 ${getFieldTypeColor(field.type)}`}>
//                           {field.type}
//                         </span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Stats Footer */}
//       <div className="p-4 border-t bg-gray-50">
//         <div className="text-sm text-gray-600">
//           <p>{fields.length} total fields</p>
//           <p>{Object.keys(groupedFields).length} categories</p>
//         </div>
//       </div>
//     </div>
//   );
// }