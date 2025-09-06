"use client"

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import PublicStorefrontSidebar from '../../../components/PublicStorefrontSidebar';
import MusicPlayer from '../../../components/MusicPlayer';
import GradientCustomizer from '../../../components/GradientCustomizer';

const API_BASE_URL = 'https://ripple-flask-server.onrender.com';

const PublicStorefront = () => {
  const { userId } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 20,
    hasMore: false,
    hasPrevious: false
  });
  // Change the initial gradientColors state to null
  const [gradientColors, setGradientColors] = useState(null);
  const [localGradientColors, setLocalGradientColors] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [socialLinks, setSocialLinks] = useState([]);
  const [themes, setThemes] = useState([]);
  const [activeTheme, setActiveTheme] = useState(null);
  const [musicWidgets, setMusicWidgets] = useState([]);
  const [activeMusicWidget, setActiveMusicWidget] = useState(null);
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storefrontId, setStorefrontId] = useState(null);

  // Add the handleGradientChange function
  const handleGradientChange = (newGradientColors) => {
    setLocalGradientColors(newGradientColors);
  };

  // Add the renderContent function
  const renderContent = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage 
            userProfile={userProfile} 
            listings={listings} 
            pagination={pagination} 
            onPageChange={setCurrentPage} 
          />
        );
      case 'about':
        return <AboutPage userProfile={userProfile} />;
      case 'portfolio':
        return <PortfolioPage listings={listings} />;
      case 'services':
        return <ServicesPage services={services} />;
      case 'contact':
        return <ContactPage userProfile={userProfile} socialLinks={socialLinks} />;
      default:
        return (
          <HomePage 
            userProfile={userProfile} 
            listings={listings} 
            pagination={pagination} 
            onPageChange={setCurrentPage} 
          />
        );
    }
  };

  useEffect(() => {
    const fetchStorefrontData = async () => {
      try {
        setIsLoading(true);
        let currentStorefrontId = null;
        let themeApplied = false; // Declare themeApplied at the function scope
        
        // Set default gradient colors (fallback)
        const defaultGradient = {
          primary: '#1a1a2e',
          secondary: '#16213e',
          accent: '#39FF14'
        };
        
        // Fetch user profile first to get storefront_id
        const profileResponse = await fetch(`${API_BASE_URL}/storefronts/profile/${userId}`);
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          console.log("This is my profile data: ", profileData)
          if (profileData) {
            setUserProfile({
              name: profileData.profile.name,
              title: profileData.profile.title,
              bio: profileData.profile.bio,
              avatar: profileData.profile.avatar,
              coverImage: profileData.profile.cover_image,
              location: profileData.profile.location,
              email: profileData.profile.email,
              phone: profileData.profile.phone,
              joinedDate: profileData.profile.joined_date ? new Date(profileData.profile.joined_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'July 2025',
              totalSales: profileData.profile.total_sales || 0,
              rating: parseFloat(profileData.profile.rating) || 0,
              followers: profileData.profile.followers || 0
            });
            
            // Store storefront_id for immediate use
            if (profileData.profile.storefront_id) {
              currentStorefrontId = profileData.profile.storefront_id;
              setStorefrontId(currentStorefrontId);
            }
          }
        }

        // Fetch services using the existing endpoint
        const servicesResponse = await fetch(`${API_BASE_URL}/storefronts/services/${userId}`);
        if (servicesResponse.ok) {
          const servicesData = await servicesResponse.json();
          if (servicesData) {
            setServices(servicesData.services || []);
          }
        }

        // Fetch social links using the new endpoint
        if (currentStorefrontId) {
          const socialResponse = await fetch(`${API_BASE_URL}/storefronts/social-links/${currentStorefrontId}`);
          if (socialResponse.ok) {
            const socialData = await socialResponse.json();
            if (socialData) {
              setSocialLinks(socialData.social_links || []);
            }
          }
        }

        // Fetch all themes using the new endpoint
if (currentStorefrontId) {
  const themesResponse = await fetch(`${API_BASE_URL}/storefronts/themes/${currentStorefrontId}`);
  if (themesResponse.ok) {
    const themesData = await themesResponse.json();
    if (themesData) {
      setThemes(themesData.themes || []);

      // Find and set active theme
      const activeThemeData = themesData.themes?.find(theme => theme.is_active === 1);
      console.log('Active theme found:', activeThemeData);

      if (activeThemeData) {
        setActiveTheme(activeThemeData);
        const backendGradient = {
          primary: activeThemeData.primary_color || defaultGradient.primary,
          secondary: activeThemeData.secondary_color || defaultGradient.secondary,
          accent: activeThemeData.accent_color || defaultGradient.accent
        };
        console.log('Setting gradient colors:', backendGradient);
        setGradientColors(backendGradient);
        themeApplied = true;
      } else {
        console.log('No active theme found, using default');
        setGradientColors(defaultGradient);
      }
    }
  }
} else {
  // Fallback to old endpoint, applying same logic as above
  const themeResponse = await fetch(`${API_BASE_URL}/storefronts/themes/${userId}`);
  if (themeResponse.ok) {
    const themeData = await themeResponse.json();
    console.log("This is theme data:", themeData);

    const themesArray = Array.isArray(themeData.themes)
      ? themeData.themes
      : themeData.themes
      ? [themeData.themes] // wrap in array if it's a single object
      : [];

    setThemes(themesArray);

    const activeThemeData = themesArray.find(theme => theme.is_active === 1) || themeData.theme;

    if (activeThemeData) {
      setActiveTheme(activeThemeData);
      const backendGradient = {
        primary: activeThemeData.primary_color || defaultGradient.primary,
        secondary: activeThemeData.secondary_color || defaultGradient.secondary,
        accent: activeThemeData.accent_color || defaultGradient.accent
      };
      setGradientColors(backendGradient);
      themeApplied = true;
    } else {
      console.log('No active theme found, using default');
      setGradientColors(defaultGradient);
    }
  }
}

        
        // If no theme was applied from backend, use default
        if (!themeApplied) {
          setGradientColors(defaultGradient);
        }

        // Fetch music widgets using the new endpoint
        if (currentStorefrontId) {
          const musicResponse = await fetch(`${API_BASE_URL}/storefronts/music-widgets/${currentStorefrontId}`);
          if (musicResponse.ok) {
            const musicData = await musicResponse.json();
            if (musicData) {
              setMusicWidgets(musicData.music_widgets || []);
              
              // Find and set active music widget - handle integer is_active values
              const activeMusicData = musicData.music_widgets?.find(widget => widget.is_active === 1);
              if (activeMusicData) {
                setActiveMusicWidget(activeMusicData);
              }
            }
          }
        }

        // Fetch listings
        const listingsResponse = await fetch(`${API_BASE_URL}/storefront/listings?user_id=${userId}`);
        if (listingsResponse.ok) {
          const listingsData = await listingsResponse.json();
          if (listingsData.listings) {
            setListings(listingsData.listings);
            setPagination(listingsData.pagination);
          }
        }
        
      } catch (error) {
        console.error('Error fetching storefront data:', error);
        // Set default gradient on error
        setGradientColors({
          primary: '#1a1a2e',
          secondary: '#16213e',
          accent: '#39FF14'
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchStorefrontData();
    }
  }, [userId]);

  // Update the gradientStyle to handle null gradientColors
  const gradientStyle = {
    background: gradientColors ? 
      `linear-gradient(135deg, ${(localGradientColors || gradientColors).primary} 0%, ${(localGradientColors || gradientColors).secondary} 50%, ${(localGradientColors || gradientColors).primary} 100%)` :
      'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)', // fallback
  };

  // Update the loading condition to also check for gradientColors
  if (isLoading || !gradientColors) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)'
      }}>
        <div className="glass-effect p-8 rounded-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#39FF14] mx-auto"></div>
          <p className="text-white mt-4 text-center">Loading storefront...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={gradientStyle}>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-999999 glass-effect p-3 rounded-full text-white hover:text-[#39FF14] transition-all duration-300"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <PublicStorefrontSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        userProfile={userProfile}
      />

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-80' : 'lg:ml-20'} min-h-screen`}>
        {/* Header */}
        <header className="glass-effect-light p-6 m-4 rounded-2xl pt-20 lg:pt-0" style={{ position: 'relative',zIndex: 99999999 }}>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white font-[var(--font-space-grotesk)]">
                {userProfile?.name}'s Storefront
              </h1>
              <p className="text-gray-300 mt-1">{userProfile?.title}</p>
            </div>
            <div className="flex items-center gap-4" style={{ position: 'relative', zIndex: 999999 }}>
              <GradientCustomizer
                gradientColors={gradientColors}
                isReadOnly={false}
                userId={userId}
                onGradientChange={handleGradientChange}
              />
              <MusicPlayer 
                userId={userId}
                isReadOnly={true}
                activeMusicWidget={activeMusicWidget}
                musicWidgets={musicWidgets}
              />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4" style={{ position: 'relative', zIndex: 0 }}>
          {renderContent()}
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

// Home Page Component
const HomePage = ({ userProfile, listings, pagination, onPageChange }) => {
  return (
    <div className="space-y-6 z-0">
      {/* Hero Section */}
      <div className="glass-effect p-8 rounded-2xl text-center">
        <div className="relative w-32 h-32 mx-auto mb-6">
          <img
            src={userProfile?.avatar}
            alt={userProfile?.name}
            className="w-full h-full rounded-full object-contain border-4 border-[#39FF14]"
          />
          <div className="absolute -bottom-2 -right-2 bg-[#39FF14] text-black px-3 py-1 rounded-full text-sm font-bold">
            ⭐ {userProfile?.rating}
          </div>
        </div>
        <h2 className="text-4xl font-bold text-white mb-2 font-[var(--font-space-grotesk)]">
          Welcome to {userProfile?.name}'s Store
        </h2>
        <p className="text-gray-300 text-lg mb-6">{userProfile?.bio}</p>
        <div className="flex justify-center gap-8 text-center">
          <div>
            <div className="text-2xl font-bold text-[#39FF14]">{userProfile?.totalSales}</div>
            <div className="text-gray-400 text-sm">Total Sales</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#39FF14]">{userProfile?.followers}</div>
            <div className="text-gray-400 text-sm">Followers</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#39FF14]">{userProfile?.rating}/5</div>
            <div className="text-gray-400 text-sm">Rating</div>
          </div>
        </div>
      </div>

      {/* Featured Listings */}
      <div className="glass-effect p-6 rounded-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white font-[var(--font-space-grotesk)]">Featured Items</h3>
          {pagination && (
            <div className="text-gray-300 text-sm">
              Showing {pagination.total} items
            </div>
          )}
        </div>
        
        {/* Loading State */}
        {listings.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((index) => (
              <div key={index} className="glass-effect-light p-4 rounded-xl animate-pulse">
                <div className="w-full h-48 bg-gray-600 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-600 rounded mb-2"></div>
                <div className="h-3 bg-gray-600 rounded mb-2 w-2/3"></div>
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-600 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-600 rounded w-1/4"></div>
                </div>
                <div className="w-full h-8 bg-gray-600 rounded-lg mt-4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div key={listing.id} className="glass-effect-light p-4 rounded-xl hover:scale-105 transition-all duration-300">
                <img
                  src={listing.images && listing.images.length > 0 ? listing.images[0].trim() : '/logo.jpg'}
                  alt={listing.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                  onError={(e) => {
                    e.target.src = '/logo.jpg';
                  }}
                />
                <h4 className="text-white font-semibold mb-2">{listing.title}</h4>
                <p className="text-gray-400 text-sm mb-2 capitalize">{listing.category}</p>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#39FF14] font-bold text-lg">${listing.price}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400">👁️</span>
                    <span className="text-gray-300 text-sm">{listing.views}</span>
                  </div>
                </div>
                {listing.is_auction ? (
                  <div className="mb-2">
                    <span className="text-orange-400 text-sm font-medium">🔥 Auction</span>
                    {listing.current_bid && (
                      <div className="text-gray-300 text-sm">Current Bid: ${listing.current_bid}</div>
                    )}
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-1 mb-3">
                  {listing.tags && listing.tags.slice(0, 2).map((tag, index) => (
                    <span key={index} className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
                <button className="w-full bg-[#39FF14] text-black py-2 rounded-lg font-semibold hover:bg-[#2dd10f] transition-colors duration-300">
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevious}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                pagination.hasPrevious
                  ? 'glass-effect-light text-white hover:text-[#39FF14] cursor-pointer'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              Previous
            </button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`w-10 h-10 rounded-lg font-medium transition-all duration-300 ${
                    page === pagination.currentPage
                      ? 'bg-[#39FF14] text-black'
                      : 'glass-effect-light text-white hover:text-[#39FF14]'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasMore}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                pagination.hasMore
                  ? 'glass-effect-light text-white hover:text-[#39FF14] cursor-pointer'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// About Page Component
const AboutPage = ({ userProfile }) => {
  return (
    <div className="space-y-6">
      {/* About Hero */}
      <div className="glass-effect p-8 rounded-2xl">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-4xl font-bold text-white mb-4 font-[var(--font-space-grotesk)]">About Me</h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              {userProfile?.bio} I've been creating digital experiences for over 8 years, 
              specializing in innovative solutions that bridge the gap between technology and human connection.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-[#39FF14]">📍</span>
                <span className="text-white">{userProfile?.location}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#39FF14]">📅</span>
                <span className="text-white">Member since {userProfile?.joinedDate}</span>
              </div>
              {/* <div className="flex items-center gap-3">
                <span className="text-[#39FF14]">🏆</span>
                <span className="text-white">Top Rated Seller</span>
              </div> */}
            </div>
          </div>
          <div className="relative">
            <img
              src={userProfile?.coverImage}
              alt="About cover"
              className="w-full object-contain rounded-xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl"></div>
          </div>
        </div>
      </div>

      {/* Skills & Expertise */}
      <div className="glass-effect p-6 rounded-2xl">
        <h3 className="text-2xl font-bold text-white mb-6 font-[var(--font-space-grotesk)]">Skills & Expertise</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Web Development', 'Digital Art', 'UI/UX Design', 'Photography', 'Blockchain', 'NFTs', 'E-commerce', 'Consulting'].map((skill) => (
            <div key={skill} className="glass-effect-light p-3 rounded-lg text-center">
              <span className="text-white font-medium">{skill}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Journey Timeline */}
      {/* <div className="glass-effect p-6 rounded-2xl">
        <h3 className="text-2xl font-bold text-white mb-6 font-[var(--font-space-grotesk)]">My Journey</h3>
        <div className="space-y-6">
          {[
            { year: '2016', title: 'Started Freelancing', desc: 'Began my journey as a freelance web developer' },
            { year: '2019', title: 'First Digital Art Sale', desc: 'Sold my first digital artwork for $500' },
            { year: '2021', title: 'Entered NFT Space', desc: 'Created and sold my first NFT collection' },
            { year: '2024', title: 'Joined RippleBids', desc: 'Started selling on the RippleBids marketplace' }
          ].map((milestone, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-[#39FF14] rounded-full flex items-center justify-center text-black font-bold">
                {milestone.year.slice(-2)}
              </div>
              <div>
                <h4 className="text-white font-semibold">{milestone.title}</h4>
                <p className="text-gray-400">{milestone.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
};

// Portfolio Page Component
const PortfolioPage = ({ listings }) => {
  const [filter, setFilter] = useState('all');
  const categories = ['all', 'Digital Art', 'Services', 'Photography'];

  const filteredListings = filter === 'all' 
    ? listings 
    : listings.filter(listing => listing.category === filter);

  return (
    <div className="space-y-6">
      <div className="glass-effect p-6 rounded-2xl">
        <h2 className="text-3xl font-bold text-white mb-6 font-[var(--font-space-grotesk)]">Portfolio</h2>
        
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                filter === category
                  ? 'bg-[#39FF14] text-black'
                  : 'glass-effect-light text-white hover:text-[#39FF14]'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Portfolio Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((item) => (
            <div key={item.id} className="glass-effect-light p-4 rounded-xl hover:scale-105 transition-all duration-300">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-48 object-contain rounded-lg mb-4"
              />
              <h4 className="text-white font-semibold mb-2">{item.title}</h4>
              <p className="text-gray-400 text-sm mb-2">{item.category}</p>
              <div className="flex justify-between items-center">
                <span className="text-[#39FF14] font-bold text-lg">${item.price}</span>
                <span className="text-gray-300 text-sm">{item.sales} sold</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Services Page Component (Updated to use props)
const ServicesPage = ({ services }) => {
  // Use fallback services if none provided
  const displayServices = services && services.length > 0 ? services : [];
  console.log("Display services: ", displayServices)

  return (
    <div className="space-y-6">
      <div className="glass-effect p-6 rounded-2xl">
        <h2 className="text-3xl font-bold text-white mb-6 font-[var(--font-space-grotesk)]">Services</h2>
        {displayServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayServices.map((service, index) => (
              <div key={index} className="glass-effect-light p-6 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-3">{service?.title || 'Service Title'}</h3>
                <p className="text-gray-300 mb-4">{service?.description || 'Service description'}</p>
                <div className="text-[#39FF14] font-bold text-lg mb-4">$ {service?.starting_price || 'Contact for pricing'}</div>
                <ul className="space-y-2 mb-6">
                  {service?.features && Array.isArray(service.features) ? service.features.map((feature, idx) => (
                    <li key={idx} className="text-gray-300 flex items-center gap-2">
                      <span className="text-[#39FF14]">✓</span>
                      {feature}
                    </li>
                  )) : (
                    <li className="text-gray-400 italic">No features listed</li>
                  )}
                </ul>
                <button className="w-full bg-[#39FF14] text-black py-2 rounded-lg font-semibold hover:bg-[#2dd10f] transition-colors duration-300">
                  Get Quote
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">No services available</div>
            <p className="text-gray-500">Services will appear here once they are added to your storefront.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Contact Page Component (Updated to use social links and remove form submission)
const ContactPage = ({ userProfile, socialLinks }) => {
    const getSocialIcon = (platform) => {
  const platformLower = platform.toLowerCase();
  
  switch (platformLower) {
    case 'twitter':
    case 'x':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      );
    case 'instagram':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      );
    case 'linkedin':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      );
    case 'github':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      );
    case 'youtube':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      );
    case 'tiktok':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
        </svg>
      );
    case 'facebook':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      );
    case 'discord':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0190 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M13.372 2.094a10.003 10.003 0 0 0-6.744 0C4.716 2.64 3.501 3.916 3.501 5.4v13.2c0 1.484 1.215 2.76 3.127 3.306a10.003 10.003 0 0 0 6.744 0c1.912-.546 3.127-1.822 3.127-3.306V5.4c0-1.484-1.215-2.76-3.127-3.306zM12 6.75a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-1.5 6a1.5 1.5 0 1 1 3 0v3a1.5 1.5 0 1 1-3 0v-3z"/>
        </svg>
      );
  }
};
  const defaultSocialLinks = [
    { platform: 'Twitter', url: '#' },
    { platform: 'Instagram', url: '#' },
    { platform: 'LinkedIn', url: '#' },
    { platform: 'GitHub', url: '#' }
  ];

  const displaySocialLinks = socialLinks && socialLinks.length > 0 ? socialLinks : defaultSocialLinks;

  return (
    <div className="space-y-6">
      <div className="glass-effect p-6 rounded-2xl">
        <h2 className="text-3xl font-bold text-white mb-6 font-[var(--font-space-grotesk)]">Get In Touch</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-[#39FF14]">📧</span>
                <span className="text-white">{userProfile?.email || 'contact@example.com'}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#39FF14]">📱</span>
                <span className="text-white">{userProfile?.phone || '+1 (555) 123-4567'}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#39FF14]">📍</span>
                <span className="text-white">{userProfile?.location}</span>
              </div>
            </div>
            
            
          </div>
          
          <div className=''>
  <h3 className="text-xl font-bold text-white mb-4">Social Media</h3>
  <div className="flex gap-4 flex-wrap">
    {displaySocialLinks.map((link, index) => (
      <a 
        key={index} 
        href={link.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="glass-effect-light p-3 rounded-lg text-white hover:text-[#39FF14] transition-colors duration-300 flex items-center gap-2"
      >
        {getSocialIcon(link.platform)}
        <span>{link.platform}</span>
      </a>
    ))}
  </div>
          </div>
          {/* <div>
            <h3 className="text-xl font-bold text-white mb-4">Send a Message</h3>
            <div className="glass-effect-light p-6 rounded-xl text-center">
              <p className="text-gray-300 mb-4">Contact form is available for the storefront owner.</p>
              <p className="text-sm text-gray-400">Please use the contact information on the left to reach out directly.</p>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default PublicStorefront;



