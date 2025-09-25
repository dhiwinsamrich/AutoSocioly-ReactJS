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
      const mockContent: ContentReview[] = [{
        id: '1',
        platform: 'facebook',
        content: 'Check out our latest blog post about social media automation! 🚀 This powerful tool can save you hours each week while maintaining your brand voice across all platforms.',
        hashtags: ['SocialMedia', 'Automation', 'Marketing'],
        status: 'pending',
        engagement_score: 85,
        character_count: 142,
        tone: 'professional'
      }, {
        id: '2',
        platform: 'twitter',
        content: 'Just discovered an amazing social media automation tool! 🎯 Save time, stay consistent, and grow your presence across all platforms. Game changer!',
        hashtags: ['SocialMedia', 'Productivity', 'GrowthHacking'],
        status: 'pending',
        engagement_score: 92,
        character_count: 138,
        tone: 'enthusiastic'
      }, {
        id: '3',
        platform: 'instagram',
        content: '✨ Social Media Automation is here! Create engaging content for multiple platforms in seconds. Perfect for busy entrepreneurs and content creators.',
        hashtags: ['Instagram', 'ContentCreation', 'BusinessGrowth'],
        status: 'pending',
        engagement_score: 78,
        character_count: 145,
        tone: 'inspiring'
      }];
      setContent(mockContent);
      setEditingContent(mockContent.reduce((acc, item) => ({
        ...acc,
        [item.id]: item.content
      }), {}));
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
        <div className="text-center mb-8 pt-20">
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
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Generated Images
                </h3>
                <Button variant="outline" size="sm">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Image
                </Button>
              </div>
              <p className="text-gray-400 mb-4">AI-generated visual content for your social media posts</p>
              
              <div className="bg-gray-900/50 rounded-lg p-6 text-center border border-gray-700">
                <div className="w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                  <Image className="h-16 w-16 text-gray-600" />
                </div>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" size="sm">
                    <Edit3 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Redo className="h-4 w-4 mr-1" />
                    Regenerate
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="lg:w-80">
              <GlassCard className="p-4 bg-gray-900/30">
                <h6 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Image Details
                </h6>
                <p className="text-sm text-gray-400">
                  This image was generated using AI based on your content topic and platform requirements.
                </p>
              </GlassCard>
            </div>
          </div>
        </GlassCard>

        {/* Generated Content Section */}
        <GlassCard className="p-6 mb-8">
          <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generated Content
          </h3>
          <p className="text-gray-400 mb-6">Platform-specific captions and content</p>
          
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
          <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Enhanced Prompt
          </h3>
          <p className="text-gray-400 mb-6">AI-enhanced prompt used for content generation</p>
          
          <div className="space-y-4">
            <div>
              <strong className="text-white">Original Prompt:</strong>
              <div className="bg-gray-800/50 p-3 rounded-lg mt-2 text-sm text-gray-400 italic border border-gray-700">
                Social media content about automation tools
              </div>
            </div>
            <div>
              <strong className="text-white">Enhanced Prompt:</strong>
              <div className="bg-gray-800/50 p-3 rounded-lg mt-2 text-white border border-gray-700">
                Create engaging social media content about automation tools that highlights time-saving benefits, 
                maintains professional tone, includes relevant hashtags, and encourages user engagement through 
                clear calls-to-action while adapting to each platform's specific format and audience expectations.
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Analytics Section */}
        <GlassCard className="p-6 mb-8">
          <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Content Analytics
          </h3>
          <p className="text-gray-400 mb-6">Performance predictions and insights</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-xs uppercase text-gray-400 mb-1">Engagement Score</div>
              <div className="text-2xl font-bold text-white">{analytics.engagement_score}</div>
            </div>
            <div className="text-center">
              <div className="text-xs uppercase text-gray-400 mb-1">Viral Potential</div>
              <div className="text-2xl font-bold text-green-400">{analytics.viral_potential}</div>
            </div>
            <div className="text-center">
              <div className="text-xs uppercase text-gray-400 mb-1">Best Time to Post</div>
              <div className="text-lg font-bold text-blue-400">{analytics.best_posting_time}</div>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <h6 className="text-gray-400 mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Target Audience
            </h6>
            <p className="text-sm text-gray-300 mb-4">{analytics.target_audience}</p>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <h6 className="text-gray-400 mb-3 flex items-center gap-2">
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
                <h3 className="text-lg font-semibold text-white">Ready to Post?</h3>
                <p className="text-gray-400">
                  {content.filter(item => item.status === 'approved').length} of {content.length} pieces approved
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <input type="datetime-local" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="border border-gray-600 bg-gray-800 text-white rounded-md px-3 py-2 text-sm" min={new Date().toISOString().slice(0, 16)} />
                </div>
                
                <Button variant="outline" onClick={handleSchedule} disabled={isScheduling || !scheduleDate} className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Schedule
                </Button>
                
                <Button onClick={handlePostAll} className="bg-white text-black hover:bg-gray-200 flex items-center gap-2">
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