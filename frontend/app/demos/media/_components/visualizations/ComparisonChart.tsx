import { Cog, Lightbulb } from "lucide-react";

interface ComparisonChartProps {
  data: any[];
  visualContent: any;
}

export default function ComparisonChart({ data, visualContent }: ComparisonChartProps) {
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
  
  // Card styling based on background
  const cardBaseClass = isWhiteBackground
    ? 'bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:shadow-md'
    : 'bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30';
    
  // Icon background styling
  const iconBgClass = isWhiteBackground
    ? 'bg-gray-200'
    : 'bg-white bg-opacity-30';
    
  // Icon color
  const iconColorClass = isWhiteBackground ? 'text-gray-700' : 'text-white';
  
  // Bullet point styling
  const bulletClass = isWhiteBackground ? 'bg-gray-400' : 'bg-white';
  
  const iconMap = {
    'cog': Cog,
    'lightbulb': Lightbulb
  };

  // Icon fallback for canvas rendering
  const iconFallbacks = {
    'cog': '⚙️',
    'lightbulb': '💡'
  };
  
  return (
    <div className={`${backgroundClass} rounded-lg p-6 ${textColorClass} min-h-64`}>
      <h3 className={`text-xl font-bold mb-6 text-center ${textColorClass}`}>
        {visualContent.title}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {data.map((item, index) => {
          const IconComponent = iconMap[item.icon as keyof typeof iconMap] || Cog;
          const fallbackIcon = iconFallbacks[item.icon as keyof typeof iconFallbacks] || '⚙️';
          
          return (
            <div
              key={index}
              className={`${cardBaseClass} rounded-lg p-6 transition-all duration-300`}
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className={`${iconBgClass} rounded-full p-3`}>
                  {/* SVG Icon with Canvas Fallback */}
                  <div className="icon-container" style={{ height: '32px', width: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <IconComponent 
                      className={`h-8 w-8 ${iconColorClass} canvas-fallback-hide`} 
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
                <div>
                  <h4 className={`font-bold text-lg ${textColorClass}`}>
                    {item.category}
                  </h4>
                  <p className={`text-sm ${isWhiteBackground ? 'text-gray-600' : 'text-white opacity-90'}`}>
                    {item.value}
                  </p>
                </div>
              </div>
              
              <p className={`text-sm leading-relaxed ${isWhiteBackground ? 'text-gray-600' : 'text-white opacity-90'}`}>
                {item.description}
              </p>
              
              {item.features && (
                <div className="mt-4">
                  <h5 className={`font-semibold text-sm mb-2 ${textColorClass}`}>
                    Key Features:
                  </h5>
                  <ul className={`text-xs space-y-1 ${isWhiteBackground ? 'text-gray-600' : 'text-white opacity-85'}`}>
                    {item.features.map((feature: string, featureIndex: number) => (
                      <li key={featureIndex} className="flex items-center space-x-2">
                        <div className={`w-1.5 h-1.5 ${bulletClass} rounded-full`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 text-center">
        <p className={`text-sm ${isWhiteBackground ? 'text-gray-600' : 'text-white opacity-90'}`}>
          Side-by-side comparison of key differences
        </p>
      </div>
    </div>
  );
}

// import { Cog, Lightbulb } from "lucide-react";

// interface ComparisonChartProps {
//   data: any[];
//   visualContent: any;
// }

// export default function ComparisonChart({ data, visualContent }: ComparisonChartProps) {
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
  
//   // Card styling based on background
//   const cardBaseClass = isWhiteBackground
//     ? 'bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:shadow-md'
//     : 'bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30';
    
//   // Icon background styling
//   const iconBgClass = isWhiteBackground
//     ? 'bg-gray-200'
//     : 'bg-white bg-opacity-30';
    
//   // Icon color
//   const iconColorClass = isWhiteBackground ? 'text-gray-700' : 'text-white';
  
//   // Bullet point styling
//   const bulletClass = isWhiteBackground ? 'bg-gray-400' : 'bg-white';
  
//   const iconMap = {
//     'cog': Cog,
//     'lightbulb': Lightbulb
//   };
  
//   return (
//     <div className={`${backgroundClass} rounded-lg p-6 ${textColorClass} min-h-64`}>
//       <h3 className={`text-xl font-bold mb-6 text-center ${textColorClass}`}>
//         {visualContent.title}
//       </h3>
      
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//         {data.map((item, index) => {
//           const IconComponent = iconMap[item.icon as keyof typeof iconMap] || Cog;
          
//           return (
//             <div
//               key={index}
//               className={`${cardBaseClass} rounded-lg p-6 transition-all duration-300`}
//             >
//               <div className="flex items-center space-x-4 mb-4">
//                 <div className={`${iconBgClass} rounded-full p-3`}>
//                   <IconComponent className={`h-8 w-8 ${iconColorClass}`} />
//                 </div>
//                 <div>
//                   <h4 className={`font-bold text-lg ${textColorClass}`}>
//                     {item.category}
//                   </h4>
//                   <p className={`text-sm ${isWhiteBackground ? 'text-gray-600' : 'text-white opacity-90'}`}>
//                     {item.value}
//                   </p>
//                 </div>
//               </div>
              
//               <p className={`text-sm leading-relaxed ${isWhiteBackground ? 'text-gray-600' : 'text-white opacity-90'}`}>
//                 {item.description}
//               </p>
              
//               {item.features && (
//                 <div className="mt-4">
//                   <h5 className={`font-semibold text-sm mb-2 ${textColorClass}`}>
//                     Key Features:
//                   </h5>
//                   <ul className={`text-xs space-y-1 ${isWhiteBackground ? 'text-gray-600' : 'text-white opacity-85'}`}>
//                     {item.features.map((feature: string, featureIndex: number) => (
//                       <li key={featureIndex} className="flex items-center space-x-2">
//                         <div className={`w-1.5 h-1.5 ${bulletClass} rounded-full`} />
//                         <span>{feature}</span>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>
      
//       <div className="mt-6 text-center">
//         <p className={`text-sm ${isWhiteBackground ? 'text-gray-600' : 'text-white opacity-90'}`}>
//           Side-by-side comparison of key differences
//         </p>
//       </div>
//     </div>
//   );
// }


// // import { Cog, Lightbulb } from "lucide-react";

// // interface ComparisonChartProps {
// //   data: any[];
// //   visualContent: any;
// // }

// // export default function ComparisonChart({ data, visualContent }: ComparisonChartProps) {
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
// //     'cog': Cog,
// //     'lightbulb': Lightbulb
// //   };
  
// //   return (
// //     <div className={`${backgroundClass} rounded-lg p-6 text-white min-h-64`}>
// //       <h3 className="text-xl font-bold mb-6 text-center">{visualContent.title}</h3>
      
// //       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
// //         {data.map((item, index) => {
// //           const IconComponent = iconMap[item.icon as keyof typeof iconMap] || Cog;
          
// //           return (
// //             <div
// //               key={index}
// //               className="bg-white bg-opacity-20 rounded-lg p-6 backdrop-blur-sm hover:bg-opacity-30 transition-all duration-300"
// //             >
// //               <div className="flex items-center space-x-4 mb-4">
// //                 <div className="bg-white bg-opacity-30 rounded-full p-3">
// //                   <IconComponent className="h-8 w-8" />
// //                 </div>
// //                 <div>
// //                   <h4 className="font-bold text-lg">{item.category}</h4>
// //                   <p className="text-sm opacity-90">{item.value}</p>
// //                 </div>
// //               </div>
              
// //               <p className="text-sm leading-relaxed opacity-90">
// //                 {item.description}
// //               </p>
              
// //               {item.features && (
// //                 <div className="mt-4">
// //                   <h5 className="font-semibold text-sm mb-2">Key Features:</h5>
// //                   <ul className="text-xs space-y-1 opacity-85">
// //                     {item.features.map((feature: string, featureIndex: number) => (
// //                       <li key={featureIndex} className="flex items-center space-x-2">
// //                         <div className="w-1.5 h-1.5 bg-white rounded-full" />
// //                         <span>{feature}</span>
// //                       </li>
// //                     ))}
// //                   </ul>
// //                 </div>
// //               )}
// //             </div>
// //           );
// //         })}
// //       </div>
      
// //       <div className="mt-6 text-center">
// //         <p className="text-sm opacity-90">
// //           Side-by-side comparison of key differences
// //         </p>
// //       </div>
// //     </div>
// //   );
// // }