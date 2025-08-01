import React from 'react';
import { Menu, MessageCircle } from 'lucide-react';
import { NavItem } from './types';
import Link from 'next/link';

interface TopNavbarProps {
  activeTab: string;
  navItems: NavItem[];
  onMenuClick: () => void;
}

const TopNavbar: React.FC<TopNavbarProps> = ({
  activeTab,
  navItems,
  onMenuClick
}) => {
  const currentItem = navItems.find(item => item.id === activeTab);

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="text-gray-500 hover:text-[#022e79] p-2 lg:hidden"
        >
          <Menu size={20} />
        </button>

        {/* Current Tab Info */}
        <div className="flex items-center space-x-3 ml-3">
          <div className="text-[#022e79]">
            {currentItem?.icon}
          </div>
          <div>
            <h2 className="text-[#022e79] font-semibold font-avenir">
              {currentItem?.title}
            </h2>
            <p className="text-gray-600 text-sm hidden sm:block">
              {currentItem?.description}
            </p>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2">
          <Link 
            href="/chat"
            className="hidden md:flex items-center space-x-2 px-3 py-3 bg-[#022e79] text-white rounded-md hover:bg-[#022e79]/90 transition-colors duration-200 font-medium text-sm"
          >
            <MessageCircle size={16} />
            <span>Continue to Chat</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default TopNavbar; 