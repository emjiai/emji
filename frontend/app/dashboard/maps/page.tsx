"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SearchSection from "../_components/SearchSection";
import TemplateListSection from "../_components/TemplateListSection";
import Templates from "@/app/(data)/Templates";
import { Loader2Icon } from "lucide-react";
import dynamic from "next/dynamic";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

// Dynamically import the CORRECT MapDisplay component for React Flow
const MapDisplay = dynamic(
  () => import("./_components/MapDisplay"), // Assuming this path points to your React Flow component (mapDisplay.txt)
  { ssr: false, loading: () => <div className="p-10 text-center"><Loader2Icon className="animate-spin mx-auto" size={30} /></div> }
);

function MapsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const [userSearchInput, setUserSearchInput] = useState<string>();
  // State to hold the *entire* API response initially
  const [apiResponseData, setApiResponseData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filter templates to only show Maps category
  const mapsTemplates = Templates.filter(
    template => template.category === "Maps"
  );
  // Get the map ID from URL parameters
  const mapId = searchParams?.get("mapId") || null;
  // const templateSlug = searchParams?.get("template") || null; // Keep if needed elsewhere

  // Load map data from session storage or API
  useEffect(() => {
    // First check if we have a mapId parameter
    if (mapId === "latest") {
      // Get from session storage (latest generated map)
      const sessionMapData = sessionStorage.getItem("generatedMap");
      if (sessionMapData) {
        try {
          const parsedMapData = JSON.parse(sessionMapData);
          // Store the entire response structure
          setApiResponseData(parsedMapData);
          return; // Exit early if data found in session
        } catch (err) {
          console.error("Error parsing map data from session storage:", err);
          setError("Invalid map data in session storage. Please generate a new map.");
          sessionStorage.removeItem("generatedMap"); // Clear invalid data
        }
      } else {
         // Handle case where 'latest' is requested but nothing is in session storage
         setError("No recently generated map found in session. Please select a template to generate one.");
      }
    } else if (mapId && user) {
      // Fetch specific map by ID from API if mapId is not 'latest'
      fetchMapById(mapId);
    }
    // No mapId means we show the template list, handled by the conditional render later
  }, [mapId, user]); // Rerun effect if mapId or user changes

  // Fetch a specific map by ID
  const fetchMapById = async (id: string) => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError(null);
      const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      // Assuming the history endpoint returns the same structure as generation
      const response = await fetch(`${API_BASE_URL}/api/content/history/${id}?clerk_id=${user.id}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to fetch map:", response.status, errorText);
        throw new Error(`Failed to fetch map: ${response.statusText} - ${errorText}`);
      }
      const data = await response.json();
      // Store the entire response structure fetched from history
      setApiResponseData(data);
    } catch (err: any) {
      console.error("Error fetching map:", err);
      setError(err.message || "Failed to load map");
    } finally {
      setLoading(false);
    }
  };

  // Reset and go back to template selection
  const handleBackToTemplates = () => {
    router.push("/dashboard/maps"); // Navigate back to the clean maps page URL
    setApiResponseData(null); // Clear the current map data
    setError(null); // Clear any errors
  };

  // Extract the actual React Flow map data (nodes, edges, title, description) from the API response structure
  // The API response structure has the map under the 'content' key
  const reactFlowMapData = apiResponseData?.content || null;

  return (
    <div className="h-full">
      {/* Show map data if available AND valid */}
      {reactFlowMapData && !error ? (
        <div className="container mx-auto py-6 px-4">
          <Button
            onClick={handleBackToTemplates}
            className="mb-4 flex items-center gap-1"
            variant="outline"
          >
             ← Back to Templates
          </Button>

          <div className="bg-white border rounded-lg shadow-md p-6">
            {/* Display title and description directly from reactFlowMapData */}
            <h1 className="text-2xl font-bold mb-2">
              {reactFlowMapData.title || "Generated Map"}
            </h1>
            <p className="text-gray-600 mb-6">
              {reactFlowMapData.description || ""}
            </p>

            <div className="border rounded-md bg-gray-50 overflow-auto max-w-full min-h-[600px]">
              {loading ? (
                 <div className="flex items-center justify-center h-64">
                  <Loader2Icon className="animate-spin mr-2" size={40} />
                  <span>Loading map...</span>
                </div>
              ) : (
                // Pass the CORRECT data structure (nodes, edges, etc.) to MapDisplay
                <MapDisplay mapData={reactFlowMapData} />
              )}
            </div>

            <div className="mt-6 text-sm text-gray-500 flex justify-between">
              {/* Access metadata from the parent apiResponseData if needed */}
              <p>Map Type: {reactFlowMapData.type || "N/A"}</p>
              <p>Generated: {apiResponseData?.created_at ? new Date(apiResponseData.created_at).toLocaleString() : "N/A"}</p>
            </div>
          </div>
        </div>
      ) : (
        // Show template selection OR error message if no valid map data
        <>
          {/* Search Section */}
           <SearchSection
            onSearchInput={(value: string) => setUserSearchInput(value)}
          />

          {/* Template List Section - Maps only */}
          <div className="bg-slate-100 flex flex-col items-center justify-center py-5">
            <h1 className="text-3xl font-bold mb-2">Visual Maps Tools</h1>
            <p className="text-gray-600 mb-4">Create visual representations of processes and knowledge</p>
           </div>

          {/* Display error message if loading failed */}
          {error && (
             <div className="container mx-auto px-4 py-4">
                 <div className="text-red-600 p-4 border border-red-300 bg-red-100 rounded-md text-center">
                   Error: {error}
                 </div>
             </div>
          )}

          <TemplateListSection
            userSearchInput={userSearchInput}
            customTemplates={mapsTemplates}
          />
        </>
      )}
    </div>
  );
}

export default MapsPage;