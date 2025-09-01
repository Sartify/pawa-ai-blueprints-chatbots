import React from 'react';
import { Paperclip, Mic, Send } from 'lucide-react';

const ChatInput = ({ inputValue, setInputValue, onSendMessage, placeholder = "What are the top national parks to visit?" }) => {
  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-2">
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          <div className="flex items-center bg-[#019A5A] rounded-full px-4 py-3 gap-3">
            <Paperclip className="w-5 h-5 text-white cursor-pointer hover:text-green-200 transition-colors" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className="flex-1 bg-transparent text-white placeholder-green-200 outline-none"
            />
            <Mic className="w-5 h-5 text-white cursor-pointer hover:text-green-200 transition-colors" />
            <button 
              onClick={handleSend}
              className="bg-white rounded-full p-2 hover:bg-gray-100 transition-colors"
            >
              <Send className="w-4 h-4 text-[#019A5A]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
