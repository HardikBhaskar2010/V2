import React from 'react';
import { Heart } from 'lucide-react';

const DevelopedByFooter = () => {
  return (
    <div className="flex items-center justify-center py-4 px-6 border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
        <span>Built with</span>
        <Heart className="h-4 w-4 text-red-500 animate-pulse" fill="currentColor" />
        <span>using</span>
        <span className="font-semibold text-primary">React</span>
        <span>&</span>
        <span className="font-semibold text-secondary">FastAPI</span>
      </div>
    </div>
  );
};

export default DevelopedByFooter;