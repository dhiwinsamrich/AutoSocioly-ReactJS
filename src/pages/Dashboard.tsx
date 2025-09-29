import { Navigation } from '@/components/Navigation';
import { GlassCard } from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Calendar, BarChart3, Plus, Eye, Clock, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '@/services/api';
import { useNotification } from '@/hooks/useNotification';
interface DashboardMetrics {
  totalPosts: number;
  engagementRate: number;
  totalFollowers: number;
  scheduledPosts: number;
}
interface RecentActivity {
  id: string;
  action: string;
  platform: string;
  time: string;
  status: 'success' | 'pending' | 'error';
}
export default function Dashboard() {
  const navigate = useNavigate();
  const {
    showNotification
  } = useNotification();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalPosts: 0,
    engagementRate: 0,
    totalFollowers: 0,
    scheduledPosts: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchDashboardData();
  }, []);
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch accounts data
      const accountsResponse = await apiService.getAccounts();
      console.log('Accounts response:', accountsResponse);
      const postingHistoryResponse = await apiService.getPostingHistory();
      console.log('Posting history response:', postingHistoryResponse);
      const scheduledPostsResponse = await apiService.getScheduledPosts();
      console.log('Scheduled posts response:', scheduledPostsResponse);
      if (accountsResponse.success && accountsResponse.accounts) {
        const accounts = Array.isArray(accountsResponse.accounts) ? accountsResponse.accounts : [];
        setConnectedAccounts(accounts.filter((acc: any) => acc.connected));

        // Calculate metrics
        const totalFollowers = accounts.reduce((sum: number, acc: any) => {
          return sum + (parseInt(acc.followers) || parseInt(acc.followers_count) || 0);
        }, 0);
        setMetrics({
          totalPosts: postingHistoryResponse.data?.history?.length || postingHistoryResponse.data?.posts?.length || 0,
          engagementRate: 8.4,
          // Default for now
          totalFollowers: totalFollowers,
          scheduledPosts: scheduledPostsResponse.data?.scheduled_posts?.length || scheduledPostsResponse.data?.posts?.length || 0
        });

        // Generate recent activity from posting history
        const activity: RecentActivity[] = [];
        const history = postingHistoryResponse.data?.history || postingHistoryResponse.data?.posts || [];
        if (Array.isArray(history)) {
          history.slice(0, 5).forEach((post: any, index: number) => {
            activity.push({
              id: `post-${index}`,
              action: 'Content posted',
              platform: post.platform || 'Unknown',
              time: post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Recently',
              status: 'success'
            });
          });
        }
        const scheduled = scheduledPostsResponse.data?.scheduled_posts || scheduledPostsResponse.data?.posts || [];
        if (Array.isArray(scheduled)) {
          scheduled.slice(0, 3).forEach((post: any, index: number) => {
            activity.push({
              id: `scheduled-${index}`,
              action: 'Post scheduled',
              platform: post.platform || 'Unknown',
              time: post.scheduled_time ? new Date(post.scheduled_time).toLocaleDateString() : 'Upcoming',
              status: 'pending'
            });
          });
        }
        setRecentActivity(activity);
      } else {
        console.log('No accounts found or invalid response format');
        setConnectedAccounts([]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showNotification('error', 'Dashboard Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen bg-neutral-950">
      <Navigation />
      
      <div className="container mx-auto px-4 bg-zinc-950 py-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-white/80">Monitor your social media performance and manage content</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <GlassCard className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {[{
                label: 'Create Content',
                icon: Plus,
                action: () => navigate('/')
              }, {
                label: 'Manage Accounts',
                icon: Users,
                action: () => navigate('/accounts')
              }].map((action, index) => {
                const Icon = action.icon;
                return <Button key={index} variant="outline" onClick={action.action} className="w-full justify-start h-12 hover:bg-black/5 hover:border-black transition-all duration-300">
                      <Icon className="mr-3 h-5 w-5 text-black" />
                      {action.label}
                    </Button>;
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
                {recentActivity.map(activity => <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-2 h-2 rounded-full ${activity.status === 'success' ? 'bg-black' : 'bg-gray-500'}`} />
                      <div>
                        <p className="font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-600">{activity.platform}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{activity.time}</span>
                    </div>
                  </div>)}
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Account Status */}
        <div className="mt-8">
          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Connected Accounts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {loading ? <div className="col-span-full text-center py-8">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-24 mx-auto"></div>
                  </div>
                </div> : connectedAccounts.length > 0 ? connectedAccounts.map(account => <div key={account.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-black rounded-full" />
                      <span className="font-medium text-gray-900 capitalize">{account.platform}</span>
                    </div>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                      Connected
                    </Badge>
                  </div>) : <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">No connected accounts found</p>
                  <Button variant="outline" className="mt-4" onClick={() => navigate('/accounts')}>
                    Connect Accounts
                  </Button>
                </div>}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>;
}