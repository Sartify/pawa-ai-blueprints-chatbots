import React from "react";
import { Bot } from "lucide-react";

export const LoadingDots: React.FC = () => {
  return (
    <div className="flex flex-col bg-gray-300 items-center justify-center space-y-1 rounded-[5px] py-1 px-2 shadow-lg">
      <div className="w-6 h-6 flex items-center justify-center">
        <Bot className="w-6 h-6 text-[#022e79]" />
      </div>

      <div className="flex space-x-1">
        <div className="w-1.5 h-1.5 bg-[#022e79] rounded-full animate-bounce delay-0"></div>
        <div className="w-1.5 h-1.5 bg-[#022e79] rounded-full animate-bounce delay-100"></div>
        <div className="w-1.5 h-1.5 bg-[#022e79] rounded-full animate-bounce delay-200"></div>
      </div>
    </div>
  );
};
