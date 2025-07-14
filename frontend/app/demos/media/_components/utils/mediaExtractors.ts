/**
 * Utility functions for extracting different types of media from podcast data
 */

// Helper function to extract image data from podcast data
export function extractImageData(data: any) {
  const images: { id: string; title: string; url: string; episodeId?: string; slideId?: string }[] = [];
  
  try {
    // Process podcast episodes
    if (data.podcast && data.podcast.episodes && Array.isArray(data.podcast.episodes)) {
      data.podcast.episodes.forEach((episode: any, episodeIndex: number) => {
        // Add episode thumbnail image if available
        if (episode.imageUrl) {
          images.push({
            id: `episode-${episode.id || episodeIndex}-thumbnail`,
            title: `${episode.title || 'Episode thumbnail'}`,
            url: episode.imageUrl,
            episodeId: episode.id || `episode-${episodeIndex}`,
            // No slideId for episode thumbnails
          });
        }
        
        // Process slides within episodes
        if (episode.videoStructure && episode.videoStructure.slides && 
            Array.isArray(episode.videoStructure.slides)) {
          episode.videoStructure.slides.forEach((slide: any, slideIndex: number) => {
            // Add slide visual image if available
            if (slide.visualContent && slide.visualContent.visualUrl) {
              images.push({
                id: `slide-${slide.slideId || `${episodeIndex}-${slideIndex}`}`,
                title: slide.title || `Slide ${slideIndex + 1}`,
                url: slide.visualContent.visualUrl,
                episodeId: episode.id || `episode-${episodeIndex}`,
                slideId: slide.slideId || `slide-${episodeIndex}-${slideIndex}`
              });
            }
          });
        }
      });
    }
  } catch (error) {
    console.error("Error extracting image data:", error);
  }
  
  return images;
}

// Helper function to extract video data from podcast data
export function extractVideoData(data: any) {
  const videos: { id: string; title: string; url: string; episodeId?: string; slideId?: string }[] = [];
  
  try {
    // Add full podcast video if available
    if (data.podcast && data.podcast.fullVideoUrl) {
      videos.push({
        id: 'full-podcast',
        title: data.podcast.title || 'Full Podcast Video',
        url: data.podcast.fullVideoUrl,
        // No episodeId or slideId for full podcast
      });
    }
    
    // Process podcast episodes
    if (data.podcast && data.podcast.episodes && Array.isArray(data.podcast.episodes)) {
      data.podcast.episodes.forEach((episode: any, episodeIndex: number) => {
        // Process slides within episodes
        if (episode.videoStructure && episode.videoStructure.slides && 
            Array.isArray(episode.videoStructure.slides)) {
          episode.videoStructure.slides.forEach((slide: any, slideIndex: number) => {
            // Add slide visual video if available
            if (slide.visualContent && slide.visualContent.visualFilePath && 
                slide.visualContent.visualFilePath.endsWith('.mp4')) {
              videos.push({
                id: `slide-video-${slide.slideId || `${episodeIndex}-${slideIndex}`}`,
                title: slide.title || `Video ${slideIndex + 1}`,
                url: slide.visualContent.visualFilePath,
                episodeId: episode.id || `episode-${episodeIndex}`,
                slideId: slide.slideId || `slide-${episodeIndex}-${slideIndex}`
              });
            }
            
            // Add merged video if available
            if (slide.output && slide.output.mergedVideoUrl && 
                slide.output.mergedVideoUrl.endsWith('.mp4')) {
              videos.push({
                id: `merged-video-${slide.slideId || `${episodeIndex}-${slideIndex}`}`,
                title: `${slide.title || 'Slide'} (Merged)`,
                url: slide.output.mergedVideoUrl,
                episodeId: episode.id || `episode-${episodeIndex}`,
                slideId: slide.slideId || `slide-${episodeIndex}-${slideIndex}`
              });
            }
          });
        }
      });
    }
  } catch (error) {
    console.error("Error extracting video data:", error);
  }
  
  return videos;
}

// Helper function to extract infographic data from podcast data
export function extractInfographicData(data: any) {
  const infographics: any[] = [];

  try {
    // Process podcast episodes
    if (data.podcast && data.podcast.episodes && Array.isArray(data.podcast.episodes)) {
      data.podcast.episodes.forEach((episode: any, episodeIndex: number) => {
        // Process slides within episodes
        if (episode.videoStructure && episode.videoStructure.slides && 
            Array.isArray(episode.videoStructure.slides)) {
          episode.videoStructure.slides.forEach((slide: any, slideIndex: number) => {
            // Include ALL slides that have any visualContent
            if (slide.visualContent) {
              const visualContent = slide.visualContent;
              let visualizationType = 'slide'; // default type
              let visualData: any[] = [];
              
              // Enhanced data extraction from nested structures
              const extractDataFromContent = (content: any) => {
                if (!content) return [];
                
                // Handle features data for infographics (like your NotebookLM vs CustomGPT example)
                if (content.features && Array.isArray(content.features)) {
                  return content.features;
                }
                
                // Handle other data structures
                if (content.keyStats && Array.isArray(content.keyStats)) {
                  return content.keyStats;
                } else if (content.data && Array.isArray(content.data)) {
                  return content.data;
                } else if (content.steps && Array.isArray(content.steps)) {
                  return content.steps;
                } else if (content.nodes && Array.isArray(content.nodes)) {
                  return content.nodes;
                } else if (content.points && Array.isArray(content.points)) {
                  return content.points;
                } else if (content.points1 && Array.isArray(content.points1)) {
                  // For feature-comparison layout, combine points1 and points2
                  const points1 = content.points1.map((p: any) => ({ ...p, category: 'capabilities' }));
                  const points2 = content.points2 ? content.points2.map((p: any) => ({ ...p, category: 'limitations' })) : [];
                  return [...points1, ...points2];
                } else if (content.crimeSpots && Array.isArray(content.crimeSpots)) {
                  // Handle map data
                  return content.crimeSpots;
                } else if (content.spots && Array.isArray(content.spots)) {
                  // Handle map data alternative format
                  return content.spots;
                } else if (content.locations && Array.isArray(content.locations)) {
                  // Handle map data alternative format
                  return content.locations;
                }
                return [];
              };
              
              // Determine visualization type and extract data
              if (visualContent.type === 'map') {
                // Handle map visualizations
                visualizationType = 'map';
                visualData = extractDataFromContent(visualContent.content) || visualContent.crimeSpots || visualContent.spots || visualContent.locations || [];
              } else if (visualContent.chartType) {
                // Handle explicit chart types (bar, pie, etc.)
                visualizationType = visualContent.chartType;
                visualData = visualContent.data || visualContent.keyStats || extractDataFromContent(visualContent.content) || [];
              } else if (visualContent.type === 'infographic') {
                // Handle infographic types - IMPORTANT: Check for features data
                if (visualContent.content?.layout === 'feature-comparison' || visualContent.content?.features) {
                  visualizationType = 'infographic';
                  // Extract features data specifically
                  visualData = visualContent.content?.features || extractDataFromContent(visualContent.content) || [];
                } else if (visualContent.layout === 'network-diagram' || visualContent.content?.layout === 'network-diagram') {
                  visualizationType = 'network-diagram';
                  visualData = extractDataFromContent(visualContent.content) || visualContent.keyStats || visualContent.data || [];
                } else if (visualContent.content?.layout === 'process-flow') {
                  visualizationType = 'infographic';
                  visualData = extractDataFromContent(visualContent.content) || [];
                } else {
                  visualizationType = 'stats-grid';
                  visualData = extractDataFromContent(visualContent.content) || visualContent.keyStats || visualContent.data || [];
                }
              } else if (visualContent.type === 'chart') {
                // Handle generic chart type - check for specific chart type in content
                if (visualContent.content?.chartType === 'bar') {
                  visualizationType = 'bar';
                } else if (visualContent.content?.chartType === 'pie') {
                  visualizationType = 'pie';
                } else {
                  visualizationType = 'bar'; // default
                }
                visualData = extractDataFromContent(visualContent.content) || visualContent.data || visualContent.keyStats || [];
              } else if (visualContent.type === 'slide' && visualContent.content) {
                // Handle regular slides with content
                visualizationType = 'slide';
                visualData = [{
                  title: visualContent.content.title || visualContent.title,
                  subtitle: visualContent.content.subtitle || '',
                  points: visualContent.content.points || [],
                  backgroundStyle: visualContent.content.backgroundStyle || visualContent.backgroundStyle,
                  textStyle: visualContent.content.textStyle || 'modern-clean'
                }];
              } else if (visualContent.keyStats && Array.isArray(visualContent.keyStats)) {
                // Handle stats data
                if (visualContent.layout === 'network-diagram') {
                  visualizationType = 'network-diagram';
                } else {
                  visualizationType = 'stats-grid';
                }
                visualData = visualContent.keyStats;
              } else if (visualContent.data && Array.isArray(visualContent.data)) {
                // Handle any other data arrays
                visualizationType = 'bar'; // default assumption for data arrays
                visualData = visualContent.data;
              } else {
                // Try to extract from nested content before fallback
                const extractedData = extractDataFromContent(visualContent.content);
                if (extractedData.length > 0) {
                  // Determine type based on layout
                  if (visualContent.content?.layout === 'feature-comparison') {
                    visualizationType = 'infographic';
                  } else if (visualContent.content?.layout === 'process-flow') {
                    visualizationType = 'infographic';
                  } else if (visualContent.content?.layout === 'network-diagram') {
                    visualizationType = 'network-diagram';
                  } else if (visualContent.content?.layout === 'stats-grid') {
                    visualizationType = 'stats-grid';
                  } else {
                    visualizationType = 'stats-grid'; // default for data
                  }
                  visualData = extractedData;
                } else {
                  // Fallback: create basic slide content for ANY visualContent
                  visualizationType = 'slide';
                  visualData = [{
                    title: visualContent.title || slide.title || `Slide ${slideIndex + 1}`,
                    subtitle: '',
                    points: [],
                    backgroundStyle: visualContent.backgroundStyle || 'gradient-blue',
                    textStyle: 'modern-clean'
                  }];
                }
              }
              
              const infographic = {
                id: `visualization-${slide.slideId || `${episodeIndex}-${slideIndex}`}`,
                title: slide.title || visualContent.title || `Slide ${slideIndex + 1}`,
                type: visualizationType,
                episodeId: episode.id,
                slideId: slide.slideId,
                episodeTitle: episode.title,
                data: visualData,
                layout: visualContent.layout || visualContent.content?.layout || 'default',
                backgroundStyle: visualContent.backgroundStyle || visualContent.content?.backgroundStyle || 'gradient-blue',
                animationType: visualContent.animationType || visualContent.content?.animationType || 'fade-in',
                visualContent: visualContent,
                hasExistingVisualUrl: !!visualContent.visualUrl
              };
              
              infographics.push(infographic);
              
              // Debug logging to help trace issues
              console.log(`Extracted infographic: ${infographic.title} (${infographic.type}) with ${visualData.length} data items`, {
                layout: infographic.layout,
                hasContent: !!visualContent.content,
                dataKeys: visualContent.content ? Object.keys(visualContent.content) : [],
                hasFeatures: !!(visualContent.content?.features),
                featuresLength: visualContent.content?.features?.length || 0
              });
            }
          });
        }
      });
    }
  } catch (error) {
    console.error("Error extracting infographic data:", error);
  }

  console.log(`Total infographics extracted: ${infographics.length}`);
  return infographics;
}
