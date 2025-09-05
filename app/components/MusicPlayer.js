"use client"

import React, { useState, useEffect, useRef } from 'react';

const API_BASE_URL = 'https://ripple-flask-server.onrender.com';

const MusicPlayer = ({ userId, isReadOnly = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeWidget, setActiveWidget] = useState('spotify');
  const [isPlaying, setIsPlaying] = useState(false);
  const [widgets, setWidgets] = useState({
    spotify: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX0XUsuxWHRQd?utm_source=generator&autoplay=1&theme=0',
    soundcloud: 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/1234567890&color=%2339FF14&auto_play=true&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  
  // Refs for persistent iframes
  const spotifyRef = useRef(null);
  const soundcloudRef = useRef(null);

  useEffect(() => {
    const fetchWidgetSettings = async () => {
      try {
        // Only GET request to fetch widget settings
        const response = await fetch(`${API_BASE_URL}/storefronts_bp/music-widgets/${userId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.widgets) {
            // Add autoplay parameters to fetched widgets
            const updatedWidgets = {
              spotify: data.widgets.spotify ? `${data.widgets.spotify}&autoplay=1&theme=0` : widgets.spotify,
              soundcloud: data.widgets.soundcloud ? `${data.widgets.soundcloud}&auto_play=true` : widgets.soundcloud
            };
            setWidgets(updatedWidgets);
          }
        }
      } catch (error) {
        console.error('Error fetching widget settings:', error);
        // Use default widgets on error
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchWidgetSettings();
    } else {
      setIsLoading(false);
    }
  }, [userId]);

  // Toggle button only controls popup visibility
  const handleToggle = (e) => {
    if (!isOpen) {
      const rect = e.currentTarget.getBoundingClientRect();
      setButtonPosition({
        top: rect.bottom + 8,
        left: rect.right - 320 // 320px is popup width
      });
    }
    setIsOpen(!isOpen);
  };

  const handlePlay = () => {
    setIsPlaying(true);
    // Send play command to active iframe via postMessage
    const activeIframe = activeWidget === 'spotify' ? spotifyRef.current : soundcloudRef.current;
    if (activeIframe && activeIframe.contentWindow) {
      try {
        activeIframe.contentWindow.postMessage({ command: 'play' }, '*');
      } catch (error) {
        console.log('PostMessage not supported for this widget');
      }
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
    // Send pause command to active iframe via postMessage
    const activeIframe = activeWidget === 'spotify' ? spotifyRef.current : soundcloudRef.current;
    if (activeIframe && activeIframe.contentWindow) {
      try {
        activeIframe.contentWindow.postMessage({ command: 'pause' }, '*');
      } catch (error) {
        console.log('PostMessage not supported for this widget');
      }
    }
  };

  // Handle widget switching without stopping playback
  const handleWidgetSwitch = (widget) => {
    // Pause current widget
    const currentIframe = activeWidget === 'spotify' ? spotifyRef.current : soundcloudRef.current;
    if (currentIframe && currentIframe.contentWindow && isPlaying) {
      try {
        currentIframe.contentWindow.postMessage({ command: 'pause' }, '*');
      } catch (error) {
        console.log('PostMessage not supported for current widget');
      }
    }
    
    // Switch to new widget
    setActiveWidget(widget);
    
    // Start new widget if currently playing
    if (isPlaying) {
      setTimeout(() => {
        const newIframe = widget === 'spotify' ? spotifyRef.current : soundcloudRef.current;
        if (newIframe && newIframe.contentWindow) {
          try {
            newIframe.contentWindow.postMessage({ command: 'play' }, '*');
          } catch (error) {
            console.log('PostMessage not supported for new widget');
          }
        }
      }, 100);
    }
  };

  return (
    <div className="relative z-10">
      {/* Persistent Hidden Background Players - Always rendered, never unmount */}
      <div className="hidden">
        {/* Spotify Player - Always present */}
        <iframe
          ref={spotifyRef}
          src={widgets.spotify}
          width="320"
          height="200"
          frameBorder="0"
          allowtransparency="true"
          allow="encrypted-media; autoplay"
          className="rounded-lg"
          style={{ display: 'none' }}
        />
        
        {/* SoundCloud Player - Always present */}
        <iframe
          ref={soundcloudRef}
          src={widgets.soundcloud}
          width="320"
          height="200"
          frameBorder="0"
          className="rounded-lg"
          style={{ display: 'none' }}
        />
      </div>

      {/* Music Player Toggle Button - Only controls popup visibility */}
      <button
        onClick={handleToggle}
        className={`glass-effect p-3 rounded-full text-white hover:text-[#39FF14] transition-all duration-300 hover:scale-110 ${
          isPlaying ? 'ring-2 ring-[#39FF14]/50 animate-pulse' : ''
        }`}
        title="Music Player"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      </button>

      {/* Music Player Popup - Control Panel Only */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="popup-overlay"
            onClick={() => setIsOpen(false)}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.1)'
            }}
          />
          
          {/* Popup Panel */}
          <div 
            className="popup-panel w-80 glass-effect-darker backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden"
            style={{
              top: `${buttonPosition.top}px`,
              left: `${buttonPosition.left}px`
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">Music Player</h3>
              <div className="flex items-center gap-2">
                {/* Play/Pause Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePlay}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      isPlaying ? 'bg-[#39FF14] text-black' : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                    title="Play"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </button>
                  <button
                    onClick={handlePause}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      !isPlaying ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                    title="Pause"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                  </button>
                </div>
                
                {/* Widget Toggle */}
                <div className="flex bg-white/10 rounded-lg p-1">
                  <button
                    onClick={() => handleWidgetSwitch('spotify')}
                    className={`px-2 py-1 rounded text-xs transition-all duration-200 ${
                      activeWidget === 'spotify'
                        ? 'bg-[#1DB954] text-white'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Spotify
                  </button>
                  <button
                    onClick={() => handleWidgetSwitch('soundcloud')}
                    className={`px-2 py-1 rounded text-xs transition-all duration-200 ${
                      activeWidget === 'soundcloud'
                        ? 'bg-[#FF5500] text-white'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    SoundCloud
                  </button>
                </div>
                
                {/* Close button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Widget Content - Visual Control Panel Only */}
            <div className="p-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#39FF14]"></div>
                </div>
              ) : (
                <>
                  {/* Visual representation of current widget */}
                  <div className="bg-white/5 rounded-lg p-4 h-48 flex flex-col items-center justify-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                      activeWidget === 'spotify' ? 'bg-[#1DB954]' : 'bg-[#FF5500]'
                    }`}>
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        {activeWidget === 'spotify' ? (
                          <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.563.387-.857.207-2.348-1.435-5.304-1.76-8.785-.964-.335.077-.67-.133-.746-.469-.077-.335.132-.67.469-.746 3.809-.871 7.077-.496 9.713 1.115.294.18.386.563.206.857zm1.223-2.723c-.226.367-.706.482-1.073.257-2.687-1.652-6.785-2.131-9.965-1.166-.413.125-.849-.106-.973-.52-.125-.413.106-.849.52-.973 3.632-1.102 8.147-.568 11.234 1.328.366.226.481.707.257 1.074zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71c-.493.15-1.016-.128-1.166-.62-.149-.493.129-1.016.621-1.166 3.532-1.073 9.404-.865 13.115 1.338.445.264.590.837.327 1.282-.264.444-.838.590-1.282.326z"/>
                        ) : (
                          <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10S2 17.514 2 12 6.486 2 12 2zm0 18c4.411 0 8-3.589 8-8s-3.589-8-8-8-8 3.589-8 8 3.589 8 8 8zm4-8c0 2.209-1.791 4-4 4s-4-1.791-4-4 1.791-4 4-4 4 1.791 4 4z"/>
                        )}
                      </svg>
                    </div>
                    <h4 className="text-white font-semibold mb-2">
                      {activeWidget === 'spotify' ? 'Spotify' : 'SoundCloud'}
                    </h4>
                    <p className="text-gray-300 text-sm text-center">
                      {isPlaying ? 'Playing in background' : 'Ready to play'}
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        isPlaying ? 'bg-[#39FF14] animate-pulse' : 'bg-gray-500'
                      }`}></div>
                      <span className="text-xs text-gray-400">
                        {isPlaying ? 'Active' : 'Paused'}
                      </span>
                    </div>
                  </div>
                </>
              )}
              
              {/* Read-only indicator */}
              {isReadOnly && (
                <div className="mt-3 p-2 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                  <p className="text-blue-300 text-xs text-center">
                    🔒 Read-only view - Music player settings cannot be modified
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-white/5 border-t border-white/10">
              <p className="text-gray-400 text-xs text-center">
                Powered by {activeWidget === 'spotify' ? 'Spotify' : 'SoundCloud'} • {isPlaying ? 'Playing' : 'Paused'}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MusicPlayer;