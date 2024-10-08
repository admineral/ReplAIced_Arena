'use client';

import React from 'react';
import Image from 'next/image';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

const founders = [
  {
    name: 'Elias Zobler',
    image: 'https://avatars.githubusercontent.com/u/50579369?v=4',
    github: 'https://github.com/admineral',
    linkedin: 'https://www.linkedin.com/in/elias-zobler-a19117250/',
  },
  {
    name: 'Nikoll Gjokaj',
    image: 'https://avatars.githubusercontent.com/u/99435364?v=4',
    github: 'https://github.com/nikollgjokaj',
    linkedin: 'https://www.linkedin.com/in/nikoll-gjokaj-929249240/',
  },
  {
    name: 'Daniel Prundianu',
    image: '/dani.jpeg',
    github: 'https://github.com/prundianudaniel',
    linkedin: 'https://www.linkedin.com/in/danielprundianu/',
  },
];

const AboutUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-6">About Us</h1>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
          <p className="text-lg mb-4">
            Welcome to <span className="font-semibold">ReplAIced</span>, a cutting-edge platform dedicated to enhancing AI security through innovative challenges and competitive gameplay.
          </p>
          <p className="text-lg mb-4">
            Our mission is to redefine the standards of AI security by providing a unique arena where users can test their skills against various AI models, expose vulnerabilities, and learn from their experiences.
          </p>
          <p className="text-lg mb-4">
            We believe in fostering a community of AI security experts who are passionate about driving innovation and contributing to a safer digital landscape.
          </p>
          <p className="text-lg mb-4">
            Join us on this exciting journey as we explore the future of AI security together!
          </p>
        </div>

        <h2 className="text-3xl font-bold mb-6">Meet Our Founders</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {founders.map((founder) => (
            <div key={founder.name} className="bg-gray-800 p-6 rounded-lg flex flex-col items-center transition-transform transform hover:scale-105">
              <Image
                src={founder.image}
                alt={founder.name}
                width={150}
                height={150}
                className="rounded-full mb-4 border-2 border-blue-500"
              />
              <h3 className="text-xl font-semibold text-center mb-2">{founder.name}</h3>
              <p className="text-sm text-gray-400 mb-2">Founder</p>
              <div className="flex justify-center space-x-4 mt-2">
                <a href={founder.github} target="_blank" rel="noopener noreferrer">
                  <FaGithub className="text-white hover:text-blue-500" size={24} />
                </a>
                <a href={founder.linkedin} target="_blank" rel="noopener noreferrer">
                  <FaLinkedin className="text-white hover:text-blue-500" size={24} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

};

export default AboutUs;