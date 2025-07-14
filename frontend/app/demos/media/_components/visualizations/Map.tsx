import React, { useEffect, useRef } from 'react';

interface MapProps {
  data: any[];
  visualContent: any;
}

interface MapSpot {
  lat: number;
  lng: number;
  intensity: number;
  label?: string;
  value?: number;
}

export default function Map({ data, visualContent }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  const backgroundStyles = {
    'white': 'bg-white',
    'gradient-blue': 'bg-gradient-to-br from-blue-500 to-blue-600',
    'gradient-green': 'bg-gradient-to-br from-green-500 to-green-600',
    'gradient-purple': 'bg-gradient-to-br from-purple-500 to-purple-600',
    'gradient-orange': 'bg-gradient-to-br from-orange-500 to-orange-600',
    'gradient-red': 'bg-gradient-to-br from-red-500 to-red-600',
    'gradient-teal': 'bg-gradient-to-br from-teal-500 to-teal-600',
    'gradient-indigo': 'bg-gradient-to-br from-indigo-500 to-indigo-600'
  };

  // Extract map data from visualContent
  const mapData = visualContent?.content || visualContent || {};
  const center = mapData.center || [0, 0];
  
  // Support multiple data source formats
  let mapSpots: MapSpot[] = [];
  if (mapData.crimeSpots) {
    mapSpots = mapData.crimeSpots;
  } else if (mapData.spots) {
    mapSpots = mapData.spots;
  } else if (mapData.locations) {
    mapSpots = mapData.locations;
  } else if (mapData.points) {
    mapSpots = mapData.points;
  } else if (data && Array.isArray(data)) {
    mapSpots = data;
  }

  const title = visualContent?.title || mapData.title || 'Geographic Visualization';
  const backgroundStyle = mapData.backgroundStyle || visualContent?.backgroundStyle || 'gradient-blue';
  const animationType = mapData.animationType || 'pulse-spots';

  // Determine if background is white
  const isWhiteBackground = backgroundStyle === 'white';
  const backgroundClass = backgroundStyles[backgroundStyle as keyof typeof backgroundStyles] || backgroundStyles['gradient-blue'];
  
  // Text color based on background
  const textColorClass = isWhiteBackground ? 'text-gray-800' : 'text-white';

  // Dynamic map bounds calculation based on data
  const calculateMapBounds = (spots: MapSpot[]) => {
    if (!spots || spots.length === 0) {
      // Default world bounds
      return {
        minLat: -90,
        maxLat: 90,
        minLng: -180,
        maxLng: 180
      };
    }

    const lats = spots.map(spot => spot.lat);
    const lngs = spots.map(spot => spot.lng);
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    // Add padding (10% of range)
    const latRange = maxLat - minLat;
    const lngRange = maxLng - minLng;
    const latPadding = Math.max(latRange * 0.1, 1); // Minimum 1 degree padding
    const lngPadding = Math.max(lngRange * 0.1, 1);
    
    return {
      minLat: minLat - latPadding,
      maxLat: maxLat + latPadding,
      minLng: minLng - lngPadding,
      maxLng: maxLng + lngPadding
    };
  };

  const mapBounds = calculateMapBounds(mapSpots);

  // Convert lat/lng to pixel coordinates within our map container
  const coordToPixel = (lat: number, lng: number, containerWidth: number, containerHeight: number) => {
    const x = ((lng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * containerWidth;
    const y = ((mapBounds.maxLat - lat) / (mapBounds.maxLat - mapBounds.minLat)) * containerHeight;
    return { x: Math.max(0, Math.min(containerWidth, x)), y: Math.max(0, Math.min(containerHeight, y)) };
  };

  // Get intensity color
  const getIntensityColor = (intensity: number) => {
    const maxIntensity = Math.max(...mapSpots.map(s => s.intensity || 1));
    const normalizedIntensity = intensity / maxIntensity;
    
    if (normalizedIntensity <= 0.2) return '#22c55e'; // Green for low intensity
    if (normalizedIntensity <= 0.4) return '#eab308'; // Yellow 
    if (normalizedIntensity <= 0.6) return '#f97316'; // Orange
    if (normalizedIntensity <= 0.8) return '#ef4444'; // Red
    return '#dc2626'; // Dark red for highest intensity
  };

  // Get intensity size based on data range
  const getIntensitySize = (intensity: number) => {
    const maxIntensity = Math.max(...mapSpots.map(s => s.intensity || 1));
    const minIntensity = Math.min(...mapSpots.map(s => s.intensity || 1));
    const normalizedIntensity = (intensity - minIntensity) / (maxIntensity - minIntensity);
    return Math.max(8, 8 + normalizedIntensity * 16); // 8px to 24px range
  };

  // Generate grid lines based on map bounds
  const generateGridLines = () => {
    const latStep = (mapBounds.maxLat - mapBounds.minLat) / 6;
    const lngStep = (mapBounds.maxLng - mapBounds.minLng) / 8;
    const lines = [];
    
    // Vertical lines (longitude)
    for (let i = 1; i < 8; i++) {
      const lng = mapBounds.minLng + (lngStep * i);
      const x = (i / 8) * 100;
      lines.push(
        <line
          key={`v-${i}`}
          x1={`${x}%`}
          y1="0%"
          x2={`${x}%`}
          y2="100%"
          stroke={isWhiteBackground ? '#e5e7eb' : 'rgba(255,255,255,0.1)'}
          strokeWidth="0.5"
        />
      );
    }
    
    // Horizontal lines (latitude)
    for (let i = 1; i < 6; i++) {
      const lat = mapBounds.minLat + (latStep * i);
      const y = (i / 6) * 100;
      lines.push(
        <line
          key={`h-${i}`}
          x1="0%"
          y1={`${y}%`}
          x2="100%"
          y2={`${y}%`}
          stroke={isWhiteBackground ? '#e5e7eb' : 'rgba(255,255,255,0.1)'}
          strokeWidth="0.5"
        />
      );
    }
    
    return lines;
  };

  useEffect(() => {
    // Add animation classes if needed
    if (animationType === 'pulse-spots' && mapRef.current) {
      const spots = mapRef.current.querySelectorAll('.map-spot');
      spots.forEach((spot, index) => {
        setTimeout(() => {
          spot.classList.add('animate-pulse');
        }, index * 200);
      });
    }
  }, [animationType]);

  // Generate coordinate labels
  const generateCoordinateLabels = () => {
    return (
      <>
        {/* Latitude labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs py-2">
          <span className={`${isWhiteBackground ? 'text-gray-500' : 'text-white opacity-60'}`}>
            {mapBounds.maxLat.toFixed(1)}°N
          </span>
          <span className={`${isWhiteBackground ? 'text-gray-500' : 'text-white opacity-60'}`}>
            {mapBounds.minLat.toFixed(1)}°N
          </span>
        </div>
        
        {/* Longitude labels */}
        <div className="absolute bottom-0 left-0 w-full flex justify-between text-xs px-2">
          <span className={`${isWhiteBackground ? 'text-gray-500' : 'text-white opacity-60'}`}>
            {mapBounds.minLng.toFixed(1)}°E
          </span>
          <span className={`${isWhiteBackground ? 'text-gray-500' : 'text-white opacity-60'}`}>
            {mapBounds.maxLng.toFixed(1)}°E
          </span>
        </div>
      </>
    );
  };

  return (
    <div className={`${backgroundClass} rounded-lg p-6 ${textColorClass} min-h-96`}>
      <h3 className={`text-xl font-bold mb-6 text-center ${textColorClass}`}>
        {title}
      </h3>
      
      <div className="flex flex-col lg:flex-row items-center justify-center space-y-6 lg:space-y-0 lg:space-x-8">
        {/* Map Container */}
        <div ref={mapRef} className="relative w-full max-w-lg h-80 mx-auto">
          {/* Map background with grid */}
          <svg 
            viewBox="0 0 400 300" 
            className="w-full h-full absolute inset-0 border rounded"
            style={{ 
              backgroundColor: isWhiteBackground ? '#f9fafb' : 'rgba(255,255,255,0.05)',
              borderColor: isWhiteBackground ? '#e5e7eb' : 'rgba(255,255,255,0.2)'
            }}
          >
            {/* Grid lines */}
            {generateGridLines()}
            
            {/* Map boundary */}
            <rect
              width="100%"
              height="100%"
              fill="none"
              stroke={isWhiteBackground ? '#d1d5db' : 'rgba(255,255,255,0.3)'}
              strokeWidth="1"
            />
          </svg>

          {/* Coordinate labels */}
          {generateCoordinateLabels()}

          {/* Data spots */}
          {mapSpots.map((spot, index) => {
            const { x, y } = coordToPixel(spot.lat, spot.lng, 400, 300);
            const size = getIntensitySize(spot.intensity || 1);
            const color = getIntensityColor(spot.intensity || 1);
            
            return (
              <div
                key={index}
                className="map-spot absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{
                  left: `${(x / 400) * 100}%`,
                  top: `${(y / 300) * 100}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                }}
                title={`${spot.label || `Point ${index + 1}`}: Intensity ${spot.intensity || 1}`}
              >
                {/* Main spot */}
                <div
                  className="w-full h-full rounded-full shadow-lg transition-transform group-hover:scale-125"
                  style={{ backgroundColor: color }}
                />
                
                {/* Pulse ring for animation */}
                {animationType === 'pulse-spots' && (
                  <div
                    className="absolute inset-0 rounded-full animate-ping opacity-30"
                    style={{ backgroundColor: color }}
                  />
                )}
                
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className={`px-2 py-1 text-xs rounded shadow-lg whitespace-nowrap ${
                    isWhiteBackground 
                      ? 'bg-gray-800 text-white' 
                      : 'bg-white text-gray-800'
                  }`}>
                    {spot.label || `Point ${index + 1}`}
                    <br />
                    Intensity: {spot.intensity || 1}
                    {spot.value && <><br />Value: {spot.value}</>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex-shrink-0">
          <div className="space-y-4">
            <h4 className={`text-sm font-semibold ${textColorClass}`}>Intensity Scale</h4>
            
            <div className="space-y-2">
              {[
                { range: 'Low (1-2)', color: '#22c55e', size: 8 },
                { range: 'Medium (3-4)', color: '#eab308', size: 12 },
                { range: 'High (5-6)', color: '#f97316', size: 16 },
                { range: 'Very High (7-8)', color: '#ef4444', size: 20 },
                { range: 'Extreme (9-10)', color: '#dc2626', size: 24 }
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div
                    className="rounded-full"
                    style={{
                      backgroundColor: item.color,
                      width: `${item.size}px`,
                      height: `${item.size}px`
                    }}
                  />
                  <span className={`text-sm ${isWhiteBackground ? 'text-gray-600' : 'text-white opacity-90'}`}>
                    {item.range}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="pt-4 border-t border-white border-opacity-20">
              <p className={`text-xs ${isWhiteBackground ? 'text-gray-500' : 'text-white opacity-75'}`}>
                Total Points: {mapSpots.length}
              </p>
              <p className={`text-xs ${isWhiteBackground ? 'text-gray-500' : 'text-white opacity-75'}`}>
                Center: {center[0].toFixed(2)}°, {center[1].toFixed(2)}°
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}