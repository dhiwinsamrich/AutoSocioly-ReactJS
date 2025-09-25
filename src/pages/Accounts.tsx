import { Navigation } from '@/components/Navigation';
import { GlassCard } from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
  Clock
} from 'lucide-react';

const socialPlatforms = [
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    connected: true,
    status: 'active',
    followers: '2.4K',
    color: 'text-gray-600'
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: Twitter,
    connected: true,
    status: 'active',
    followers: '1.8K',
    color: 'text-gray-700'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    connected: true,
    status: 'pending',
    followers: '3.2K',
    color: 'text-gray-800'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    connected: false,
    status: 'disconnected',
    followers: '0',
    color: 'text-gray-900'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: Youtube,
    connected: false,
    status: 'disconnected',
    followers: '0',
    color: 'text-gray-600'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: Music,
    connected: false,
    status: 'disconnected',
    followers: '0',
    color: 'text-gray-700'
  }
];

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
              {socialPlatforms.map((platform) => {
                const Icon = platform.icon;
                return (
                  <div key={platform.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg bg-gray-50 ${platform.color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{platform.name}</h3>
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
                          <Button variant="outline" size="sm" className="flex-1">
                            <Settings className="mr-2 h-4 w-4" />
                            Configure
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            Disconnect
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" className="w-full" variant="gradient">
                          Connect {platform.name}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
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
                <span className="font-semibold text-black">3/6</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Pending approvals</span>
                <span className="font-semibold text-gray-600">1</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Last sync</span>
                <span className="font-semibold text-gray-900">2 min ago</span>
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