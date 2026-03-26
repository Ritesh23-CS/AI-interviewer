import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
      <p className="text-text-muted font-medium animate-pulse">{message}</p>
    </div>
  );
}
