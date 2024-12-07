import React, { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, XCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  details?: {
    progress?: Array<{
      step: string;
      time: string;
      [key: string]: any;
    }>;
    [key: string]: any;
  };
  onDismiss?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  details,
  onDismiss 
}) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg space-y-2">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <span className="flex-1">{message}</span>
        
        <div className="flex items-center gap-1">
          {details && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-1 hover:bg-red-500/20 rounded-lg transition-colors"
              title={showDetails ? 'Hide details' : 'Show details'}
            >
              {showDetails ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          )}
          
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1 hover:bg-red-500/20 rounded-lg transition-colors"
              title="Dismiss"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {showDetails && details && (
        <div className="mt-2 space-y-2">
          {details.progress && (
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Loading Progress:</h4>
              {details.progress.map((p, i) => (
                <div 
                  key={i}
                  className="text-xs bg-red-500/5 p-2 rounded flex justify-between"
                >
                  <span className="font-medium">{p.step}</span>
                  <span>{p.time}</span>
                </div>
              ))}
            </div>
          )}
          
          <pre className="p-2 bg-red-500/5 rounded text-xs font-mono overflow-x-auto">
            {JSON.stringify(details, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};