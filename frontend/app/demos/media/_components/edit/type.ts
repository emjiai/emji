export interface EditableField {
    id: string;
    label: string;
    value: string;
    path: string;
    category: string;
    type: 'text' | 'textarea' | 'number' | 'date' | 'url';
    description?: string;
    context?: {
      episode?: string;
      slide?: string;
      section?: string;
    };
  }
  
  export interface FieldCategory {
    name: string;
    count: number;
    icon: string;
  }
  
  export interface EditableFieldGroup {
    category: string;
    fields: EditableField[];
  }