export interface ExtractedField {
    name: string;
    value: any;
    type: string;
    children?: ExtractedField[];
  }
  
  export interface AcademicSearchData {
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
  
  export async function extractAcademicSearchData(): Promise<AcademicSearchData> {
    const extractedData: AcademicSearchData = {};
    
    // List of JSON files in the academic_search directory
    const files = [
      'coreapi_results.json',
      'gemini_results.json',
      'openai_results.json',
      'perplexity_results.json'
    ];
    
    // Import all JSON files and extract their fields
    for (const filename of files) {
      try {
        const module = await import(`@/app/demos/search/_components/_data/academic_search/${filename}`);
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
  
  // Helper function to get a summary of the data structure
  export function getDataSummary(data: any): { totalFields: number; depth: number; types: string[] } {
    let totalFields = 0;
    let maxDepth = 0;
    const types = new Set<string>();
    
    function traverse(obj: any, depth: number = 0) {
      if (depth > maxDepth) maxDepth = depth;
      
      if (obj && typeof obj === 'object') {
        if (Array.isArray(obj)) {
          types.add('array');
          obj.forEach(item => traverse(item, depth + 1));
        } else {
          types.add('object');
          Object.entries(obj).forEach(([key, value]) => {
            totalFields++;
            if (value !== null && value !== undefined) {
              types.add(typeof value);
            }
            traverse(value, depth + 1);
          });
        }
      } else {
        types.add(typeof obj);
      }
    }
    
    traverse(data);
    
    return {
      totalFields,
      depth: maxDepth,
      types: Array.from(types)
    };
  }