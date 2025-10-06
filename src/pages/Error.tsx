import { Navigation } from '@/components/Navigation';
import { GlassCard } from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
interface ErrorProps {
  code?: string;
  title?: string;
  message?: string;
  details?: string;
}
export default function Error({
  code = "500",
  title = "Oops! Something went wrong",
  message = "An unexpected error occurred. Please try again later.",
  details
}: ErrorProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get error details from navigation state
  const state = location.state as any;
  const errorCode = state?.code || code;
  const errorTitle = state?.title || title;
  const errorMessage = state?.message || message;
  const errorDetails = state?.details || details;
  return <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-950">
      <GlassCard className="p-12 text-center max-w-md w-full">
        <div className="mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-10 w-10 text-white" />
          </div>
          
          <div className="text-4xl font-bold text-gray-900 mb-2">{errorCode}</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{errorTitle}</h1>
          <p className="text-gray-600 text-lg mb-4">{errorMessage}</p>
          
          {errorDetails && <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-blue-700">{errorDetails}</p>
            </div>}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => navigate('/')} variant="gradient">
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Button>
          <Button onClick={() => window.location.reload()} variant="outline" className="border-black text-black hover:bg-black/5">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </GlassCard>
    </div>;
}