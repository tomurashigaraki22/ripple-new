"use client"

import React from 'react';

const PublicStorefrontSidebar = ({ isOpen, onClose, currentPage, setCurrentPage, userProfile }) => {
  const menuItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'about', label: 'About', icon: '👤' },
    { id: 'portfolio', label: 'Portfolio', icon: '💼' },
    { id: 'services', label: 'Services', icon: '⚡' },
    { id: 'contact', label: 'Contact', icon: '📧' }
  ];

  return (
    <>
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full z-99999999 transition-all duration-300 ${
        isOpen ? 'w-80' : 'w-20 lg:w-20'
      } ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-full glass-effect-darker backdrop-blur-xl border-r border-white/10">
          {/* Profile Section */}
          <div className={`p-4 border-b border-white/10 transition-all duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0 lg:opacity-100'
          }`}>
            {isOpen ? (
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-3">
                  <img
                    src={userProfile.avatar}
                    alt={userProfile.name}
                    className="w-full h-full rounded-full object-cover border-2 border-[#39FF14]"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#39FF14] rounded-full border-2 border-black"></div>
                </div>
                <h3 className="text-white font-semibold text-sm truncate">{userProfile.name}</h3>
                <p className="text-gray-400 text-xs truncate">{userProfile.title}</p>
                <div className="flex justify-center items-center gap-2 mt-2">
                  <span className="text-yellow-400 text-xs">⭐</span>
                  <span className="text-white text-xs">{userProfile.rating}</span>
                  <span className="text-gray-400 text-xs">({userProfile.totalSales} sales)</span>
                </div>
              </div>
            ) : (
              <div className="hidden lg:flex justify-center">
                <img
                  src={userProfile.avatar}
                  alt={userProfile.name}
                  className="w-10 h-10 rounded-full object-contain border-2 border-[#39FF14]"
                />
              </div>
            )}
          </div>

          {/* Navigation Menu */}
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group ${
                  currentPage === item.id
                    ? 'bg-[#39FF14] text-black'
                    : 'text-white hover:bg-white/10 hover:text-[#39FF14]'
                }`}
              >
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                <span className={`font-medium transition-all duration-300 ${
                  isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 lg:opacity-100 lg:translate-x-0'
                } ${!isOpen ? 'lg:hidden' : ''}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </nav>

          {/* Stats Section */}
          {isOpen && (
            <div className="absolute bottom-4 left-4 right-4">
              <div className="glass-effect-light p-4 rounded-xl">
                <h4 className="text-white font-semibold text-sm mb-3">Quick Stats</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Total Sales</span>
                    <span className="text-[#39FF14] font-semibold">{userProfile.totalSales}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Followers</span>
                    <span className="text-[#39FF14] font-semibold">{userProfile.followers}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Rating</span>
                    <span className="text-[#39FF14] font-semibold">{userProfile.rating}/5</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Collapse Button */}
          <button
            onClick={() => onClose()}
            className="hidden lg:block absolute top-4 right-4 text-white hover:text-[#39FF14] transition-colors duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default PublicStorefrontSidebar;