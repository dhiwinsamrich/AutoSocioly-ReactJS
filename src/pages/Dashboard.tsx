import { Navigation } from '@/components/Navigation';
import { GlassCard } from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Calendar, BarChart3, Plus, Eye, Clock, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '@/services/api';
import { useNotification } from '@/hooks/useNotification';
// import { logger } from '@/utils/logger';
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
  content?: string;
  scheduledTime?: string;
  createdAt?: string;
  author?: string;
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
  const [showAllActivities, setShowAllActivities] = useState(false);
  useEffect(() => {
    fetchDashboardData();
  }, []);
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch accounts data
      const accountsResponse = await apiService.getAccounts();
      console.log('Accounts response:', accountsResponse);
      
      // Fetch posting history with error handling
      let postingHistoryResponse = { data: { history: [], posts: [] } };
      try {
        postingHistoryResponse = await apiService.getPostingHistory();
        console.log('Posting history response:', postingHistoryResponse);
      } catch (error) {
        console.error('Failed to fetch posting history:', error);
      }
      
      // Fetch scheduled posts with error handling
      let scheduledPostsResponse = { data: { scheduled_posts: [], posts: [] } };
      try {
        scheduledPostsResponse = await apiService.getScheduledPosts();
        console.log('Scheduled posts response:', scheduledPostsResponse);
      } catch (error) {
        console.error('Failed to fetch scheduled posts:', error);
      }
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

        let recentActivitiesData = [];
          try {
            const activitiesResponse = await apiService.getRecentActivities(10);
            console.log('Recent activities response:', activitiesResponse);
            if (activitiesResponse.success && activitiesResponse.activities) {
              recentActivitiesData = activitiesResponse.activities;
            }
          } catch (error) {
            console.error('Failed to fetch recent activities:', error);
          }

        // Generate recent activity from posting history
        const activity: RecentActivity[] = recentActivitiesData.length > 0 
          ? recentActivitiesData.map((act: any, index: number) => ({
              id: act.id || `redis-${index}`,
              action: act.status === 'success' ? 'Content posted' : 'Post failed',
              platform: act.platform || 'Unknown',
              time: act.timestamp ? new Date(act.timestamp).toLocaleString() : 'Recently',
              status: act.status || 'success',
              content: act.content_preview || act.content || 'Content preview not available',
              scheduledTime: act.scheduled_time,
              createdAt: act.created_at || act.timestamp,
              author: act.author || 'System'
            }))
          : [];
        // If no recent activities from API, try to generate from posting history
        if (activity.length === 0) {
          const history = postingHistoryResponse.data?.history || postingHistoryResponse.data?.posts || [];
          if (Array.isArray(history)) {
            history.slice(0, 10).forEach((post: any, index: number) => {
              activity.push({
                id: `post-${index}`,
                action: 'Content posted',
                platform: post.platform || 'Unknown',
                time: post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Recently',
                status: 'success',
                content: post.content || 'Posted content',
                createdAt: post.created_at,
                author: post.author || 'User'
              });
            });
          }
        }
        
        // Add scheduled posts as activities
        const scheduled = scheduledPostsResponse.data?.scheduled_posts || scheduledPostsResponse.data?.posts || [];
        if (Array.isArray(scheduled)) {
          scheduled.slice(0, 5).forEach((post: any, index: number) => {
            activity.push({
              id: `scheduled-${index}`,
              action: 'Post scheduled',
              platform: post.platform || 'Unknown',
              time: post.scheduled_time ? new Date(post.scheduled_time).toLocaleDateString() : 'Upcoming',
              status: 'pending',
              content: post.content || 'Scheduled content',
              scheduledTime: post.scheduled_time,
              createdAt: post.created_at,
              author: post.author || 'User'
            });
          });
        }
        // If still no activities, create a placeholder
        if (activity.length === 0) {
          activity.push({
            id: 'placeholder-1',
            action: 'Welcome to your dashboard',
            platform: 'System',
            time: new Date().toLocaleString(),
            status: 'success',
            content: 'Start creating content to see your recent activities here',
            createdAt: new Date().toISOString(),
            author: 'System'
          });
        }
        
        setRecentActivity(activity);
      } else {
        console.log('No accounts found or invalid response format');
        setConnectedAccounts([]);
        
        // Set empty state for activities
        setRecentActivity([{
          id: 'no-accounts-1',
          action: 'Connect your accounts',
          platform: 'System',
          time: new Date().toLocaleString(),
          status: 'pending',
          content: 'Connect your social media accounts to start posting content',
          createdAt: new Date().toISOString(),
          author: 'System'
        }]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showNotification('error', 'Dashboard Error', 'Failed to load dashboard data');
      
      // Set fallback activities even on error
      setRecentActivity([{
        id: 'error-1',
        action: 'Dashboard loading error',
        platform: 'System',
        time: new Date().toLocaleString(),
        status: 'error',
        content: 'There was an error loading your dashboard data. Please refresh the page.',
        createdAt: new Date().toISOString(),
        author: 'System'
      }]);
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen bg-neutral-950">
      <Navigation />
      
      <div className="container mx-auto px-4 bg-zinc-950 py-[5px]">
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
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-black hover:text-gray-800"
                  onClick={() => setShowAllActivities(!showAllActivities)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  {showAllActivities ? 'Show Less' : 'View All'}
                </Button>
              </div>
              
              <div className="space-y-4">
                {(showAllActivities ? recentActivity : recentActivity.slice(0, 4)).map(activity => (
                  <div key={activity.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            variant={activity.status === 'success' ? 'default' : activity.status === 'pending' ? 'secondary' : 'destructive'}
                            className={`text-xs ${
                              activity.status === 'success' 
                                ? 'bg-green-100 text-green-800 border-green-200' 
                                : activity.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                : 'bg-red-100 text-red-800 border-red-200'
                            }`}
                          >
                            {activity.status === 'success' ? 'Published' : activity.status === 'pending' ? 'Scheduled' : 'Failed'}
                          </Badge>
                        </div>
                        <p className="text-gray-900 font-medium text-sm mb-2 line-clamp-2">
                          {activity.content || activity.action}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 mb-2">
                          {activity.scheduledTime && (
                            <span>scheduled: {new Date(activity.scheduledTime).toLocaleDateString()} {new Date(activity.scheduledTime).toLocaleTimeString()}</span>
                          )}
                          {activity.createdAt && (
                            <span>created: {new Date(activity.createdAt).toLocaleDateString()}</span>
                          )}
                          {activity.author && (
                            <span>by: {activity.author}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-700">platforms:</span>
                          <div className="flex items-center gap-1">
                            <span className="text-blue-600 font-medium capitalize">{activity.platform}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0">
                          <span className="sr-only">Delete</span>
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {recentActivity.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No recent activities found</p>
                  </div>
                )}
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