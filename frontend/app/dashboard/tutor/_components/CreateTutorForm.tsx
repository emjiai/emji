"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import CategorySelector from "./CreateCategory";
import TemplateOptions from "@/app/(data)/TemplateOptions";

// Define interface for database categories
interface DbCategory {
  id: string;
  name: string;
}

export default function CreateTutorForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [dbCategories, setDbCategories] = useState<DbCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    instructions: "",
    seed: "",
    categoryId: "",
    src: "https://ui-avatars.com/api/?background=random",
  });
  
  // Fetch categories from the database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/category");
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        setDbCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast({
          variant: "destructive",
          description: "Failed to load categories",
        });
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // State to store the UI selected category value (from dropdown)
  const [selectedCategoryValue, setSelectedCategoryValue] = useState("");
  const [categoryError, setCategoryError] = useState(false);

  const handleCategorySelect = async (categoryValue: string) => {
    console.log("Category selected:", categoryValue);
    
    // Update the UI selection state
    setSelectedCategoryValue(categoryValue);
    setCategoryError(false);
    
    // Find the selected category from TemplateOptions
    const selectedTemplateCategory = TemplateOptions.categories.find(
      category => category.value === categoryValue
    );
    
    if (!selectedTemplateCategory) {
      toast({
        variant: "destructive",
        description: "Invalid category selected",
      });
      setCategoryError(true);
      return;
    }
    
    // Try to find this category in our database (by name)
    const matchingDbCategory = dbCategories.find(
      dbCat => dbCat.name.toLowerCase() === selectedTemplateCategory.label.toLowerCase()
    );
    
    if (matchingDbCategory) {
      // Category exists in DB, use its ID
      console.log("Found existing category:", matchingDbCategory);
      setFormData(prev => ({ ...prev, categoryId: matchingDbCategory.id }));
    } else {
      // Category doesn't exist in DB, let's create it
      try {
        setIsLoading(true);
        console.log("Creating category:", selectedTemplateCategory.label);
        
        const response = await fetch("/api/category", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: selectedTemplateCategory.label }),
        });
        
        if (!response.ok) {
          throw new Error("Failed to create category");
        }
        
        const newCategory = await response.json();
        console.log("Created new category:", newCategory);
        
        // Add to our local state
        setDbCategories(prev => [...prev, newCategory]);
        // Use the new category ID
        setFormData(prev => ({ ...prev, categoryId: newCategory.id }));
        
        toast({
          description: `Created category: ${selectedTemplateCategory.label}`,
        });
      } catch (error) {
        console.error("Error creating category:", error);
        setCategoryError(true);
        toast({
          variant: "destructive",
          description: "Failed to create category",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name.trim() || !formData.description.trim() || 
        !formData.instructions.trim() || !formData.seed.trim() || 
        !formData.categoryId) {
      toast({
        variant: "destructive",
        description: "All fields are required",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to create tutor");
      }
      
      const tutor = await response.json();
      
      toast({
        description: "Tutor created successfully!",
      });
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        instructions: "",
        seed: "",
        categoryId: "",
        src: "https://ui-avatars.com/api/?background=random",
      });
      
      // Redirect to the tutor page
      router.push(`/dashboard/tutor/${tutor.id}`);
      router.refresh();
      
    } catch (error) {
      console.error("Error creating tutor:", error);
      toast({
        variant: "destructive",
        description: `Failed to create tutor: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingCategories) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 w-full max-w-3xl mx-auto flex justify-center items-center h-32">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2">Loading categories...</span>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 w-full max-w-3xl mx-auto">
      <h2 className="text-lg font-medium mb-4">Create New Tutor</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4 w-full">
        <div>
          <label className="block text-sm font-medium mb-1">Tutor Name</label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter tutor name"
            disabled={isLoading}
          />
        </div>
        
        {/* Category Selector component */}
        <CategorySelector 
          onCategorySelect={handleCategorySelect} 
          selectedCategory={selectedCategoryValue}
          error={categoryError}
        />
        
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter a description of this tutor"
            disabled={isLoading}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Instructions</label>
          <Textarea
            name="instructions"
            value={formData.instructions}
            onChange={handleInputChange}
            placeholder="Enter instructions for this tutor"
            disabled={isLoading}
            rows={3}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Initial Message</label>
          <Textarea
            name="seed"
            value={formData.seed}
            onChange={handleInputChange}
            placeholder="Enter the initial message that this tutor will say"
            disabled={isLoading}
            rows={3}
          />
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Tutor
        </Button>
      </form>
    </div>
  );
}
