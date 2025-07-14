"use client";
import { useState, useEffect, useCallback } from "react";
import { Excalidraw, convertToExcalidrawElements } from "@excalidraw/excalidraw";
import { Button } from "@/components/ui/button";
import { Maximize2Icon, Minimize2Icon } from "lucide-react";

import "@excalidraw/excalidraw/index.css";

const WhiteBoard = () => {
  console.info(convertToExcalidrawElements([{
    type: "rectangle",
    id: "rect-1",
    width: 186.47265625,
    height: 141.9765625,
    x: 100,
    y: 100,
    strokeColor: "#000000",
    backgroundColor: "transparent",
    fillStyle: "hachure",
    strokeWidth: 1,
    roughness: 1,
    opacity: 100,
  }]));

  return (
    <div className="h-screen w-full">
      <Excalidraw />
    </div>
  );
};

export default WhiteBoard;