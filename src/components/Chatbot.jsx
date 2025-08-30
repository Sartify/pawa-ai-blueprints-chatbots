import React, { useState } from 'react';
import { Send, Mic, TreePine, Plane, Users } from 'lucide-react';
import { ReactTyped } from 'react-typed';
import CoatOfArmsImg from '../assets/images/Coat_of_arms_of_Tanzania.png'
import PawaAiLogo from '../assets/images/apple-touch-icon.png'

const ChatBotPage = () => {
  const [inputValue, setInputValue] = useState("What are the top national parks to visit?");

  const handleSend = () => {
    console.log('Sending message:', inputValue);
    // Handle message sending logic here
  };

  const handleQuestionClick = (question) => {
    setInputValue(question);
  };

  const questions = [
    {
      category: "Wildlife & Parks",
      icon: TreePine,
      color: "text-orange-500",
      questions: [
        "How much is the Ngorongoro entry fee?",
        "Best time for a safari in Tanzania?"
      ]
    },
    {
      category: "Travel & Permits", 
      icon: Plane,
      color: "text-orange-500",
      questions: [
        "How do I get a Kilimanjaro climbing permit?",
        "Do I need a visa to visit Tanzania?"
      ]
    },
    {
      category: "Culture & Heritage",
      icon: Users,
      color: "text-orange-500", 
      questions: [
        "What are the top cultural sites in Tanzania?",
        "Where can I learn about Maasai traditions?"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center">
              <img src={CoatOfArmsImg} alt="Coat of Arms" className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-800">WIZARA</h1>
              <h2 className="text-lg font-semibold text-gray-800">YA MALIASILI</h2>
              <h3 className="text-lg font-semibold text-gray-800">NA UTALII</h3>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <img src={CoatOfArmsImg} alt="Coat of Arms" className="w-8 h-8" />
              </div>
              <div className="text-sm text-gray-600">
                <div>JAMHURI</div>
                <div>YA MUUNGANO</div>
                <div>WA TANZANIA</div>
              </div>
              <div className="w-px h-12 bg-gray-300"></div>
              <div className="text-sm text-gray-600">
                <div>WIZARA</div>
                <div>YA MALIASILI</div>
                <div>NA UTALII</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-orange-500">
              <img src={PawaAiLogo} alt="Pawa AI Logo" className="w-8 h-8" />
              <span className="font-semibold text-xl">Pawa AI</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Karibu to Tanzania's Tourism Assistant
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Your trusted digital guide to explore Tanzania's wildlife, culture, and travel services.
          </p>
          <p className="text-lg text-gray-500">
            Ask anything—get instant answers.
          </p>
        </div>

        {/* Question Categories */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {questions.map((category, categoryIndex) => {
            const IconComponent = category.icon;
            return (
              <div key={categoryIndex} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                    <IconComponent className={`w-8 h-8 ${category.color}`} />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-6">
                  {category.category}
                </h3>
                <div className="space-y-3">
                  {category.questions.map((question, questionIndex) => (
                    <button
                      key={questionIndex}
                      onClick={() => handleQuestionClick(question)}
                      className="w-full p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg text-left transition-colors duration-200 shadow-sm hover:shadow-md"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-green-600 rounded-2xl p-1">
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
                  className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
};

export default ChatBotPage;