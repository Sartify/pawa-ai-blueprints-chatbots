import React from 'react';
import { Bot, X } from 'lucide-react';
import { NavItem } from './types';

interface SidebarProps {
  navItems: NavItem[];
  activeTab: string;
  sidebarOpen: boolean;
  onTabChange: (tabId: string) => void;
  onSidebarClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  navItems,
  activeTab,
  sidebarOpen,
  onTabChange,
  onSidebarClose
}) => {
  return (
    <div className={`
      fixed lg:static inset-y-0 left-0 z-50
      w-64 bg-white border-r border-gray-200 
      transform transition-transform duration-300 ease-in-out
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      flex flex-col shadow-lg
    `}>
      {/* Sidebar Header */}
      <div className="p-5 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-center align-center gap-2">
          <div className="flex items-center justify-center w-8 h-8">
            <Bot size={20} className="text-[#022e79]" />
          </div>
          <h1 className="text-[#022e79] text-lg font-semibold font-avenir">
            WCF Agent
          </h1>
          <button
            onClick={onSidebarClose}
            className="text-gray-500 hover:text-[#022e79] p-1 lg:hidden flex items-center justify-center w-8 h-8"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 bg-white">
        <div className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                onSidebarClose();
              }}
              className={`
                w-full flex items-center space-x-3 px-3 py-3 rounded-md text-left transition-all duration-200
                ${activeTab === item.id
                  ? 'bg-[#022e79] text-white shadow-md transform scale-105'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-[#022e79] hover:scale-102'
                }
              `}
            >
              <div className="flex-shrink-0">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-medium block truncate">
                  {item.title}
                </span>
                {/* <span className={`text-xs block truncate ${
                  activeTab === item.id ? 'text-white/70' : 'text-gray-500'
                }`}>
                  {item.description}
                </span> */}
              </div>
            </button>
          ))}
        </div>
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 text-center">
          <p className="font-medium text-[#022e79] mb-1">Documentation v2.0</p>
          <p>Built for WCF Agent</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 