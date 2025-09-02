import React from 'react';
import CoatOfArmsImg from '../assets/images/Coat_of_arms_of_Tanzania.png'
import PawaAiLogo from '../assets/pawa-logo.png'

const ChatbotHeader = ({ onNewChat }) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img src={CoatOfArmsImg} alt="Coat of Arms" className="w-10 h-10" />
        <div className="flex items-center gap-3">
          <h1 className="font-semibold text-gray-900 text-sm">WIZARA YA MALIASILI NA UTALII</h1>
          <div className="w-1 h-6 bg-[#FFA200]"></div>
          <div className="flex items-center gap-2">
            <img src={PawaAiLogo} alt="Pawa AI Logo" className="w-10 h-8" />
            <span className="font-medium text-[#FFA200]">Pawa AI</span>
          </div>
        </div>
      </div>
      
      {/* New Chat Button */}
      <button
        onClick={onNewChat}
        className="px-4 py-2 bg-[#019A5A] hover:bg-[#018a4f] text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        New Chat
      </button>
    </div>
  );
};

export default ChatbotHeader;
