import { Navigation } from '@/components/Navigation';
import { GlassCard } from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ActivityDemo } from '@/components/ActivityDemo';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { TrendingUp, Users, Calendar, BarChart3, Plus, Eye, Clock, CheckCircle, Trash2 } from 'lucide-react';
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
  platforms?: string[];
  time: string;
  status: 'success' | 'pending' | 'error';
  content?: string;
  scheduledTime?: string;
  createdAt?: string;
  author?: string;
  posted_by?: string;
  post_urls?: Record<string, string>;
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
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    activityId: string | null;
    activityContent: string;
  }>({
    isOpen: false,
    activityId: null,
    activityContent: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDeleteClick = (activityId: string, content: string) => {
    setDeleteDialog({
      isOpen: true,
      activityId,
      activityContent: content
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.activityId) return;

    try {
      setIsDeleting(true);
      const response = await apiService.deleteActivity(deleteDialog.activityId);
      
      if (response.success) {
        // Remove the activity from the local state
        setRecentActivity(prev => prev.filter(activity => activity.id !== deleteDialog.activityId));
        
        // Update metrics
        setMetrics(prev => ({
          ...prev,
          totalPosts: Math.max(0, prev.totalPosts - 1)
        }));

        showNotification('success', 'Activity Deleted', 'The activity has been successfully deleted.');
      } else {
        throw new Error(response.message || 'Failed to delete activity');
      }
    } catch (error) {
      console.error('Error deleting activity:', error);
      showNotification('error', 'Delete Failed', error instanceof Error ? error.message : 'Failed to delete activity. Please try again.');
    } finally {
      setIsDeleting(false);
      setDeleteDialog({
        isOpen: false,
        activityId: null,
        activityContent: ''
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({
      isOpen: false,
      activityId: null,
      activityContent: ''
    });
  };
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch accounts data
      const accountsResponse = await apiService.getAccounts();
      console.log('Accounts response:', accountsResponse);
      
      // Fetch posting history with error handling
      let postingHistoryResponse: { data: { history: any[]; posts: any[] } } = { data: { history: [], posts: [] } };
      try {
        const response = await apiService.getPostingHistory();
        console.log('Posting history response:', response);
        if (response.success && response.data) {
          postingHistoryResponse = response as { data: { history: any[]; posts: any[] } };
        }
      } catch (error) {
        console.error('Failed to fetch posting history:', error);
      }
      
      // Fetch scheduled posts with error handling
      let scheduledPostsResponse: { data: { scheduled_posts: any[]; posts: any[] } } = { data: { scheduled_posts: [], posts: [] } };
      try {
        const response = await apiService.getScheduledPosts();
        console.log('Scheduled posts response:', response);
        if (response.success && response.data) {
          scheduledPostsResponse = response as { data: { scheduled_posts: any[]; posts: any[] } };
        }
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
            if (activitiesResponse.success) {
              // Check if activities is in data or directly in response
              recentActivitiesData = activitiesResponse.activities || 
                                   (activitiesResponse.data && activitiesResponse.data.activities) || 
                                   (activitiesResponse.data && Array.isArray(activitiesResponse.data) ? activitiesResponse.data : []);
            }
          } catch (error) {
            console.error('Failed to fetch recent activities:', error);
          }

        // Generate recent activity from posting history
        const activity: RecentActivity[] = recentActivitiesData.length > 0 
          ? recentActivitiesData.map((act: any, index: number) => {
              // Handle platforms - use platforms array if available, otherwise single platform
              const platforms = act.platforms || (act.platform ? [act.platform] : []);
              const primaryPlatform = platforms.length > 0 ? platforms[0] : 'Unknown';
              
              // Handle user name - use posted_by if available, otherwise fallback
              const userName = act.posted_by === 'user' ? 'User' : 
                              act.posted_by === 'api_user' ? 'API User' :
                              act.posted_by === 'system' ? 'System' :
                              act.posted_by || 'System';
              
              // Debug logging for post URLs
              console.log(`Activity ${act.id || index}:`, {
                post_urls: act.post_urls,
                platforms: platforms,
                status: act.status
              });
              
              return {
                id: act.id || `activity-${index}`,
                action: act.status === 'success' ? 'Content posted' : 'Post failed',
                platform: primaryPlatform,
                platforms: platforms,
                time: act.timestamp ? new Date(act.timestamp).toLocaleString() : 'Recently',
                status: act.status || 'success',
                content: act.content_preview || act.content || 'Content preview not available',
                scheduledTime: act.scheduled_time,
                createdAt: act.created_at || act.timestamp,
                author: userName,
                posted_by: act.posted_by,
                post_urls: act.post_urls || {}
              };
            })
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
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 bg-zinc-950 py-4 sm:py-6 lg:py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-white/80">Monitor your social media performance and manage content</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Quick Actions and Activity Demo */}
          <div className="lg:col-span-1 space-y-8">
            {/* Quick Actions */}
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

            {/* Activity Demo */}
            {/* <GlassCard className="p-6">
              <ActivityDemo />
            </GlassCard> */}
          </div>

          {/* Right Column - Recent Activity */}
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
                          <div className="flex items-center gap-1 flex-wrap">
                            {activity.platforms && activity.platforms.length > 0 ? (
                              activity.platforms.map((platform, index) => (
                                <span key={index} className="text-blue-600 font-medium capitalize">
                                  {platform}
                                  {index < activity.platforms!.length - 1 && ', '}
                                </span>
                              ))
                            ) : (
                              <span className="text-blue-600 font-medium capitalize">{activity.platform}</span>
                            )}
                          </div>
                        </div>
                        
                        {/* Post Links */}
                        {activity.post_urls && Object.keys(activity.post_urls).length > 0 && (
                          <div className="flex items-center gap-2 text-sm mt-1">
                            <span className="text-gray-700">links:</span>
                            <div className="flex items-center gap-2 flex-wrap">
                              {Object.entries(activity.post_urls).map(([platform, url]) => (
                                <a
                                  key={platform}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 underline text-xs"
                                >
                                  {platform}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0 transition-colors"
                          onClick={() => handleDeleteClick(activity.id, activity.content || activity.action)}
                          disabled={isDeleting}
                        >
                          <span className="sr-only">Delete</span>
                          <Trash2 className="h-4 w-4" />
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

      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Activity"
        message={`Are you sure you want to delete this activity? This action cannot be undone.

Content: "${deleteDialog.activityContent}"`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>;
}