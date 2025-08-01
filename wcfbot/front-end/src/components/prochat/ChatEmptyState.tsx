"use client";
import { MessageFile } from "@/types/Message";
import React from "react";
import { Bot } from "lucide-react";
import ChatInput from "./ChatInputBar";

interface EmptyStateProps {
  onSend: (message: string, files: MessageFile[]) => void;
  disabled?: boolean;
}

const starterQuestions = [
  {
    question: "What should I do if I get injured at work?",
    description: "Learn about the steps to take after a workplace injury"
  },
  // {
  //   question: "How do I file a compensation claim?",
  //   description: "Understand the WCF claim filing process"
  // },
  // {
  //   question: "What occupational diseases are covered?",
  //   description: "Find out which work-related illnesses are eligible"
  // },
  {
    question: "How much compensation can I receive?",
    description: "Learn about WCF compensation rates and calculations"
  },
];

export default function TutorEmptyState({ onSend, disabled }: EmptyStateProps) {
  const handleQuestionClick = (question: string) => {
    onSend(question, []);
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4 py-4 text-center">
      <Bot className="w-16 h-16 text-[#022e79] mb-4" />
      <h1 className="text-xl font-bold mb-2 text-[#022e79]">
        WCF Agent Assistant
      </h1>
      <p className="text-gray-600 mb-8 max-w-md">
        I'm here to help you with Workers' Compensation Fund (WCF) questions, 
        claim filing, and occupational injury support.
      </p>
      
      <div className="w-full max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {starterQuestions.map((item, index) => (
            <button
              key={index}
              onClick={() => handleQuestionClick(item.question)}
              disabled={disabled}
              className="text-left p-4 rounded-lg border border-gray-200 hover:border-[#022e79] hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <h3 className="font-medium text-[#022e79] mb-1">
                {item.question}
              </h3>
              <p className="text-sm text-gray-600">
                {item.description}
              </p>
            </button>
          ))}
        </div>
      </div>
      
      <div className="w-full mt-8">
        <ChatInput
          onSend={onSend}
          disabled={disabled}
          showVoiceButton={false}
        />
      </div>
    </div>
  );
}
