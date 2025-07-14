import React from 'react';

interface ListTodoProps {
  className?: string;
}

const ListTodo: React.FC<ListTodoProps> = ({ className = "h-4 w-4" }) => {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
      />
    </svg>
  );
};

export default ListTodo;

// 'use client';

// import React from 'react';

// interface ListTodoProps {
//   className?: string;
//   size?: number;
//   color?: string;
// }

// const ListTodo: React.FC<ListTodoProps> = ({ 
//   className = "", 
//   size = 24, 
//   color = "currentColor" 
// }) => {
//   return (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       width={size}
//       height={size}
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke={color}
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       className={className}
//     >
//       <line x1="8" y1="6" x2="21" y2="6" />
//       <line x1="8" y1="12" x2="21" y2="12" />
//       <line x1="8" y1="18" x2="21" y2="18" />
//       <path d="M3 6h2" />
//       <path d="M3 12h2" />
//       <path d="M3 18h2" />
//       <circle cx="4" cy="6" r="1" />
//       <circle cx="4" cy="12" r="1" />
//       <circle cx="4" cy="18" r="1" />
//     </svg>
//   );
// };

// export default ListTodo;