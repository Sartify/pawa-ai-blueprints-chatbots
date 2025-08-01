import React from 'react';
import { NavItem } from './types';

interface ContentDisplayProps {
  activeTab: string;
  navItems: NavItem[];
}

const ContentDisplay: React.FC<ContentDisplayProps> = ({ activeTab, navItems }) => {
  const currentItem = navItems.find(item => item.id === activeTab);
  
  if (!currentItem) return null;

  return (
    <div className="flex-1 flex items-center justify-center bg-white">
      <div className="text-center space-y-6 max-w-md">
        {/* Large Icon */}
        <div className="w-24 h-24 bg-[#022e79] rounded-full flex items-center justify-center mx-auto">
          <div className="scale-150 text-white">
            {currentItem.icon}
          </div>
        </div>
        
        {/* Title */}
        <h1 className="text-3xl font-bold text-[#022e79] font-avenir">
          {currentItem.title}
        </h1>
        
        {/* Description */}
        <p className="text-gray-600 text-lg">
          {currentItem.description}
        </p>
        
        {/* Active Tab Indicator */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-gray-700 text-sm">
            Currently viewing: <span className="text-[#022e79] font-semibold">{currentItem.title}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContentDisplay; 