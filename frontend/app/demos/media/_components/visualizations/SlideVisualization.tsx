interface SlideVisualizationProps {
  data: any[];
  visualContent: any;
}

export default function SlideVisualization({ data, visualContent }: SlideVisualizationProps) {
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

  // Get slide content from data array or visual content
  const slideContent = data[0] || {
    title: visualContent.title || 'Slide Title',
    subtitle: '',
    points: [],
    backgroundStyle: 'gradient-blue',
    textStyle: 'modern-clean'
  };

  // Determine slide type based on slide ID or content
  const slideId = visualContent.slideId || slideContent.slideId || '';
  const slideIndex = slideId ? parseInt(slideId.replace(/\D/g, '')) || 0 : 0;
  
  // Use a combination of factors to generate a pseudo-random but consistent type
  const titleLength = slideContent.title?.length || 0;
  const pointsCount = slideContent.points?.length || 0;
  const contentHash = titleLength + pointsCount + (slideContent.subtitle?.length || 0);
  const slideType = (slideIndex + contentHash) % 5; // Pseudo-random based on content

  // Use visual content background style if available, otherwise use slide content
  const backgroundStyle = visualContent.backgroundStyle || slideContent.backgroundStyle;
  const isWhiteBackground = backgroundStyle === 'white';
  const backgroundClass = backgroundStyles[backgroundStyle as keyof typeof backgroundStyles] || backgroundStyles['gradient-blue'];
  
  // Text colors based on background
  const textColorClass = isWhiteBackground ? 'text-gray-800' : 'text-white';
  const subtitleColorClass = isWhiteBackground ? 'text-gray-600' : 'text-white opacity-90';

  // Type 0: Modern Minimal with Side Accent
  const renderModernMinimal = () => {
    const accentBar = isWhiteBackground 
      ? 'bg-gradient-to-b from-blue-500 to-purple-600' 
      : 'bg-white bg-opacity-30';
    const cardClass = isWhiteBackground
      ? 'bg-gray-50 hover:bg-gray-100'
      : 'bg-white bg-opacity-10 hover:bg-opacity-20';

    return (
      <div className="flex h-full">
        {/* Side accent bar */}
        <div className={`w-1 ${accentBar} mr-8 rounded-full`}></div>
        
        <div className="flex-1 flex flex-col justify-center">
          <div className="mb-8">
            <h1 className={`text-4xl md:text-5xl font-black mb-3 ${textColorClass} tracking-tight`}>
              {slideContent.title}
            </h1>
            {slideContent.subtitle && (
              <h2 className={`text-xl font-light ${subtitleColorClass} tracking-wide`}>
                {slideContent.subtitle}
              </h2>
            )}
          </div>
          
          {slideContent.points && slideContent.points.length > 0 && (
            <div className="space-y-3">
              {slideContent.points.map((point: string, index: number) => (
                <div
                  key={index}
                  className={`${cardClass} rounded-lg p-4 transition-all duration-300 transform hover:translate-x-2`}
                >
                  <div className="flex items-center space-x-4">
                    <span className={`text-3xl font-light ${isWhiteBackground ? 'text-blue-500' : 'text-white opacity-60'}`}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <p className={`${textColorClass} font-medium text-lg`}>
                      {point}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Type 1: 3D Perspective Cards
  const renderGeometricCards = () => {
    const cardStyles = [
      { gradient: 'from-blue-500 via-blue-600 to-indigo-700', shadow: 'shadow-blue-500/50', icon: '🚀' },
      { gradient: 'from-purple-500 via-pink-500 to-rose-600', shadow: 'shadow-purple-500/50', icon: '✨' },
      { gradient: 'from-emerald-500 via-green-600 to-teal-700', shadow: 'shadow-emerald-500/50', icon: '🎯' },
      { gradient: 'from-orange-500 via-red-500 to-pink-600', shadow: 'shadow-orange-500/50', icon: '🔥' },
    ];

    return (
      <div className="relative perspective-1000">
        {/* Animated gradient background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-300 via-purple-300 to-pink-300 animate-gradient-xy"></div>
        </div>

        <div className="relative z-10">
          {/* Title with split animation effect */}
          <div className="text-center mb-12">
            <h1 className={`text-4xl md:text-5xl font-black ${textColorClass} relative inline-block`}>
              {slideContent.title.split(' ').map((word: string, i: number) => (
                <span key={i} className="inline-block hover:scale-110 transition-transform duration-300 cursor-default">
                  {word}{' '}
                </span>
              ))}
            </h1>
            {slideContent.subtitle && (
              <div className="mt-4">
                <h2 className={`text-xl font-light ${subtitleColorClass} tracking-wide relative inline-block`}>
                  <span className="relative">
                    {slideContent.subtitle}
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-current to-transparent opacity-50"></div>
                  </span>
                </h2>
              </div>
            )}
          </div>
          
          {slideContent.points && slideContent.points.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 perspective-1000">
              {slideContent.points.map((point: string, index: number) => {
                const style = cardStyles[index % cardStyles.length];
                const delay = index * 100;
                
                return (
                  <div
                    key={index}
                    className="relative group transform-style-3d"
                    style={{ animationDelay: `${delay}ms` }}
                  >
                    {/* 3D Card Container */}
                    <div className={`
                      relative h-full
                      transform transition-all duration-700 
                      hover:rotate-y-10 hover:rotate-x-5 hover:scale-105
                      animate-float-in
                    `}>
                      {/* Main Card */}
                      <div className={`
                        relative overflow-hidden rounded-2xl h-full
                        ${isWhiteBackground 
                          ? 'bg-white shadow-2xl' 
                          : 'bg-gray-900 bg-opacity-50 backdrop-blur-xl'}
                        border border-opacity-20 
                        ${isWhiteBackground ? 'border-gray-200' : 'border-white'}
                        transform-gpu transition-all duration-500
                        group-hover:${style.shadow} group-hover:shadow-2xl
                      `}>
                        {/* Gradient overlay */}
                        <div className={`
                          absolute inset-0 opacity-0 group-hover:opacity-100
                          bg-gradient-to-br ${style.gradient}
                          transition-opacity duration-500
                        `}></div>
                        
                        {/* Card content */}
                        <div className="relative z-10 p-8 h-full flex flex-col">
                          {/* Icon and number */}
                          <div className="flex items-center justify-between mb-4">
                            <div className={`
                              w-14 h-14 rounded-xl flex items-center justify-center
                              bg-gradient-to-br ${style.gradient}
                              text-white font-bold text-xl
                              shadow-lg transform group-hover:rotate-12 group-hover:scale-110 
                              transition-all duration-500
                            `}>
                              {index + 1}
                            </div>
                            <span className="text-3xl group-hover:animate-bounce-slow">
                              {style.icon}
                            </span>
                          </div>
                          
                          {/* Text */}
                          <p className={`
                            flex-grow
                            ${isWhiteBackground 
                              ? 'text-gray-700 group-hover:text-white' 
                              : 'text-gray-200 group-hover:text-white'}
                            font-medium text-base leading-relaxed
                            transition-colors duration-500
                          `}>
                            {point}
                          </p>
                          
                          {/* Progress bar decoration */}
                          <div className="mt-4 h-1 bg-gray-200 bg-opacity-20 rounded-full overflow-hidden">
                            <div className={`
                              h-full bg-gradient-to-r ${style.gradient}
                              transform -translate-x-full group-hover:translate-x-0
                              transition-transform duration-1000 ease-out
                            `}></div>
                          </div>
                        </div>
                        
                        {/* Floating particles effect */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                          <div className="absolute w-20 h-20 -top-10 -left-10 bg-white rounded-full opacity-10 group-hover:translate-x-40 group-hover:translate-y-40 transition-transform duration-2000"></div>
                          <div className="absolute w-16 h-16 -bottom-8 -right-8 bg-white rounded-full opacity-10 group-hover:-translate-x-32 group-hover:-translate-y-32 transition-transform duration-2000"></div>
                        </div>
                      </div>
                      
                      {/* 3D shadow effect */}
                      <div className={`
                        absolute inset-0 -z-10 rounded-2xl
                        bg-gradient-to-br ${style.gradient}
                        transform translate-y-4 scale-95 opacity-0
                        group-hover:opacity-30 group-hover:translate-y-8 group-hover:scale-90
                        transition-all duration-700 blur-xl
                      `}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <style jsx>{`
          @keyframes float-in {
            from {
              opacity: 0;
              transform: translateY(30px) rotateX(-30deg);
            }
            to {
              opacity: 1;
              transform: translateY(0) rotateX(0);
            }
          }
          
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          
          @keyframes gradient-xy {
            0%, 100% { transform: translateX(0%) translateY(0%); }
            25% { transform: translateX(100%) translateY(0%); }
            50% { transform: translateX(100%) translateY(100%); }
            75% { transform: translateX(0%) translateY(100%); }
          }
          
          .animate-float-in {
            animation: float-in 0.8s ease-out forwards;
          }
          
          .animate-bounce-slow {
            animation: bounce-slow 2s ease-in-out infinite;
          }
          
          .animate-gradient-xy {
            animation: gradient-xy 15s ease infinite;
          }
          
          .perspective-1000 {
            perspective: 1000px;
          }
          
          .transform-style-3d {
            transform-style: preserve-3d;
          }
          
          .rotate-y-10 {
            transform: rotateY(10deg);
          }
          
          .rotate-x-5 {
            transform: rotateX(5deg);
          }
        `}</style>
      </div>
    );
  };

  // Type 2: Asymmetric Layout
  const renderAsymmetric = () => {
    const highlightClass = isWhiteBackground
      ? 'bg-yellow-100 text-yellow-800'
      : 'bg-yellow-400 bg-opacity-20 text-yellow-200';

    return (
      <div className="grid grid-cols-12 gap-6 h-full">
        <div className="col-span-7 flex flex-col justify-center">
          <div className="space-y-6">
            {slideContent.points && slideContent.points.length > 0 && slideContent.points[0] && (
              <div className={`${highlightClass} rounded-2xl p-6 transform -rotate-1`}>
                <div className="flex items-start space-x-4">
                  <span className="text-3xl">★</span>
                  <p className="text-lg font-semibold">
                    {slideContent.points[0]}
                  </p>
                </div>
              </div>
            )}
            
            <div className="space-y-3 ml-8">
              {slideContent.points && slideContent.points.slice(1).map((point: string, index: number) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`w-3 h-3 ${isWhiteBackground ? 'bg-gray-400' : 'bg-white bg-opacity-50'} rounded-full`}></div>
                  <p className={`${textColorClass} font-medium`}>
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="col-span-5 flex items-center justify-center">
          <div className="text-right transform rotate-3">
            <h1 className={`text-3xl md:text-4xl font-black ${textColorClass} leading-tight`}>
              {slideContent.title}
            </h1>
            {slideContent.subtitle && (
              <h2 className={`text-lg font-medium mt-3 ${subtitleColorClass}`}>
                {slideContent.subtitle}
              </h2>
            )}
            <div className={`mt-4 inline-block w-20 h-1 ${isWhiteBackground ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-white bg-opacity-50'} rounded-full`}></div>
          </div>
        </div>
      </div>
    );
  };

  // Type 3: Magazine Style
  const renderMagazineStyle = () => {
    const pullQuoteClass = isWhiteBackground
      ? 'text-blue-600 border-l-4 border-blue-600'
      : 'text-white border-l-4 border-white border-opacity-50';

    return (
      <div>
        {/* Large title treatment */}
        <div className="mb-10">
          <h1 className={`text-5xl md:text-6xl font-black ${textColorClass} leading-none tracking-tight`}>
            {slideContent.title.split(' ').map((word: string, i: number) => (
              <span key={i} className={i === 0 ? 'block' : 'block ml-12'}>
                {word}
              </span>
            ))}
          </h1>
          {slideContent.subtitle && (
            <h2 className={`text-xl font-light mt-4 ${subtitleColorClass} italic`}>
              {slideContent.subtitle}
            </h2>
          )}
        </div>
        
        {/* Magazine-style points */}
        {slideContent.points && slideContent.points.length > 0 && (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12">
              {/* First point as pull quote */}
              {slideContent.points[0] && (
                <div className={`${pullQuoteClass} pl-6 py-2 mb-6`}>
                  <p className="text-2xl font-light italic">
                    "{slideContent.points[0]}"
                  </p>
                </div>
              )}
              
              {/* Remaining points in columns */}
              <div className="grid grid-cols-2 gap-6">
                {slideContent.points.slice(1).map((point: string, index: number) => (
                  <div key={index} className="flex items-start space-x-3">
                    <span className={`text-lg ${isWhiteBackground ? 'text-gray-400' : 'text-white opacity-50'}`}>
                      ◆
                    </span>
                    <p className={`${textColorClass} leading-relaxed`}>
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Type 4: Minimalist Timeline Flow
  const renderBentoBox = () => {
    const accentColor = isWhiteBackground ? 'text-gray-900' : 'text-white';
    const lineColor = isWhiteBackground ? 'bg-gray-300' : 'bg-white bg-opacity-30';
    const dotColor = isWhiteBackground ? 'bg-gray-900' : 'bg-white';
    
    return (
      <div className="relative h-full flex flex-col">
        {/* Elegant title */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl md:text-5xl font-light ${textColorClass} tracking-wide`}>
            {slideContent.title}
          </h1>
          {slideContent.subtitle && (
            <h2 className={`text-lg font-light mt-3 ${subtitleColorClass} italic`}>
              — {slideContent.subtitle} —
            </h2>
          )}
        </div>
        
        {slideContent.points && slideContent.points.length > 0 && (
          <div className="flex-1 relative max-w-4xl mx-auto w-full">
            {/* Flowing connection lines */}
            <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={isWhiteBackground ? '#9CA3AF' : '#FFFFFF'} stopOpacity="0.1" />
                  <stop offset="50%" stopColor={isWhiteBackground ? '#6B7280' : '#FFFFFF'} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={isWhiteBackground ? '#9CA3AF' : '#FFFFFF'} stopOpacity="0.1" />
                </linearGradient>
              </defs>
              
              {/* Curved paths connecting points */}
              {slideContent.points.slice(0, -1).map((_: any, index: number) => {
                const y1 = (index / (slideContent.points.length - 1)) * 100;
                const y2 = ((index + 1) / (slideContent.points.length - 1)) * 100;
                const curve = index % 2 === 0 ? 'M10,${y1}% Q50,${y1 + 10}% 90,${y2}%' : 'M90,${y1}% Q50,${y1 + 10}% 10,${y2}%';
                
                return (
                  <path
                    key={index}
                    d={curve.replace('${y1}', y1.toString()).replace('${y1 + 10}', (y1 + 10).toString()).replace('${y2}', y2.toString())}
                    stroke="url(#lineGradient)"
                    strokeWidth="1"
                    fill="none"
                    className="opacity-50"
                  />
                );
              })}
            </svg>
            
            {/* Content points */}
            <div className="relative z-10 h-full flex flex-col justify-between py-4">
              {slideContent.points.map((point: string, index: number) => {
                const isLeft = index % 2 === 0;
                
                return (
                  <div
                    key={index}
                    className={`flex items-center ${isLeft ? 'justify-start' : 'justify-end'} group`}
                  >
                    {/* Content */}
                    <div className={`flex items-center ${isLeft ? 'flex-row' : 'flex-row-reverse'} max-w-md`}>
                      {/* Number circle */}
                      <div className="flex-shrink-0 relative">
                        <div className={`w-12 h-12 rounded-full ${dotColor} flex items-center justify-center font-light text-lg ${isWhiteBackground ? 'text-white' : 'text-gray-900'} transition-all duration-500 group-hover:scale-110`}>
                          {index + 1}
                        </div>
                        {/* Pulse effect on hover */}
                        <div className={`absolute inset-0 rounded-full ${dotColor} opacity-20 scale-100 group-hover:scale-150 transition-transform duration-1000`}></div>
                      </div>
                      
                      {/* Text with subtle background */}
                      <div className={`${isLeft ? 'ml-6' : 'mr-6'} relative`}>
                        <div className={`
                          px-6 py-3 rounded-full
                          ${isWhiteBackground 
                            ? 'bg-gray-50 hover:bg-gray-100' 
                            : 'bg-white bg-opacity-5 hover:bg-opacity-10'}
                          transition-all duration-300
                          transform group-hover:scale-105
                        `}>
                          <p className={`${textColorClass} font-light text-base leading-relaxed`}>
                            {point}
                          </p>
                        </div>
                        
                        {/* Subtle accent line */}
                        <div className={`absolute top-1/2 ${isLeft ? '-left-6' : '-right-6'} w-6 h-px ${lineColor} transform -translate-y-1/2 opacity-30`}></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Ambient decoration */}
            <div className="absolute inset-0 pointer-events-none">
              <div className={`absolute top-1/4 left-1/4 w-32 h-32 rounded-full ${isWhiteBackground ? 'bg-gray-200' : 'bg-white'} opacity-5 blur-3xl`}></div>
              <div className={`absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full ${isWhiteBackground ? 'bg-gray-300' : 'bg-white'} opacity-5 blur-3xl`}></div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Footer component (shared across all types)
  const renderFooter = () => {
    const footerBadgeClass = isWhiteBackground
      ? 'bg-gray-200 border border-gray-300'
      : 'bg-white bg-opacity-20 backdrop-blur-sm';
      
    const footerTextClass = isWhiteBackground ? 'text-gray-700' : 'text-white';
    const footerDotClass = isWhiteBackground ? 'bg-blue-500' : 'bg-white';

    return (
      <div className="mt-8 text-center">
        <div className={`inline-flex items-center space-x-2 ${footerBadgeClass} rounded-full px-4 py-2`}>
          <div className={`w-2 h-2 ${footerDotClass} rounded-full`}></div>
          <span className={`text-sm font-medium ${footerTextClass}`}>
            {slideContent.textStyle === 'modern-clean' ? 'Modern Design' : 'Classic Style'}
          </span>
        </div>
      </div>
    );
  };

  // Render appropriate layout based on slide type
  const renderSlideContent = () => {
    switch (slideType) {
      case 0:
        return renderModernMinimal();
      case 1:
        return renderGeometricCards();
      case 2:
        return renderAsymmetric();
      case 3:
        return renderMagazineStyle();
      case 4:
        return renderBentoBox();
      default:
        return renderModernMinimal();
    }
  };

  return (
    <div className={`${backgroundClass} rounded-lg p-8 ${textColorClass} min-h-80 flex flex-col justify-center relative overflow-hidden`}>
      {/* Subtle background pattern for visual interest */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px), radial-gradient(circle at 75% 75%, white 2px, transparent 2px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>
      
      <div className="relative z-10 flex-1 flex flex-col justify-center">
        {renderSlideContent()}
        {renderFooter()}
      </div>
    </div>
  );
}
// interface SlideVisualizationProps {
//   data: any[];
//   visualContent: any;
// }

// export default function SlideVisualization({ data, visualContent }: SlideVisualizationProps) {
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

//   // Get slide content from data array or visual content
//   const slideContent = data[0] || {
//     title: visualContent.title || 'Slide Title',
//     subtitle: '',
//     points: [],
//     backgroundStyle: 'gradient-blue',
//     textStyle: 'modern-clean'
//   };

//   // Determine slide type based on slide ID or content
//   const slideId = visualContent.slideId || slideContent.slideId || '';
//   const slideIndex = slideId ? parseInt(slideId.replace(/\D/g, '')) || 0 : 0;
//   const slideType = slideIndex % 5; // Cycle through 5 types

//   // Use visual content background style if available, otherwise use slide content
//   const backgroundStyle = visualContent.backgroundStyle || slideContent.backgroundStyle;
//   const isWhiteBackground = backgroundStyle === 'white';
//   const backgroundClass = backgroundStyles[backgroundStyle as keyof typeof backgroundStyles] || backgroundStyles['gradient-blue'];
  
//   // Text colors based on background
//   const textColorClass = isWhiteBackground ? 'text-gray-800' : 'text-white';
//   const subtitleColorClass = isWhiteBackground ? 'text-gray-600' : 'text-white opacity-90';

//   // Type 0: Classic Centered Layout (existing design)
//   const renderClassicCentered = () => {
//     const pointCardClass = isWhiteBackground
//       ? 'bg-gray-100 border border-gray-200 hover:bg-gray-150 hover:shadow-md'
//       : 'bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30';
      
//     const numberBadgeClass = isWhiteBackground
//       ? 'bg-blue-500 text-white'
//       : 'bg-white bg-opacity-30 text-white';

//     return (
//       <div className="text-center">
//         <h1 className={`text-3xl md:text-4xl font-bold mb-4 leading-tight ${textColorClass}`}>
//           {slideContent.title}
//         </h1>
//         {slideContent.subtitle && (
//           <h2 className={`text-xl md:text-2xl font-medium mb-6 ${subtitleColorClass}`}>
//             {slideContent.subtitle}
//           </h2>
//         )}
        
//         {slideContent.points && slideContent.points.length > 0 && (
//           <div className="space-y-4 mt-8">
//             {slideContent.points.map((point: string, index: number) => (
//               <div
//                 key={index}
//                 className={`flex items-start space-x-4 ${pointCardClass} rounded-lg p-4 transition-all duration-300`}
//               >
//                 <div className={`flex-shrink-0 w-12 h-12 ${numberBadgeClass} rounded-full flex items-center justify-center font-bold text-lg`}>
//                   {index + 1}
//                 </div>
//                 <div className="flex-1">
//                   <p className={`text-lg font-medium leading-relaxed ${textColorClass}`}>
//                     {point}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     );
//   };

//   // Type 1: Split Layout with Large Number
//   const renderSplitLayout = () => {
//     const accentColor = isWhiteBackground ? 'text-blue-600' : 'text-white';
//     const cardClass = isWhiteBackground
//       ? 'bg-gray-50 border-l-4 border-blue-500'
//       : 'bg-white bg-opacity-15 backdrop-blur-sm border-l-4 border-white border-opacity-50';

//     return (
//       <div className="grid grid-cols-12 gap-8 h-full items-center">
//         <div className="col-span-5 text-right">
//           <div className={`text-8xl font-black ${accentColor} opacity-20 mb-4`}>
//             {(slideContent.points?.length || 1).toString().padStart(2, '0')}
//           </div>
//           <h1 className={`text-2xl md:text-3xl font-bold ${textColorClass}`}>
//             {slideContent.title}
//           </h1>
//           {slideContent.subtitle && (
//             <h2 className={`text-lg font-medium mt-2 ${subtitleColorClass}`}>
//               {slideContent.subtitle}
//             </h2>
//           )}
//         </div>
        
//         <div className="col-span-7">
//           {slideContent.points && slideContent.points.length > 0 && (
//             <div className="space-y-3">
//               {slideContent.points.map((point: string, index: number) => (
//                 <div key={index} className={`${cardClass} p-4 rounded-r-lg`}>
//                   <div className="flex items-center space-x-3">
//                     <div className={`w-2 h-2 rounded-full ${isWhiteBackground ? 'bg-blue-500' : 'bg-white'}`}></div>
//                     <p className={`${textColorClass} font-medium`}>
//                       {point}
//                     </p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   // Type 2: Card Grid Layout
//   const renderCardGrid = () => {
//     const cardClass = isWhiteBackground
//       ? 'bg-white border border-gray-200 shadow-sm hover:shadow-md'
//       : 'bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 hover:bg-opacity-30';

//     return (
//       <div className="text-center mb-8">
//         <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${textColorClass}`}>
//           {slideContent.title}
//         </h1>
//         {slideContent.subtitle && (
//           <h2 className={`text-xl font-medium mb-8 ${subtitleColorClass}`}>
//             {slideContent.subtitle}
//           </h2>
//         )}
        
//         {slideContent.points && slideContent.points.length > 0 && (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
//             {slideContent.points.map((point: string, index: number) => (
//               <div key={index} className={`${cardClass} rounded-xl p-6 transition-all duration-300 group`}>
//                 <div className="flex items-center space-x-4">
//                   <div className={`w-10 h-10 ${isWhiteBackground ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-white bg-opacity-30'} rounded-lg flex items-center justify-center font-bold ${isWhiteBackground ? 'text-white' : textColorClass}`}>
//                     {index + 1}
//                   </div>
//                   <p className={`${isWhiteBackground ? 'text-gray-800' : textColorClass} font-medium text-left flex-1`}>
//                     {point}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     );
//   };

//   // Type 3: Timeline/Steps Layout
//   const renderTimeline = () => {
//     const lineColor = isWhiteBackground ? 'bg-blue-500' : 'bg-white bg-opacity-50';
//     const stepClass = isWhiteBackground
//       ? 'bg-white border-2 border-blue-500 text-blue-600'
//       : 'bg-white bg-opacity-30 border-2 border-white text-white';

//     return (
//       <div>
//         <div className="text-center mb-10">
//           <h1 className={`text-3xl md:text-4xl font-bold mb-4 ${textColorClass}`}>
//             {slideContent.title}
//           </h1>
//           {slideContent.subtitle && (
//             <h2 className={`text-xl font-medium ${subtitleColorClass}`}>
//               {slideContent.subtitle}
//             </h2>
//           )}
//         </div>
        
//         {slideContent.points && slideContent.points.length > 0 && (
//           <div className="relative">
//             {/* Timeline line */}
//             <div className={`absolute left-6 top-6 bottom-6 w-0.5 ${lineColor}`}></div>
            
//             <div className="space-y-6">
//               {slideContent.points.map((point: string, index: number) => (
//                 <div key={index} className="relative flex items-start space-x-6">
//                   <div className={`w-12 h-12 ${stepClass} rounded-full flex items-center justify-center font-bold text-lg z-10`}>
//                     {index + 1}
//                   </div>
//                   <div className="flex-1 pt-2">
//                     <p className={`${textColorClass} font-medium text-lg leading-relaxed`}>
//                       {point}
//                     </p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };

//   // Type 4: Featured Hero Layout
//   const renderHeroLayout = () => {
//     const highlightClass = isWhiteBackground
//       ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
//       : 'bg-white bg-opacity-20 backdrop-blur-sm';
    
//     const bulletClass = isWhiteBackground ? 'text-blue-500' : 'text-white';

//     return (
//       <div className="relative">
//         {/* Hero Section */}
//         <div className="text-center mb-12">
//           <div className={`inline-block ${highlightClass} px-6 py-3 rounded-full mb-6`}>
//             <span className={`font-semibold ${isWhiteBackground ? 'text-white' : textColorClass}`}>
//               {slideContent.textStyle === 'modern-clean' ? 'Key Insights' : 'Highlights'}
//             </span>
//           </div>
//           <h1 className={`text-4xl md:text-5xl font-black mb-4 ${textColorClass} leading-tight`}>
//             {slideContent.title}
//           </h1>
//           {slideContent.subtitle && (
//             <h2 className={`text-xl md:text-2xl font-medium ${subtitleColorClass} max-w-3xl mx-auto`}>
//               {slideContent.subtitle}
//             </h2>
//           )}
//         </div>
        
//         {/* Points in elegant list */}
//         {slideContent.points && slideContent.points.length > 0 && (
//           <div className="max-w-2xl mx-auto">
//             <div className="space-y-4">
//               {slideContent.points.map((point: string, index: number) => (
//                 <div key={index} className="flex items-start space-x-4 group">
//                   <div className={`mt-2 text-2xl ${bulletClass} group-hover:scale-110 transition-transform duration-200`}>
//                     ✦
//                   </div>
//                   <p className={`${textColorClass} text-lg font-medium leading-relaxed flex-1`}>
//                     {point}
//                   </p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };

//   // Footer component (shared across all types)
//   const renderFooter = () => {
//     const footerBadgeClass = isWhiteBackground
//       ? 'bg-gray-200 border border-gray-300'
//       : 'bg-white bg-opacity-20 backdrop-blur-sm';
      
//     const footerTextClass = isWhiteBackground ? 'text-gray-700' : 'text-white';
//     const footerDotClass = isWhiteBackground ? 'bg-blue-500' : 'bg-white';

//     return (
//       <div className="mt-8 text-center">
//         <div className={`inline-flex items-center space-x-2 ${footerBadgeClass} rounded-full px-4 py-2`}>
//           <div className={`w-2 h-2 ${footerDotClass} rounded-full`}></div>
//           <span className={`text-sm font-medium ${footerTextClass}`}>
//             {slideContent.textStyle === 'modern-clean' ? 'Modern Design' : 'Classic Style'}
//           </span>
//         </div>
//       </div>
//     );
//   };

//   // Render appropriate layout based on slide type
//   const renderSlideContent = () => {
//     switch (slideType) {
//       case 0:
//         return renderClassicCentered();
//       case 1:
//         return renderSplitLayout();
//       case 2:
//         return renderCardGrid();
//       case 3:
//         return renderTimeline();
//       case 4:
//         return renderHeroLayout();
//       default:
//         return renderClassicCentered();
//     }
//   };

//   return (
//     <div className={`${backgroundClass} rounded-lg p-8 ${textColorClass} min-h-80 flex flex-col justify-center relative overflow-hidden`}>
//       {/* Subtle background pattern for visual interest */}
//       <div className="absolute inset-0 opacity-5">
//         <div className="absolute inset-0" style={{
//           backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px), radial-gradient(circle at 75% 75%, white 2px, transparent 2px)`,
//           backgroundSize: '50px 50px'
//         }}></div>
//       </div>
      
//       <div className="relative z-10 flex-1 flex flex-col justify-center">
//         {renderSlideContent()}
//         {renderFooter()}
//       </div>
//     </div>
//   );
// }


// // interface SlideVisualizationProps {
// //   data: any[];
// //   visualContent: any;
// // }

// // export default function SlideVisualization({ data, visualContent }: SlideVisualizationProps) {
// //   const backgroundStyles = {
// //     'white': 'bg-white',
// //     'gradient-blue': 'bg-gradient-to-br from-blue-500 to-blue-600',
// //     'gradient-green': 'bg-gradient-to-br from-green-500 to-green-600',
// //     'gradient-purple': 'bg-gradient-to-br from-purple-500 to-purple-600',
// //     'gradient-orange': 'bg-gradient-to-br from-orange-500 to-orange-600',
// //     'gradient-red': 'bg-gradient-to-br from-red-500 to-red-600',
// //     'gradient-teal': 'bg-gradient-to-br from-teal-500 to-teal-600',
// //     'gradient-indigo': 'bg-gradient-to-br from-indigo-500 to-indigo-600'
// //   };

// //   // Get slide content from data array or visual content
// //   const slideContent = data[0] || {
// //     title: visualContent.title || 'Slide Title',
// //     subtitle: '',
// //     points: [],
// //     backgroundStyle: 'gradient-blue',
// //     textStyle: 'modern-clean'
// //   };

// //   // Use visual content background style if available, otherwise use slide content
// //   const backgroundStyle = visualContent.backgroundStyle || slideContent.backgroundStyle;
// //   const isWhiteBackground = backgroundStyle === 'white';
// //   const backgroundClass = backgroundStyles[backgroundStyle as keyof typeof backgroundStyles] || backgroundStyles['gradient-blue'];
  
// //   // Text colors based on background
// //   const textColorClass = isWhiteBackground ? 'text-gray-800' : 'text-white';
// //   const subtitleColorClass = isWhiteBackground ? 'text-gray-600' : 'text-white opacity-90';
  
// //   // Point card styling
// //   const pointCardClass = isWhiteBackground
// //     ? 'bg-gray-100 border border-gray-200 hover:bg-gray-150 hover:shadow-md'
// //     : 'bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30';
    
// //   // Number badge styling - made wider and taller
// //   const numberBadgeClass = isWhiteBackground
// //     ? 'bg-blue-500 text-white'
// //     : 'bg-white bg-opacity-30 text-white';
    
// //   // Footer badge styling
// //   const footerBadgeClass = isWhiteBackground
// //     ? 'bg-gray-200 border border-gray-300'
// //     : 'bg-white bg-opacity-20 backdrop-blur-sm';
    
// //   const footerTextClass = isWhiteBackground ? 'text-gray-700' : 'text-white';
// //   const footerDotClass = isWhiteBackground ? 'bg-blue-500' : 'bg-white';

// //   return (
// //     <div className={`${backgroundClass} rounded-lg p-8 ${textColorClass} min-h-80 flex flex-col justify-center`}>
// //       {/* Main Title */}
// //       <div className="text-center mb-8">
// //         <h1 className={`text-3xl md:text-4xl font-bold mb-4 leading-tight ${textColorClass}`}>
// //           {slideContent.title}
// //         </h1>
// //         {slideContent.subtitle && (
// //           <h2 className={`text-xl md:text-2xl font-medium mb-6 ${subtitleColorClass}`}>
// //             {slideContent.subtitle}
// //           </h2>
// //         )}
// //       </div>

// //       {/* Content Points */}
// //       {slideContent.points && slideContent.points.length > 0 && (
// //         <div className="space-y-4">
// //           {slideContent.points.map((point: string, index: number) => (
// //             <div
// //               key={index}
// //               className={`flex items-start space-x-4 ${pointCardClass} rounded-lg p-4 transition-all duration-300`}
// //             >
// //               <div className={`flex-shrink-0 w-12 h-12 ${numberBadgeClass} rounded-full flex items-center justify-center font-bold text-lg`} style={{ minWidth: '48px', minHeight: '48px' }}>
// //                 {index + 1}
// //               </div>
// //               <div className="flex-1">
// //                 <p className={`text-lg font-medium leading-relaxed ${textColorClass}`}>
// //                   {point}
// //                 </p>
// //               </div>
// //             </div>
// //           ))}
// //         </div>
// //       )}

// //       {/* Footer/Attribution */}
// //       <div className="mt-8 text-center">
// //         <div className={`inline-flex items-center space-x-2 ${footerBadgeClass} rounded-full px-4 py-2`}>
// //           <div className={`w-2 h-2 ${footerDotClass} rounded-full`}></div>
// //           <span className={`text-sm font-medium ${footerTextClass}`}>
// //             {slideContent.textStyle === 'modern-clean' ? 'Modern Design' : 'Classic Style'}
// //           </span>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

