import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { apiService } from '@/services/api';
import { GlassCard } from '@/components/GlassCard';
import { Navigation } from '@/components/Navigation';
import { Check, Edit3, X, Send, Clock, Calendar, Image, FileText, Lightbulb, BarChart3, Users, CheckCircle, ArrowUp, Redo, Info, Hash, MessageSquare, TrendingUp, RefreshCw } from 'lucide-react';
import { useNotification } from '@/hooks/useNotification';
import { useActivity } from '@/contexts/ActivityContext';
import { EditModal } from '@/components/EditModal';
import { NETWORK_CONFIG } from '@/config/network';

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
  call_to_action?: string;
}

interface PlatformAnalysis {
  platform: string;
  analysis: {
    engagement_score?: number | string;
    viral_potential?: string;
    best_posting_time?: string;
    target_audience?: string;
    strengths?: string[];
    improvements?: string[];
  };
}

interface Analytics {
  engagement_score: string;
  engagement_range?: string;
  viral_potential: string;
  best_posting_time: string;
  target_audience: string;
  strengths: string[];
  improvements: string[];
  content_performance?: string;
  hashtag_strategy?: string;
  character_optimization?: string;
}

const ReviewContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotification();
  const { addActivity, updateActivity, addLiveMessage, clearCurrentMessage, showPopup } = useActivity();
  const [content, setContent] = useState<ContentReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingContent, setEditingContent] = useState<{ [key: string]: string }>({});
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [showPostAnimation, setShowPostAnimation] = useState(false);
  const [regeneratingImages, setRegeneratingImages] = useState<Set<string>>(new Set());
  const [analytics, setAnalytics] = useState<Analytics>({
    engagement_score: 'High (85%)',
    viral_potential: 'Medium',
    best_posting_time: '2-4 PM weekdays',
    target_audience: 'Young professionals and entrepreneurs interested in social media marketing',
    strengths: ['Engaging visual content', 'Clear call-to-action', 'Trending hashtags', 'Platform-optimized format'],
    improvements: ['Add more emojis for engagement', 'Include user-generated content', 'Optimize posting schedule', 'Enhance visual storytelling']
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [workflowData, setWorkflowData] = useState<any>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [workflowId, setWorkflowId] = useState<string>('');
  const [hasFetched, setHasFetched] = useState(false);
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    type: 'caption' | 'hashtags' | 'image';
    itemId: string;
  }>({
    isOpen: false,
    type: 'caption',
    itemId: ''
  });

  useEffect(() => {
    if (!hasFetched) {
      setHasFetched(true);
      fetchGeneratedContent();
    }
  }, [hasFetched]);

  const generateAnalyticsFromContent = (contentData: ContentReview[]) => {
    if (contentData.length === 0) return;
    
    // Calculate comprehensive engagement metrics
    const engagementScores = contentData.map(item => {
      const score = typeof item.engagement_score === 'number' ? item.engagement_score : 85;
      return score;
    });
    const avgEngagement = engagementScores.reduce((sum, score) => sum + score, 0) / engagementScores.length;
    const maxEngagement = Math.max(...engagementScores);
    const minEngagement = Math.min(...engagementScores);
    
    // Analyze content characteristics
    const hasStrongCTA = contentData.some(item => 
      item.content.toLowerCase().includes('?') || 
      item.content.toLowerCase().includes('share') ||
      item.content.toLowerCase().includes('comment') ||
      item.content.toLowerCase().includes('tag') ||
      item.content.toLowerCase().includes('like')
    );
    
    const hasTrendingHashtags = contentData.some(item => item.hashtags.length >= 3);
    const hasOptimalLength = contentData.some(item => item.character_count >= 200 && item.character_count <= 300);
    const hasEmojis = contentData.some(item => /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(item.content));
    const hasQuestions = contentData.some(item => item.content.includes('?'));
    const hasNumbers = contentData.some(item => /\d+/.test(item.content));
    const hasMentions = contentData.some(item => item.content.includes('@'));
    
    // Platform-specific optimization analysis
    const platformAnalysis = contentData.map(item => {
      const platform = item.platform.toLowerCase();
      let optimization = [];
      
      if (platform === 'twitter') {
        if (item.character_count <= 280) optimization.push('Twitter character limit optimized');
        if (item.hashtags.length <= 3) optimization.push('Optimal hashtag count for Twitter');
        if (item.content.length <= 140) optimization.push('Ideal tweet length');
      } else if (platform === 'linkedin') {
        if (item.character_count >= 200 && item.character_count <= 600) optimization.push('LinkedIn optimal length');
        if (item.hashtags.length >= 3 && item.hashtags.length <= 5) optimization.push('Professional hashtag strategy');
        if (hasNumbers) optimization.push('Data-driven content');
      } else if (platform === 'instagram') {
        if (item.hashtags.length >= 8 && item.hashtags.length <= 15) optimization.push('Instagram hashtag strategy');
        if (hasEmojis) optimization.push('Visual engagement elements');
        if (hasMentions) optimization.push('Community engagement');
      }
      
      return optimization;
    }).flat();
    
    // Determine viral potential with enhanced criteria
    let viralPotential = 'Low';
    const viralScore = (hasStrongCTA ? 1 : 0) + (hasTrendingHashtags ? 1 : 0) + 
                      (hasOptimalLength ? 1 : 0) + (hasEmojis ? 1 : 0) + 
                      (hasQuestions ? 1 : 0) + (avgEngagement >= 80 ? 1 : 0);
    
    if (viralScore >= 5) viralPotential = 'Very High';
    else if (viralScore >= 4) viralPotential = 'High';
    else if (viralScore >= 3) viralPotential = 'Medium';
    
    // Generate comprehensive strengths
    const strengths = [];
    if (avgEngagement >= 80) strengths.push('Exceptional engagement potential');
    else if (avgEngagement >= 70) strengths.push('Strong engagement potential');
    
    if (hasTrendingHashtags) strengths.push('Strategic hashtag usage');
    if (hasStrongCTA) strengths.push('Strong audience engagement strategy');
    if (hasOptimalLength) strengths.push('Optimal content length');
    if (hasEmojis) strengths.push('Visual engagement elements');
    if (hasQuestions) strengths.push('Interactive content format');
    if (hasNumbers) strengths.push('Data-driven content approach');
    if (hasMentions) strengths.push('Community-focused messaging');
    if (platformAnalysis.length > 0) strengths.push(...platformAnalysis.slice(0, 2));
    
    // Generate targeted improvements
    const improvements = [];
    if (!hasStrongCTA) improvements.push('Add stronger call-to-action for engagement');
    if (!hasTrendingHashtags) improvements.push('Include strategic hashtags for discoverability');
    if (!hasOptimalLength) improvements.push('Optimize content length for platform algorithms');
    if (!hasEmojis && contentData.some(item => item.platform.toLowerCase() !== 'linkedin')) 
      improvements.push('Add visual elements for emotional connection');
    if (!hasQuestions) improvements.push('Include questions to boost audience interaction');
    if (avgEngagement < 70) improvements.push('Enhance content quality for better engagement');
    if (contentData.some(item => item.hashtags.length < 2)) improvements.push('Increase hashtag variety for broader reach');
    
    // Determine optimal posting time based on content type and target audience
    let bestPostingTime = '2-4 PM weekdays';
    if (contentData.some(item => item.platform.toLowerCase() === 'linkedin')) {
      bestPostingTime = '8-10 AM or 12-2 PM on weekdays';
    } else if (contentData.some(item => item.platform.toLowerCase() === 'twitter')) {
      bestPostingTime = '9 AM or 7-9 PM daily';
    } else if (contentData.some(item => item.platform.toLowerCase() === 'instagram')) {
      bestPostingTime = '11 AM-1 PM or 7-9 PM daily';
    }
    
    // Enhanced target audience analysis
    let targetAudience = 'Young professionals and entrepreneurs interested in social media marketing';
    if (hasNumbers && hasStrongCTA) {
      targetAudience = 'Data-driven professionals and business decision-makers';
    } else if (hasEmojis && hasQuestions) {
      targetAudience = 'Social media enthusiasts and community-oriented users';
    } else if (contentData.some(item => item.platform.toLowerCase() === 'linkedin')) {
      targetAudience = 'B2B professionals, industry leaders, and career-focused individuals';
    }
    
    // Performance metrics
    const performanceMetrics = {
      engagement_score: `${Math.round(avgEngagement)}%`,
      engagement_range: `${Math.round(minEngagement)}% - ${Math.round(maxEngagement)}%`,
      content_pieces: contentData.length,
      total_character_count: contentData.reduce((sum, item) => sum + item.character_count, 0),
      total_hashtags: contentData.reduce((sum, item) => sum + item.hashtags.length, 0),
      platforms_covered: [...new Set(contentData.map(item => item.platform))].join(', ')
    };
    
    setAnalytics({
      engagement_score: performanceMetrics.engagement_score,
      engagement_range: performanceMetrics.engagement_range,
      viral_potential: viralPotential,
      best_posting_time: bestPostingTime,
      target_audience: targetAudience,
      strengths: strengths.length > 0 ? strengths : ['Professional content quality', 'Clear messaging strategy', 'Brand-consistent tone'],
      improvements: improvements.length > 0 ? improvements : ['Enhance visual storytelling', 'Include user-generated content elements', 'Optimize for trending topics'],
      content_performance: `Generated ${performanceMetrics.content_pieces} content pieces across ${performanceMetrics.platforms_covered}`,
      hashtag_strategy: `${performanceMetrics.total_hashtags} total hashtags with strategic placement`,
      character_optimization: `${performanceMetrics.total_character_count} characters optimized for platform algorithms`
    });
  };

  const fetchGeminiAnalytics = async (contentData: ContentReview[]) => {
    if (contentData.length === 0) return;
    
    setAnalyticsLoading(true);
    try {
      // Analyze each platform's content separately and then combine results
      const platformAnalyses = await Promise.all(
        contentData.map(async (item) => {
          try {
            const response = await apiService.analyzeContent(item.content, item.platform);
            if (response.success && response.data) {
              return {
                platform: item.platform,
                analysis: response.data
              };
            }
          } catch (error) {
            console.error(`Failed to analyze content for ${item.platform}:`, error);
          }
          return null;
        })
      );

      // Filter out failed analyses
      const successfulAnalyses = platformAnalyses.filter((analysis): analysis is PlatformAnalysis => analysis !== null);
      
      if (successfulAnalyses.length > 0) {
        // Combine analyses from different platforms
        const combinedAnalysis = {
          engagement_score: '75%',
          viral_potential: 'Medium',
          best_posting_time: '2-4 PM weekdays',
          target_audience: 'Young professionals and entrepreneurs interested in social media marketing',
          strengths: [] as string[],
          improvements: [] as string[]
        };

        // Calculate average engagement score
        const engagementScores = successfulAnalyses.map(analysis => {
          const score = analysis!.analysis.engagement_score ?? 75;
          return typeof score === 'string' ? parseInt(score) : score;
        });

        const avgEngagement = Math.round(
          engagementScores.reduce((sum, score) => sum + score, 0) / engagementScores.length
        );
        // store as number
        combinedAnalysis.engagement_score = `${avgEngagement}%`;

        // Determine viral potential based on highest score
        const viralPotentials = successfulAnalyses.map(analysis => analysis!.analysis.viral_potential || 'Medium');
        const viralPotentialPriority = { 'Very High': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
        const highestViralPotential = viralPotentials.reduce((highest, current) => {
          return (viralPotentialPriority[current as keyof typeof viralPotentialPriority] || 0) > 
                 (viralPotentialPriority[highest as keyof typeof viralPotentialPriority] || 0) ? current : highest;
        }, 'Medium');
        combinedAnalysis.viral_potential = highestViralPotential;

        // Combine best posting times (take the most common one)
        const postingTimes = successfulAnalyses.map(analysis => analysis!.analysis.best_posting_time);
        const postingTimeCounts = postingTimes.reduce((counts, time) => {
          counts[time] = (counts[time] || 0) + 1;
          return counts;
        }, {} as Record<string, number>);
        const mostCommonPostingTime = Object.keys(postingTimeCounts).reduce((a, b) => 
          postingTimeCounts[a] > postingTimeCounts[b] ? a : b, postingTimes[0] || '2-4 PM weekdays');
        combinedAnalysis.best_posting_time = mostCommonPostingTime;

        // Combine target audiences (take the most specific one)
        const targetAudiences = successfulAnalyses.map(analysis => analysis!.analysis.target_audience);
        combinedAnalysis.target_audience = targetAudiences[0] || combinedAnalysis.target_audience;

        // Combine strengths and remove duplicates
        const allStrengths = successfulAnalyses.flatMap(analysis => analysis!.analysis.strengths || []);
        combinedAnalysis.strengths = [...new Set(allStrengths)].slice(0, 6);

        // Combine improvements and remove duplicates
        const allImprovements = successfulAnalyses.flatMap(analysis => analysis!.analysis.improvements || []);
        combinedAnalysis.improvements = [...new Set(allImprovements)].slice(0, 6);

        setAnalytics(combinedAnalysis);
        showNotification('success', 'Analytics Updated', 'Content analysis completed using Gemini AI');
      } else {
        // Fallback to client-side analytics if Gemini analysis fails
        generateAnalyticsFromContent(contentData);
        showNotification('info', 'Analytics Fallback', 'Using basic analytics due to API issues');
      }
    } catch (error) {
      console.error('Error fetching Gemini analytics:', error);
      // Fallback to client-side analytics on error
      generateAnalyticsFromContent(contentData);
      showNotification('info', 'Analytics Fallback', 'Using basic analytics due to API issues');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchGeneratedContent = async () => {
    try {
      setLoading(true);

      // Get workflow_id from navigation state or URL params
      const currentWorkflowId = location.state?.workflowId || new URLSearchParams(location.search).get('workflow_id');
      if (!currentWorkflowId) {
        showNotification('error', 'No Workflow', 'No workflow ID found. Please create content first.');
        setLoading(false);
        // Navigate back to home after 3 seconds
        setTimeout(() => {
          navigate('/');
        }, 3000);
        return;
      }

      // Store workflowId in state for use throughout the component
      setWorkflowId(currentWorkflowId);

      // Fetch real data from backend
      const response = await apiService.getWorkflow(currentWorkflowId);
      if (response.success) {
        // The response structure wraps data in a 'workflow' property
        const workflowResponseData = (response as any).workflow || {};
        
        // Debug: Log the actual data structure
        console.log('Workflow response data:', workflowResponseData);
        console.log('Platform content:', workflowResponseData.content);
        console.log('Generated images:', workflowResponseData.generated_images);
        
        // Store the original workflow data for the Enhanced Prompt section
        setWorkflowData(workflowResponseData);
        const platformContent = workflowResponseData.content || {};
        const workflowGeneratedImages = workflowResponseData.generated_images || workflowResponseData.images || [];
        setGeneratedImages(workflowGeneratedImages);

        // Transform platform content to ContentReview format
        const transformedContent: ContentReview[] = Object.entries(platformContent).map(([platform, contentArray]: [string, any], index) => {
          // Handle array content structure (API returns array with one item)
          const contentItem = Array.isArray(contentArray) && contentArray.length > 0 ? contentArray[0] : contentArray;
          
          // Handle the actual content structure from backend with proper null checking
          const actualContent = contentItem?.content || contentItem?.caption || contentItem?.text || '';
          const hashtags = contentItem?.hashtags || contentItem?.tags || [];
          const engagementScore = contentItem?.engagement_score || contentItem?.engagement || 'high';
          const characterCount = contentItem?.character_count || contentItem?.length || actualContent.length || 0;
          
          return {
            id: `${platform}-${index}`,
            platform: platform.toLowerCase(),
            content: actualContent,
            hashtags: hashtags,
            media_url: workflowGeneratedImages[index] || workflowGeneratedImages[0] ? apiService.getImageUrl(workflowGeneratedImages[index] || workflowGeneratedImages[0]) : '',
            status: 'pending',
            engagement_score: engagementScore === 'high' ? 85 : engagementScore === 'medium' ? 65 : engagementScore === 'low' ? 45 : Math.floor(Math.random() * 30) + 70,
            character_count: characterCount,
            tone: contentItem?.tone || workflowData?.tone || 'professional'
          };
        });
        setContent(transformedContent);
        setEditingContent(transformedContent.reduce((acc, item) => ({
          ...acc,
          [item.id]: item.content
        }), {}));

        // Update analytics if available (handle platform-specific analytics)
        if (workflowResponseData.analytics && Object.keys(workflowResponseData.analytics).length > 0) {
          // Get analytics for the first platform as overall analytics, or use platform-specific
          const firstPlatform = Object.keys(workflowResponseData.analytics)[0];
          const platformAnalytics = firstPlatform ? workflowResponseData.analytics[firstPlatform] : null;
          if (platformAnalytics) {
            setAnalytics({
              engagement_score: platformAnalytics.engagement_score || 'High (85%)',
              viral_potential: platformAnalytics.viral_potential || 'Medium',
              best_posting_time: platformAnalytics.best_posting_time || '2-4 PM weekdays',
              target_audience: platformAnalytics.target_audience || 'Young professionals and entrepreneurs interested in social media marketing',
              strengths: platformAnalytics.strengths || ['Engaging visual content', 'Clear call-to-action', 'Trending hashtags', 'Platform-optimized format'],
              improvements: platformAnalytics.improvements || ['Add more emojis for engagement', 'Include user-generated content', 'Optimize posting schedule', 'Enhance visual storytelling']
            });
          } else if (transformedContent.length > 0) {
            // Generate basic analytics from content instead of making API calls
            generateAnalyticsFromContent(transformedContent);
          }
        } else if (transformedContent.length > 0) {
          // Generate basic analytics from content instead of making API calls
          generateAnalyticsFromContent(transformedContent);
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
    setEditModal({
      isOpen: true,
      type: 'caption',
      itemId: id
    });
  };

  const handleReject = (id: string) => {
    setContent(prev => prev.filter(item => item.id !== id));
    showNotification('info', 'Content Rejected', 'Content has been removed');
  };

  const handleEditImage = (id: string) => {
    setEditModal({
      isOpen: true,
      type: 'image',
      itemId: id
    });
  };

  const handleRegenerateImage = async (id: string) => {
    try {
      // Add to regenerating set
      setRegeneratingImages(prev => new Set(prev).add(id));
      
      showNotification('info', 'Regenerating Image', 'Creating a new version of this image...');
      
      // Call API to regenerate image
      const response = await apiService.regenerateImage({
        workflow_id: workflowId,
        image_id: id
      });
      
      if (response.success) {
        // Update the generated images
        setGeneratedImages(prev => {
          const newImages = [...prev];
          const imageIndex = parseInt(id.split('-')[1]);
          if (imageIndex >= 0 && imageIndex < newImages.length) {
            newImages[imageIndex] = response.image_url;
          }
          return newImages;
        });
        
        showNotification('success', 'Image Regenerated', 'New image has been generated successfully!');
      } else {
        showNotification('error', 'Regeneration Failed', response.message || 'Failed to regenerate image');
      }
    } catch (error) {
      console.error('Image regeneration error:', error);
      showNotification('error', 'Regeneration Failed', 'Failed to regenerate image. Please try again.');
    } finally {
      // Remove from regenerating set
      setRegeneratingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleEditHashtags = (id: string) => {
    setEditModal({
      isOpen: true,
      type: 'hashtags',
      itemId: id
    });
  };

  const handleSaveEdit = async (editData: any) => {
    const { content: newContent, hashtags: newHashtags, imagePrompt } = editData;
    const itemId = editModal.itemId;

    try {
      if (editModal.type === 'caption') {
        setContent(prev => prev.map(item => item.id === itemId ? {
          ...item,
          content: newContent
        } : item));
        showNotification('success', 'Caption Updated', 'Caption has been updated successfully!');
      } else if (editModal.type === 'hashtags') {
        setContent(prev => prev.map(item => item.id === itemId ? {
          ...item,
          hashtags: newHashtags
        } : item));
        showNotification('success', 'Hashtags Updated', 'Hashtags have been updated successfully!');
      } else if (editModal.type === 'image' && imagePrompt) {
        showNotification('info', 'Regenerating Image', 'Creating new image with your prompt...');
        
        // Get the original prompt from workflow data for better context
        const originalPrompt = workflowData?.enhanced_prompt || workflowData?.topic || 'social media content';
        
        const response = await apiService.regenerateImage({
          workflow_id: workflowId,
          image_id: itemId,
          new_prompt: imagePrompt,
          original_prompt: originalPrompt
        } as { workflow_id: string; image_id: string; new_prompt?: string; original_prompt?: string });
        
        if (response.success) {
          setGeneratedImages(prev => {
            const newImages = [...prev];
            const imageIndex = parseInt(itemId.split('-')[1]);
            if (imageIndex >= 0 && imageIndex < newImages.length) {
              newImages[imageIndex] = response.image_url;
              console.log(`Updated image at index ${imageIndex} with new URL: ${response.image_url}`);
            }
            console.log('Updated generated images:', newImages);
            return newImages;
          });
          
          showNotification('success', 'Image Updated', 'Image has been regenerated successfully!');
        } else {
          showNotification('error', 'Regeneration Failed', response.message || 'Failed to regenerate image');
        }
      }
    } catch (error) {
      console.error('Error saving edit:', error);
      showNotification('error', 'Save Failed', 'Failed to save changes. Please try again.');
    }
  };

  // In ReviewContent.tsx - Fix handlePostAll function
const handlePostAll = async () => {
  setIsPosting(true);
  setShowPostAnimation(true);
  
  // Get approved content - but only for platforms that were originally selected
  const approvedContent = content.filter(item => item.status === 'approved');
  if (approvedContent.length === 0) {
    showNotification('info', 'No Content', 'Please approve at least one piece of content');
    setIsPosting(false);
    setShowPostAnimation(false);
    return;
  }

  // Get the original platforms from workflow data to ensure we only post to selected platforms
  const originalPlatforms = workflowData?.platforms || [];
  if (originalPlatforms.length === 0) {
    showNotification('error', 'No Platforms', 'No platforms selected for this content');
    setIsPosting(false);
    setShowPostAnimation(false);
    return;
  }

  // Filter approved content to only include platforms that were originally selected
  const filteredApprovedContent = approvedContent.filter(item => 
    originalPlatforms.includes(item.platform.toLowerCase())
  );

  if (filteredApprovedContent.length === 0) {
    showNotification('error', 'No Approved Content', 'No approved content found for the selected platforms');
    setIsPosting(false);
    setShowPostAnimation(false);
    return;
  }

  // Show activity popup and add activity tracking
  console.log('Starting posting process with activity tracking...');
  showPopup();
  const activityId = addActivity({
    type: 'posting',
    title: 'Publishing content',
    description: `Posting to ${filteredApprovedContent.map(item => item.platform).join(', ')}`,
    platform: filteredApprovedContent.map(item => item.platform).join(', '),
    status: 'in_progress',
    progress: 0,
    platforms: filteredApprovedContent.map(item => item.platform),
  });
  console.log('Activity created with ID:', activityId);

  // Add live messages for posting process
  const messages = [
    'Preparing content for multi-platform posting...',
    'Validating content against platform guidelines...',
    'Authenticating with social media APIs...',
    'Uploading media files...',
    'Publishing to platforms...',
    'Finalizing posts...'
  ];

  let messageIndex = 0;
  let progress = 0;
  const startTime = Date.now();

  const messageInterval = setInterval(() => {
    if (messageIndex < messages.length) {
      addLiveMessage(activityId, messages[messageIndex]);
      messageIndex++;
    }
  }, 1000);

  const progressInterval = setInterval(() => {
    progress += Math.random() * 20;
    if (progress >= 90) {
      progress = 90;
      clearInterval(progressInterval);
    } else {
      // Simple progress update
      updateActivity(activityId, { 
        progress
      });
    }
  }, 800);

  try {
    showNotification('info', 'Publishing', 'Publishing content to platforms...');

    // Get connected accounts to retrieve account IDs
    const accountsResponse = await apiService.getAccounts();
    if (!accountsResponse.success) {
      throw new Error('Failed to retrieve connected accounts');
    }

    const connectedAccounts = accountsResponse.accounts || [];
    
    // Create account mapping for platforms
    const accountMapping: Record<string, string> = {};
    connectedAccounts.forEach((account: any) => {
      if (account.platform && account.id) {
        const platformName = account.platform.toLowerCase();
        // Map both the original platform name and the backend mapped name
        accountMapping[platformName] = account.id;
        // Also map the backend version for easier lookup
        const backendMapped = mapPlatformToBackend(platformName);
        if (backendMapped !== platformName) {
          accountMapping[backendMapped] = account.id;
        }
      }
    });

    // Prepare media items from generated images
    let mediaItems: Array<{ type: string; url: string }> = [];
    
    // Convert generated images to media items
    console.log('Generated images for posting:', generatedImages);
    if (generatedImages.length > 0) {
      for (const imagePath of generatedImages) {
        if (imagePath && typeof imagePath === 'string') {
          // Convert local path to public URL using the API service
          try {
            const publicUrl = apiService.getImageUrl(imagePath);
            mediaItems.push({
              type: 'image',
              url: publicUrl
            });
            console.log(`Added media item: ${publicUrl}`);
          } catch (error) {
            console.error(`Failed to convert image path ${imagePath}:`, error);
          }
        }
      }
    }
    console.log('Final media items for posting:', mediaItems);

    // Prepare platforms array with account IDs - only for filtered approved content
    const platformsWithAccounts = filteredApprovedContent.map(item => {
      const platformName = item.platform.toLowerCase();
      const mappedPlatform = mapPlatformToBackend(platformName);
      // Look up account ID using the mapped platform name
      const accountId = accountMapping[mappedPlatform];
      
      if (!accountId) {
        throw new Error(`No account ID found for platform: ${platformName} (mapped to: ${mappedPlatform})`);
      }
      
      return {
        platform: mappedPlatform, // Use mapped platform name for backend
        accountId: accountId
      };
    });

    // Combine all content into one string - use filtered content
    const firstApprovedContent = filteredApprovedContent[0];
    const contentText = firstApprovedContent.content;
    const hashtagsText = firstApprovedContent.hashtags.map(tag => `#${tag}`).join(' ');
    const fullContent = contentText + (hashtagsText ? `\n\n${hashtagsText}` : '');

    // Prepare the payload with media items
    const payload = {
      content: fullContent,
      platforms: platformsWithAccounts,
      publishNow: true,
      timezone: "America/New_York",
      workflow_id: workflowId,
      // Include media items if they exist
      ...(mediaItems.length > 0 && { mediaItems: mediaItems }),
    };

    console.log('Sending payload with media:', payload);

    const response = await apiService.postContent(payload);

    if (!response.success) {
      throw new Error(response.message || 'Failed to post content');
    }

    // Clear intervals and update activity on success
    clearInterval(messageInterval);
    clearInterval(progressInterval);
    clearCurrentMessage(activityId);
    console.log('ReviewContent: Updating activity to completed:', activityId);
    
    // Update activity status to completed
    updateActivity(activityId, {
      status: 'completed',
      progress: 100,
      title: 'Content published successfully',
      description: 'Your post is now live on all platforms'
    });
    console.log('ReviewContent: Activity updated to completed');
    
    // Force hide popup after a short delay to show completion
    setTimeout(() => {
      console.log('ReviewContent: Hiding popup after completion');
      // The popup will auto-hide due to the activity being completed
    }, 2000);

    console.log('Successfully posted to all platforms:', response);
    showNotification('success', 'Content Posted', 'All approved content has been posted successfully!');
    
    // Navigate to success page with posting details and post data
    const platformNames = platformsWithAccounts.map(p => p.platform).join(', ');
    navigate('/success', {
      state: {
        title: 'Content Posted Successfully!',
        message: `Your content has been posted to ${platformNames}. You can view your recent activity on the dashboard.`,
        postData: response // Pass the entire API response which contains post data
      }
    });

  } catch (error: any) {
    // Clear intervals and update activity on error
    clearInterval(messageInterval);
    clearInterval(progressInterval);
    clearCurrentMessage(activityId);
    updateActivity(activityId, {
      status: 'failed',
      title: 'Content publishing failed',
      description: error.message || 'Failed to post content'
    });

    console.error('Error posting content:', error);
    showNotification('error', 'Posting Failed', `Failed to post content: ${error.message}. Please try again.`);
    
    // Navigate to error page with error details
    navigate('/error', {
      state: {
        code: 'POSTING_FAILED',
        title: 'Content Publishing Failed',
        message: 'We encountered an error while trying to publish your content. Please try again.',
        details: error.message || 'Unknown error occurred during posting'
      }
    });
  } finally {
    setIsPosting(false);
    setShowPostAnimation(false);
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
      
      // Navigate to success page with scheduling details
      const platformNames = approvedContent.map(item => item.platform).join(', ');
      navigate('/success', {
        state: {
          title: 'Content Scheduled Successfully!',
          message: `Your content has been scheduled for ${platformNames}. You can view your scheduled posts on the dashboard.`
        }
      });
    } catch (error: any) {
      console.error('Error scheduling content:', error);
      showNotification('error', 'Scheduling Failed', 'Failed to schedule content. Please try again.');
      
      // Navigate to error page with error details
      navigate('/error', {
        state: {
          code: 'SCHEDULING_FAILED',
          title: 'Content Scheduling Failed',
          message: 'We encountered an error while trying to schedule your content. Please try again.',
          details: error.message || 'Unknown error occurred during scheduling'
        }
      });
    } finally {
      setIsScheduling(false);
    }
  };

  const getPlatformDisplayName = (platform: string) => {
    const platformNames: { [key: string]: string } = {
      facebook: 'Facebook',
      x: 'X (Twitter)',
      twitter: 'X (Twitter)', // Support both for backward compatibility
      instagram: 'Instagram',
      linkedin: 'LinkedIn',
      tiktok: 'TikTok'
    };
    return platformNames[platform] || platform;
  };

  // Map platform names to backend format
  const mapPlatformToBackend = (platform: string) => {
    const platformMapping: { [key: string]: string } = {
      'twitter': 'x',
      'x': 'x',
      'facebook': 'facebook',
      'instagram': 'instagram',
      'linkedin': 'linkedin',
      'reddit': 'reddit',
      'pinterest': 'pinterest',
      'tiktok': 'tiktok',
      'youtube': 'youtube'
    };
    return platformMapping[platform.toLowerCase()] || platform.toLowerCase();
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
        <div className="text-center mb-8 pt-20 bg-neutral-950 smooth-fade-in">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <FileText className="h-10 w-10 text-white" />
            Content Review
          </h1>
          <p className="text-gray-400">Review your AI-generated social media content</p>
        </div>

        {/* Generated Image Section */}
        <GlassCard className="p-6 mb-8 smooth-fade-in-delayed">
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
                {generatedImages.length > 0 ? generatedImages.map((imageUrl, index) => <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="aspect-video bg-gray-200 flex items-center justify-center relative overflow-hidden">
                      {imageUrl ? <img 
                        src={apiService.getImageUrl(imageUrl)}
                        alt={`Generated image ${index + 1}`} className="w-full h-full object-contain" onError={e => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling!.classList.remove('hidden');
                  }} /> : null}
                      <div className={`text-center ${imageUrl ? 'hidden' : ''}`}>
                        <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="text-gray-500 text-sm">Generated Image {index + 1}</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleEditImage(`image-${index}`)} className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
                          Edit Image
                        </button>
                        <button 
                          onClick={() => handleRegenerateImage(`image-${index}`)} 
                          disabled={regeneratingImages.has(`image-${index}`)}
                          className={`flex-1 px-3 py-2 rounded-md transition-colors text-sm flex items-center justify-center ${
                            regeneratingImages.has(`image-${index}`)
                              ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                              : 'bg-gray-600 text-white hover:bg-gray-700'
                          }`}
                        >
                          {regeneratingImages.has(`image-${index}`) ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Regenerating...
                            </>
                          ) : (
                            'Regenerate'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>) : <div className="col-span-full text-center py-8">
                    <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-gray-500 text-sm">No images generated</span>
                  </div>}
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
            {content.map(item => <div key={item.id} className="bg-white rounded-lg p-6 border border-gray-700">
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
                        <Button size="sm" variant="outline" onClick={() => handleApprove(item.id)} className=" text-green-400 border-green-600 hover:bg-green-900/20">
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      </>}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h6 className="text-neutral-950 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-neutral-950" />
                        Caption:
                      </h6>
                      {item.status !== 'approved' && <Button size="sm" variant="outline" className="text-neutral-950" onClick={() => handleEdit(item.id)}>
                          <Edit3 className="h-4 w-4 mr-1 " />
                          Edit Caption
                        </Button>}
                    </div>
                    <Textarea 
                      value={editingContent[item.id] || item.content || ''} 
                      onChange={e => setEditingContent(prev => ({
                        ...prev,
                        [item.id]: e.target.value
                      }))} 
                      className="min-h-[100px] bg-white border-gray-600 text-neutral-950" 
                      disabled={item.status === 'approved'} 
                      placeholder="No content available"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h6 className="text-neutral-950 flex items-center gap-2">
                        <Hash className="h-4 w-4 text-neutral-950 mx-0 px-0 my-[7px]" />
                        Hashtags:
                      </h6>
                      {item.status !== 'approved' && <Button size="sm" variant="outline" className="text-neutral-950" onClick={() => handleEditHashtags(item.id)}>
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
                      <div className="text-sm text-neutral-950">Engagement</div>
                      <div className="font-bold text-neutral-950">{item.engagement_score || 85}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-neutral-950">Characters</div>
                      <div className="font-bold text-neutral-800">{item.character_count || item.content.length}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-neutral-950">Tone</div>
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
                {workflowData?.topic || 'Social media content'}
              </div>
            </div>
            <div>
              <strong className="text-black">Enhanced Prompt:</strong>
              <div className="p-3 rounded-lg mt-2 text-black border border-gray-700 bg-slate-50">
                {workflowData?.enhanced_prompt || workflowData?.prompt || `Create engaging social media content about ${workflowData?.topic || 'the topic'} that highlights key benefits, 
                maintains ${workflowData?.tone || 'professional'} tone, includes relevant hashtags, and encourages user engagement through 
                clear calls-to-action while adapting to each platform's specific format and audience expectations.`}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Analytics Section */}
        <GlassCard className="p-6 mb-8">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-semibold flex items-center gap-2 text-neutral-950">
              <BarChart3 className="h-5 w-5" />
              Content Analytics
            </h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => content.length > 0 && fetchGeminiAnalytics(content)}
              disabled={analyticsLoading}
              className="text-neutral-950"
            >
              {analyticsLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  Analyzing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Refresh Analytics
                </div>
              )}
            </Button>
          </div>
          <p className="mb-6 text-neutral-800">Performance predictions and insights powered by Gemini AI</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-xs uppercase text-black mb-1">Engagement Score</div>
              <div className="text-2xl font-bold text-black">{analytics.engagement_score}</div>
            </div>
            <div className="text-center">
              <div className="text-xs uppercase text-black mb-1">Viral Potential</div>
              <div className="text-2xl font-bold text-green-400 ">{analytics.viral_potential}</div>
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
                  <CheckCircle className="h-4 w-4 text-green-6 00" />
                  Strengths
                </h6>
                <div className="space-y-2">
                  {analytics.strengths.map((strength, index) => <div key={index} className="p-2 bg-green-900/20 rounded border-l-2 border-green-400 hover:bg-green-900/30 transition-colors">
                      <small className="text-neutral-950">{strength}</small>
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
                      <small className="text-neutral-950">{improvement}</small>
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
                
                <Button 
                  onClick={handlePostAll} 
                  disabled={isPosting}
                  className="text-black flex items-center gap-2 bg-blue-500 hover:bg-blue-400 disabled:opacity-100 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  {showPostAnimation ? (
                    <div className="post-loader">
                      <span className="text-black">Posting</span>
                      <div className="post-words text-black">
                        {(() => {
                          const approvedContent = content.filter(item => item.status === 'approved');
                          const platforms = [...new Set(approvedContent.map(item => item.platform))];
                          return [
                            <span key="initiated" className="post-word">Post initiated...</span>,
                            <span key="payloads" className="post-word">Sending payloads...</span>,
                            <span key="validating" className="post-word">Validating...</span>,
                            <span key="verified" className="post-word">Verified!</span>
                          ];
                        })()}
                      </div>
                    </div>
                  ) : (
                    <>
                      <Send className="h-4 w-4 text-white" />
                      <span className="text-white">Post Now</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </GlassCard>}

        {/* Edit Modal */}
        <EditModal
          isOpen={editModal.isOpen}
          onClose={() => setEditModal({ isOpen: false, type: 'caption', itemId: '' })}
          onSave={handleSaveEdit}
          initialData={{
            content: content.find(item => item.id === editModal.itemId)?.content || '',
            hashtags: content.find(item => item.id === editModal.itemId)?.hashtags || [],
            imagePrompt: ''
          }}
          type={editModal.type}
        />
      </div>
    </div>;
}

export default ReviewContent;