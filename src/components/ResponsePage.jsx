import React, { useState } from 'react';
import { Volume2, Paperclip, Mic, Send } from 'lucide-react';
import CoatOfArmsImg from '../assets/images/Coat_of_arms_of_Tanzania.png'
import PawaAiLogo from '../assets/pawa-logo.png'

const ChatbotResponse = () => {
  const [inputValue, setInputValue] = useState("What are the top national parks to visit?");
  const [isPlaying, setIsPlaying] = useState(false);

  const handleReadAloud = () => {
    setIsPlaying(!isPlaying);
    // In a real implementation, this would trigger text-to-speech
  };

  return (
    <div className="max-w-4xl mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={CoatOfArmsImg} alt="Coat of Arms" className="w-10 h-10" />
          <div>
            <h1 className="font-semibold text-gray-900 text-sm">WIZARA</h1>
            <p className="font-semibold text-gray-900 text-sm">YA MALIASILI</p>
            <p className="font-semibold text-gray-900 text-sm">NA UTALII</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <img src={PawaAiLogo} alt="Pawa AI Logo" className="w-10 h-8" />
          <span className="font-medium text-[#FFA200]">Pawa AI</span>
        </div>
      </div>

      {/* Chat Content */}
      <div className="px-6 py-8 space-y-6">
        {/* User Question */}
        <div className="flex justify-end">
          <div className="bg-green-600 text-white px-6 py-3 rounded-2xl rounded-br-lg max-w-md">
            What are the top cultural sites in Tanzania?
          </div>
        </div>

        {/* Bot Response */}
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
            <span className="text-orange-600 text-sm">🏛️</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-green-600 font-medium">Unforgettable Experience</span>
            </div>

            <div className="bg-white rounded-lg p-6 border-l-4 border-orange-400 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Top Cultural Sites in Tanzania</h3>
              <p className="text-gray-700 mb-4">
                Tanzania is rich in culture and history, and some of the most popular cultural and heritage sites include:
              </p>

              <ul className="space-y-4 text-gray-700">
                <li>
                  <span className="font-medium">Stone Town (Zanzibar)</span> – A UNESCO World Heritage Site known for its winding alleys, spice markets, and Swahili architecture.
                </li>
                <li>
                  <span className="font-medium">Bagamoyo</span> – Once an important East African port town, with colonial-era buildings, the Caravan Serai Museum, and sites linked to the slave trade.
                </li>
                <li>
                  <span className="font-medium">Olduvai Gorge</span> – A world-famous archaeological site often called the "Cradle of Mankind," where early human fossils were discovered.
                </li>
                <li>
                  <span className="font-medium">Maasai Villages (Arusha & Ngorongoro)</span> – Experience traditional Maasai culture, dances, and crafts.
                </li>
                <li>
                  <span className="font-medium">Kilwa Kisiwani & Songo Mnara</span> – UNESCO World Heritage Sites with ancient Swahili ruins that date back to the 9th century.
                </li>
              </ul>
            </div>

            {/* Read Aloud Button */}
            <button
              onClick={handleReadAloud}
              className="flex items-center gap-2 mt-4 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Volume2 className="w-4 h-4" />
              <span className="text-sm">Read aloud</span>
            </button>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="flex items-center bg-green-600 rounded-full px-4 py-3 gap-3">
              <Paperclip className="w-5 h-5 text-white cursor-pointer hover:text-green-200 transition-colors" />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="What are the top national parks to visit?"
                className="flex-1 bg-transparent text-white placeholder-green-200 outline-none"
              />
              <Mic className="w-5 h-5 text-white cursor-pointer hover:text-green-200 transition-colors" />
              <button className="bg-white rounded-full p-2 hover:bg-gray-100 transition-colors">
                <Send className="w-4 h-4 text-green-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotResponse;