import React, { useState } from 'react';
import { Send, Mic } from 'lucide-react';
import { ReactTyped } from 'react-typed';
import EmptyState from './EmptyState';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

const ChatBotPage = () => {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [hasStartedConversation, setHasStartedConversation] = useState(false);

  // Mock response data - in a real app, this would come from an API
  const getBotResponse = (userMessage) => {
    const responses = {
      "What are the top cultural sites in Tanzania?": {
        title: "Top Cultural Sites in Tanzania",
        description: "Tanzania is rich in culture and history, and some of the most popular cultural and heritage sites include:",
        content: (
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
        )
      },
      "How much is the Ngorongoro entry fee?": {
        title: "Ngorongoro Conservation Area Entry Fees",
        description: "The entry fees for Ngorongoro Conservation Area vary based on your nationality and the type of visit:",
        content: (
          <ul className="space-y-4 text-gray-700">
            <li>
              <span className="font-medium">Foreign Tourists:</span> $70 USD per person per day
            </li>
            <li>
              <span className="font-medium">East African Residents:</span> 20,000 TZS per person per day
            </li>
            <li>
              <span className="font-medium">Tanzanian Citizens:</span> 5,000 TZS per person per day
            </li>
            <li>
              <span className="font-medium">Vehicle Entry:</span> 40,000 TZS per vehicle per day
            </li>
          </ul>
        )
      },
      "Best time for a safari in Tanzania?": {
        title: "Best Time for Safari in Tanzania",
        description: "The best time for a safari in Tanzania depends on what you want to see:",
        content: (
          <ul className="space-y-4 text-gray-700">
            <li>
              <span className="font-medium">Dry Season (June-October):</span> Best for wildlife viewing as animals gather around water sources
            </li>
            <li>
              <span className="font-medium">Wildebeest Migration (July-October):</span> Witness the Great Migration in the Serengeti
            </li>
            <li>
              <span className="font-medium">Green Season (November-May):</span> Beautiful landscapes, fewer crowds, and lower prices
            </li>
            <li>
              <span className="font-medium">Calving Season (January-March):</span> See newborn animals in the southern Serengeti
            </li>
          </ul>
        )
      }
    };

    return responses[userMessage] || {
      title: "Thank you for your question",
      description: "I'm here to help you explore Tanzania's amazing wildlife, culture, and travel opportunities. Please ask me anything about Tanzania's tourism!",
      content: null
    };
  };

  const handleQuestionClick = (question) => {
    setInputValue(question);
    handleSendMessage(question);
  };

  const handleSendMessage = (message) => {
    if (!message.trim()) return;

    const userMessage = message;
    const botResponse = getBotResponse(userMessage);

    const newMessage = {
      userMessage,
      botResponse
    };

    setMessages(prev => [...prev, newMessage]);
    setHasStartedConversation(true);
  };

  const handleSend = () => {
    if (inputValue.trim()) {
      handleSendMessage(inputValue);
      setInputValue('');
    }
  };

  // If no conversation has started, show empty state
  if (!hasStartedConversation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EmptyState onQuestionClick={handleQuestionClick} />
        
        {/* Input Section for Empty State */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#019A5A] rounded-2xl p-1">
              <div className="flex items-center bg-white rounded-xl">
                <div className="flex items-center px-4 py-3 text-gray-400">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <Mic className="w-5 h-5" />
                </div>
                <ReactTyped
                  strings={["What are the top national parks to visit?", "How much is the Ngorongoro entry fee?", "Best time for a safari in Tanzania?", "How do I get a Kilimanjaro climbing permit?", "Do I need a visa to visit Tanzania?", "What are the top cultural sites in Tanzania?", "Where can I learn about Maasai traditions?"]}
                  typeSpeed={40}
                  backSpeed={50}
                  loop
                  className="flex-1 px-4 py-3 text-gray-700 bg-transparent border-none outline-none text-lg"
                />
                <div className="flex items-center space-x-3 px-4 py-3">
                  <button
                    onClick={handleSend}
                    className="p-2 bg-[#019A5A] text-white rounded-lg hover:bg-[#018a4f] transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If conversation has started, show message list
  return (
    <MessageList
      messages={messages}
      onSendMessage={handleSendMessage}
      inputValue={inputValue}
      setInputValue={setInputValue}
    />
  );
};

export default ChatBotPage;