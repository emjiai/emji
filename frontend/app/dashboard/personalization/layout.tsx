"use client";

import React from 'react';

export default function PersonalizationAILayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full min-h-screen flex flex-col">
      <div className="flex-grow overflow-hidden">
        {children}
      </div>
    </div>
  );
}