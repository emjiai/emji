"use client";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TemplateOptions from "@/app/(data)/TemplateOptions";

interface CategorySelectorProps {
  onCategorySelect: (categoryValue: string) => void;
  selectedCategory?: string;
  error?: boolean;
}

export default function CategorySelector({
  onCategorySelect,
  selectedCategory,
  error = false
}: CategorySelectorProps) {
  // Use the categories from TemplateOptions.tsx
  const categories = TemplateOptions.categories || [];
  
  // For debugging
  console.log("Selected Category:", selectedCategory);

  return (
    <div className="mb-4 w-full">
      <label className="block text-sm font-medium mb-1">Category</label>
      <Select
        value={selectedCategory}
        onValueChange={onCategorySelect}
      >
        <SelectTrigger className={`w-full ${error ? "border-red-500" : ""}`}>
          <SelectValue placeholder="Select a category" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category.value} value={category.value}>
              {category.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
