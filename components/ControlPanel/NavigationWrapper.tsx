'use client'

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '../Landingpage/Navbar';
import LandingPageNavbar from '../../app/Landingpage/LandingPageNavbar';
import ControlPanel from './ControlPanel_Component';

export default function NavigationWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mode, setMode] = useState('preview');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());
  const [activeSection, setActiveSection] = useState('home');

  const switchMode = (newMode: string) => setMode(newMode);
  
  const openCreateBoxModal = () => {
    // Implement this function
    console.log('Open create box modal');
  };

  const reloadBoxes = () => {
    setIsLoading(true);
    // Implement reloading logic here
    setTimeout(() => {
      setIsLoading(false);
      setLastUpdateTime(new Date());
    }, 1000); // Simulating a reload
  };

  const clearAllBoxes = () => {
    // Implement this function
    console.log('Clear all boxes');
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const navbarHeight = 64; // Adjust this value based on your navbar height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 3;
      const sections = ['home', 'about', 'features', 'join'];

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    if (pathname === '/') {
      window.addEventListener('scroll', handleScroll);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pathname]);

  useEffect(() => {
    // Reset active section when pathname changes
    setActiveSection('home');
  }, [pathname]);

  if (pathname === '/') {
    return (
      <>
        <LandingPageNavbar activeSection={activeSection} scrollToSection={scrollToSection} />
        <main>{children}</main>
      </>
    );
  }

  if (pathname === '/Arena') {
    return (
      <>
        <ControlPanel 
          mode={mode}
          switchMode={switchMode}
          openCreateBoxModal={openCreateBoxModal}
          reloadBoxes={reloadBoxes}
          clearAllBoxes={clearAllBoxes}
          isAttackModeAvailable={true}
          isLoading={isLoading}
          setLastUpdateTime={setLastUpdateTime}
        />
        <main>{children}</main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}