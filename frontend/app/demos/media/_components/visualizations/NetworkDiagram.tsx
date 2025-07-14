import { TrendingUp, Users, Briefcase, PieChart, Target, Clock, Brain, Edit, Search, Code, BarChart, Lightbulb, Cog } from "lucide-react";

interface NetworkDiagramProps {
  data: any[];
  visualContent: any;
}

export default function NetworkDiagram({ data, visualContent }: NetworkDiagramProps) {
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

  // Determine if background is white
  const isWhiteBackground = visualContent.backgroundStyle === 'white';
  const backgroundClass = backgroundStyles[visualContent.backgroundStyle as keyof typeof backgroundStyles] || backgroundStyles['gradient-blue'];
  
  // Text color based on background
  const textColorClass = isWhiteBackground ? 'text-gray-800' : 'text-white';
  
  // Connection line styling
  const connectionColor = isWhiteBackground ? 'rgba(100, 116, 139, 0.4)' : 'rgba(255, 255, 255, 0.4)';
  
  // Center hub styling
  const hubFillColor = isWhiteBackground ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.2)';
  const hubStrokeColor = isWhiteBackground ? 'rgba(59, 130, 246, 0.8)' : 'rgba(255, 255, 255, 0.8)';
  const hubTextColor = isWhiteBackground ? '#1f2937' : 'white';
  
  // Node styling
  const nodeBaseClass = isWhiteBackground
    ? 'bg-blue-100 border-blue-300 hover:bg-blue-200'
    : 'bg-white bg-opacity-25 border-white border-opacity-50 hover:bg-opacity-40';
    
  const nodeIconColor = isWhiteBackground ? 'text-blue-700' : 'text-white';
  
  // Label styling
  const labelBgClass = isWhiteBackground
    ? 'bg-gray-800 bg-opacity-90 border-gray-600'
    : 'bg-black bg-opacity-70 border-white border-opacity-20';
    
  const labelTextColor = isWhiteBackground ? 'text-white' : 'text-white';

  const iconMap = {
    'trending-up': TrendingUp,
    'users': Users,
    'briefcase': Briefcase,
    'pie-chart': PieChart,
    'target': Target,
    'clock': Clock,
    'brain': Brain,
    'edit': Edit,
    'search': Search,
    'code': Code,
    'bar-chart': BarChart,
    'lightbulb': Lightbulb,
    'robot': Cog,
    'cog': Cog
  };

  // Icon fallback for canvas rendering
  const iconFallbacks = {
    'trending-up': '📈',
    'users': '👥',
    'briefcase': '💼',
    'pie-chart': '📊',
    'target': '🎯',
    'clock': '🕐',
    'brain': '🧠',
    'edit': '✏️',
    'search': '🔍',
    'code': '💻',
    'bar-chart': '📊',
    'lightbulb': '💡',
    'robot': '🤖',
    'cog': '⚙️'
  };
  
  // Improved layout for better spacing
  const containerWidth = 600;
  const containerHeight = 400;
  const centerX = containerWidth / 2;
  const centerY = containerHeight / 2;
  const radius = 140; // Increased radius for better spacing
  
  const nodePositions = data.map((_, index) => {
    const angle = (index / data.length) * 2 * Math.PI - Math.PI / 2; // Start from top
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  });
  
  return (
    <div className={`${backgroundClass} rounded-lg p-12 ${textColorClass} min-h-96 overflow-hidden`}>
      <h3 className={`text-2xl font-bold mb-8 text-center ${textColorClass}`}>
        {visualContent.title}
      </h3>
      
      <div className="relative flex justify-center">
        {/* SVG for connections */}
        <svg 
          width={containerWidth} 
          height={containerHeight} 
          className="absolute"
          viewBox={`0 0 ${containerWidth} ${containerHeight}`}
        >
          {/* Draw connections from center to each node */}
          {data.map((_, index) => (
            <line
              key={`connection-${index}`}
              x1={centerX}
              y1={centerY}
              x2={nodePositions[index].x}
              y2={nodePositions[index].y}
              stroke={connectionColor}
              strokeWidth="2"
              strokeDasharray="8,4"
            />
          ))}
          
          {/* Center hub */}
          <circle
            cx={centerX}
            cy={centerY}
            r="30"
            fill={hubFillColor}
            stroke={hubStrokeColor}
            strokeWidth="3"
          />
          <text
            x={centerX}
            y={centerY + 6}
            textAnchor="middle"
            fill={hubTextColor}
            fontSize="16"
            fontWeight="bold"
          >
            AI
          </text>
        </svg>
        
        {/* Nodes positioned around the circle */}
        <div className="relative" style={{ width: containerWidth, height: containerHeight }}>
          {data.map((item, index) => {
            const IconComponent = iconMap[item.icon as keyof typeof iconMap] || Cog;
            const fallbackIcon = iconFallbacks[item.icon as keyof typeof iconFallbacks] || '📊';
            const position = nodePositions[index];
            
            // Determine label position based on node position relative to center
            const isLeft = position.x < centerX;
            
            return (
              <div
                key={index}
                className="absolute group"
                style={{
                  left: position.x - 40, // Center the 80px wide node
                  top: position.y - 40,  // Center the 80px tall node
                  width: '80px',
                  height: '80px'
                }}
              >
                {/* Node circle */}
                <div className={`w-full h-full ${nodeBaseClass} rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-300 group-hover:scale-110 border-2`}>
                  {/* SVG Icon with Canvas Fallback */}
                  <div className="icon-container" style={{ height: '32px', width: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <IconComponent 
                      className={`h-8 w-8 ${nodeIconColor} canvas-fallback-hide`} 
                      style={{ width: '32px', height: '32px' }}
                    />
                    <span 
                      className="canvas-fallback-show" 
                      style={{ 
                        fontSize: '24px', 
                        display: 'none',
                        lineHeight: '32px'
                      }}
                    >
                      {fallbackIcon}
                    </span>
                  </div>
                </div>
                
                {/* Label positioned to the side of the circle with proper wrapping */}
                <div 
                  className="absolute flex items-center"
                  style={{
                    top: '50%',
                    transform: 'translateY(-50%)',
                    left: isLeft ? '-140px' : '90px', // Increased space for left labels
                    width: '130px' // Increased width for better wrapping
                  }}
                >
                  <div 
                    className={`${labelBgClass} rounded-lg px-3 py-2 backdrop-blur-sm w-full border`}
                    style={{
                      textAlign: 'center',
                      wordWrap: 'break-word',
                      hyphens: 'auto'
                    }}
                  >
                    <span className={`text-sm font-medium leading-tight block ${labelTextColor}`}>
                      {item.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <p className={`text-lg ${isWhiteBackground ? 'text-gray-600' : 'text-white opacity-90'}`}>
          Interconnected network showing relationships
        </p>
      </div>
    </div>
  );
}

// import { TrendingUp, Users, Briefcase, PieChart, Target, Clock, Brain, Edit, Search, Code, BarChart, Lightbulb, Cog } from "lucide-react";

// interface NetworkDiagramProps {
//   data: any[];
//   visualContent: any;
// }

// export default function NetworkDiagram({ data, visualContent }: NetworkDiagramProps) {
//   const backgroundStyles = {
//     'white': 'bg-white',
//     'gradient-blue': 'bg-gradient-to-br from-blue-500 to-blue-600',
//     'gradient-green': 'bg-gradient-to-br from-green-500 to-green-600',
//     'gradient-purple': 'bg-gradient-to-br from-purple-500 to-purple-600',
//     'gradient-orange': 'bg-gradient-to-br from-orange-500 to-orange-600',
//     'gradient-red': 'bg-gradient-to-br from-red-500 to-red-600',
//     'gradient-teal': 'bg-gradient-to-br from-teal-500 to-teal-600',
//     'gradient-indigo': 'bg-gradient-to-br from-indigo-500 to-indigo-600'
//   };

//   // Determine if background is white
//   const isWhiteBackground = visualContent.backgroundStyle === 'white';
//   const backgroundClass = backgroundStyles[visualContent.backgroundStyle as keyof typeof backgroundStyles] || backgroundStyles['gradient-blue'];
  
//   // Text color based on background
//   const textColorClass = isWhiteBackground ? 'text-gray-800' : 'text-white';
  
//   // Connection line styling
//   const connectionColor = isWhiteBackground ? 'rgba(100, 116, 139, 0.4)' : 'rgba(255, 255, 255, 0.4)';
  
//   // Center hub styling
//   const hubFillColor = isWhiteBackground ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.2)';
//   const hubStrokeColor = isWhiteBackground ? 'rgba(59, 130, 246, 0.8)' : 'rgba(255, 255, 255, 0.8)';
//   const hubTextColor = isWhiteBackground ? '#1f2937' : 'white';
  
//   // Node styling
//   const nodeBaseClass = isWhiteBackground
//     ? 'bg-blue-100 border-blue-300 hover:bg-blue-200'
//     : 'bg-white bg-opacity-25 border-white border-opacity-50 hover:bg-opacity-40';
    
//   const nodeIconColor = isWhiteBackground ? 'text-blue-700' : 'text-white';
  
//   // Label styling
//   const labelBgClass = isWhiteBackground
//     ? 'bg-gray-800 bg-opacity-90 border-gray-600'
//     : 'bg-black bg-opacity-70 border-white border-opacity-20';
    
//   const labelTextColor = isWhiteBackground ? 'text-white' : 'text-white';

//   const iconMap = {
//     'trending-up': TrendingUp,
//     'users': Users,
//     'briefcase': Briefcase,
//     'pie-chart': PieChart,
//     'target': Target,
//     'clock': Clock,
//     'brain': Brain,
//     'edit': Edit,
//     'search': Search,
//     'code': Code,
//     'bar-chart': BarChart,
//     'lightbulb': Lightbulb,
//     'robot': Cog,
//     'cog': Cog
//   };
  
//   // Improved layout for better spacing
//   const containerWidth = 600;
//   const containerHeight = 400;
//   const centerX = containerWidth / 2;
//   const centerY = containerHeight / 2;
//   const radius = 140; // Increased radius for better spacing
  
//   const nodePositions = data.map((_, index) => {
//     const angle = (index / data.length) * 2 * Math.PI - Math.PI / 2; // Start from top
//     return {
//       x: centerX + radius * Math.cos(angle),
//       y: centerY + radius * Math.sin(angle)
//     };
//   });
  
//   return (
//     <div className={`${backgroundClass} rounded-lg p-12 ${textColorClass} min-h-96 overflow-hidden`}>
//       <h3 className={`text-2xl font-bold mb-8 text-center ${textColorClass}`}>
//         {visualContent.title}
//       </h3>
      
//       <div className="relative flex justify-center">
//         {/* SVG for connections */}
//         <svg 
//           width={containerWidth} 
//           height={containerHeight} 
//           className="absolute"
//           viewBox={`0 0 ${containerWidth} ${containerHeight}`}
//         >
//           {/* Draw connections from center to each node */}
//           {data.map((_, index) => (
//             <line
//               key={`connection-${index}`}
//               x1={centerX}
//               y1={centerY}
//               x2={nodePositions[index].x}
//               y2={nodePositions[index].y}
//               stroke={connectionColor}
//               strokeWidth="2"
//               strokeDasharray="8,4"
//             />
//           ))}
          
//           {/* Center hub */}
//           <circle
//             cx={centerX}
//             cy={centerY}
//             r="30"
//             fill={hubFillColor}
//             stroke={hubStrokeColor}
//             strokeWidth="3"
//           />
//           <text
//             x={centerX}
//             y={centerY + 6}
//             textAnchor="middle"
//             fill={hubTextColor}
//             fontSize="16"
//             fontWeight="bold"
//           >
//             AI
//           </text>
//         </svg>
        
//         {/* Nodes positioned around the circle */}
//         <div className="relative" style={{ width: containerWidth, height: containerHeight }}>
//           {data.map((item, index) => {
//             const IconComponent = iconMap[item.icon as keyof typeof iconMap] || Cog;
//             const position = nodePositions[index];
            
//             // Determine label position based on node position relative to center
//             const isLeft = position.x < centerX;
            
//             return (
//               <div
//                 key={index}
//                 className="absolute group"
//                 style={{
//                   left: position.x - 40, // Center the 80px wide node
//                   top: position.y - 40,  // Center the 80px tall node
//                   width: '80px',
//                   height: '80px'
//                 }}
//               >
//                 {/* Node circle */}
//                 <div className={`w-full h-full ${nodeBaseClass} rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-300 group-hover:scale-110 border-2`}>
//                   <IconComponent className={`h-8 w-8 ${nodeIconColor}`} />
//                 </div>
                
//                 {/* Label positioned to the side of the circle with proper wrapping */}
//                 <div 
//                   className="absolute flex items-center"
//                   style={{
//                     top: '50%',
//                     transform: 'translateY(-50%)',
//                     left: isLeft ? '-140px' : '90px', // Increased space for left labels
//                     width: '130px' // Increased width for better wrapping
//                   }}
//                 >
//                   <div 
//                     className={`${labelBgClass} rounded-lg px-3 py-2 backdrop-blur-sm w-full border`}
//                     style={{
//                       textAlign: 'center',
//                       wordWrap: 'break-word',
//                       hyphens: 'auto'
//                     }}
//                   >
//                     <span className={`text-sm font-medium leading-tight block ${labelTextColor}`}>
//                       {item.label}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>
      
//       <div className="mt-8 text-center">
//         <p className={`text-lg ${isWhiteBackground ? 'text-gray-600' : 'text-white opacity-90'}`}>
//           Interconnected network showing relationships
//         </p>
//       </div>
//     </div>
//   );
// }

// // import { TrendingUp, Users, Briefcase, PieChart, Target, Clock, Brain, Edit, Search, Code, BarChart, Lightbulb, Cog } from "lucide-react";

// // interface NetworkDiagramProps {
// //   data: any[];
// //   visualContent: any;
// // }

// // export default function NetworkDiagram({ data, visualContent }: NetworkDiagramProps) {
// //   const backgroundStyles = {
// //     'gradient-blue': 'bg-gradient-to-br from-blue-500 to-blue-600',
// //     'gradient-green': 'bg-gradient-to-br from-green-500 to-green-600',
// //     'gradient-purple': 'bg-gradient-to-br from-purple-500 to-purple-600',
// //     'gradient-orange': 'bg-gradient-to-br from-orange-500 to-orange-600',
// //     'gradient-red': 'bg-gradient-to-br from-red-500 to-red-600',
// //     'gradient-teal': 'bg-gradient-to-br from-teal-500 to-teal-600',
// //     'gradient-indigo': 'bg-gradient-to-br from-indigo-500 to-indigo-600'
// //   };

// //   const backgroundClass = backgroundStyles[visualContent.backgroundStyle as keyof typeof backgroundStyles] || backgroundStyles['gradient-blue'];
  
// //   const iconMap = {
// //     'trending-up': TrendingUp,
// //     'users': Users,
// //     'briefcase': Briefcase,
// //     'pie-chart': PieChart,
// //     'target': Target,
// //     'clock': Clock,
// //     'brain': Brain,
// //     'edit': Edit,
// //     'search': Search,
// //     'code': Code,
// //     'bar-chart': BarChart,
// //     'lightbulb': Lightbulb,
// //     'robot': Cog,
// //     'cog': Cog
// //   };
  
// //   // Improved layout for better spacing
// //   const containerWidth = 600;
// //   const containerHeight = 400;
// //   const centerX = containerWidth / 2;
// //   const centerY = containerHeight / 2;
// //   const radius = 140; // Increased radius for better spacing
  
// //   const nodePositions = data.map((_, index) => {
// //     const angle = (index / data.length) * 2 * Math.PI - Math.PI / 2; // Start from top
// //     return {
// //       x: centerX + radius * Math.cos(angle),
// //       y: centerY + radius * Math.sin(angle)
// //     };
// //   });
  
// //   return (
// //     <div className={`${backgroundClass} rounded-lg p-12 text-white min-h-96 overflow-hidden`}>
// //       <h3 className="text-2xl font-bold mb-8 text-center">{visualContent.title}</h3>
      
// //       <div className="relative flex justify-center">
// //         {/* SVG for connections */}
// //         <svg 
// //           width={containerWidth} 
// //           height={containerHeight} 
// //           className="absolute"
// //           viewBox={`0 0 ${containerWidth} ${containerHeight}`}
// //         >
// //           {/* Draw connections from center to each node */}
// //           {data.map((_, index) => (
// //             <line
// //               key={`connection-${index}`}
// //               x1={centerX}
// //               y1={centerY}
// //               x2={nodePositions[index].x}
// //               y2={nodePositions[index].y}
// //               stroke="rgba(255, 255, 255, 0.4)"
// //               strokeWidth="2"
// //               strokeDasharray="8,4"
// //             />
// //           ))}
          
// //           {/* Center hub */}
// //           <circle
// //             cx={centerX}
// //             cy={centerY}
// //             r="30"
// //             fill="rgba(255, 255, 255, 0.2)"
// //             stroke="rgba(255, 255, 255, 0.8)"
// //             strokeWidth="3"
// //           />
// //           <text
// //             x={centerX}
// //             y={centerY + 6}
// //             textAnchor="middle"
// //             fill="white"
// //             fontSize="16"
// //             fontWeight="bold"
// //           >
// //             AI
// //           </text>
// //         </svg>
        
// //         {/* Nodes positioned around the circle */}
// //         <div className="relative" style={{ width: containerWidth, height: containerHeight }}>
// //           {data.map((item, index) => {
// //             const IconComponent = iconMap[item.icon as keyof typeof iconMap] || Cog;
// //             const position = nodePositions[index];
            
// //             // Determine label position based on node position relative to center
// //             const isLeft = position.x < centerX;
            
// //             return (
// //               <div
// //                 key={index}
// //                 className="absolute group"
// //                 style={{
// //                   left: position.x - 40, // Center the 80px wide node
// //                   top: position.y - 40,  // Center the 80px tall node
// //                   width: '80px',
// //                   height: '80px'
// //                 }}
// //               >
// //                 {/* Node circle */}
// //                 <div className="w-full h-full bg-white bg-opacity-25 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-opacity-40 transition-all duration-300 group-hover:scale-110 border-2 border-white border-opacity-50">
// //                   <IconComponent className="h-8 w-8" />
// //                 </div>
                
// //                 {/* Label positioned to the side of the circle with proper wrapping */}
// //                 <div 
// //                   className="absolute flex items-center"
// //                   style={{
// //                     top: '50%',
// //                     transform: 'translateY(-50%)',
// //                     left: isLeft ? '-140px' : '90px', // Increased space for left labels
// //                     width: '130px' // Increased width for better wrapping
// //                   }}
// //                 >
// //                   <div 
// //                     className="bg-black bg-opacity-70 rounded-lg px-3 py-2 backdrop-blur-sm w-full border border-white border-opacity-20"
// //                     style={{
// //                       textAlign: 'center',
// //                       wordWrap: 'break-word',
// //                       hyphens: 'auto'
// //                     }}
// //                   >
// //                     <span className="text-sm font-medium leading-tight block">
// //                       {item.label}
// //                     </span>
// //                   </div>
// //                 </div>
// //               </div>
// //             );
// //           })}
// //         </div>
// //       </div>
      
// //       <div className="mt-8 text-center">
// //         <p className="text-lg opacity-90">
// //           Interconnected network showing relationships
// //         </p>
// //       </div>
// //     </div>
// //   );
// // }


