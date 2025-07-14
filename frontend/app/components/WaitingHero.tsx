import React from "react";
import { motion } from "framer-motion";
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState } from 'react';

function WaitingHero() {
  const headingVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
  };

  const textVariants = {
    hidden: { opacity: 0, x: 0 },
    visible: { opacity: 1, x: 20 },
  };

  return (
    <>
      <div className="sm:mt-10 mt-24 relative overflow-hidden h-auto">
        {/* Background Image */}
        <motion.div className="absolute top-0 left-1/2 w-full h-full bg-[url('https://raw.githubusercontent.com/Sharjeel-Riaz/SaaS-Assets/2df3536eeea9a33f3515f7c623aae3defb1aba86/verdant/forest.svg')] dark:bg-[url('https://raw.githubusercontent.com/Sharjeel-Riaz/SaaS-Assets/2df3536eeea9a33f3515f7c623aae3defb1aba86/verdant/forest.svg')] bg-no-repeat bg-top bg-cover transform -translate-x-1/2 -z-10" />

        {/* Gradient Overlay - Adjusted z-index */}
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-b from-transparent to-white dark:to-black z-0"></div>

        {/* Main Content - Ensure it's above gradient */}
        <div className="relative max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 z-10">
          {/* Free subscription banner */}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ease: "easeIn", duration: 1.5 }}
            className="flex justify-center"
          >
            <a
              className="inline-flex items-center gap-x-2 bg-white border border-gray-200 text-sm text-gray-800 p-1 ps-3 rounded-full transition hover:border-gray-300 dark:bg-neutral-800 dark:border-neutral-700 dark:hover:border-neutral-600 dark:text-neutral-200"
              href="#"
              target="_self"
            >
              We are launching in July 2025
              <span className="py-1.5 px-2.5 inline-flex justify-center items-center gap-x-2 rounded-full bg-zinc-700 font-semibold text-sm text-gray-100 dark:bg-neutral-700 dark:text-neutral-400">
                <svg
                  className="flex-shrink-0 size-4"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </span>
            </a>
          </motion.div>

          {/* Title */}
          <motion.div
            className="mt-5 max-w-2xl text-center mx-auto"
            initial="hidden"
            animate="visible"
            variants={textVariants}
            transition={{ duration: 2, ease: "easeInOut" }}
          >
            <h1 className="block font-bold text-gray-800 text-4xl md:text-5xl lg:text-6xl dark:text-neutral-200">
              EmJi
              <span className="bg-clip-text bg-gradient-to-tl from-[#423042] to-[#865db2] text-transparent">
                Ai
              </span>
            </h1>
          </motion.div>

          {/* Description */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={headingVariants}
            transition={{ duration: 2, ease: "easeOut" }}
            className="mt-5 max-w-3xl text-center mx-auto"
          >
            <p className="text-lg text-gray-600 dark:text-neutral-400 mx-10">
              Study smarter, not harder!
            </p>
            <p className="text-lg text-gray-600 dark:text-neutral-400 mx-10">
              Learn 10x Faster with EmJi Ai, your 24/7 AI-powered study buddy.
            </p>
          </motion.div>

          {/* CTA Button */}
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ease: "easeIn", duration: 1.2 }}
          className="mt-4"
        >
          {/* Features Carousel */}
          {(() => {
            const features = [
              {
                title: "AI Assessment",
                description: "Create comprehensive quizzes and formative assessments.",
                icon: (
                  <svg className="flex-shrink-0 size-6 text-white" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11V8a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-3" /><path d="M5 15h4" /><path d="M9 11H5v4" /><rect width="4" height="4" x="5" y="5" rx="1" /></svg>
                ),
                href: "#"
              },
              {
                title: "AI Mind Maps",
                description: "Generate process and knowledge maps to visualize complex concepts.",
                icon: (
                  <svg className="flex-shrink-0 size-6 text-white" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3v18" /><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M21 9H3" /><path d="M9 21V9" /></svg>
                ),
                href: "/dashboard/maps"
              },
              {
                title: "AI Adaptive Learning",
                description: "Dynamically adjusts learning materials for each student.",
                icon: (
                  <svg className="flex-shrink-0 size-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M8 15s1.5-2 4-2 4 2 4 2" /><path d="M9 9h.01" /><path d="M15 9h.01" /></svg>
                ),
                href: "#"
              },
              {
                title: "AI Content Creation",
                description: "Instantly generate lesson drafts, summaries, and translations.",
                icon: (
                  <svg className="flex-shrink-0 size-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M8 9h8M8 13h6" /></svg>
                ),
                href: "#"
              },
              {
                title: "AI Hyper Personalisation",
                description: "Suggests relevant courses and resources based on your needs and real-time market needs.",
                icon: (
                  <svg className="flex-shrink-0 size-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>
                ),
                href: "#"
              },
              {
                title: "AI Reinforcement Tools",
                description: "Boost retention with spot quizzes and microlearning.",
                icon: (
                  <svg className="flex-shrink-0 size-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 3v4M8 3v4" /></svg>
                ),
                href: "#"
              },
              {
                title: "AI Learning Analytics",
                description: "Unlock insights and predict success with advanced analytics.",
                icon: (
                  <svg className="flex-shrink-0 size-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24" viewBox="0 0 24 24"><path d="M3 17v-2a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                ),
                href: "#"
              },
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
              <div className="relative w-full max-w-[1600px] mx-auto">
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
                          className="h-full group flex flex-col justify-center hover:bg-gray-50 rounded-xl p-6 md:p-8 dark:hover:bg-neutral-800 transition"
                        >
                          <div className="flex justify-center items-center size-14 bg-primary rounded-xl">
                            {feature.icon}
                          </div>
                          <div className="mt-6">
                            <h3 className="group-hover:text-gray-600 text-xl font-semibold text-gray-800 dark:text-white dark:group-hover:text-gray-400">
                              {feature.title}
                            </h3>
                            <p className="mt-2 text-gray-600 dark:text-neutral-400">
                              {feature.description}
                            </p>
                            <span className="mt-3 inline-flex items-center gap-x-1.5 text-base text-[#423042] decoration-2 group-hover:underline font-medium">
                              Learn more
                              <svg className="flex-shrink-0 size-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                            </span>
                          </div>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Carousel navigation below, not overlaying */}
                <div className="flex justify-center gap-4 mt-6">
                  <button
                    onClick={scrollPrev}
                    className="bg-white dark:bg-neutral-800 rounded-full shadow p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 transition"
                    aria-label="Previous"
                  >
                    <svg className="size-5 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <button
                    onClick={scrollNext}
                    className="bg-white dark:bg-neutral-800 rounded-full shadow p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 transition"
                    aria-label="Next"
                  >
                    <svg className="size-5 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            );
          })()}
        </motion.div>
      </div>
    </>
  );
}

export default WaitingHero;
