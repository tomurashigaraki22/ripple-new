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
  const [gradientColors, setGradientColors] = useState({
    primary: '#1a1a2e',
    secondary: '#16213e',
    accent: '#39FF14'
  });
  const [localGradientColors, setLocalGradientColors] = useState(null); // For local preview
  const [userProfile, setUserProfile] = useState({
    name: 'Dev Tomiwa',
    title: 'FullStack Web, App and Web3 Developer',
    bio: 'Passionate about creating innovative digital experiences and building meaningful connections through technology.',
    avatar: '/logo.jpg',
    coverImage: '/logo.jpg',
    location: 'Port Harcourt, Nigeria',
    joinedDate: 'July 2025',
    totalSales: 156,
    rating: 4.9,
    followers: 2847
  });
  const [services, setServices] = useState([]);
  const [socialLinks, setSocialLinks] = useState([]);
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStorefrontData = async () => {
      try {
        // Fetch user profile
        const profileResponse = await fetch(`${API_BASE_URL}/storefronts_bp/profile/${userId}`);
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          if (profileData.success) {
            setUserProfile(profileData.profile);
          }
        }

        // Fetch services
        const servicesResponse = await fetch(`${API_BASE_URL}/storefronts_bp/services/${userId}`);
        if (servicesResponse.ok) {
          const servicesData = await servicesResponse.json();
          if (servicesData.success) {
            setServices(servicesData.services);
          }
        }

        // Fetch social links
        const socialResponse = await fetch(`${API_BASE_URL}/storefronts_bp/social/${userId}`);
        if (socialResponse.ok) {
          const socialData = await socialResponse.json();
          if (socialData.success) {
            setSocialLinks(socialData.social_links);
          }
        }

        // Fetch active theme
        const themeResponse = await fetch(`${API_BASE_URL}/storefronts_bp/themes/${userId}`);
        if (themeResponse.ok) {
          const themeData = await themeResponse.json();
          if (themeData.success && themeData.theme) {
            setGradientColors({
              primary: themeData.theme.primary_color,
              secondary: themeData.theme.secondary_color,
              accent: themeData.theme.accent_color
            });
          }
        }

        // Demo listings (client-side dummy data)
        const demoListings = [
          {
            id: 1,
            title: 'Premium Digital Art Collection',
            price: 299.99,
            image: '/logo.jpg',
            category: 'Digital Art',
            rating: 4.8,
            sales: 45
          },
          {
            id: 2,
            title: 'Custom Web Development Service',
            price: 1299.99,
            image: '/logo.jpg',
            category: 'Services',
            rating: 5.0,
            sales: 23
          },
          {
            id: 3,
            title: 'Photography Preset Pack',
            price: 49.99,
            image: '/logo.jpg',
            category: 'Photography',
            rating: 4.7,
            sales: 89
          }
        ];
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching storefront data:', error);
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchStorefrontData();
    }
  }, [userId]);

  const gradientStyle = {
    background: `linear-gradient(135deg, ${(localGradientColors || gradientColors).primary} 0%, ${(localGradientColors || gradientColors).secondary} 50%, ${(localGradientColors || gradientColors).primary} 100%)`,
  };

    const handleGradientChange = (newGradient) => {
    setLocalGradientColors(newGradient);
  };

  useEffect(() => {
    const fetchListings = async () => {
        try {
            // Extract userId from pathname
            const pathSegments = window.location.pathname.split('/');
            const userId = pathSegments[pathSegments.length - 1];
            
            if (!userId) {
                console.error('User ID not found in pathname');
                return;
            }
            
            const response = await fetch(`${API_BASE_URL}/storefront/listings?user_id=${userId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Handle the response data
            if (data.listings) {
                setListings(data.listings);
                setPagination(data.pagination);
            }
            
        } catch (error) {
            console.error("Error fetching listings:", error);
        }
    };
    
    fetchListings();
}, [])

  const renderContent = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage userProfile={userProfile} listings={listings} />;
      case 'about':
        return <AboutPage userProfile={userProfile} />;
      case 'portfolio':
        return <PortfolioPage listings={listings} />;
      case 'services':
        return <ServicesPage services={services} />;
      case 'contact':
        return <ContactPage userProfile={userProfile} socialLinks={socialLinks} />;
      default:
        return <HomePage userProfile={userProfile} listings={listings} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={gradientStyle}>
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
        <header className="glass-effect-light p-6 m-4 rounded-2xl" style={{ position: 'relative' }}>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white font-[var(--font-space-grotesk)]">
                {userProfile.name}'s Storefront
              </h1>
              <p className="text-gray-300 mt-1">{userProfile.title}</p>
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
              />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4" style={{ position: 'relative', zIndex: 1 }}>
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
            src={userProfile.avatar}
            alt={userProfile.name}
            className="w-full h-full rounded-full object-contain border-4 border-[#39FF14]"
          />
          <div className="absolute -bottom-2 -right-2 bg-[#39FF14] text-black px-3 py-1 rounded-full text-sm font-bold">
            ⭐ {userProfile.rating}
          </div>
        </div>
        <h2 className="text-4xl font-bold text-white mb-2 font-[var(--font-space-grotesk)]">
          Welcome to {userProfile.name}'s Store
        </h2>
        <p className="text-gray-300 text-lg mb-6">{userProfile.bio}</p>
        <div className="flex justify-center gap-8 text-center">
          <div>
            <div className="text-2xl font-bold text-[#39FF14]">{userProfile.totalSales}</div>
            <div className="text-gray-400 text-sm">Total Sales</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#39FF14]">{userProfile.followers}</div>
            <div className="text-gray-400 text-sm">Followers</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#39FF14]">{userProfile.rating}/5</div>
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
              {userProfile.bio} I've been creating digital experiences for over 8 years, 
              specializing in innovative solutions that bridge the gap between technology and human connection.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-[#39FF14]">📍</span>
                <span className="text-white">{userProfile.location}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#39FF14]">📅</span>
                <span className="text-white">Member since {userProfile.joinedDate}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#39FF14]">🏆</span>
                <span className="text-white">Top Rated Seller</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <img
              src={userProfile.coverImage}
              alt="About cover"
              className="w-full h-64 object-contain rounded-full"
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
      <div className="glass-effect p-6 rounded-2xl">
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
      </div>
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
  const defaultServices = [
    {
      title: 'Custom Web Development',
      description: 'Full-stack web applications built with modern technologies',
      price: 'Starting at $1,299',
      features: ['Responsive Design', 'SEO Optimized', 'Fast Loading', 'Mobile First']
    },
    {
      title: 'Digital Art Commission',
      description: 'Unique digital artwork tailored to your vision',
      price: 'Starting at $299',
      features: ['High Resolution', 'Multiple Formats', 'Commercial License', 'Revisions Included']
    },
    {
      title: 'NFT Collection Creation',
      description: 'Complete NFT collection with metadata and smart contracts',
      price: 'Starting at $2,499',
      features: ['Smart Contract', 'Metadata Generation', 'Rarity System', 'Marketplace Ready']
    }
  ];

  const displayServices = services && services.length > 0 ? services : defaultServices;

  return (
    <div className="space-y-6">
      <div className="glass-effect p-6 rounded-2xl">
        <h2 className="text-3xl font-bold text-white mb-6 font-[var(--font-space-grotesk)]">Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayServices.map((service, index) => (
            <div key={index} className="glass-effect-light p-6 rounded-xl">
              <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
              <p className="text-gray-300 mb-4">{service.description}</p>
              <div className="text-[#39FF14] font-bold text-lg mb-4">{service.price}</div>
              <ul className="space-y-2 mb-6">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="text-gray-300 flex items-center gap-2">
                    <span className="text-[#39FF14]">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="w-full bg-[#39FF14] text-black py-2 rounded-lg font-semibold hover:bg-[#2dd10f] transition-colors duration-300">
                Get Quote
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Contact Page Component (Updated to use social links and remove form submission)
const ContactPage = ({ userProfile, socialLinks }) => {
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
                <span className="text-white">{userProfile.email || 'contact@example.com'}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#39FF14]">📱</span>
                <span className="text-white">{userProfile.phone || '+1 (555) 123-4567'}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#39FF14]">📍</span>
                <span className="text-white">{userProfile.location}</span>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-4 mt-8">Social Media</h3>
            <div className="flex gap-4 flex-wrap">
              {displaySocialLinks.map((link, index) => (
                <a 
                  key={index} 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="glass-effect-light p-3 rounded-lg text-white hover:text-[#39FF14] transition-colors duration-300"
                >
                  {link.platform}
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Send a Message</h3>
            <div className="glass-effect-light p-6 rounded-xl text-center">
              <p className="text-gray-300 mb-4">Contact form is available for the storefront owner.</p>
              <p className="text-sm text-gray-400">Please use the contact information on the left to reach out directly.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicStorefront;