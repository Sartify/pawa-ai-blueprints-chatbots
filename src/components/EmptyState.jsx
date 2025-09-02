import React from 'react';
import CoatOfArmsImg from '../assets/images/Coat_of_arms_of_Tanzania.png'
import ChatbotHeader from './ChatbotHeader'
import TourismImg from '../assets/tourism.png'
import SafariImg from '../assets/safari.png'
import ProtectImg from '../assets/protect.png'

const EmptyState = ({ onQuestionClick }) => {
  const questions = [
    {
      category: "Wildlife & Parks",
      icon: SafariImg,
      color: "#FFA200",
      questions: [
        "How much is the Ngorongoro entry fee?",
        "Best time for a safari in Tanzania?"
      ]
    },
    {
      category: "Travel & Permits",
      icon: TourismImg,
      color: "#FFA200",
      questions: [
        "How do I get a Kilimanjaro climbing permit?",
        "Do I need a visa to visit Tanzania?"
      ]
    },
    {
      category: "Culture & Heritage",
      icon: ProtectImg,
      color: "#FFA200",
      questions: [
        "What are the top cultural sites in Tanzania?",
        "Where can I learn about Maasai traditions?"
      ]
    }
  ];

  const handleQuestionClick = (question) => {
    // Automatically submit the question instead of just setting it in input
    onQuestionClick(question);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Chatbot Header */}
      <ChatbotHeader />
      
      {/* Main Content - Vertically Centered */}
      <div className="flex-1 flex items-center justify-center p-4 pt-20 pb-24">
        <div className="max-w-6xl mx-auto w-full">
          {/* Empty State Header - Centered */}
          <div className="mb-8">
            <div className="flex justify-center items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-[#019A5A] rounded-lg flex items-center justify-center">
                  <img src={CoatOfArmsImg} alt="Coat of Arms" className="w-8 h-8" />
                </div>
                <div className="text-sm font-bold text-gray-600">
                  <div>JAMHURI</div>
                  <div>YA MUUNGANO</div>
                  <div>WA TANZANIA</div>
                </div>
                <div className="w-1 h-14 bg-[#FFA200]"></div>
                <div className="text-sm font-bold text-gray-600">
                  <div>WIZARA</div>
                  <div>YA MALIASILI</div>
                  <div>NA UTALII</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div>
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Karibu to Tanzania's Tourism Assistant
              </h1>
              <p className="text-md text-gray-600 mb-2">
                Your trusted digital guide to explore Tanzania's wildlife, culture, and travel services. <br/>  Ask anything—get instant answers.
              </p>
            </div>

            {/* Question Categories */}
            <div className="grid md:grid-cols-3 gap-8">
              {questions.map((category, categoryIndex) => {
                return (
                  <div key={categoryIndex} className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center">
                        <img 
                          src={category.icon} 
                          alt={category.category}
                          className="w-8 h-8"
                          style={{
                            filter: 'brightness(0) saturate(100%) invert(67%) sepia(100%) saturate(1000%) hue-rotate(360deg) brightness(1) contrast(1)'
                          }}
                        />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-6" style={{ color: category.color }}>
                      {category.category}
                    </h3>
                    <div className="space-y-3">
                      {category.questions.map((question, questionIndex) => (
                        <button
                          key={questionIndex}
                          onClick={() => handleQuestionClick(question)}
                          className="w-full p-4 bg-[#019A5A] hover:bg-[#018a4f] text-white rounded-lg text-left transition-colors duration-200 shadow-sm hover:shadow-md"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
