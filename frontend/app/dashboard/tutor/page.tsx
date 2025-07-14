import React from "react";
import { Categories } from "./_components/Categories";
import SearchBar from "./_components/Search";
import { db } from "@/utils/db";
import { Category } from "@/utils/schema";
import TutorsWrapper from "./_components/TutorsWrapper";
import CreateTutorForm from "./_components/CreateTutorForm";
import { Button } from "@/components/ui/button";

interface RootPageProps {
  searchParams: {
    categoryId?: string;
    name?: string;
    create?: string;
  };
}

const RootPage = async ({ searchParams }: RootPageProps) => {
  const categories = await db.select().from(Category);
  const showCreateForm = searchParams.create === "true";

  return (
    <div className="max-w-full overflow-x-hidden">
      <div className="w-full mb-2">
        <SearchBar />
      </div>
      <div className="flex justify-end mb-4 px-4 sm:px-6">
        <Button asChild>
          <a href={`/dashboard/tutor?create=${!showCreateForm}`}>
            {showCreateForm ? "View Tutors" : "Create Tutor"}
          </a>
        </Button>
      </div>
      
      {showCreateForm ? (
        <div className="container mx-auto px-4 py-6">
          <CreateTutorForm />
        </div>
      ) : (
        <>
          <Categories data={categories} />
          <TutorsWrapper searchParams={searchParams} />
        </>
      )}
    </div>
  );
};

export default RootPage;
