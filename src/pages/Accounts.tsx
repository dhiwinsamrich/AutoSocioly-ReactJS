import { Navigation } from '@/components/Navigation';
import { GlassCard } from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ApiKeyChangeModal } from '@/components/ApiKeyChangeModal';
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Plus, Facebook, Instagram, Linkedin, CheckCircle, AlertCircle, Clock, User, Calendar, Activity, Settings, RefreshCw, TrendingUp, Image, Users, Key } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter, faReddit, faPinterest } from '@fortawesome/free-brands-svg-icons';

interface Account {
  id: string;
  platform: string;
  connected: boolean;
  status: 'active' | 'pending' | 'disconnected';
  color: string;
  glowColor: string;
  icon: any;
  username?: string;
  connectedAt?: string;
  isActive?: boolean;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  last_login?: string;
  plan: string;
  is_active: boolean;
}

interface UsageStats {
  posts_generated: number;
  posts_posted: number;
  images_generated: number;
  api_calls: number;
  storage_used: number;
  bandwidth_used: number;
  period_start: string;
  period_end: string;
}

interface PlanLimits {
  plan_name: string;
  max_posts_per_month: number;
  max_api_calls_per_minute: number;
  max_storage_gb: number;
  max_bandwidth_gb: number;
  supported_platforms: string[];
  features: string[];
  price: number;
}

interface ProfileDetails {
  profile_id: string;
  created_at: string;
  updated_at: string;
  is_default: boolean;
  color: string;
}

interface AccountDetails {
  profile: UserProfile;
  usage_stats: UsageStats;
  plan_limits: PlanLimits;
  connected_accounts: Account[];
  recent_activity: any[];
  profile_details: ProfileDetails;
}

const platformIcons = {
  facebook: Facebook,
  x: faXTwitter,
  instagram: Instagram,
  linkedin: Linkedin,
  reddit: faReddit,
  pinterest: faPinterest
};

const platformColors = {
  facebook: 'text-[#1877F2]',
  x: 'text-[#14171A]',
  instagram: 'text-[#E4405F]',
  linkedin: 'text-[#0A66C2]',
  reddit: 'text-[#FF4500]',
  pinterest: 'text-[#E60023]'
};

const platformGlowColors = {
  facebook: 'shadow-[0_0_30px_rgba(24,119,242,0.6)]',
  x: 'shadow-[0_0_30px_rgba(0,0,0,0.8)]',
  instagram: 'shadow-[0_0_30px_rgba(228,64,95,0.6)]',
  linkedin: 'shadow-[0_0_30px_rgba(10,102,194,0.6)]',
  reddit: 'shadow-[0_0_30px_rgba(255,69,0,0.6)]',
  pinterest: 'shadow-[0_0_30px_rgba(230,0,35,0.6)]'
};

const platformBorderGlow = {
  facebook: 'border-[#1877F2] shadow-[0_0_20px_rgba(24,119,242,0.5)]',
  x: 'border-[#000000] shadow-[0_0_20px_rgba(0,0,0,0.7)]',
  instagram: 'border-[#E4405F] shadow-[0_0_20px_rgba(228,64,95,0.5)]',
  linkedin: 'border-[#0A66C2] shadow-[0_0_20px_rgba(10,102,194,0.5)]',
  reddit: 'border-[#FF4500] shadow-[0_0_20px_rgba(255,69,0,0.5)]',
  pinterest: 'border-[#E60023] shadow-[0_0_20px_rgba(230,0,35,0.5)]'
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active':
      return <CheckCircle className="h-4 w-4 text-black" />;
    case 'pending':
      return <Clock className="h-4 w-4 text-gray-600" />;
    default:
      return <AlertCircle className="h-4 w-4 text-gray-400" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <Badge variant="secondary" className="bg-gray-800 text-white">Connected</Badge>;
    case 'pending':
      return <Badge variant="secondary" className="bg-gray-600 text-white">Pending</Badge>;
    default:
      return <Badge variant="secondary" className="bg-gray-100 text-gray-600">Disconnected</Badge>;
  }
};

export default function Accounts() {
  const [accountDetails, setAccountDetails] = useState<AccountDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [currentApiKey, setCurrentApiKey] = useState<string>('');

  useEffect(() => {
    fetchAccountDetails();
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchAccountDetails, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAccountDetails = async () => {
    try {
      setRefreshing(true);
      const response = await apiService.request('/api/account/profile');
      // The response from the backend is directly the AccountDetails object
      setAccountDetails(response as unknown as AccountDetails);
    } catch (error) {
      console.error('Failed to fetch account details:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchCurrentApiKey = async () => {
    try {
      const response = await apiService.request('/api/account/api-key');
      // The backend response may not be typed, so use type assertion or optional chaining
      setCurrentApiKey((response as any)?.api_key || '');
    } catch (error) {
      console.error('Failed to fetch current API key:', error);
    }
  };

  const handleApiKeyChange = async (newApiKey: string) => {
    try {
      await apiService.request('/api/account/api-key', {
        method: 'PUT',
        body: JSON.stringify({ api_key: newApiKey })
      });
      // Refresh the current API key display
      await fetchCurrentApiKey();
    } catch (error) {
      throw new Error('Failed to update API key. Please try again.');
    }
  };

  const refreshUsageStats = async () => {
    try {
      setRefreshing(true);
      const response = await apiService.request('/api/account/usage');
      if (accountDetails) {
        setAccountDetails({
          ...accountDetails,
          usage_stats: response as unknown as UsageStats
        });
      }
    } catch (error) {
      console.error('Failed to refresh usage stats:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleNavigateToConnections = () => {
    globalThis.location.href = 'https://getlate.dev/dashboard/connections';
  };

  const getPlatformDisplayName = (platform: string) => {
    const names: { [key: string]: string } = {
      facebook: 'Facebook',
      x: 'X',
      instagram: 'Instagram',
      linkedin: 'LinkedIn',
      reddit: 'Reddit',
      pinterest: 'Pinterest'
    };
    return names[platform] || platform;
  };

  const renderIcon = (platform: string, icon: any, className: string = "h-6 w-6") => {
    if (platform === 'x' || platform === 'reddit' || platform === 'pinterest') {
      return <FontAwesomeIcon icon={icon} className={className} />;
    }
    return React.createElement(icon, { className });
  };
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not connected';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getUsagePercentage = (used: number, max: number) => {
    return Math.min((used / max) * 100, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <Navigation />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white/80">Loading account details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!accountDetails) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <Navigation />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center py-12">
            <p className="text-white/80">Failed to load account details</p>
            <Button onClick={fetchAccountDetails} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { profile, usage_stats, plan_limits, connected_accounts, profile_details } = accountDetails;

  return (
    <div className="min-h-screen bg-neutral-950">
      <Navigation />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Account Dashboard</h1>
              <p className="text-white/60">Manage your profile, usage, and connected accounts</p>
            </div>
            <Button 
              onClick={refreshUsageStats} 
              disabled={refreshing}
              variant="outline"
              className="text-white border-white/20 hover:bg-white hover:text-black"
            >
              <RefreshCw className={`mr-2 h-4 w-4 text-black ${refreshing ? 'animate-spin' : ''}`} />
              <span className="text-black">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Profile Section - Simplified */}
        <div className="mb-8">
          <GlassCard className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-black">{profile.name}</h2>
                <p className="text-black/60">{profile.email}</p>
                <Badge variant="secondary" className="mt-2">
                  {plan_limits.plan_name} Plan
                </Badge>
              </div>
            </div>
            
            {/* API Key Management */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Key className="h-4 w-4 text-black/60" />
                  <span className="text-black/80 font-medium">GetLate API Key</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    fetchCurrentApiKey();
                    setIsApiKeyModalOpen(true);
                  }}
                  className="text-black border-black/20 hover:bg-black hover:text-white"
                >
                  <Settings className="mr-2 h-3 w-3" />
                  Change API Key
                </Button>
              </div>
            </div>

            {/* Profile Details from GetLate */}
            {profile_details && Object.keys(profile_details).length > 0 && (
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-white/60" />
                    <span className="text-black/80">Profile ID:</span>
                    <span className="text-black font-medium font-mono text-sm">
                      {profile_details.profile_id ? profile_details.profile_id.substring(0, 24) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-black" />
                    <span className="text-black/80">Member since:</span>
                    <span className="text-black font-medium">
                      {profile_details.created_at ? formatDate(profile_details.created_at) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-black" />
                    <span className="text-black/80">Last Active:</span>
                    <span className="text-black font-medium">
                      {profile_details.updated_at ? formatDate(profile_details.updated_at) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Usage Statistics - Real-time from GetLate */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-8 w-8 text-blue-500" />
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-black mb-1">{usage_stats.posts_generated}</h3>
            <p className="text-black/60 text-sm">Profiles Connected</p>
            <div className="mt-3">
              <Progress 
                value={getUsagePercentage(usage_stats.posts_generated, plan_limits.max_posts_per_month)} 
                className="h-2"
              />
              <p className="text-xs text-black mt-1">
                {usage_stats.posts_generated} / {plan_limits.max_posts_per_month} profiles
              </p>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Image className="h-8 w-8 text-purple-500" />
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-black mb-1">{usage_stats.images_generated}</h3>
            <p className="text-black/60 text-sm">Posts Uploaded</p>
            <div className="mt-3">
              <Progress 
                value={getUsagePercentage(usage_stats.images_generated, plan_limits.max_storage_gb)} 
                className="h-2"
              />
              <p className="text-xs text-black mt-1">
                {usage_stats.images_generated} / {plan_limits.max_storage_gb} uploads
              </p>
            </div>
          </GlassCard>
        </div>

        {/* Connected Accounts */}
        <div className="mb-8">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-black">Connected Accounts</h2>
              <Button variant="gradient" onClick={handleNavigateToConnections}>
                <Plus className="mr-2 h-4 w-4" />
                Add Account
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {['instagram', 'facebook', 'x', 'reddit', 'pinterest', 'linkedin'].map(platformKey => {
                // Try multiple possible platform keys for X/Twitter
                const possibleKeys = platformKey === 'x' ? ['x', 'twitter', 'X', 'Twitter'] : [platformKey];
                const account = connected_accounts.find(acc => 
                  possibleKeys.some(key => 
                    acc.platform?.toLowerCase() === key.toLowerCase()
                  )
                );
                const isConnected = account?.connected || false;
                const borderGlow = isConnected ? platformBorderGlow[platformKey as keyof typeof platformBorderGlow] : '';
                
                return (
                  <div 
                    key={platformKey} 
                    className={`relative border-2 rounded-lg p-6 hover:shadow-md transition-all duration-300 ${
                      isConnected 
                        ? borderGlow
                        : 'border-gray-200'
                    }`}
                  >
                    {/* Status Indicator Dot */}
                    <div className="absolute top-3 right-3">
                      {isConnected ? (
                        <div className="relative">
                          <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                          <div className="absolute top-0 left-0 h-3 w-3 bg-green-500 rounded-full opacity-75 animate-ping"></div>
                        </div>
                      ) : (
                        <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg bg-gray-50 ${platformColors[platformKey as keyof typeof platformColors]} ${isConnected ? platformGlowColors[platformKey as keyof typeof platformGlowColors] : ''} transition-all duration-300`}>
                          {renderIcon(platformKey, platformIcons[platformKey as keyof typeof platformIcons])}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{getPlatformDisplayName(platformKey)}</h3>
                          {account?.username && (
                            <p className="text-sm text-gray-600">@{account.username}</p>
                          )}
                        </div>
                      </div>
                      {getStatusIcon(isConnected ? 'active' : 'disconnected')}
                    </div>

                    <div className="mb-4 space-y-2">
                      {getStatusBadge(isConnected ? 'active' : 'disconnected')}
                      
                      {isConnected && account && (
                        <div className="text-xs text-gray-600 space-y-1 mt-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Account ID:</span>
                            <span className="font-mono text-gray-500">{account.id.substring(0, 24)}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      {isConnected ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full text-red-600 hover:text-red-700" 
                          onClick={handleNavigateToConnections}
                        >
                          Disconnect
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          className="w-full" 
                          variant="gradient" 
                          onClick={handleNavigateToConnections}
                        >
                          Connect {getPlatformDisplayName(platformKey)}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* API Key Change Modal */}
        <ApiKeyChangeModal
          isOpen={isApiKeyModalOpen}
          onClose={() => setIsApiKeyModalOpen(false)}
          onSave={handleApiKeyChange}
          currentApiKey={currentApiKey}
        />

      </div>
    </div>
  );
}