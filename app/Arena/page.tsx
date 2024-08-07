import React from 'react';
import LayoutWithNavigation from '../layout-with-navigation';
import AISecurityMap from '../../components/Map/AISecurityMap';

export default function ArenaPage() {
  return (
    <LayoutWithNavigation>
      <div className="h-screen w-screen">
        <AISecurityMap />
      </div>
    </LayoutWithNavigation>
  );
}