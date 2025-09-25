import { Navigation } from '@/components/Navigation';
import { GlassCard } from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { 
  Plus,
  Settings,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Music,
  CheckCircle,
  AlertCircle,
  Clock,
  Users
} from 'lucide-react';

interface Account {
  id: string;
  platform: string;
  connected: boolean;
  status: 'active' | 'pending' | 'disconnected';
  followers: string;
  color: string;
  icon: any;
}

const platformIcons = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  tiktok: Music
};

const platformColors = {
  facebook: 'text-gray-600',
  twitter: 'text-gray-700',
  instagram: 'text-gray-800',
  linkedin: 'text-gray-900',
  youtube: 'text-gray-600',
  tiktok: 'text-gray-700'
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

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAccounts();
      if (response.success && response.data?.accounts) {
        const accountData = response.data.accounts.map((acc: any) => ({
          id: acc.id || acc._id || `${acc.platform}-${Date.now()}`,
          platform: acc.platform || 'unknown',
          connected: acc.connected === true,
          status: acc.status || (acc.connected === true ? 'active' : 'disconnected'),
          followers: acc.followers || acc.followers_count || '0',
          color: platformColors[acc.platform as keyof typeof platformColors] || 'text-gray-600',
          icon: platformIcons[acc.platform as keyof typeof platformIcons] || Music
        }));
        setAccounts(accountData);
      } else {
        setAccounts([]);
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectAccount = async (platform: string) => {
    try {
      const response = await apiService.connectAccount(platform, {});
      if (response.success) {
        if (response.data?.auth_url) {
          window.location.href = response.data.auth_url;
        } else {
          fetchAccounts();
        }
      }
    } catch (error) {
      console.error('Failed to connect account:', error);
    }
  };

  const handleDisconnectAccount = async (platform: string) => {
    try {
      const response = await apiService.disconnectAccount(platform);
      if (response.success) {
        fetchAccounts();
      }
    } catch (error) {
      console.error('Failed to disconnect account:', error);
    }
  };

  const handleConfigureAccount = (platform: string) => {
    navigate(`/accounts/${platform}/configure`);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-white/80">Loading accounts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Social Media Accounts</h1>
          <p className="text-white/80">Connect and manage your social media platforms</p>
        </div>

        {/* Connected Accounts */}
        <div className="mb-8">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Connected Accounts</h2>
              <Button variant="gradient">
                <Plus className="mr-2 h-4 w-4" />
                Add Account
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accounts.length > 0 ? (
                accounts.map((platform) => {
                  const Icon = platform.icon;
                  return (
                    <div key={platform.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg bg-gray-50 ${platform.color}`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{platform.platform}</h3>
                            <p className="text-sm text-gray-500">{platform.followers} followers</p>
                          </div>
                        </div>
                        {getStatusIcon(platform.status)}
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        {getStatusBadge(platform.status)}
                        <Switch checked={platform.connected} />
                      </div>

                      <div className="flex space-x-2">
                        {platform.connected ? (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handleConfigureAccount(platform.platform)}
                            >
                              <Settings className="mr-2 h-4 w-4" />
                              Configure
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDisconnectAccount(platform.platform)}
                            >
                              Disconnect
                            </Button>
                          </>
                        ) : (
                          <Button 
                            size="sm" 
                            className="w-full" 
                            variant="gradient"
                            onClick={() => handleConnectAccount(platform.platform)}
                          >
                            Connect {platform.platform}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="text-gray-500 mb-4">
                    <Users className="h-12 w-12 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Connected Accounts</h3>
                    <p className="text-gray-500 mb-6">Connect your social media accounts to get started</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                    {Object.entries(platformIcons).map(([platform, Icon]) => (
                      <Button
                        key={platform}
                        variant="outline"
                        className="flex flex-col items-center space-y-2 p-4"
                        onClick={() => handleConnectAccount(platform)}
                      >
                        <Icon className="h-6 w-6" />
                        <span className="text-sm capitalize">{platform}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Account Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Publishing Schedule</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">Auto-posting</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">Cross-platform sharing</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">Analytics tracking</span>
                <Switch defaultChecked />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Account Health</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Active connections</span>
                <span className="font-semibold text-black">
                  {accounts.filter(acc => acc.connected).length}/{accounts.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Pending approvals</span>
                <span className="font-semibold text-gray-600">
                  {accounts.filter(acc => acc.status === 'pending').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Last sync</span>
                <span className="font-semibold text-gray-900">Just now</span>
              </div>
              <div className="pt-4">
                <Button variant="outline" className="w-full">
                  Refresh All Connections
                </Button>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
