import React from 'react';
import CoatOfArmsImg from '../assets/images/Coat_of_arms_of_Tanzania.png'
import PawaAiLogo from '../assets/images/apple-touch-icon.png'

const ChatbotHeader = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img src={CoatOfArmsImg} alt="Coat of Arms" className="w-10 h-10" />
        <div>
          <h1 className="font-semibold text-gray-900">WIZARA</h1>
          <p className="text-sm text-gray-600">YA MALIASILI</p>
          <p className="text-sm text-gray-600">NA UTALII</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <img src={PawaAiLogo} alt="Pawa AI Logo" className="w-8 h-8" />
        <span className="font-medium text-gray-700">Pawa AI</span>
      </div>
    </div>
  );
};

export default ChatbotHeader;
