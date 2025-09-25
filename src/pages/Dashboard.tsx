<<<<<<< HEAD
=======
import { useState, useEffect } from 'react';
>>>>>>> d2784f3 (Backend implemented on the Homepage)
import { Navigation } from '@/components/Navigation';
import { GlassCard } from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
<<<<<<< HEAD
=======
import { apiService } from '../services/api';
import { useNavigate } from 'react-router-dom';
>>>>>>> d2784f3 (Backend implemented on the Homepage)
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

<<<<<<< HEAD
const metrics = [
  {
    title: 'Total Posts',
    value: '247',
    change: '+12%',
    icon: BarChart3,
    color: 'text-gray-600'
  },
  {
    title: 'Engagement Rate',
    value: '8.4%',
    change: '+2.1%',
    icon: TrendingUp,
    color: 'text-gray-700'
  },
  {
    title: 'Followers',
    value: '12.4K',
    change: '+5.7%',
    icon: Users,
    color: 'text-gray-800'
  },
  {
    title: 'Scheduled',
    value: '18',
    change: '+3',
    icon: Calendar,
    color: 'text-gray-900'
  }
];
=======
interface DashboardData {
  metrics: {
    title: string;
    value: string;
    change: string;
    icon: any;
    color: string;
  }[];
  recentActivity: {
    id: number;
    action: string;
    platform: string;
    time: string;
    status: 'success' | 'pending' | 'error';
  }[];
  connectedAccounts: {
    platform: string;
    connected: boolean;
    status: 'connected' | 'disconnected' | 'error';
  }[];
}
>>>>>>> d2784f3 (Backend implemented on the Homepage)

const quickActions = [
  { label: 'Create Content', icon: Plus, action: 'create' },
  { label: 'Schedule Post', icon: Calendar, action: 'schedule' },
  { label: 'View Analytics', icon: BarChart3, action: 'analytics' },
  { label: 'Manage Accounts', icon: Users, action: 'accounts' }
];

<<<<<<< HEAD
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
=======
export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    metrics: [
      {
        title: 'Total Posts',
        value: '0',
        change: '+0%',
        icon: BarChart3,
        color: 'text-gray-600'
      },
      {
        title: 'Engagement Rate',
        value: '0%',
        change: '+0%',
        icon: TrendingUp,
        color: 'text-gray-700'
      },
      {
        title: 'Followers',
        value: '0',
        change: '+0%',
        icon: Users,
        color: 'text-gray-800'
      },
      {
        title: 'Scheduled',
        value: '0',
        change: '+0',
        icon: Calendar,
        color: 'text-gray-900'
      }
    ],
    recentActivity: [],
    connectedAccounts: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch posting history
      const historyResponse = await apiService.getPostingHistory();
      const postingHistory = historyResponse.success && historyResponse.history ? historyResponse.history : [];
      
      // Fetch scheduled posts
      const scheduledResponse = await apiService.getScheduledPosts();
      const scheduledPosts = scheduledResponse.success && scheduledResponse.scheduled_posts ? scheduledResponse.scheduled_posts : [];
      
      // Fetch connected accounts
      const accountsResponse = await apiService.getAccounts();
      const connectedAccounts = accountsResponse.success && accountsResponse.data?.accounts ? accountsResponse.data.accounts : [];
      
      // Update metrics with real data
      const updatedMetrics = [
        {
          title: 'Total Posts',
          value: postingHistory?.length?.toString() || '0',
          change: '+0%',
          icon: BarChart3,
          color: 'text-gray-600'
        },
        {
          title: 'Engagement Rate',
          value: '0%',
          change: '+0%',
          icon: TrendingUp,
          color: 'text-gray-700'
        },
        {
          title: 'Followers',
          value: '0',
          change: '+0%',
          icon: Users,
          color: 'text-gray-800'
        },
        {
          title: 'Scheduled',
          value: scheduledPosts?.length?.toString() || '0',
          change: '+0',
          icon: Calendar,
          color: 'text-gray-900'
        }
      ];

      // Convert posting history to recent activity
      const recentActivity = postingHistory?.slice(0, 5)?.map((item: any, index: number) => ({
        id: index + 1,
        action: item.status === 'published' ? 'Content published' : 'Content created',
        platform: item.platform || 'Unknown',
        time: new Date(item.created_at || Date.now()).toLocaleDateString(),
        status: item.status === 'published' ? 'success' as const : 'pending' as const
      })) || [];

      // Convert accounts to connected accounts format
      let accountData = [];
      if (Array.isArray(connectedAccounts)) {
        accountData = connectedAccounts.map((acc: any) => ({
          platform: acc.platform ? acc.platform.charAt(0).toUpperCase() + acc.platform.slice(1) : 'Unknown',
          connected: acc.connected === true,
          status: acc.connected === true ? 'connected' as const : 'disconnected' as const
        }));
      }

      setDashboardData({
        metrics: updatedMetrics,
        recentActivity,
        connectedAccounts: accountData
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'create':
        navigate('/');
        break;
      case 'schedule':
        // Navigate to scheduling page or show scheduling modal
        break;
      case 'analytics':
        // Navigate to analytics page or show analytics
        break;
      case 'accounts':
        navigate('/accounts');
        break;
      default:
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-white/80">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

>>>>>>> d2784f3 (Backend implemented on the Homepage)
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
<<<<<<< HEAD
          {metrics.map((metric, index) => {
=======
          {dashboardData.metrics.map((metric, index) => {
>>>>>>> d2784f3 (Backend implemented on the Homepage)
            const Icon = metric.icon;
            return (
              <GlassCard key={index} hover className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg bg-white/10 ${metric.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800">
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
                      className="w-full justify-start h-12 hover:bg-black/5 hover:border-black transition-all duration-300"
<<<<<<< HEAD
=======
                      onClick={() => handleQuickAction(action.action)}
>>>>>>> d2784f3 (Backend implemented on the Homepage)
                    >
                      <Icon className="mr-3 h-5 w-5 text-black" />
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
                <Button variant="ghost" size="sm" className="text-black hover:text-gray-800">
                  <Eye className="mr-2 h-4 w-4" />
                  View All
                </Button>
              </div>
              
              <div className="space-y-4">
<<<<<<< HEAD
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.status === 'success' ? 'bg-black' : 'bg-gray-500'
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
=======
                {dashboardData.recentActivity.length > 0 ? (
                  dashboardData.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.status === 'success' ? 'bg-black' : 'bg-gray-500'
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
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No recent activity found.</p>
                    <p className="text-sm">Create some content to see activity here.</p>
                  </div>
                )}
>>>>>>> d2784f3 (Backend implemented on the Homepage)
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Account Status */}
        <div className="mt-8">
          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Connected Accounts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
<<<<<<< HEAD
              {['Facebook', 'Twitter', 'Instagram', 'LinkedIn'].map((platform) => (
                <div key={platform} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-black rounded-full" />
                    <span className="font-medium text-gray-900">{platform}</span>
                  </div>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                    Connected
                  </Badge>
                </div>
              ))}
=======
              {dashboardData.connectedAccounts.length > 0 ? (
                dashboardData.connectedAccounts.map((account) => (
                  <div key={account.platform} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        account.status === 'connected' ? 'bg-black' : 'bg-gray-400'
                      }`} />
                      <span className="font-medium text-gray-900">{account.platform}</span>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`${
                        account.status === 'connected' 
                          ? 'bg-gray-100 text-gray-800' 
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {account.status === 'connected' ? 'Connected' : 'Disconnected'}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-4 text-gray-500">
                  <p>No accounts connected. Go to Accounts page to connect your social media accounts.</p>
                </div>
              )}
>>>>>>> d2784f3 (Backend implemented on the Homepage)
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}