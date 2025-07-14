import { getBaseUrl } from "./utils";

// Define types for the API response
export interface PersonalizedContent {
  parsedMindMap: any;
  match(arg0: RegExp): unknown;
  mind_map: PersonalizedContent;
  title?: string;
  content: any;
  nodes?: any[];
  edges?: any[];
  display_type?: string;
  topic?: string;
  lesson_description?: string;
}

// Define supported display types
export type DisplayType = 'mind_map' | 'concept_map' | 'knowledge_graph' | 'learning_path';

/**
 * Client for interacting with the personalization API
 */
export class PersonalizationApiClient {
  private apiBaseUrl: string;

  constructor() {
    this.apiBaseUrl = getBaseUrl();
  }

  /**
   * Generate personalized content based on topic and lesson description
   * 
   * @param topicInput - The main topic for personalization
   * @param lessonDescription - A detailed description of the lesson
   * @param displayType - The type of visualization to generate
   * @returns Promise resolving to personalized content
   */
  async generatePersonalizedContent(
    topicInput: string, 
    lessonDescription: string, 
    displayType: DisplayType = "mind_map"
  ): Promise<PersonalizedContent> {
    try {
      const endpoint = `${this.apiBaseUrl}/api/v1/generate-personalized-content`;
      
      console.log('Sending personalization request to:', endpoint);
      console.log('Request data:', { 
        topic: topicInput, 
        lesson_description: lessonDescription, 
        display_type: displayType 
      });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topicInput,
          lesson_description: lessonDescription,
          display_type: displayType
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Personalization API error response:', errorText);
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Personalization API response data:', data);
      return data;
    } catch (error) {
      console.error('Error generating personalized content:', error);
      throw error;
    }
  }
}

// Create a singleton instance for global use
export const personalizationApiClient = new PersonalizationApiClient();