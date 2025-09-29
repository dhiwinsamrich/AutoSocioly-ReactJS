import { Navigation } from '@/components/Navigation';
import { GlassCard } from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { Plus, Facebook, Instagram, Linkedin, CheckCircle, AlertCircle, Clock } from 'lucide-react';
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
  x: 'shadow-[0_0_30px_rgba(20,23,26,0.6)]',
  instagram: 'shadow-[0_0_30px_rgba(228,64,95,0.6)]',
  linkedin: 'shadow-[0_0_30px_rgba(10,102,194,0.6)]',
  reddit: 'shadow-[0_0_30px_rgba(255,69,0,0.6)]',
  pinterest: 'shadow-[0_0_30px_rgba(230,0,35,0.6)]'
};

const platformBorderGlow = {
  facebook: 'border-[#1877F2] shadow-[0_0_20px_rgba(24,119,242,0.5)]',
  x: 'border-[#14171A] shadow-[0_0_20px_rgba(20,23,26,0.5)]',
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
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // All platforms to display
  const allPlatforms = ['instagram', 'facebook', 'x', 'reddit', 'pinterest', 'linkedin'];

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAccounts();
      console.log('API Response:', response);
      
      let connectedAccounts: Account[] = [];
      
      // Helper function to normalize platform names
      const normalizePlatform = (platform: string): string => {
        const normalized = platform.toLowerCase();
        // Map twitter to x
        if (normalized === 'twitter') return 'x';
        return normalized;
      };
      
      if (response.success && response.data?.accounts) {
        connectedAccounts = response.data.accounts.map((acc: any) => {
          const platformKey = normalizePlatform(acc.platform || 'unknown');
          const isConnected = acc.connected === true;
          
          console.log(`Platform from API: ${acc.platform}, Normalized: ${platformKey}, Connected: ${isConnected}`);
          
          return {
            id: acc.id || acc._id || `${platformKey}-${Date.now()}`,
            platform: platformKey,
            connected: isConnected,
            status: acc.status || (isConnected ? 'active' : 'disconnected'),
            color: platformColors[platformKey as keyof typeof platformColors] || 'text-gray-600',
            glowColor: platformGlowColors[platformKey as keyof typeof platformGlowColors] || '',
            icon: platformIcons[platformKey as keyof typeof platformIcons] || Facebook,
            username: acc.username || acc.displayName || 'Unknown',
            connectedAt: acc.connectedAt || acc.connected_at,
            isActive: acc.isActive !== undefined ? acc.isActive : isConnected
          };
        });
      } else if (response.accounts) {
        connectedAccounts = response.accounts.map((acc: any) => {
          const platformKey = normalizePlatform(acc.platform || 'unknown');
          const isConnected = acc.connected === true;
          
          console.log(`Platform from API: ${acc.platform}, Normalized: ${platformKey}, Connected: ${isConnected}`);
          
          return {
            id: acc.id || acc._id || `${platformKey}-${Date.now()}`,
            platform: platformKey,
            connected: isConnected,
            status: acc.status || (isConnected ? 'active' : 'disconnected'),
            color: platformColors[platformKey as keyof typeof platformColors] || 'text-gray-600',
            glowColor: platformGlowColors[platformKey as keyof typeof platformGlowColors] || '',
            icon: platformIcons[platformKey as keyof typeof platformIcons] || Facebook,
            username: acc.username || acc.displayName || 'Unknown',
            connectedAt: acc.connectedAt || acc.connected_at,
            isActive: acc.isActive !== undefined ? acc.isActive : isConnected
          };
        });
      } else if (response.accounts) {
        connectedAccounts = response.accounts.map((acc: any) => {
          const platformKey = normalizePlatform(acc.platform || 'unknown');
          const isConnected = acc.connected === true;
          
          console.log(`Platform from API: ${acc.platform}, Normalized: ${platformKey}, Connected: ${isConnected}`);
          
          return {
            id: acc.id || acc._id || `${platformKey}-${Date.now()}`,
            platform: platformKey,
            connected: isConnected,
            status: acc.status || (isConnected ? 'active' : 'disconnected'),
            color: platformColors[platformKey as keyof typeof platformColors] || 'text-gray-600',
            glowColor: platformGlowColors[platformKey as keyof typeof platformGlowColors] || '',
            icon: platformIcons[platformKey as keyof typeof platformIcons] || Facebook
          };
        });
      }

      // Create full list with all platforms
      const fullAccountsList = allPlatforms.map(platformKey => {
        const existingAccount = connectedAccounts.find(acc => acc.platform === platformKey);
        
        if (existingAccount) {
          return existingAccount;
        }
        
        return {
          id: `${platformKey}-placeholder`,
          platform: platformKey,
          connected: false,
          status: 'disconnected' as const,
          color: platformColors[platformKey as keyof typeof platformColors] || 'text-gray-600',
          glowColor: platformGlowColors[platformKey as keyof typeof platformGlowColors] || '',
          icon: platformIcons[platformKey as keyof typeof platformIcons] || Facebook
        };
      });

      console.log('Full accounts list:', fullAccountsList);
      setAccounts(fullAccountsList);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
      // Still show all platforms even on error
      const defaultAccounts = allPlatforms.map(platformKey => ({
        id: `${platformKey}-placeholder`,
        platform: platformKey,
        connected: false,
        status: 'disconnected' as const,
        color: platformColors[platformKey as keyof typeof platformColors] || 'text-gray-600',
        glowColor: platformGlowColors[platformKey as keyof typeof platformGlowColors] || '',
        icon: platformIcons[platformKey as keyof typeof platformIcons] || Facebook
      }));
      setAccounts(defaultAccounts);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToConnections = () => {
    window.location.href = 'https://getlate.dev/dashboard/connections';
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

  if (loading) {
    return <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-white/80">Loading accounts...</p>
          </div>
        </div>
      </div>;
  }

  return <div className="min-h-screen bg-neutral-950">
      <Navigation />
      
      <div className="container mx-auto px-4 bg-zinc-950 py-8">
        {/* Connected Accounts */}
        <div className="mb-8">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Connected Accounts</h2>
              <Button variant="gradient" onClick={handleNavigateToConnections}>
                <Plus className="mr-2 h-4 w-4" />
                Add Account
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accounts.map(platform => {
                const borderGlow = platform.connected ? platformBorderGlow[platform.platform as keyof typeof platformBorderGlow] : '';
                
                return <div 
                        key={platform.id} 
                        className={`relative border-2 rounded-lg p-6 hover:shadow-md transition-all duration-300 ${
                          platform.connected 
                            ? borderGlow
                            : 'border-gray-200'
                        }`}
                      >
                        {/* Status Indicator Dot */}
                        <div className="absolute top-3 right-3">
                          {platform.isActive ? (
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
                            <div className={`p-2 rounded-lg bg-gray-50 ${platform.color} ${platform.connected ? platform.glowColor : ''} transition-all duration-300`}>
                              {renderIcon(platform.platform, platform.icon)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{getPlatformDisplayName(platform.platform)}</h3>
                              {platform.username && (
                                <p className="text-sm text-gray-600">@{platform.username}</p>
                              )}
                            </div>
                          </div>
                          {getStatusIcon(platform.status)}
                        </div>

                        <div className="mb-4 space-y-2">
                          {getStatusBadge(platform.status)}
                          
                          {platform.connected && (
                            <div className="text-xs text-gray-600 space-y-1 mt-2">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">Account ID:</span>
                                <span className="font-mono text-gray-500">{platform.id.substring(0, 12)}...</span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex space-x-2">
                          {platform.connected ? (
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
                              Connect {getPlatformDisplayName(platform.platform)}
                            </Button>
                          )}
                        </div>
                      </div>;
              })}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>;
}