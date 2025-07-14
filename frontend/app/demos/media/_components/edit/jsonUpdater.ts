/**
 * Utility functions to update JSON data with AWS URLs
 */

/**
 * Updates the visualUrl field for a specific slide in the JSON data
 * @param jsonData - The complete JSON data object
 * @param episodeId - The episode ID
 * @param slideId - The slide ID  
 * @param awsUrl - The AWS URL to save
 * @returns Updated JSON data
 */
export function updateSlideVisualUrl(
    jsonData: any, 
    episodeId: string, 
    slideId: string, 
    awsUrl: string
  ): any {
    // Deep clone the data to avoid mutations
    const updatedData = JSON.parse(JSON.stringify(jsonData));
    
    try {
      // Find the episode
      const episodes = updatedData.podcast?.episodes;
      if (!episodes || !Array.isArray(episodes)) {
        throw new Error("No episodes found in JSON data");
      }
      
      const episode = episodes.find((ep: any) => ep.id === episodeId);
      if (!episode) {
        throw new Error(`Episode with ID ${episodeId} not found`);
      }
      
      // Find the slide
      const slides = episode.videoStructure?.slides;
      if (!slides || !Array.isArray(slides)) {
        throw new Error(`No slides found in episode ${episodeId}`);
      }
      
      const slide = slides.find((sl: any) => sl.slideId === slideId);
      if (!slide) {
        throw new Error(`Slide with ID ${slideId} not found in episode ${episodeId}`);
      }
      
      // Update the visualUrl
      if (!slide.visualContent) {
        slide.visualContent = {};
      }
      
      slide.visualContent.visualUrl = awsUrl;
      
      console.log(`Successfully updated visualUrl for slide ${slideId} in episode ${episodeId}`);
      return updatedData;
      
    } catch (error) {
      console.error("Error updating slide visual URL:", error);
      throw error;
    }
  }
  
  /**
   * Updates multiple visual URLs in batch
   * @param jsonData - The complete JSON data object
   * @param updates - Array of update objects with episodeId, slideId, and awsUrl
   * @returns Updated JSON data
   */
  export function batchUpdateVisualUrls(
    jsonData: any,
    updates: Array<{
      episodeId: string;
      slideId: string;
      awsUrl: string;
    }>
  ): any {
    let updatedData = jsonData;
    
    for (const update of updates) {
      updatedData = updateSlideVisualUrl(
        updatedData,
        update.episodeId,
        update.slideId,
        update.awsUrl
      );
    }
    
    return updatedData;
  }
  
  /**
   * Validates that the required fields exist for updating
   * @param jsonData - The JSON data to validate
   * @param episodeId - Episode ID to check
   * @param slideId - Slide ID to check
   * @returns Boolean indicating if the path exists
   */
  export function validateUpdatePath(
    jsonData: any,
    episodeId: string,
    slideId: string
  ): boolean {
    try {
      const episodes = jsonData.podcast?.episodes;
      if (!episodes || !Array.isArray(episodes)) return false;
      
      const episode = episodes.find((ep: any) => ep.id === episodeId);
      if (!episode) return false;
      
      const slides = episode.videoStructure?.slides;
      if (!slides || !Array.isArray(slides)) return false;
      
      const slide = slides.find((sl: any) => sl.slideId === slideId);
      return !!slide;
      
    } catch (error) {
      return false;
    }
  }


  export function updateSlideImageUrl(jsonData: any, episodeId: string, slideId: string, imageUrl: string): any {
    const updatedData = JSON.parse(JSON.stringify(jsonData)); // Deep clone
    
    if (updatedData?.podcast?.episodes) {
      for (const episode of updatedData.podcast.episodes) {
        if (episode.id === episodeId) {
          if (episode.videoStructure?.slides) {
            for (const slide of episode.videoStructure.slides) {
              if (slide.slideId === slideId) {
                if (!slide.visualContent) {
                  slide.visualContent = {};
                }
                slide.visualContent.imageUrl = imageUrl;
                console.log(`Updated imageUrl for ${episodeId}/${slideId}: ${imageUrl}`);
                return updatedData;
              }
            }
          }
          break;
        }
      }
    }
    
    throw new Error(`Slide ${slideId} not found in episode ${episodeId}`);
  }
  
  export function updateSlideVideoUrl(jsonData: any, episodeId: string, slideId: string, videoUrl: string): any {
    const updatedData = JSON.parse(JSON.stringify(jsonData)); // Deep clone
    
    if (updatedData?.podcast?.episodes) {
      for (const episode of updatedData.podcast.episodes) {
        if (episode.id === episodeId) {
          if (episode.videoStructure?.slides) {
            for (const slide of episode.videoStructure.slides) {
              if (slide.slideId === slideId) {
                // Update both visualContent.videoUrl and output.mergedVideoUrl
                if (!slide.visualContent) {
                  slide.visualContent = {};
                }
                if (!slide.output) {
                  slide.output = {};
                }
                
                slide.visualContent.videoUrl = videoUrl;
                slide.output.mergedVideoUrl = videoUrl;
                
                console.log(`Updated videoUrl for ${episodeId}/${slideId}: ${videoUrl}`);
                return updatedData;
              }
            }
          }
          break;
        }
      }
    }
    
    throw new Error(`Slide ${slideId} not found in episode ${episodeId}`);
  }
  
  export function updateEpisodeVideoUrl(jsonData: any, episodeId: string, videoUrl: string, type: 'audio' | 'fullVideo'): any {
    const updatedData = JSON.parse(JSON.stringify(jsonData)); // Deep clone
    
    if (updatedData?.podcast?.episodes) {
      for (const episode of updatedData.podcast.episodes) {
        if (episode.id === episodeId) {
          if (type === 'audio') {
            episode.audioUrl = videoUrl;
          } else if (type === 'fullVideo') {
            episode.fullVideoUrl = videoUrl;
          }
          console.log(`Updated ${type}Url for episode ${episodeId}: ${videoUrl}`);
          return updatedData;
        }
      }
    }
    
    throw new Error(`Episode ${episodeId} not found`);
  }