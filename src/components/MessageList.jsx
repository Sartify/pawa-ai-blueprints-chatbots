import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';
import ChatbotHeader from './ChatbotHeader'
import ChatInput from './ChatInput'

const MessageList = ({ messages, onSendMessage, inputValue, setInputValue }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleReadAloud = () => {
    setIsPlaying(!isPlaying);
    // In a real implementation, this would trigger text-to-speech
  };

  return (
    <div className="max-w-4xl mx-auto bg-gray-50 min-h-screen">
      {/* Chatbot Header */}
      <ChatbotHeader />

      {/* Chat Content */}
      <div className="px-6 py-8 space-y-6 pb-24 pt-20">
        {messages.map((message, index) => (
          <div key={index}>
            {/* User Question */}
            <div className="flex justify-end">
              <div className="bg-[#019A5A] text-white px-6 py-3 rounded-2xl rounded-br-lg max-w-md">
                {message.userMessage}
              </div>
            </div>

            {/* Bot Response */}
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-orange-600 text-sm">🏛️</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[#019A5A] font-medium">Unforgettable Experience</span>
                </div>
                
                <div className="bg-white rounded-lg p-6 border-l-4 border-orange-400 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">{message.botResponse.title}</h3>
                  <p className="text-gray-700 mb-4">
                    {message.botResponse.description}
                  </p>
                  
                  {message.botResponse.content && (
                    <div className="text-gray-700">
                      {message.botResponse.content}
                    </div>
                  )}
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
        ))}
      </div>

      {/* Input Area */}
      <ChatInput 
        inputValue={inputValue}
        setInputValue={setInputValue}
        onSendMessage={onSendMessage}
      />
    </div>
  );
};

export default MessageList;
