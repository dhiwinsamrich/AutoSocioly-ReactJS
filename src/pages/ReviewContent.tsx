import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { apiService } from '@/services/api';
import { GlassCard } from '@/components/GlassCard';
import { Navigation } from '@/components/Navigation';
import { Check, Edit3, X, Send, Clock, Calendar, Image, FileText, Lightbulb, BarChart3, Users, CheckCircle, ArrowUp, Redo, Info, Hash, MessageSquare, TrendingUp } from 'lucide-react';
import { useNotification } from '@/hooks/useNotification';
interface ContentReview {
  id: string;
  platform: string;
  content: string;
  hashtags: string[];
  media_url?: string;
  status: 'pending' | 'approved' | 'scheduled';
  engagement_score?: number;
  character_count?: number;
  tone?: string;
}
interface Analytics {
  engagement_score: string;
  viral_potential: string;
  best_posting_time: string;
  target_audience: string;
  strengths: string[];
  improvements: string[];
}
const ReviewContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    showNotification
  } = useNotification();
  const [content, setContent] = useState<ContentReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingContent, setEditingContent] = useState<{
    [key: string]: string;
  }>({});
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [analytics, setAnalytics] = useState<Analytics>({
    engagement_score: 'High (85%)',
    viral_potential: 'Medium',
    best_posting_time: '2-4 PM weekdays',
    target_audience: 'Young professionals and entrepreneurs interested in social media marketing',
    strengths: ['Engaging visual content', 'Clear call-to-action', 'Trending hashtags', 'Platform-optimized format'],
    improvements: ['Add more emojis for engagement', 'Include user-generated content', 'Optimize posting schedule', 'Enhance visual storytelling']
  });
  useEffect(() => {
    fetchGeneratedContent();
  }, []);
  const fetchGeneratedContent = async () => {
    try {
      setLoading(true);

      // Get workflow_id from navigation state
      const workflowId = location.state?.workflowId;
      if (!workflowId) {
        showNotification('error', 'No Workflow', 'No workflow ID found. Please create content first.');
        setLoading(false);
        return;
      }

      // Fetch real data from backend
      const response = await apiService.getWorkflow(workflowId);
      if (response.success) {
        // The response structure wraps data in a 'workflow' property
        const workflowData = (response as any).workflow || {};
        const platformContent = workflowData.content || {};
        const generatedImages = workflowData.images || [];

        // Transform platform content to ContentReview format
        const transformedContent: ContentReview[] = Object.entries(platformContent).map(([platform, contentArray]: [string, any], index) => {
          // Handle array content structure (API returns array with one item)
          const contentItem = Array.isArray(contentArray) && contentArray.length > 0 ? contentArray[0] : contentArray;
          return {
            id: `${platform}-${index}`,
            platform: platform.toLowerCase(),
            content: contentItem.content || contentItem.caption || '',
            hashtags: contentItem.hashtags || [],
            media_url: generatedImages[index] || generatedImages[0] ? apiService.getImageUrl(generatedImages[index] || generatedImages[0]) : '',
            status: 'pending',
            engagement_score: contentItem.engagement_score || Math.floor(Math.random() * 30) + 70,
            character_count: contentItem.content?.length || contentItem.caption?.length || 0,
            tone: contentItem.tone || workflowData.tone || 'professional'
          };
        });
        setContent(transformedContent);
        setEditingContent(transformedContent.reduce((acc, item) => ({
          ...acc,
          [item.id]: item.content
        }), {}));

        // Update analytics if available (handle platform-specific analytics)
        if (workflowData.analytics && Object.keys(workflowData.analytics).length > 0) {
          // Get analytics for the first platform as overall analytics, or use platform-specific
          const firstPlatform = Object.keys(workflowData.analytics)[0];
          const platformAnalytics = firstPlatform ? workflowData.analytics[firstPlatform] : null;
          if (platformAnalytics) {
            setAnalytics({
              engagement_score: platformAnalytics.engagement_score || 'High (85%)',
              viral_potential: platformAnalytics.viral_potential || 'Medium',
              best_posting_time: platformAnalytics.best_posting_time || '2-4 PM weekdays',
              target_audience: platformAnalytics.target_audience || 'Young professionals and entrepreneurs interested in social media marketing',
              strengths: platformAnalytics.strengths || ['Engaging visual content', 'Clear call-to-action', 'Trending hashtags', 'Platform-optimized format'],
              improvements: platformAnalytics.improvements || ['Add more emojis for engagement', 'Include user-generated content', 'Optimize posting schedule', 'Enhance visual storytelling']
            });
          } else {
            // Set default analytics when no analysis data is available
            setAnalytics({
              engagement_score: 'High (85%)',
              viral_potential: 'Medium',
              best_posting_time: '2-4 PM weekdays',
              target_audience: 'Young professionals and entrepreneurs interested in social media marketing',
              strengths: ['Engaging visual content', 'Clear call-to-action', 'Trending hashtags', 'Platform-optimized format'],
              improvements: ['Add more emojis for engagement', 'Include user-generated content', 'Optimize posting schedule', 'Enhance visual storytelling']
            });
          }
        } else {
          // Set default analytics when no analysis data is available
          setAnalytics({
            engagement_score: 'High (85%)',
            viral_potential: 'Medium',
            best_posting_time: '2-4 PM weekdays',
            target_audience: 'Young professionals and entrepreneurs interested in social media marketing',
            strengths: ['Engaging visual content', 'Clear call-to-action', 'Trending hashtags', 'Platform-optimized format'],
            improvements: ['Add more emojis for engagement', 'Include user-generated content', 'Optimize posting schedule', 'Enhance visual storytelling']
          });
        }
      } else {
        showNotification('error', 'Failed to Load', response.message || 'Failed to load generated content');
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      showNotification('error', 'Error', 'Failed to load generated content');
    } finally {
      setLoading(false);
    }
  };
  const handleApprove = (id: string) => {
    setContent(prev => prev.map(item => item.id === id ? {
      ...item,
      status: 'approved'
    } : item));
    showNotification('success', 'Content Approved', 'Content has been approved for posting');
  };
  const handleEdit = (id: string) => {
    const newContent = editingContent[id];
    setContent(prev => prev.map(item => item.id === id ? {
      ...item,
      content: newContent
    } : item));
    showNotification('success', 'Content Updated', 'Content has been updated');
  };
  const handleReject = (id: string) => {
    setContent(prev => prev.filter(item => item.id !== id));
    showNotification('info', 'Content Rejected', 'Content has been removed');
  };
  const handleEditImage = (id: string) => {
    showNotification('info', 'Image Editing', 'Image editing functionality coming soon!');
  };
  const handleRegenerateImage = (id: string) => {
    showNotification('info', 'Image Regeneration', 'Image regeneration functionality coming soon!');
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
    const platformNames: {
      [key: string]: string;
    } = {
      facebook: 'Facebook',
      twitter: 'Twitter',
      instagram: 'Instagram',
      linkedin: 'LinkedIn',
      tiktok: 'TikTok'
    };
    return platformNames[platform] || platform;
  };
  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading generated content...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-black text-white">
      <Navigation />
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-8 pt-20 bg-neutral-950">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <FileText className="h-10 w-10 text-white" />
            Content Review
          </h1>
          <p className="text-gray-400">Review your AI-generated social media content</p>
        </div>

        {/* Generated Image Section */}
        <GlassCard className="p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold flex items-center gap-2 text-neutral-950">
                  <Image className="h-5 w-5" />
                  Generated Images
                </h3>
                <Button variant="outline" size="sm" className="text-neutral-950">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Image
                </Button>
              </div>
              <p className="mb-4 text-neutral-800">AI-generated visual content for your social media posts</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {content.map(item => <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="aspect-video bg-gray-200 flex items-center justify-center relative">
                      {item.media_url ? <img src={item.media_url} alt={`Generated content for ${item.platform}`} className="w-full h-full object-cover" onError={e => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling!.classList.remove('hidden');
                  }} /> : null}
                      <div className={`text-center ${item.media_url ? 'hidden' : ''}`}>
                        <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="text-gray-500 text-sm">Generated Image for {item.platform}</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleEditImage(item.id)} className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
                          Edit Image
                        </button>
                        <button onClick={() => handleRegenerateImage(item.id)} className="flex-1 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm">
                          Regenerate
                        </button>
                      </div>
                    </div>
                  </div>)}
              </div>
            </div>
            
            
          </div>
        </GlassCard>

        {/* Generated Content Section */}
        <GlassCard className="p-6 mb-8">
          <h3 className="text-xl font-semibold mb-2 flex items-center gap-2 text-neutral-950">
            <FileText className="h-5 w-5" />
            Generated Content
          </h3>
          <p className="mb-6 text-neutral-900">Platform-specific captions and content</p>
          
          <div className="space-y-6">
            {content.map(item => <div key={item.id} className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-lg px-3 py-1 border-gray-600">
                      {getPlatformDisplayName(item.platform)}
                    </Badge>
                    {item.status === 'approved' && <Badge className="bg-green-900/30 text-green-400 border-green-600">
                        <Check className="h-3 w-3 mr-1" />
                        Approved
                      </Badge>}
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.status === 'pending' && <>
                        <Button size="sm" variant="outline" onClick={() => handleReject(item.id)} className="text-red-400 border-red-600 hover:bg-red-900/20">
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button size="sm" onClick={() => handleApprove(item.id)} className="bg-green-900/30 text-green-400 border-green-600 hover:bg-green-900/50">
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      </>}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h6 className="text-white flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Caption:
                      </h6>
                      {item.status !== 'approved' && <Button size="sm" variant="outline" onClick={() => handleEdit(item.id)}>
                          <Edit3 className="h-4 w-4 mr-1" />
                          Edit Caption
                        </Button>}
                    </div>
                    <Textarea value={editingContent[item.id] || item.content} onChange={e => setEditingContent(prev => ({
                  ...prev,
                  [item.id]: e.target.value
                }))} className="min-h-[100px] bg-gray-800 border-gray-600 text-white" disabled={item.status === 'approved'} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h6 className="text-white flex items-center gap-2">
                        <Hash className="h-4 w-4 text-neutral-950 mx-0 px-0 my-[7px]" />
                        Hashtags:
                      </h6>
                      {item.status !== 'approved' && <Button size="sm" variant="outline" className="text-neutral-950">
                          <Edit3 className="h-4 w-4 mr-1" />
                          Edit Hashtags
                        </Button>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {item.hashtags.map((hashtag, index) => <Badge key={index} className="bg-white text-black hover:bg-gray-200">
                          #{hashtag}
                        </Badge>)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Engagement</div>
                      <div className="font-bold text-neutral-950">{item.engagement_score || 85}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Characters</div>
                      <div className="font-bold text-neutral-800">{item.character_count || item.content.length}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Tone</div>
                      <div className="font-bold text-neutral-950">{item.tone || 'Professional'}</div>
                    </div>
                  </div>
                </div>
              </div>)}
          </div>
        </GlassCard>

        {/* Enhanced Prompt Section */}
        <GlassCard className="p-6 mb-8">
          <h3 className="text-xl font-semibold mb-2 flex items-center gap-2 text-neutral-950">
            <Lightbulb className="h-5 w-5" />
            Enhanced Prompt
          </h3>
          <p className="mb-6 text-neutral-800">AI-enhanced prompt used for content generation</p>
          
          <div className="space-y-4">
            <div>
              <strong className="text-black bg-inherit">Original Prompt:</strong>
              <div className="p-3 rounded-lg mt-2 text-sm text-black italic border border-gray-700 bg-slate-50">
                Social media content about automation tools
              </div>
            </div>
            <div>
              <strong className="text-black">Enhanced Prompt:</strong>
              <div className="p-3 rounded-lg mt-2 text-black border border-gray-700 bg-slate-50">
                Create engaging social media content about automation tools that highlights time-saving benefits, 
                maintains professional tone, includes relevant hashtags, and encourages user engagement through 
                clear calls-to-action while adapting to each platform's specific format and audience expectations.
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Analytics Section */}
        <GlassCard className="p-6 mb-8">
          <h3 className="text-xl font-semibold mb-2 flex items-center gap-2 text-neutral-950">
            <BarChart3 className="h-5 w-5" />
            Content Analytics
          </h3>
          <p className="mb-6 text-neutral-800">Performance predictions and insights</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-xs uppercase text-black mb-1">Engagement Score</div>
              <div className="text-2xl font-bold text-black">{analytics.engagement_score}</div>
            </div>
            <div className="text-center">
              <div className="text-xs uppercase text-black mb-1">Viral Potential</div>
              <div className="text-2xl font-bold text-green">{analytics.viral_potential}</div>
            </div>
            <div className="text-center">
              <div className="text-xs uppercase text-black mb-1">Best Time to Post</div>
              <div className="text-lg font-bold text-blue-400">{analytics.best_posting_time}</div>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <h6 className="mb-2 flex items-center gap-2 text-neutral-950">
              <Users className="h-4 w-4" />
              Target Audience
            </h6>
            <p className="text-sm mb-4 text-neutral-900">{analytics.target_audience}</p>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <h6 className="mb-3 flex items-center gap-2 text-neutral-950">
              <TrendingUp className="h-4 w-4" />
              Content Analysis
            </h6>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h6 className="text-green-400 mb-2 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  Strengths
                </h6>
                <div className="space-y-2">
                  {analytics.strengths.map((strength, index) => <div key={index} className="p-2 bg-green-900/20 rounded border-l-2 border-green-400">
                      <small className="text-gray-300">{strength}</small>
                    </div>)}
                </div>
              </div>
              
              <div>
                <h6 className="text-blue-400 mb-2 flex items-center gap-1">
                  <ArrowUp className="h-4 w-4" />
                  Suggested Improvements
                </h6>
                <div className="space-y-2">
                  {analytics.improvements.map((improvement, index) => <div key={index} className="p-2 bg-blue-900/20 rounded border-l-2 border-blue-400 hover:bg-blue-900/30 transition-colors">
                      <small className="text-gray-300">{improvement}</small>
                    </div>)}
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Action Buttons */}
        {content.length > 0 && <GlassCard className="p-6 sticky bottom-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-neutral-950">Ready to Post?</h3>
                <p className="text-neutral-900">
                  {content.filter(item => item.status === 'approved').length} of {content.length} pieces approved
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <input type="datetime-local" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="border border-gray-600 bg-gray-800 text-white rounded-md px-3 py-2 text-sm" min={new Date().toISOString().slice(0, 16)} />
                </div>
                
                <Button variant="outline" onClick={handleSchedule} disabled={isScheduling || !scheduleDate} className="flex items-center gap-2 text-neutral-950">
                  <Clock className="h-4 w-4" />
                  Schedule
                </Button>
                
                <Button onClick={handlePostAll} className="text-black flex items-center gap-2 bg-stone-500 hover:bg-stone-400">
                  <Send className="h-4 w-4" />
                  Post Now
                </Button>
              </div>
            </div>
          </GlassCard>}
      </div>
    </div>;
};
export default ReviewContent;