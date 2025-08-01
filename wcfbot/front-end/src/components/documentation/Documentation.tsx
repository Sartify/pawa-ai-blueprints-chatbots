"use client";
import React, { useState } from 'react';
import { navItems } from './navData';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import ContentDisplay from './ContentDisplay';

const DocumentationStructure: React.FC = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  const handleMenuClick = () => {
    setSidebarOpen(true);
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={handleSidebarClose}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        navItems={navItems}
        activeTab={activeTab}
        sidebarOpen={sidebarOpen}
        onTabChange={handleTabChange}
        onSidebarClose={handleSidebarClose}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar
          activeTab={activeTab}
          navItems={navItems}
          onMenuClick={handleMenuClick}
        />

        {/* Content Area */}
        <main className="flex-1 flex flex-col bg-white">
          <ContentDisplay activeTab={activeTab} navItems={navItems} />
        </main>
      </div>
    </div>
  );
};

export default DocumentationStructure;