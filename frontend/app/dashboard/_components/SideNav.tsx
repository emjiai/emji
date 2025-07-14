"use client";
import {
  FileClock,
  Settings,
  WalletCards,
  BookOpen,
  MessageSquare,
  Plus,
  PanelLeftClose,
  BrainCircuit,
  ClipboardCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import UsageTrack from "./UsageTrack";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface SideNavProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

function SideNav({ isOpen, toggleSidebar }: SideNavProps) {
  const createId = "new";
  const path = usePathname();
  const [showUsage, setShowUsage] = useState(false);
  const router = useRouter();

  const toggleUsage = () => {
    setShowUsage(!showUsage);
  };

  const MenuList = [
    {
      section: "GENERAL",
      items: [
        {
          name: "AI Coursework",
          icon: BookOpen,
          path: "/dashboard",
        },
        {
          name: "AI Visaul Maps",
          icon: BrainCircuit,
          path: "/dashboard/maps",
        },
        {
          name: "AI Tutor",
          icon: MessageSquare,
          path: "/dashboard/tutor",
        },
        {
          name: "AI Assessment",
          icon: ClipboardCheck,
          path: "/dashboard/assessment",
        },
        {
          name: "History",
          icon: FileClock,
          path: "/dashboard/history",
        },
      ],
    },
    {
      section: "SUPPORT",
      items: [
        {
          name: "Create",
          icon: Plus,
          path: `/dashboard/create/${createId}`,
        },
        {
          name: "Billing",
          icon: WalletCards,
          path: "/dashboard/billing",
        },
        {
          name: "Settings",
          icon: Settings,
          path: "/dashboard/settings",
        },
      ],
    },
  ];

  const sidebarVariants = {
    hidden: {
      x: "-100%",
      borderRadius: "0 100% 100% 0",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
      },
    },
    visible: {
      x: 0,
      borderRadius: "0%",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
      },
    },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
  };

  // Common sidebar content that will be used for both mobile and desktop
  const renderSidebarContent = (isMobile?: boolean) => (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Logo section */}
      <div className="flex justify-between items-center mb-2 flex-shrink-0">
        <Image src="/logo3.png" alt="logo" width={150} height={150} />
        {isMobile && (
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close sidebar"
          >
            <PanelLeftClose className="h-6 w-6" />
          </button>
        )}
      </div>
      <hr className="mb-4 border flex-shrink-0" />

      {/* Menu sections */}
      <div className="flex-1 overflow-y-auto">
        {MenuList.map((section) => (
          <div key={uuidv4()} className="mb-4">
            <h3 className="text-xs font-medium tracking-wide text-gray-500 mb-3">
              {section.section}
            </h3>
            {section.items.map((menu) => (
              <Link
                href={menu.path}
                key={uuidv4()}
                onClick={isMobile ? toggleSidebar : undefined}
                className="block"
              >
                <div
                  className={`flex gap-2 mb-3 p-2 hover:bg-primary hover:text-white
                    rounded-lg cursor-pointer items-center transition-all hover-parent
                    ${path === menu.path ? "bg-primary text-white" : ""}`}
                >
                  <menu.icon className="h-5 w-5 icon-bounce" />
                  <h2 className="text-lg">{menu.name}</h2>
                </div>
              </Link>
            ))}
          </div>
        ))}
      </div>

      {/* Footer section */}
      <div className="mt-2 pt-2 flex-shrink-0">
        <button 
          onClick={toggleUsage} 
          className="w-full flex items-center justify-between p-2 mb-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <span className="text-sm font-medium">
            {showUsage ? "Hide Usage" : "View Usage"}
          </span>
          {showUsage ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        
        {showUsage && <UsageTrack hideUpgradeButton={true} />}
        
        <Button
          variant="secondary"
          className="w-full my-3 text-primary"
          onClick={() => {
            router.push("/dashboard/billing");
          }}
        >
          Upgrade
        </Button>
        
        <hr className="my-3 border" />
        <p className="text-xs text-center text-gray-500">
          {new Date().getFullYear()} EmJi Ai Inc.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full">
        <div className="h-full flex flex-col p-5 shadow-sm border bg-white overflow-hidden">
          {renderSidebarContent()}
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-[998] lg:hidden"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={overlayVariants}
              onClick={toggleSidebar}
            />

            {/* Mobile Sidebar */}
            <motion.div
              className="fixed inset-0 w-full max-w-[300px] z-[999] lg:hidden"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={sidebarVariants}
            >
              <div className="h-full bg-white p-5 overflow-hidden">
                {renderSidebarContent(true)}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default SideNav;
