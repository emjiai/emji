import React from "react";

function PreviewModal({ show, onClose, children }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 h-screen z-50">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>

      {/* Modal container */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded shadow-lg z-10">
        <button onClick={onClose} className="absolute top-2 right-2">
          X
        </button>
        {children}
      </div>
    </div>
  );
}

export default PreviewModal;


// import React from "react";

// function PreviewModal({ show, onClose, children }) {
//   if (!show) return null;
//   return (
//     <div className="fixed inset-0 h-screen z-50">
//       {/* Dark overlay */}
//       <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>

//       {/* Modal container */}
//       <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded shadow-lg z-10">
//         <button onClick={onClose} className="absolute top-2 right-2">
//           X
//         </button>
//         {children}
//       </div>
//     </div>
//   );
// }

// export default PreviewModal;



