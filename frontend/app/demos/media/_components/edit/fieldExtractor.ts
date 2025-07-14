import type { EditableField } from './type';

export function extractEditableFields(data: any): EditableField[] {
  const fields: EditableField[] = [];

  // Extract podcast-level fields
  if (data.podcast) {
    const podcast = data.podcast;
    
    // Basic podcast info
    if (podcast.title) {
      fields.push({
        id: 'podcast-title',
        label: 'Podcast Title',
        value: podcast.title,
        path: 'podcast.title',
        category: 'Podcast Info',
        type: 'text',
        description: 'Main title of the podcast series'
      });
    }

    if (podcast.description) {
      fields.push({
        id: 'podcast-description',
        label: 'Podcast Description',
        value: podcast.description,
        path: 'podcast.description',
        category: 'Podcast Info',
        type: 'textarea',
        description: 'Overall description of the podcast series'
      });
    }

    if (podcast.fullVideoUrl) {
      fields.push({
        id: 'podcast-video-url',
        label: 'Full Video URL',
        value: podcast.fullVideoUrl,
        path: 'podcast.fullVideoUrl',
        category: 'Media URLs',
        type: 'url',
        description: 'URL to the complete podcast video'
      });
    }

    // Extract episode-level fields
    if (podcast.episodes && Array.isArray(podcast.episodes)) {
      podcast.episodes.forEach((episode: any, episodeIndex: number) => {
        const episodePrefix = `episode-${episodeIndex}`;
        
        // Episode basic info
        if (episode.title) {
          fields.push({
            id: `${episodePrefix}-title`,
            label: `Episode ${episodeIndex + 1} Title`,
            value: episode.title,
            path: `podcast.episodes[${episodeIndex}].title`,
            category: 'Episodes',
            type: 'text',
            context: { episode: episode.id || `Episode ${episodeIndex + 1}` }
          });
        }

        if (episode.description) {
          fields.push({
            id: `${episodePrefix}-description`,
            label: `Episode ${episodeIndex + 1} Description`,
            value: episode.description,
            path: `podcast.episodes[${episodeIndex}].description`,
            category: 'Episodes',
            type: 'textarea',
            context: { episode: episode.id || `Episode ${episodeIndex + 1}` }
          });
        }

        if (episode.duration) {
          fields.push({
            id: `${episodePrefix}-duration`,
            label: `Episode ${episodeIndex + 1} Duration`,
            value: episode.duration,
            path: `podcast.episodes[${episodeIndex}].duration`,
            category: 'Episodes',
            type: 'text',
            context: { episode: episode.id || `Episode ${episodeIndex + 1}` }
          });
        }

        if (episode.hostName) {
          fields.push({
            id: `${episodePrefix}-host`,
            label: `Episode ${episodeIndex + 1} Host`,
            value: episode.hostName,
            path: `podcast.episodes[${episodeIndex}].hostName`,
            category: 'Episodes',
            type: 'text',
            context: { episode: episode.id || `Episode ${episodeIndex + 1}` }
          });
        }

        // Learning objectives
        if (episode.learningObjectives && Array.isArray(episode.learningObjectives)) {
          episode.learningObjectives.forEach((objective: string, objIndex: number) => {
            fields.push({
              id: `${episodePrefix}-objective-${objIndex}`,
              label: `Episode ${episodeIndex + 1} Learning Objective ${objIndex + 1}`,
              value: objective,
              path: `podcast.episodes[${episodeIndex}].learningObjectives[${objIndex}]`,
              category: 'Learning Objectives',
              type: 'textarea',
              context: { episode: episode.id || `Episode ${episodeIndex + 1}` }
            });
          });
        }

        // Topics
        if (episode.topics && Array.isArray(episode.topics)) {
          episode.topics.forEach((topic: string, topicIndex: number) => {
            fields.push({
              id: `${episodePrefix}-topic-${topicIndex}`,
              label: `Episode ${episodeIndex + 1} Topic ${topicIndex + 1}`,
              value: topic,
              path: `podcast.episodes[${episodeIndex}].topics[${topicIndex}]`,
              category: 'Topics',
              type: 'text',
              context: { episode: episode.id || `Episode ${episodeIndex + 1}` }
            });
          });
        }

        // Extract slide-level fields
        if (episode.videoStructure?.slides && Array.isArray(episode.videoStructure.slides)) {
          episode.videoStructure.slides.forEach((slide: any, slideIndex: number) => {
            const slidePrefix = `${episodePrefix}-slide-${slideIndex}`;
            
            if (slide.title) {
              fields.push({
                id: `${slidePrefix}-title`,
                label: `Slide ${slideIndex + 1} Title`,
                value: slide.title,
                path: `podcast.episodes[${episodeIndex}].videoStructure.slides[${slideIndex}].title`,
                category: 'Slides',
                type: 'text',
                context: { 
                  episode: episode.id || `Episode ${episodeIndex + 1}`,
                  slide: slide.slideId || `Slide ${slideIndex + 1}`
                }
              });
            }

            // Audio script
            if (slide.audioScript?.text) {
              fields.push({
                id: `${slidePrefix}-audio-text`,
                label: `Slide ${slideIndex + 1} Audio Script`,
                value: slide.audioScript.text,
                path: `podcast.episodes[${episodeIndex}].videoStructure.slides[${slideIndex}].audioScript.text`,
                category: 'Audio Scripts',
                type: 'textarea',
                context: { 
                  episode: episode.id || `Episode ${episodeIndex + 1}`,
                  slide: slide.slideId || `Slide ${slideIndex + 1}`
                }
              });
            }

            // Visual content
            if (slide.visualContent) {
              const visualContent = slide.visualContent;
              
              if (visualContent.title) {
                fields.push({
                  id: `${slidePrefix}-visual-title`,
                  label: `Slide ${slideIndex + 1} Visual Title`,
                  value: visualContent.title,
                  path: `podcast.episodes[${episodeIndex}].videoStructure.slides[${slideIndex}].visualContent.title`,
                  category: 'Visual Content',
                  type: 'text',
                  context: { 
                    episode: episode.id || `Episode ${episodeIndex + 1}`,
                    slide: slide.slideId || `Slide ${slideIndex + 1}`
                  }
                });
              }

              // Content points
              if (visualContent.content?.points && Array.isArray(visualContent.content.points)) {
                visualContent.content.points.forEach((point: string, pointIndex: number) => {
                  fields.push({
                    id: `${slidePrefix}-point-${pointIndex}`,
                    label: `Slide ${slideIndex + 1} Point ${pointIndex + 1}`,
                    value: point,
                    path: `podcast.episodes[${episodeIndex}].videoStructure.slides[${slideIndex}].visualContent.content.points[${pointIndex}]`,
                    category: 'Content Points',
                    type: 'text',
                    context: { 
                      episode: episode.id || `Episode ${episodeIndex + 1}`,
                      slide: slide.slideId || `Slide ${slideIndex + 1}`
                    }
                  });
                });
              }

              // Chart/infographic data
              if (visualContent.keyStats && Array.isArray(visualContent.keyStats)) {
                visualContent.keyStats.forEach((stat: any, statIndex: number) => {
                  if (stat.label) {
                    fields.push({
                      id: `${slidePrefix}-stat-label-${statIndex}`,
                      label: `Slide ${slideIndex + 1} Stat ${statIndex + 1} Label`,
                      value: stat.label,
                      path: `podcast.episodes[${episodeIndex}].videoStructure.slides[${slideIndex}].visualContent.keyStats[${statIndex}].label`,
                      category: 'Statistics',
                      type: 'text',
                      context: { 
                        episode: episode.id || `Episode ${episodeIndex + 1}`,
                        slide: slide.slideId || `Slide ${slideIndex + 1}`
                      }
                    });
                  }
                  
                  if (stat.value) {
                    fields.push({
                      id: `${slidePrefix}-stat-value-${statIndex}`,
                      label: `Slide ${slideIndex + 1} Stat ${statIndex + 1} Value`,
                      value: stat.value.toString(),
                      path: `podcast.episodes[${episodeIndex}].videoStructure.slides[${slideIndex}].visualContent.keyStats[${statIndex}].value`,
                      category: 'Statistics',
                      type: 'text',
                      context: { 
                        episode: episode.id || `Episode ${episodeIndex + 1}`,
                        slide: slide.slideId || `Slide ${slideIndex + 1}`
                      }
                    });
                  }
                });
              }

              // Chart data
              if (visualContent.data && Array.isArray(visualContent.data)) {
                visualContent.data.forEach((dataItem: any, dataIndex: number) => {
                  if (dataItem.category) {
                    fields.push({
                      id: `${slidePrefix}-data-category-${dataIndex}`,
                      label: `Slide ${slideIndex + 1} Data ${dataIndex + 1} Category`,
                      value: dataItem.category,
                      path: `podcast.episodes[${episodeIndex}].videoStructure.slides[${slideIndex}].visualContent.data[${dataIndex}].category`,
                      category: 'Chart Data',
                      type: 'text',
                      context: { 
                        episode: episode.id || `Episode ${episodeIndex + 1}`,
                        slide: slide.slideId || `Slide ${slideIndex + 1}`
                      }
                    });
                  }
                  
                  if (dataItem.description) {
                    fields.push({
                      id: `${slidePrefix}-data-description-${dataIndex}`,
                      label: `Slide ${slideIndex + 1} Data ${dataIndex + 1} Description`,
                      value: dataItem.description,
                      path: `podcast.episodes[${episodeIndex}].videoStructure.slides[${slideIndex}].visualContent.data[${dataIndex}].description`,
                      category: 'Chart Data',
                      type: 'textarea',
                      context: { 
                        episode: episode.id || `Episode ${episodeIndex + 1}`,
                        slide: slide.slideId || `Slide ${slideIndex + 1}`
                      }
                    });
                  }
                });
              }
            }
          });
        }
      });
    }
  }

  return fields;
}