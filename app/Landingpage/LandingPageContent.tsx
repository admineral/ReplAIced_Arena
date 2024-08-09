'use client'

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import LandingPageNavbar from './LandingPageNavbar';
import Link from 'next/link';

interface Feature {
  title: string;
  icon: string;
  description: string;
  link?: string;
}

export default function LandingPageContent() {
  const [isVideoReady, setIsVideoReady] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeSection, setActiveSection] = useState<string>('home');
  const sectionsRef = useRef<{ [key: string]: HTMLElement | null }>({});
  const router = useRouter();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setIsVideoReady(true);
      video.play().catch(error => console.error('Auto-play failed:', error));
    };

    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      for (const section in sectionsRef.current) {
        const element = sectionsRef.current[section];
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    sectionsRef.current['home'] = document.getElementById('home');
    sectionsRef.current['about'] = document.getElementById('about');
    sectionsRef.current['features'] = document.getElementById('features');
    sectionsRef.current['join'] = document.getElementById('join');
  }, []);

  const handleGetStarted = () => {
    router.push('/Arena');
  };

  const scrollToSection = (sectionId: string) => {
    const section = sectionsRef.current[sectionId];
    if (section) {
      const navbarHeight = 64;
      const sectionTop = section.offsetTop - navbarHeight;
      window.scrollTo({
        top: sectionTop,
        behavior: 'smooth'
      });
      setActiveSection(sectionId);
    }
  };

  const features: Feature[] = [
    { 
      title: "Dynamic Challenge Map", 
      icon: "🗺️", 
      description: "Navigate through a landscape of AI models with varying difficulty levels.",
      link: "/Arena"
    },
    { 
      title: "Competitive Gameplay", 
      icon: "🏆", 
      description: "Launch attacks, bypass defenses, and earn points for successful breaches." 
    },
    { 
      title: "Advanced Security Tools", 
      icon: "🛡️", 
      description: "Utilize cutting-edge features like Similarity Search filters to defend against threats." 
    },
    { 
      title: "Global Leaderboard", 
      icon: "📊", 
      description: "Compete on a visible rank list that highlights top performers.",
      link: "/GlobalRank"
    }
  ];

  const handleFeatureClick = (link: string) => {
    router.push(link);
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-black">
      {/* Video Background */}
      <video 
        ref={videoRef}
        autoPlay 
        loop 
        muted 
        playsInline
        className={`fixed z-0 w-auto min-w-full min-h-full max-w-none object-cover transition-opacity duration-1000 ${isVideoReady ? 'opacity-100' : 'opacity-0'}`}
      >
        <source src="/gen3.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen text-white">
        {/* Navigation */}
        <LandingPageNavbar activeSection={activeSection} scrollToSection={scrollToSection} />

        {/* Home Section */}
        <section id="home" className="flex flex-col items-start justify-center min-h-screen px-4 sm:px-8 md:px-16 lg:px-24 bg-gradient-to-r from-black via-black/70 to-transparent">
          <div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-2">
              Repl<span className="text-blue-500">AI</span>ced
            </h1>
            <p className="text-xl sm:text-2xl font-light">AI Security Challenge Arena</p>
          </div>
          <div className="max-w-md mt-8">
            <p className="text-lg sm:text-xl mb-8">
              Challenge AI models. Expose vulnerabilities. Redefine security.
            </p>
            <button 
              onClick={handleGetStarted}
              className="px-6 sm:px-8 py-3 bg-blue-600 text-white text-base sm:text-lg font-semibold rounded-full hover:bg-blue-700 transition duration-300 transform hover:scale-105 shadow-lg"
            >
              Enter the Arena
            </button>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-24 bg-gradient-to-b from-black via-gray-900 to-blue-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-blue-400">Redefining AI Security</h2>
                <p className="text-base sm:text-xl text-gray-300 leading-relaxed">
                  In the rapidly evolving AI landscape, ReplAIced emerges as a cutting-edge platform designed to address critical security challenges. We've created an innovative arena where AI models become strategic assets in a competitive environment.
                </p>
              </div>
              <div className="md:w-1/2 flex justify-center">
                <div className="w-48 h-48 sm:w-64 sm:h-64 bg-blue-500 bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-4xl sm:text-6xl">🔐</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-gradient-to-b from-blue-900 via-gray-900 to-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-blue-400 mb-12">Key Features</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className={`bg-gray-800 bg-opacity-50 p-6 rounded-xl backdrop-filter backdrop-blur-lg transform transition duration-500 hover:scale-105 ${feature.link ? 'cursor-pointer' : ''}`}
                  onClick={() => feature.link && handleFeatureClick(feature.link)}
                >
                  <div className="text-3xl sm:text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl sm:text-2xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-gray-300">{feature.description}</p>
                  {feature.link && (
                    <Link href={feature.link} passHref>
                      <span className="mt-4 inline-block text-blue-400 hover:text-blue-300">
                        Learn More →
                      </span>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Join Section */}
        <section id="join" className="py-24 bg-gradient-to-b from-black to-blue-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-blue-400">Join the AI Security Revolution</h2>
            <p className="text-base sm:text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Be part of a community that's setting new standards in AI security. Together, we'll drive innovation and contribute to a safer, more resilient AI ecosystem.
            </p>
            <button 
              onClick={handleGetStarted}
              className="px-8 sm:px-12 py-3 sm:py-4 bg-blue-600 text-white text-base sm:text-xl font-semibold rounded-full hover:bg-blue-700 transition duration-300 transform hover:scale-105 shadow-lg"
            >
              Get Started Now
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p>&copy; 2023 ReplAIced. All rights reserved.</p>
              </div>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-blue-500 transition-colors duration-300">Terms of Service</a>
                <a href="#" className="hover:text-blue-500 transition-colors duration-300">Privacy Policy</a>
                <a href="#" className="hover:text-blue-500 transition-colors duration-300">Contact</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}