"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import MediaDisplay from "./_components/MediaDisplay";
import EditView from "./_components/EditView";

type ViewMode = "media" | "edit" | null;

export default function MediaPage() {
  const [currentView, setCurrentView] = useState<ViewMode>(null);

  const renderView = () => {
    switch (currentView) {
      case "media":
        return <MediaDisplay onClose={() => setCurrentView(null)} />;
      case "edit":
        return <EditView onClose={() => setCurrentView(null)} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500 mb-6">Choose an action to get started</p>
            <div className="flex space-x-4">
              <Button 
                onClick={() => setCurrentView("media")}
                className="px-6 py-2"
                variant="default"
              >
                View Media Gallery
              </Button>
              <Button 
                onClick={() => setCurrentView("edit")}
                className="px-6 py-2"
                variant="outline"
              >
                Edit Content
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Media Management</h1>
        {currentView && (
          <Button 
            onClick={() => setCurrentView(null)}
            variant="ghost"
            className="text-gray-600"
          >
            ← Back to Home
          </Button>
        )}
      </div>
      
      {renderView()}
    </div>
  );
}

// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import MediaDisplay from "./_components/MediaDisplay";

// export default function MediaPage() {
//   const [showMediaDisplay, setShowMediaDisplay] = useState(false);

//   return (
//     <div className="container mx-auto py-8">
//       <h1 className="text-3xl font-bold mb-6">Media Gallery</h1>
      
//       {!showMediaDisplay ? (
//         <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
//           <p className="text-gray-500 mb-4">Click the button below to view the media gallery</p>
//           <Button 
//             onClick={() => setShowMediaDisplay(true)}
//             className="px-6 py-2"
//           >
//             Display Media
//           </Button>
//         </div>
//       ) : (
//         <MediaDisplay onClose={() => setShowMediaDisplay(false)} />
//       )}
//     </div>
//   );
// }