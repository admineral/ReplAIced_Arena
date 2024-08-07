import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias['@'] = __dirname;
    config.resolve.alias['@lib'] = join(__dirname, 'lib');
    return config;
  },
  images: {
    domains: ['avatars.githubusercontent.com'],
  },
};

export default nextConfig;