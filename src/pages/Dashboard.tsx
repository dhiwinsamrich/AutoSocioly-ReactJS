import { Navigation } from '@/components/Navigation';
import { GlassCard } from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  BarChart3,
  Plus,
  Eye,
  Clock,
  CheckCircle
} from 'lucide-react';

const metrics = [
  {
    title: 'Total Posts',
    value: '247',
    change: '+12%',
    icon: BarChart3,
    color: 'text-blue-600'
  },
  {
    title: 'Engagement Rate',
    value: '8.4%',
    change: '+2.1%',
    icon: TrendingUp,
    color: 'text-green-600'
  },
  {
    title: 'Followers',
    value: '12.4K',
    change: '+5.7%',
    icon: Users,
    color: 'text-purple-600'
  },
  {
    title: 'Scheduled',
    value: '18',
    change: '+3',
    icon: Calendar,
    color: 'text-orange-600'
  }
];

const quickActions = [
  { label: 'Create Content', icon: Plus, action: 'create' },
  { label: 'Schedule Post', icon: Calendar, action: 'schedule' },
  { label: 'View Analytics', icon: BarChart3, action: 'analytics' },
  { label: 'Manage Accounts', icon: Users, action: 'accounts' }
];

const recentActivity = [
  {
    id: 1,
    action: 'Content published',
    platform: 'Instagram',
    time: '2 hours ago',
    status: 'success'
  },
  {
    id: 2,
    action: 'Post scheduled',
    platform: 'Twitter',
    time: '4 hours ago',
    status: 'pending'
  },
  {
    id: 3,
    action: 'Content generated',
    platform: 'LinkedIn',
    time: '6 hours ago',
    status: 'success'
  }
];

export default function Dashboard() {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-white/80">Monitor your social media performance and manage content</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <GlassCard key={index} hover className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg bg-white/10 ${metric.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {metric.change}
                  </Badge>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
                  <p className="text-sm text-gray-600">{metric.title}</p>
                </div>
              </GlassCard>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <GlassCard className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start h-12 hover:bg-primary/5 hover:border-primary transition-all duration-300"
                    >
                      <Icon className="mr-3 h-5 w-5 text-primary" />
                      {action.label}
                    </Button>
                  );
                })}
              </div>
            </GlassCard>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary-dark">
                  <Eye className="mr-2 h-4 w-4" />
                  View All
                </Button>
              </div>
              
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.status === 'success' ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                      <div>
                        <p className="font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-600">{activity.platform}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Account Status */}
        <div className="mt-8">
          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Connected Accounts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {['Facebook', 'Twitter', 'Instagram', 'LinkedIn'].map((platform) => (
                <div key={platform} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="font-medium text-gray-900">{platform}</span>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Connected
                  </Badge>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}