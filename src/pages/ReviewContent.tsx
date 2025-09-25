import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { apiService } from '@/services/api';
import { GlassCard } from '@/components/GlassCard';
import { Check, Edit3, X, Send, Clock, Calendar } from 'lucide-react';
import { useNotification } from '@/hooks/useNotification';

interface ContentReview {
  id: string;
  platform: string;
  content: string;
  hashtags: string[];
  media_url?: string;
  status: 'pending' | 'approved' | 'scheduled';
}

const ReviewContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotification();
  const [content, setContent] = useState<ContentReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingContent, setEditingContent] = useState<{ [key: string]: string }>({});
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');

  useEffect(() => {
    fetchGeneratedContent();
  }, []);

  const fetchGeneratedContent = async () => {
    try {
      setLoading(true);
      // For now, we'll simulate the content data
      // In a real implementation, this would fetch from the API
      const mockContent: ContentReview[] = [
        {
          id: '1',
          platform: 'facebook',
          content: 'Check out our latest blog post about social media automation! 🚀 This powerful tool can save you hours each week while maintaining your brand voice across all platforms. #SocialMedia #Automation #Marketing',
          hashtags: ['#SocialMedia', '#Automation', '#Marketing'],
          status: 'pending'
        },
        {
          id: '2',
          platform: 'twitter',
          content: 'Just discovered an amazing social media automation tool! 🎯 Save time, stay consistent, and grow your presence across all platforms. Game changer! #SocialMedia #Productivity #GrowthHacking',
          hashtags: ['#SocialMedia', '#Productivity', '#GrowthHacking'],
          status: 'pending'
        },
        {
          id: '3',
          platform: 'instagram',
          content: '✨ Social Media Automation is here! Create engaging content for multiple platforms in seconds. Perfect for busy entrepreneurs and content creators. #Instagram #ContentCreation #BusinessGrowth',
          hashtags: ['#Instagram', '#ContentCreation', '#BusinessGrowth'],
          status: 'pending'
        }
      ];
      
      setContent(mockContent);
      setEditingContent(
        mockContent.reduce((acc, item) => ({
          ...acc,
          [item.id]: item.content
        }), {})
      );
    } catch (error) {
      console.error('Error fetching content:', error);
      showNotification('error', 'Error', 'Failed to load generated content');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (id: string) => {
    setContent(prev => prev.map(item => 
      item.id === id ? { ...item, status: 'approved' } : item
    ));
    showNotification('success', 'Content Approved', 'Content has been approved for posting');
  };

  const handleEdit = (id: string) => {
    const newContent = editingContent[id];
    setContent(prev => prev.map(item => 
      item.id === id ? { ...item, content: newContent } : item
    ));
    showNotification('success', 'Content Updated', 'Content has been updated');
  };

  const handleReject = (id: string) => {
    setContent(prev => prev.filter(item => item.id !== id));
    showNotification('info', 'Content Rejected', 'Content has been removed');
  };

  const handlePostAll = async () => {
    const approvedContent = content.filter(item => item.status === 'approved');
    
    if (approvedContent.length === 0) {
      showNotification('info', 'No Content', 'Please approve at least one piece of content');
      return;
    }

    try {
      for (const item of approvedContent) {
        await apiService.postContent({
          platform: item.platform,
          content: item.content,
          hashtags: item.hashtags
        });
      }
      
      showNotification('success', 'Content Posted', 'All approved content has been posted successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error posting content:', error);
      showNotification('error', 'Posting Failed', 'Failed to post content. Please try again.');
    }
  };

  const handleSchedule = async () => {
    if (!scheduleDate) {
      showNotification('info', 'Schedule Required', 'Please select a date and time');
      return;
    }

    const approvedContent = content.filter(item => item.status === 'approved');
    
    if (approvedContent.length === 0) {
      showNotification('info', 'No Content', 'Please approve at least one piece of content');
      return;
    }

    setIsScheduling(true);
    
    try {
      for (const item of approvedContent) {
        await apiService.schedulePost({
          platform: item.platform,
          content: item.content,
          hashtags: item.hashtags,
          scheduled_time: scheduleDate
        });
      }
      
      showNotification('success', 'Content Scheduled', 'Content has been scheduled successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error scheduling content:', error);
      showNotification('error', 'Scheduling Failed', 'Failed to schedule content. Please try again.');
    } finally {
      setIsScheduling(false);
    }
  };

  const getPlatformDisplayName = (platform: string) => {
    const platformNames: { [key: string]: string } = {
      facebook: 'Facebook',
      twitter: 'Twitter',
      instagram: 'Instagram',
      linkedin: 'LinkedIn',
      tiktok: 'TikTok'
    };
    return platformNames[platform] || platform;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading generated content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Review Your Content</h1>
          <p className="text-gray-600">Review and approve your generated content before posting</p>
        </div>

        <div className="grid gap-6 mb-8">
          {content.map((item) => (
            <GlassCard key={item.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    {getPlatformDisplayName(item.platform)}
                  </Badge>
                  {item.status === 'approved' && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <Check className="h-3 w-3 mr-1" />
                      Approved
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {item.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(item.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Textarea
                  value={editingContent[item.id] || item.content}
                  onChange={(e) => setEditingContent(prev => ({
                    ...prev,
                    [item.id]: e.target.value
                  }))}
                  className="min-h-[100px] border-2 focus:border-blue-500"
                  disabled={item.status === 'approved'}
                />
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {item.hashtags.map((hashtag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {hashtag}
                      </Badge>
                    ))}
                  </div>
                  
                  {item.status !== 'approved' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(item.id)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      Save Edit
                    </Button>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {content.length > 0 && (
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Ready to Post?</h3>
                <p className="text-gray-600">
                  {content.filter(item => item.status === 'approved').length} of {content.length} pieces approved
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <input
                    type="datetime-local"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="border rounded-md px-3 py-2 text-sm"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
                
                <Button
                  variant="outline"
                  onClick={handleSchedule}
                  disabled={isScheduling || !scheduleDate}
                  className="flex items-center space-x-2"
                >
                  <Clock className="h-4 w-4" />
                  <span>Schedule</span>
                </Button>
                
                <Button
                  onClick={handlePostAll}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span>Post Now</span>
                </Button>
              </div>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
};

export default ReviewContent;