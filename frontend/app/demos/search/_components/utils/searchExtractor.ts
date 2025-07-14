export interface ExtractedField {
  name: string;
  value: any;
  type: string;
  children?: ExtractedField[];
}

export interface SearchData {
  [filename: string]: ExtractedField[];
}

function extractFields(data: any, parentName: string = ''): ExtractedField[] {
  if (data === null || data === undefined) {
    return [{
      name: parentName || 'value',
      value: data,
      type: 'null'
    }];
  }

  const dataType = Array.isArray(data) ? 'array' : typeof data;
  
  if (dataType === 'object' && !Array.isArray(data)) {
    const fields: ExtractedField[] = [];
    
    for (const [key, value] of Object.entries(data)) {
      const field: ExtractedField = {
        name: key,
        value: value,
        type: Array.isArray(value) ? 'array' : typeof value
      };
      
      if (typeof value === 'object' && value !== null) {
        field.children = extractFields(value, key);
      }
      
      fields.push(field);
    }
    
    return fields;
  } else if (Array.isArray(data)) {
    return data.map((item, index) => {
      const field: ExtractedField = {
        name: `[${index}]`,
        value: item,
        type: Array.isArray(item) ? 'array' : typeof item
      };
      
      if (typeof item === 'object' && item !== null) {
        field.children = extractFields(item, `${parentName}[${index}]`);
      }
      
      return field;
    });
  } else {
    return [{
      name: parentName || 'value',
      value: data,
      type: dataType
    }];
  }
}

export async function extractSearchData(): Promise<SearchData> {
  const extractedData: SearchData = {};
  
  // List of JSON files in the search directory
  const files = ['predictive_policing.json'];
  
  // Import all JSON files and extract their fields
  for (const filename of files) {
    try {
      const module = await import(`@/app/demos/search/_components/_data/search/${filename}`);
      const rawData = module.default;
      
      // Extract fields from the raw data
      extractedData[filename] = extractFields(rawData);
      
    } catch (error) {
      console.error(`Failed to load ${filename}:`, error);
      extractedData[filename] = [{
        name: 'error',
        value: `Failed to load file: ${error}`,
        type: 'error'
      }];
    }
  }
  
  return extractedData;
}

// Helper function to get key insights from search data
export function getSearchDataInsights(data: any): { 
  metadata?: any;
  documentCount?: number;
  searchEngines?: string[];
  hasWebResults?: boolean;
  hasProcessedDocs?: boolean;
} {
  const insights: any = {};
  
  if (data.metadata) {
    insights.metadata = data.metadata;
  }
  
  if (data.processed_documents) {
    insights.documentCount = data.processed_documents.length;
    insights.hasProcessedDocs = true;
  }
  
  if (data.web_search_results) {
    insights.searchEngines = Object.keys(data.web_search_results);
    insights.hasWebResults = true;
  }
  
  if (data.summary) {
    insights.summary = data.summary;
  }
  
  return insights;
}