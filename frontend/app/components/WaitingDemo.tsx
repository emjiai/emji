import React from "react";
import { motion } from "framer-motion";
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback } from 'react';

function WaitingDemo() {
  const headingVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      <div className="py-10 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-[85rem] px-4 sm:px-6 lg:px-8 mx-auto">
          {/* Section Title */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={headingVariants}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center mb-10 lg:mb-14"
          >
            <h2 className="text-3xl font-bold md:text-4xl dark:text-white">
              Try Some of Our Features
            </h2>
            <p className="mt-3 text-gray-600 dark:text-gray-400">
              Discover how EmJi AI can transform your learning experience
            </p>
          </motion.div>

          {/* Feature Cards Carousel */}
          {(() => {
            const features = [
              {
                title: "Read Document",
                description: "Upload any document and get instant summaries, key points, and insights to save hours of reading time.",
                icon: (
                  <svg 
                    className="flex-shrink-0 size-6 text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth={1.5} 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                ),
                href: "/demos/read-document"
              },
              {
                title: "Quiz",
                description: "Generate custom quizzes from your study materials to test your knowledge and improve retention.",
                icon: (
                  <svg 
                    className="flex-shrink-0 size-6 text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth={1.5} 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                  </svg>
                ),
                href: "/demos/quiz"
              },
              {
                title: "Assessment",
                description: "Receive in-depth assessments of your understanding with personalized feedback and improvement suggestions.",
                icon: (
                  <svg 
                    className="flex-shrink-0 size-6 text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth={1.5} 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75" />
                  </svg>
                ),
                href: "/demos/assessment"
              },
              {
                title: "Create Lesson Plan",
                description: "Design comprehensive, structured lesson plans tailored to any topic or learning objective in minutes.",
                icon: (
                  <svg 
                    className="flex-shrink-0 size-6 text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth={1.5} 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                  </svg>
                ),
                href: "/demos/lesson-plan"
              },
              {
                title: "Special Education",
                description: "Create personalized speech and language development plans for special educational needs.",
                icon: (
                  <svg 
                    className="flex-shrink-0 size-6 text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth={1.5} 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                  </svg>
                ),
                href: "/demos/sen"
              }
            ];
            
            const [emblaRef, emblaApi] = useEmblaCarousel({
              loop: true,
              slidesToScroll: 1,
              align: 'start',
              containScroll: 'keepSnaps',
              skipSnaps: false,
            });
            
            const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
            const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
            
            return (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="relative w-full max-w-[1600px] mx-auto"
              >
                {/* Carousel viewport */}
                <div className="overflow-hidden" ref={emblaRef}>
                  <div className="flex -ml-4">
                    {features.map((feature) => (
                      <div 
                        key={feature.title}
                        className="pl-4 min-w-0 flex-[0_0_100%] sm:flex-[0_0_50%] md:flex-[0_0_33.333%] lg:flex-[0_0_25%]"
                      >
                        <a 
                          href={feature.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-full group flex flex-col bg-white border shadow-sm rounded-xl hover:shadow-md transition dark:bg-slate-900 dark:border-gray-800"
                        >
                          <div className="p-4 md:p-5">
                            <div className="flex justify-center items-center size-12 bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg mb-5">
                              {feature.icon}
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                              {feature.title}
                            </h3>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                              {feature.description}
                            </p>
                            <span className="mt-3 inline-flex items-center gap-x-1 font-medium text-purple-600 dark:text-purple-500">
                              Try it now
                              <svg className="flex-shrink-0 size-4 text-purple-600 dark:text-purple-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                            </span>
                          </div>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Carousel navigation */}
                <div className="flex justify-center gap-4 mt-6">
                  <button
                    onClick={scrollPrev}
                    className="bg-gradient-to-br from-purple-600 to-blue-500 rounded-full shadow p-2 hover:opacity-90 transition"
                    aria-label="Previous"
                  >
                    <svg className="size-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <button
                    onClick={scrollNext}
                    className="bg-gradient-to-br from-purple-600 to-blue-500 rounded-full shadow p-2 hover:opacity-90 transition"
                    aria-label="Next"
                  >
                    <svg className="size-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </motion.div>
            );
          })()}
        </div>
      </div>
    </>
  );
}

export default WaitingDemo;