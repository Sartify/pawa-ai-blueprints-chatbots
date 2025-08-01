import React from "react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, PenLine, Bot } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  onNewChat: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNewChat,
}) => {
  return (
    <header className="flex justify-between items-center p-2 sm:p-4 sticky top-0 bg-white z-10">
      <div className="flex items-center gap-2">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <Bot className="w-10 h-10 md:w-14 md:h-14 lg:w-12 lg:h-12 max-[300px]:h-10 max-[300px]:w-10 text-[#022e79]" />
            <span className="text-[#022e79] font-semibold text-base sm:text-lg hidden sm:inline font-avenir">
              WCF Agent
            </span>
          </div>
        </Link>
      </div>

      <h1 className="text-lg font-semibold flex items-center">
        <span
          className="text-[#022e79] truncate max-w-[50vw] sm:max-w-xs md:max-w-sm lg:max-w-md font-avenir-medium"
        >
          New Chat
        </span>
      </h1>

      <div className="flex items-center gap-2 sm:gap-4">
        <Button
          variant="outline"
          onClick={onNewChat}
          className="text-[#022e79] border-[#022e79] hover:bg-[#022e79] hover:text-white flex items-center gap-2 px-2 sm:px-4 h-8 sm:h-10 rounded-sm"
        >
          <span
            className="hidden sm:inline font-avenir-medium"
          >
            New Chat
          </span>
          <PenLine className="w-5 h-5 sm:w-6 sm:h-6" />
        </Button>
{/* 
        <Link href="/dev">
          <Button
            variant="outline"
            className="border-[#022e79] text-[#022e79] hover:bg-[#022e79] hover:text-white px-2 sm:px-4 h-8 sm:h-10 rounded-sm"
          >
            <span
              className="hidden sm:inline font-avenir-medium"
            >
              Build your Ai
            </span>
            <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>
        </Link> */}
      </div>
    </header>
  );
};
