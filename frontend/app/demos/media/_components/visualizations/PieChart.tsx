interface PieChartProps {
  data: any[];
  visualContent: any;
}

export default function PieChart({ data, visualContent }: PieChartProps) {
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
  
  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Create SVG pie chart
  let cumulativePercentage = 0;
  const radius = 80;
  const centerX = 100;
  const centerY = 100;
  
  const createArcPath = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(centerX, centerY, radius, endAngle);
    const end = polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", centerX, centerY,
      "L", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "Z"
    ].join(" ");
  };
  
  function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }
  
  return (
    <div className={`${backgroundClass} rounded-lg p-6 ${textColorClass} min-h-64`}>
      <h3 className={`text-xl font-bold mb-6 text-center ${textColorClass}`}>{visualContent.title}</h3>
      
      <div className="flex items-center justify-center space-x-8">
        {/* Pie Chart SVG */}
        <div className="relative">
          <svg width="200" height="200" className="transform -rotate-90">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const startAngle = cumulativePercentage * 3.6;
              const endAngle = (cumulativePercentage + percentage) * 3.6;
              cumulativePercentage += percentage;
              
              return (
                <path
                  key={index}
                  d={createArcPath(startAngle, endAngle)}
                  fill={item.color || `hsl(${index * 60}, 70%, 60%)`}
                  stroke={isWhiteBackground ? "#e5e7eb" : "white"}
                  strokeWidth="2"
                  className="hover:opacity-80 transition-opacity"
                />
              );
            })}
          </svg>
        </div>
        
        {/* Legend */}
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: item.color || `hsl(${index * 60}, 70%, 60%)` }}
              />
              <div>
                <div className={`font-medium text-sm ${textColorClass}`}>{item.category}</div>
                <div className={`text-xs ${isWhiteBackground ? 'text-gray-600' : 'text-white opacity-75'}`}>
                  {item.value}% ({Math.round((item.value / total) * 100)}% of total)
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <p className={`text-sm ${isWhiteBackground ? 'text-gray-600' : 'text-white opacity-90'}`}>
          Distribution across {data.length} categories
        </p>
      </div>
    </div>
  );
}
// interface PieChartProps {
//     data: any[];
//     visualContent: any;
//   }
  
//   export default function PieChart({ data, visualContent }: PieChartProps) {
//     const backgroundStyles = {
//       'gradient-blue': 'bg-gradient-to-br from-blue-500 to-blue-600',
//       'gradient-green': 'bg-gradient-to-br from-green-500 to-green-600',
//       'gradient-purple': 'bg-gradient-to-br from-purple-500 to-purple-600',
//       'gradient-orange': 'bg-gradient-to-br from-orange-500 to-orange-600',
//       'gradient-red': 'bg-gradient-to-br from-red-500 to-red-600',
//       'gradient-teal': 'bg-gradient-to-br from-teal-500 to-teal-600',
//       'gradient-indigo': 'bg-gradient-to-br from-indigo-500 to-indigo-600'
//     };
  
//     const backgroundClass = backgroundStyles[visualContent.backgroundStyle as keyof typeof backgroundStyles] || backgroundStyles['gradient-blue'];
    
//     // Calculate total for percentages
//     const total = data.reduce((sum, item) => sum + item.value, 0);
    
//     // Create SVG pie chart
//     let cumulativePercentage = 0;
//     const radius = 80;
//     const centerX = 100;
//     const centerY = 100;
    
//     const createArcPath = (startAngle: number, endAngle: number) => {
//       const start = polarToCartesian(centerX, centerY, radius, endAngle);
//       const end = polarToCartesian(centerX, centerY, radius, startAngle);
//       const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
      
//       return [
//         "M", centerX, centerY,
//         "L", start.x, start.y,
//         "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
//         "Z"
//       ].join(" ");
//     };
    
//     function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
//       const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
//       return {
//         x: centerX + (radius * Math.cos(angleInRadians)),
//         y: centerY + (radius * Math.sin(angleInRadians))
//       };
//     }
    
//     return (
//       <div className={`${backgroundClass} rounded-lg p-6 text-white min-h-64`}>
//         <h3 className="text-xl font-bold mb-6 text-center">{visualContent.title}</h3>
        
//         <div className="flex items-center justify-center space-x-8">
//           {/* Pie Chart SVG */}
//           <div className="relative">
//             <svg width="200" height="200" className="transform -rotate-90">
//               {data.map((item, index) => {
//                 const percentage = (item.value / total) * 100;
//                 const startAngle = cumulativePercentage * 3.6;
//                 const endAngle = (cumulativePercentage + percentage) * 3.6;
//                 cumulativePercentage += percentage;
                
//                 return (
//                   <path
//                     key={index}
//                     d={createArcPath(startAngle, endAngle)}
//                     fill={item.color || `hsl(${index * 60}, 70%, 60%)`}
//                     stroke="white"
//                     strokeWidth="2"
//                     className="hover:opacity-80 transition-opacity"
//                   />
//                 );
//               })}
//             </svg>
//           </div>
          
//           {/* Legend */}
//           <div className="space-y-3">
//             {data.map((item, index) => (
//               <div key={index} className="flex items-center space-x-3">
//                 <div
//                   className="w-4 h-4 rounded-full"
//                   style={{ backgroundColor: item.color || `hsl(${index * 60}, 70%, 60%)` }}
//                 />
//                 <div>
//                   <div className="font-medium text-sm">{item.category}</div>
//                   <div className="text-xs opacity-75">
//                     {item.value}% ({Math.round((item.value / total) * 100)}% of total)
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
        
//         <div className="mt-6 text-center">
//           <p className="text-sm opacity-90">
//             Distribution across {data.length} categories
//           </p>
//         </div>
//       </div>
//     );
//   }