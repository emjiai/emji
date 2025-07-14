import * as React from 'react';

// This file provides a centralized mapping of icon names to emoji characters
// for consistent icon rendering across infographic components

export type IconName = 
  // Fa prefix icons (Font Awesome style)
  | 'FaMapPins'
  | 'FaRegCalendarAlt'
  | 'FaMapMarkedAlt'
  | 'FaBrain'
  | 'FaRobot'
  | 'FaGlobeAmericas'
  | 'FaClock'
  | 'FaDice'
  | 'FaLayerGroup'
  | 'FaCodeBranch'
  | 'FaBalanceScale'
  | 'FaTools'
  | 'FaUsers'
  // Gi prefix icons (Game Icons style)
  | 'GiMapPins'
  | 'GiContagion'
  | 'GiTargeted'
  // Io prefix icons (Ionicons style)
  | 'IoHardwareChipOutline'
  // Visual aid icons
  | 'sparkles'
  | 'arrows-alt'
  | 'cloud'
  | 'puzzle-piece'
  | 'lightbulb'
  // Missing icons from the JSON data
  | 'X'
  | 'Check'
  | 'Users'
  | 'MapPin'
  | 'Cloud'
  | 'AlertCircle'
  | 'EyeOff'
  | 'Lock'
  | 'Banknote'
  | 'Clock'
  | 'Globe'
  | 'MessageSquare'
  | 'GitFork'
  | 'HelpCircle'
  | 'LayoutList'
  | 'BookOpen'
  | 'Brain'
  | 'TrendingDown'
  | 'Map'
  | 'TrendingUp'
  | 'Calendar'
  | 'Quote'
  | 'ArrowUp'
  | 'ArrowDown'
  | 'Minus'
  | 'ArrowRight'
  // Default fallback
  | string;

export const iconMap: Record<IconName, string> = {
  // Fa prefix icons
  'FaMapPins': '📍',
  'FaRegCalendarAlt': '📅',
  'FaMapMarkedAlt': '🗺️',
  'FaBrain': '🧠',
  'FaRobot': '🤖',
  'FaGlobeAmericas': '🌍',
  'FaClock': '🕐',
  'FaDice': '🎲',
  'FaLayerGroup': '📚',
  'FaCodeBranch': '🔀',
  'FaBalanceScale': '⚖️',
  'FaTools': '🔧',
  'FaUsers': '👥',
  
  // Gi prefix icons
  'GiMapPins': '📍',
  'GiContagion': '🦠',
  'GiTargeted': '🎯',
  
  // Io prefix icons
  'IoHardwareChipOutline': '💾',
  
  // Visual aid icons
  'sparkles': '✨',
  'arrows-alt': '↔️',
  'cloud': '☁️',
  'puzzle-piece': '🧩',
  'lightbulb': '💡',
  
  // Missing icons from the JSON data
  'X': '❌',
  'Check': '✅',
  'Users': '👥',
  'MapPin': '📍',
  'Cloud': '☁️',
  'AlertCircle': '⚠️',
  'EyeOff': '👁️‍🗨️',
  'Lock': '🔒',
  'Banknote': '💰',
  'Clock': '🕐',
  'Globe': '🌍',
  'MessageSquare': '💬',
  'GitFork': '🔀',
  'HelpCircle': '❓',
  'LayoutList': '📋',
  'BookOpen': '📖',
  'Brain': '🧠',
  'TrendingDown': '📉',
  'Map': '🗺️',
  'TrendingUp': '📈',
  'Calendar': '📅',
  'Quote': '💬',
  'ArrowUp': '⬆️',
  'ArrowDown': '⬇️',
  'Minus': '➖',
  'ArrowRight': '➡️',
};

/**
 * Returns the emoji character for a given icon name
 * @param iconName Name of the icon to retrieve
 * @param fallback Optional fallback emoji if icon not found
 * @returns Emoji character string
 */
export function getIcon(iconName: IconName, fallback: string = '📊'): string {
  if (!iconName) return fallback;
  
  return iconMap[iconName] || fallback;
}

/**
 * Component that renders an icon based on its name
 */
export function Icon({ 
  name, 
  className = '',
  fallback = '📊'
}: {
  name: IconName;
  className?: string;
  fallback?: string;
}) {
  return (
    <span className={className}>
      {getIcon(name, fallback)}
    </span>
  );
}

// import * as React from 'react';

// // This file provides a centralized mapping of icon names to emoji characters
// // for consistent icon rendering across infographic components

// export type IconName = 
//   // Fa prefix icons (Font Awesome style)
//   | 'FaMapPins'
//   | 'FaRegCalendarAlt'
//   | 'FaMapMarkedAlt'
//   | 'FaBrain'
//   | 'FaRobot'
//   | 'FaGlobeAmericas'
//   | 'FaClock'
//   | 'FaDice'
//   | 'FaLayerGroup'
//   | 'FaCodeBranch'
//   | 'FaBalanceScale'
//   | 'FaTools'
//   | 'FaUsers'
//   // Gi prefix icons (Game Icons style)
//   | 'GiMapPins'
//   | 'GiContagion'
//   | 'GiTargeted'
//   // Io prefix icons (Ionicons style)
//   | 'IoHardwareChipOutline'
//   // Visual aid icons
//   | 'sparkles'
//   | 'arrows-alt'
//   | 'cloud'
//   | 'puzzle-piece'
//   | 'lightbulb'
//   // Default fallback
//   | string;

// export const iconMap: Record<IconName, string> = {
//   // Fa prefix icons
//   'FaMapPins': '📍',
//   'FaRegCalendarAlt': '📅',
//   'FaMapMarkedAlt': '🗺️',
//   'FaBrain': '🧠',
//   'FaRobot': '🤖',
//   'FaGlobeAmericas': '🌍',
//   'FaClock': '🕐',
//   'FaDice': '🎲',
//   'FaLayerGroup': '📚',
//   'FaCodeBranch': '🔀',
//   'FaBalanceScale': '⚖️',
//   'FaTools': '🔧',
//   'FaUsers': '👥',
  
//   // Gi prefix icons
//   'GiMapPins': '📍',
//   'GiContagion': '🦠',
//   'GiTargeted': '🎯',
  
//   // Io prefix icons
//   'IoHardwareChipOutline': '💾',
  
//   // Visual aid icons
//   'sparkles': '✨',
//   'arrows-alt': '↔️',
//   'cloud': '☁️',
//   'puzzle-piece': '🧩',
//   'lightbulb': '💡',
// };

// /**
//  * Returns the emoji character for a given icon name
//  * @param iconName Name of the icon to retrieve
//  * @param fallback Optional fallback emoji if icon not found
//  * @returns Emoji character string
//  */
// export function getIcon(iconName: IconName, fallback: string = '📊'): string {
//   if (!iconName) return fallback;
  
//   return iconMap[iconName] || fallback;
// }

// /**
//  * Component that renders an icon based on its name
//  */
// export function Icon({ 
//   name, 
//   className = '',
//   fallback = '📊'
// }: {
//   name: IconName;
//   className?: string;
//   fallback?: string;
// }) {
//   return (
//     <span className={className}>
//       {getIcon(name, fallback)}
//     </span>
//   );
// }