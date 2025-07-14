'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Clock,
  Download,
  Eye,
  EyeOff,
  BarChart3,
  Map,
  FileText,
  Video,
  Image,
  Layers
} from 'lucide-react';

// Enhanced episode interface with visual content
interface VisualContent {
  type: 'slide' | 'chart' | 'map' | 'video' | 'infographic' | 'interactive';
  title: string;
  content: any;
  timestamp: number; // When to show this content (in seconds)
  duration?: number; // How long to show it
}

interface EnhancedPodcastEpisode {
  id: string;
  title: string;
  description: string;
  duration: string;
  publishDate: string;
  audioUrl: string;
  videoUrl?: string; // Optional video track
  imageUrl?: string;
  hostName?: string;
  guestName?: string;
  topics: string[];
  learningObjectives: string[];
  audioScript?: string;
  visualContent?: VisualContent[]; // Dynamic visual content
  keyTimestamps?: { time: number; title: string; description: string }[];
  // New properties from JSON structure
  videoStructure?: {
    episodeOutput?: {
      finalVideoUrl?: string;
      totalDuration?: number;
      status?: string;
    };
  };
}

interface EnhancedPodcastData {
  title: string;
  description?: string;
  fullVideoUrl?: string; // Main video URL from JSON
  episodes: EnhancedPodcastEpisode[];
}

// Generate dynamic visual content based on episode content
const generateVisualContent = (episode: EnhancedPodcastEpisode): VisualContent[] => {
  const visualContent: VisualContent[] = [];
  
  // Generate intro slide
  visualContent.push({
    type: 'slide',
    title: 'Episode Introduction',
    content: {
      title: episode.title,
      points: episode.learningObjectives || episode.topics.slice(0, 4)
    },
    timestamp: 10,
    duration: 60
  });

  // Generate topic-based charts for each main topic
  episode.topics.forEach((topic, index) => {
    const timestamp = 120 + (index * 180); // Space them out every 3 minutes
    
    if (topic.toLowerCase().includes('model') || topic.toLowerCase().includes('sepp') || topic.toLowerCase().includes('rtm')) {
      visualContent.push({
        type: 'chart',
        title: `${topic} Performance Analysis`,
        content: {
          type: 'bar',
          data: [
            { category: 'Accuracy', value: 85 + Math.random() * 10 },
            { category: 'Speed', value: 75 + Math.random() * 15 },
            { category: 'Reliability', value: 80 + Math.random() * 12 },
            { category: 'Scalability', value: 70 + Math.random() * 20 }
          ]
        },
        timestamp,
        duration: 90
      });
    } else if (topic.toLowerCase().includes('crime') || topic.toLowerCase().includes('policing')) {
      visualContent.push({
        type: 'map',
        title: `${topic} Geographic Distribution`,
        content: {
          center: [40.7128, -74.0060],
          crimeSpots: Array.from({ length: 5 }, (_, i) => ({
            lat: 40.7128 + (Math.random() - 0.5) * 0.1,
            lng: -74.0060 + (Math.random() - 0.5) * 0.1,
            intensity: 6 + Math.random() * 4
          }))
        },
        timestamp,
        duration: 90
      });
    } else {
      visualContent.push({
        type: 'infographic',
        title: topic,
        content: {
          keyStats: [
            { label: 'Effectiveness', value: `${Math.floor(70 + Math.random() * 30)}%` },
            { label: 'Adoption Rate', value: `${Math.floor(40 + Math.random() * 40)}%` },
            { label: 'Cost Reduction', value: `${Math.floor(15 + Math.random() * 25)}%` }
          ]
        },
        timestamp,
        duration: 90
      });
    }
  });

  return visualContent;
};

// Generate dynamic timestamps based on episode content
const generateKeyTimestamps = (episode: EnhancedPodcastEpisode): { time: number; title: string; description: string }[] => {
  const timestamps = [
    { time: 0, title: 'Introduction', description: 'Episode overview and objectives' }
  ];

  episode.topics.forEach((topic, index) => {
    const time = 180 + (index * 300); // Start after intro, space 5 minutes apart
    timestamps.push({
      time,
      title: topic,
      description: `Deep dive into ${topic.toLowerCase()}`
    });
  });

  // Add conclusion
  const durationParts = episode.duration.split(':');
  const totalSeconds = parseInt(durationParts[0]) * 60 + parseInt(durationParts[1]) - 120;
  timestamps.push({
    time: totalSeconds,
    title: 'Conclusion',
    description: 'Summary and key takeaways'
  });

  return timestamps;
};

const EnhancedPodcast = ({ data }: { data: EnhancedPodcastData }) => {
  const [activeEpisode, setActiveEpisode] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showVisuals, setShowVisuals] = useState(true);
  const [currentVisual, setCurrentVisual] = useState<VisualContent | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'slides' | 'charts' | 'notes'>('overview');
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showMainVideo, setShowMainVideo] = useState(true); // Default to main video
  const [isFullScreen, setIsFullScreen] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Enhance episodes with dynamic content
  const enhancedEpisodes: EnhancedPodcastEpisode[] = data.episodes.map(episode => ({
    ...episode,
    hostName: episode.hostName || 'AI Learning Assistant',
    visualContent: generateVisualContent(episode),
    keyTimestamps: generateKeyTimestamps(episode)
  }));

  // Detect full-screen mode
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
    document.addEventListener('mozfullscreenchange', handleFullScreenChange);
    document.addEventListener('MSFullscreenChange', handleFullScreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullScreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullScreenChange);
    };
  }, []);

  // Get current video URL based on selection
  const getCurrentVideoUrl = () => {
    if (showMainVideo && data.fullVideoUrl) {
      return data.fullVideoUrl;
    }
    if (activeEpisode) {
      const episode = enhancedEpisodes.find(ep => ep.id === activeEpisode);
      return episode?.videoStructure?.episodeOutput?.finalVideoUrl || '';
    }
    return '';
  };

  // Load video when active episode changes or main video is selected
  useEffect(() => {
    if (videoRef.current) {
      const videoUrl = getCurrentVideoUrl();
      if (videoUrl) {
        // Stop any current playback and reset
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
        setIsPlaying(false);
        setCurrentTime(0);
        setPlaybackProgress(0);
        
        // Set new source and load
        videoRef.current.src = videoUrl;
        videoRef.current.load();
      }
    }
  }, [activeEpisode, showMainVideo, data.fullVideoUrl]);

  // Set up video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      if (video.currentTime) {
        setCurrentTime(video.currentTime);
      }
    };
    
    const updateDuration = () => {
      if (video.duration && !isNaN(video.duration)) {
        setDuration(video.duration);
      }
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setPlaybackProgress(0);
      setCurrentTime(0);
    };
    
    const handleLoadStart = () => {
      setCurrentTime(0);
      setPlaybackProgress(0);
      setDuration(0);
    };

    const handleError = (e: any) => {
      console.error('Video error:', e);
      setIsPlaying(false);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    const handleWaiting = () => {
      console.log('Video is buffering...');
    };

    const handleCanPlay = () => {
      console.log('Video can start playing');
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('error', handleError);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('error', handleError);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  // Update progress and find current visual content
  useEffect(() => {
    if (duration > 0) {
      setPlaybackProgress((currentTime / duration) * 100);
    }

    // Find current visual content based on timestamp (only for individual episodes)
    if (activeEpisode && currentTime > 0 && !showMainVideo) {
      const episode = enhancedEpisodes.find(ep => ep.id === activeEpisode);
      if (episode && episode.visualContent) {
        const visual = episode.visualContent.find(
          v => currentTime >= v.timestamp && 
               currentTime <= (v.timestamp + (v.duration || 60))
        );
        setCurrentVisual(visual || null);
      }
    } else {
      setCurrentVisual(null);
    }
  }, [currentTime, duration, activeEpisode, enhancedEpisodes, showMainVideo]);

  // Handle volume changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handlePlayPause = async () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      try {
        // Check if video is loaded and ready
        if (videoRef.current.readyState >= 3) { // HAVE_FUTURE_DATA or higher
          await videoRef.current.play();
        } else {
          // Video not ready, wait for it to load
          const playWhenReady = () => {
            if (videoRef.current) {
              videoRef.current.play().catch(error => {
                console.error('Error playing video:', error);
                setIsPlaying(false);
              });
            }
          };
          
          videoRef.current.addEventListener('canplay', playWhenReady, { once: true });
          setIsPlaying(true); // Update UI immediately
        }
      } catch (error) {
        console.error('Error playing video:', error);
        setIsPlaying(false);
      }
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = Number(e.target.value);
    const newTime = (newProgress / 100) * duration;
    
    if (videoRef.current && duration > 0) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
    setPlaybackProgress(newProgress);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMainVideoClick = () => {
    setShowMainVideo(true);
    setActiveEpisode(null);
    setCurrentTime(0);
    setPlaybackProgress(0);
    setIsPlaying(false);
  };

  const handleEpisodeClick = (episodeId: string) => {
    setShowMainVideo(false);
    setActiveEpisode(episodeId);
    setCurrentTime(0);
    setPlaybackProgress(0);
    setIsPlaying(false);
  };

  const renderVisualContent = () => {
    if (showMainVideo || !showVisuals || !currentVisual) {
      return (
        <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="text-center p-8">
            <div className="w-24 h-24 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <Video className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {showMainVideo ? 'Full Video Experience' : 'Video Learning Mode'}
            </h3>
            <p className="text-gray-500">
              {showMainVideo ? 'Complete educational series' : 'Individual lesson with synchronized content'}
            </p>
          </div>
        </div>
      );
    }

    // Render visual content for individual episodes (existing logic)
    switch (currentVisual.type) {
      case 'slide':
        return (
          <div className="h-full bg-white p-8 flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
              {currentVisual.content.title}
            </h2>
            <ul className="space-y-4 max-w-4xl mx-auto">
              {currentVisual.content.points.map((point: string, index: number) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-3 flex-shrink-0"></div>
                  <span className="text-lg text-gray-700">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        );

      case 'chart':
        return (
          <div className="h-full bg-white p-8">
            <h3 className="text-2xl font-bold text-center mb-6">{currentVisual.title}</h3>
            <div className="h-80 flex items-end justify-center space-x-4">
              {currentVisual.content.data.map((item: any, index: number) => (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className="bg-blue-500 rounded-t-lg mb-2 transition-all duration-1000 ease-out"
                    style={{ 
                      height: `${(item.value / 100) * 200}px`,
                      width: '60px'
                    }}
                  ></div>
                  <span className="text-sm font-medium">{item.category}</span>
                  <span className="text-xs text-gray-500">{Math.round(item.value)}%</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'map':
        return (
          <div className="h-full bg-white p-8">
            <h3 className="text-2xl font-bold text-center mb-6">{currentVisual.title}</h3>
            <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-4 bg-blue-50 rounded-lg">
                {currentVisual.content.crimeSpots.map((spot: any, index: number) => (
                  <div
                    key={index}
                    className="absolute w-4 h-4 bg-red-500 rounded-full animate-pulse"
                    style={{
                      left: `${20 + index * 15}%`,
                      top: `${30 + index * 10}%`,
                      opacity: spot.intensity / 10
                    }}
                  ></div>
                ))}
              </div>
              <div className="text-center z-10">
                <Map className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Crime Pattern Analysis</p>
              </div>
            </div>
          </div>
        );

      case 'infographic':
        return (
          <div className="h-full bg-white p-8 flex flex-col justify-center">
            <h3 className="text-2xl font-bold text-center mb-8">{currentVisual.title}</h3>
            <div className="grid grid-cols-3 gap-8 max-w-4xl mx-auto">
              {currentVisual.content.keyStats.map((stat: any, index: number) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderTimestampNavigation = () => {
    const episode = enhancedEpisodes.find(ep => ep.id === activeEpisode);
    if (!episode?.keyTimestamps || showMainVideo) return null;

    return (
      <div className="bg-white rounded-lg p-4 mb-4">
        <h4 className="font-semibold mb-3 flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          Episode Timeline
        </h4>
        <div className="space-y-2">
          {episode.keyTimestamps.map((timestamp, index) => (
            <div 
              key={index}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                currentTime >= timestamp.time && 
                (index === episode.keyTimestamps!.length - 1 || currentTime < episode.keyTimestamps![index + 1].time)
                  ? 'bg-blue-100 border-l-4 border-blue-500' 
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = timestamp.time;
                }
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{timestamp.title}</div>
                  <div className="text-xs text-gray-600">{timestamp.description}</div>
                </div>
                <div className="text-xs text-gray-500">
                  {Math.floor(timestamp.time / 60)}:{String(timestamp.time % 60).padStart(2, '0')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6 w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">{data.title}</h2>
          {data.description && <p className="text-gray-600 mt-2">{data.description}</p>}
        </div>
        <button
          onClick={() => setShowVisuals(!showVisuals)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          {showVisuals ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showVisuals ? 'Hide Visuals' : 'Show Visuals'}
        </button>
      </div>

      {/* Video Selection Buttons */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Select Video</h3>
        
        {/* Main Video Button */}
        {data.fullVideoUrl && (
          <div className="mb-4">
            <button
              onClick={handleMainVideoClick}
              className={`p-4 rounded-lg text-left transition-all w-full ${
                showMainVideo 
                  ? 'bg-purple-500 text-white shadow-lg' 
                  : 'bg-white hover:bg-purple-50 border-2 border-transparent hover:border-purple-200'
              }`}
            >
              <div className="flex items-center">
                <Video className="h-6 w-6 mr-3" />
                <div>
                  <div className="font-medium">Complete Video Series</div>
                  <div className="text-xs opacity-75">Full educational experience with all lessons</div>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Individual Lesson Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {enhancedEpisodes.map((episode) => (
            <button
              key={episode.id}
              onClick={() => handleEpisodeClick(episode.id)}
              className={`p-4 rounded-lg text-left transition-all ${
                activeEpisode === episode.id && !showMainVideo
                  ? 'bg-blue-500 text-white shadow-lg' 
                  : 'bg-white hover:bg-blue-50 border-2 border-transparent hover:border-blue-200'
              }`}
            >
              <div className="font-medium text-sm mb-1">{episode.title}</div>
              <div className="text-xs opacity-75 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {episode.duration}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Video Area */}
      <div className="mb-6">
        <div className="bg-white rounded-xl shadow-lg p-4 max-w-5xl mx-auto">
          <div className="bg-black rounded-lg overflow-hidden flex items-center justify-center relative" style={{ minHeight: '480px' }}>
            <video
              ref={videoRef}
              className="w-full h-full rounded-lg object-contain"
              style={{ 
                width: '100%', 
                height: '100%',
                aspectRatio: '16/9'
              }}
              controls={false}
              preload="metadata"
              poster={showMainVideo ? undefined : enhancedEpisodes.find(ep => ep.id === activeEpisode)?.imageUrl}
              onError={(e) => {
                console.error('Video error:', e);
                setIsPlaying(false);
              }}
            >
              <source src={getCurrentVideoUrl()} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            {/* Overlay for visual content (only for individual episodes) */}
            {!showMainVideo && showVisuals && (
              <div className="absolute inset-0 pointer-events-none">
                {renderVisualContent()}
              </div>
            )}
          </div>

          {/* Video Controls */}
          <div className="bg-white rounded-lg p-4 mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            
            <div className="mb-4">
              <input
                type="range"
                min="0"
                max="100"
                value={playbackProgress}
                onChange={handleProgressChange}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${playbackProgress}%, #E5E7EB ${playbackProgress}%, #E5E7EB 100%)`
                }}
              />
            </div>

            <div className="flex items-center justify-center space-x-4">
              <button 
                className="rounded-full p-2 bg-gray-100 hover:bg-gray-200 transition-colors"
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 15, 0);
                  }
                }}
              >
                <SkipBack className="h-5 w-5" />
              </button>
              
              <button 
                className="rounded-full p-3 bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                onClick={handlePlayPause}
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </button>
              
              <button 
                className="rounded-full p-2 bg-gray-100 hover:bg-gray-200 transition-colors"
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 15, duration);
                  }
                }}
              >
                <SkipForward className="h-5 w-5" />
              </button>

              <button 
                className="rounded-full p-2 bg-gray-100 hover:bg-gray-200 transition-colors"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Sidebar - Full Width */}
      {!showMainVideo && activeEpisode && (
        <div className="mb-6">
          {/* Tab Navigation */}
          <div className="bg-white rounded-lg p-1 flex mb-4">
            {[
              { id: 'overview', label: 'Timeline', icon: Clock },
              { id: 'slides', label: 'Slides', icon: Image },
              { id: 'charts', label: 'Charts', icon: BarChart3 },
              { id: 'notes', label: 'Notes', icon: Layers }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content - Horizontal Layout */}
          <div className="bg-white rounded-lg p-4">
            {activeTab === 'overview' && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Episode Timeline
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {enhancedEpisodes.find(ep => ep.id === activeEpisode)?.keyTimestamps?.map((timestamp, index) => (
                    <div 
                      key={index}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        currentTime >= timestamp.time && 
                        (index === enhancedEpisodes.find(ep => ep.id === activeEpisode)!.keyTimestamps!.length - 1 || 
                         currentTime < enhancedEpisodes.find(ep => ep.id === activeEpisode)!.keyTimestamps![index + 1].time)
                          ? 'bg-blue-100 border-l-4 border-blue-500' 
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.currentTime = timestamp.time;
                        }
                      }}
                    >
                      <div className="font-medium text-sm">{timestamp.title}</div>
                      <div className="text-xs text-gray-600 mb-1">{timestamp.description}</div>
                      <div className="text-xs text-gray-500">
                        {Math.floor(timestamp.time / 60)}:{String(timestamp.time % 60).padStart(2, '0')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'slides' && (
              <div>
                <h4 className="font-semibold mb-3">Visual Content</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {enhancedEpisodes.find(ep => ep.id === activeEpisode)?.visualContent?.map((visual, index) => (
                    <div 
                      key={index}
                      className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.currentTime = visual.timestamp;
                        }
                      }}
                    >
                      <div className="font-medium text-sm mb-1">{visual.title}</div>
                      <div className="text-xs text-gray-500 mb-1">Type: {visual.type}</div>
                      <div className="text-xs text-gray-500">
                        {Math.floor(visual.timestamp / 60)}:{String(visual.timestamp % 60).padStart(2, '0')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'charts' && (
              <div>
                <h4 className="font-semibold mb-3">Data Visualizations</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {enhancedEpisodes.find(ep => ep.id === activeEpisode)?.visualContent
                    ?.filter(v => v.type === 'chart')
                    .map((chart, index) => (
                      <div 
                        key={index}
                        className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          if (videoRef.current) {
                            videoRef.current.currentTime = chart.timestamp;
                          }
                        }}
                      >
                        <div className="font-medium text-sm mb-1">{chart.title}</div>
                        <div className="text-xs text-gray-500 mb-1">Interactive chart</div>
                        <div className="text-xs text-gray-500">
                          {Math.floor(chart.timestamp / 60)}:{String(chart.timestamp % 60).padStart(2, '0')}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div>
                <h4 className="font-semibold mb-3">Learning Objectives</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {enhancedEpisodes.find(ep => ep.id === activeEpisode)?.learningObjectives.map((objective, index) => (
                    <div key={index} className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                      <strong>Objective {index + 1}:</strong> {objective}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Episode Card - Only show for individual episodes */}
      {!showMainVideo && activeEpisode && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {enhancedEpisodes.find(ep => ep.id === activeEpisode)?.imageUrl && (
              <div className="md:w-48 h-48 flex-shrink-0">
                <img 
                  src={enhancedEpisodes.find(ep => ep.id === activeEpisode)?.imageUrl} 
                  alt={enhancedEpisodes.find(ep => ep.id === activeEpisode)?.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="flex-1 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium text-xl mb-2">{enhancedEpisodes.find(ep => ep.id === activeEpisode)?.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Host: {enhancedEpisodes.find(ep => ep.id === activeEpisode)?.hostName}
                  </p>
                  <p className="text-gray-700 mb-4">
                    {enhancedEpisodes.find(ep => ep.id === activeEpisode)?.description}
                  </p>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{enhancedEpisodes.find(ep => ep.id === activeEpisode)?.duration}</span>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium text-sm text-gray-700 mb-2">Learning Objectives:</h4>
                <div className="flex flex-wrap gap-2">
                  {enhancedEpisodes.find(ep => ep.id === activeEpisode)?.learningObjectives.map((objective, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {objective.substring(0, 60)}...
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">Topics Covered:</h4>
                <div className="flex flex-wrap gap-2">
                  {enhancedEpisodes.find(ep => ep.id === activeEpisode)?.topics.map((topic, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Video Description - Only show for main video */}
      {showMainVideo && (
        <div className="bg-white rounded-lg shadow overflow-hidden p-6">
          <h3 className="font-medium text-xl mb-4">Complete Educational Series</h3>
          <p className="text-gray-700 mb-4">
            {data.description || 'This comprehensive video series covers all aspects of the educational content in a seamless learning experience.'}
          </p>
          
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-2">Series includes:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {enhancedEpisodes.map((episode, index) => (
                <div key={episode.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-sm mb-1">
                    Lesson {index + 1}: {episode.title}
                  </div>
                  <div className="text-xs text-gray-600 mb-1">
                    {episode.description.substring(0, 80)}...
                  </div>
                  <div className="text-xs text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {episode.duration}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedPodcast;