import { GlassCard } from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { CheckCircle, Home, LayoutDashboard, ExternalLink, Calendar, User, AtSign } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { APIPostResponse } from '@/types/post';

interface SuccessProps {
  readonly title?: string;
  readonly message?: string;
}

export default function Success({
  title = "Success!",
  message = "Your action was completed successfully."
}: SuccessProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get data from location state
  const successTitle = location.state?.title ?? title;
  const successMessage = location.state?.message ?? message;
  const apiResponse: APIPostResponse | null = location.state?.postData ?? null;
  
  // Extract post data from API response
  const postData = apiResponse?.post || apiResponse?.data?.post || null;

  // Helper function to format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      });
    } catch {
      return dateString;
    }
  };

  // Helper function to capitalize platform name
  const capitalizePlatform = (platform: string) => {
    return platform.charAt(0).toUpperCase() + platform.slice(1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-950">
      <GlassCard className="p-8 text-center max-w-2xl w-full">
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{successTitle}</h1>
          <p className="text-gray-600 text-lg mb-6">{successMessage}</p>
        </div>

        {/* Post Details */}
        {postData?.platforms?.length ? (
          <div className="mb-8 space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Post Details</h2>
            
            {postData.platforms.map((platformData, index) => {
              const platformName = platformData.platform ?? 'Platform';
              const platformKey = platformName || `platform-${index}`;
              const cardKey = platformData.platformPostUrl ?? `${platformKey}-${index}`;
              return (
              <div key={cardKey} className="bg-white/50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {capitalizePlatform(platformName).charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {capitalizePlatform(platformName)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Status: <span className="capitalize font-medium text-green-600">{platformData.status ?? 'unknown'}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-left">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Display Name</p>
                      <p className="font-medium text-gray-900">{platformData.accountId?.displayName ?? 'Unknown'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <AtSign className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Username</p>
                      <p className="font-medium text-gray-900">{platformData.accountId?.username ?? 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 md:col-span-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Published At</p>
                      <p className="font-medium text-gray-900">{platformData.publishedAt ? formatDate(platformData.publishedAt) : 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* View Post Button */}
                {platformData.platformPostUrl && (
                  <Button 
                    onClick={() => globalThis.open(platformData.platformPostUrl, '_blank')}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Post on {capitalizePlatform(platformName)}
                  </Button>
                )}
              </div>
            )})}
          </div>
        ) : null}
        
        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => navigate('/')} variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
            <Home className="mr-2 h-4 w-4" />
            Create Another Post
          </Button>
          <Button onClick={() => navigate('/dashboard')} className="bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-gray-950 text-white">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            View Dashboard
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}