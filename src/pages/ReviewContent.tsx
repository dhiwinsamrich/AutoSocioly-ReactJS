import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { apiService } from '@/services/api';
import { GlassCard } from '@/components/GlassCard';
import { Navigation } from '@/components/Navigation';
import { Check, Edit3, X, Send, Clock, Calendar, Image, FileText, Lightbulb, BarChart3, Users, CheckCircle, ArrowUp, Redo, Info, Hash, MessageSquare, TrendingUp, RefreshCw, Download } from 'lucide-react';
import { useNotification } from '@/hooks/useNotification';
import { useActivity } from '@/contexts/ActivityContext';
import { EditModal } from '@/components/EditModal';
import { NETWORK_CONFIG, getApiUrl } from '@/config/network';

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
  const [downloadingImages, setDownloadingImages] = useState<Set<number>>(new Set());
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
  const [subreddit, setSubreddit] = useState<string>('');
  // Reddit flair inputs (optional; subreddit may require flair)
  const [redditFlairId, setRedditFlairId] = useState<string>('');
  const [redditFlairText, setRedditFlairText] = useState<string>('');
  const [subredditError, setSubredditError] = useState<string>('');
  const [isVerifyingSubreddit, setIsVerifyingSubreddit] = useState<boolean>(false);
  const [subredditVerified, setSubredditVerified] = useState<boolean>(false);
  const [subredditVerificationError, setSubredditVerificationError] = useState<string>('');
  
  // Pinterest board selection state
  const [pinterestBoards, setPinterestBoards] = useState<Array<{id: string, name: string}>>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string>('');
  const [isLoadingBoards, setIsLoadingBoards] = useState<boolean>(false);
  const [boardError, setBoardError] = useState<string>('');

  useEffect(() => {
    if (!hasFetched) {
      setHasFetched(true);
      fetchGeneratedContent();
    }
  }, [hasFetched]); // Include hasFetched dependency for proper React behavior

  const fetchPinterestBoards = useCallback(async () => {
    try {
      setIsLoadingBoards(true);
      setBoardError('');
      
      // Get connected accounts to find Pinterest account
      const accountsResponse = await apiService.getAccounts();
      if (!accountsResponse.success) {
        throw new Error('Failed to retrieve connected accounts');
      }

      // Handle nested accounts structure
      const connectedAccounts = accountsResponse.accounts?.data?.accounts || accountsResponse.accounts?.accounts || accountsResponse.accounts || [];
      const pinterestAccount = connectedAccounts.find((account: any) => 
        account.platform && account.platform.toLowerCase() === 'pinterest'
      );

      if (!pinterestAccount) {
        throw new Error('No Pinterest account connected');
      }

      // Fetch Pinterest boards
      const boardsResponse = await apiService.getPinterestBoards(pinterestAccount.id);
      
      // Handle both response formats (with and without success property)
      const boards = boardsResponse.boards || (boardsResponse.success ? boardsResponse.data?.boards : null);
      const defaultBoardId = boardsResponse.defaultBoardId || (boardsResponse.success ? boardsResponse.data?.defaultBoardId : null);
      
      if (boards && boards.length > 0) {
        setPinterestBoards(boards);
        
        // Set default board if available
        if (defaultBoardId) {
          setSelectedBoardId(defaultBoardId);
        } else if (boards.length > 0) {
          setSelectedBoardId(boards[0].id);
        }
        
        showNotification('success', 'Pinterest Boards Loaded', `Found ${boards.length} Pinterest boards`);
      } else {
        throw new Error(boardsResponse.message || 'Failed to load Pinterest boards');
      }
    } catch (error) {
      setBoardError(error instanceof Error ? error.message : 'Failed to load Pinterest boards');
      showNotification('error', 'Board Loading Failed', error instanceof Error ? error.message : 'Failed to load Pinterest boards');
    } finally {
      setIsLoadingBoards(false);
    }
  }, [showNotification]);

  // Auto-fetch Pinterest boards when Pinterest content is detected
  useEffect(() => {
    const hasPinterestContent = content.some(item => item.platform.toLowerCase() === 'pinterest');
    if (hasPinterestContent && pinterestBoards.length === 0 && !isLoadingBoards) {
      fetchPinterestBoards();
    }
  }, [content, pinterestBoards.length, isLoadingBoards, fetchPinterestBoards]);

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
            // Failed to analyze content for this platform
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
        const engagementScores = successfulAnalyses.map((analysis) => {
          const score = analysis!.analysis.engagement_score ?? 75;
          if (typeof score === 'string') {
            const parsed = Number.parseInt(score, 10);
            return Number.isNaN(parsed) ? 75 : parsed;
          }
          return score;
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
        
        // Process workflow response data
        
        // Store the original workflow data for the Enhanced Prompt section
        setWorkflowData(workflowResponseData);
        
        // Handle both data structures - check if data is wrapped in 'data' property
        const platformContent = workflowResponseData.data?.content || workflowResponseData.content || {};
        const workflowGeneratedImages = workflowResponseData.data?.generated_images || workflowResponseData.generated_images || workflowResponseData.images || [];
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

        // Initialize subreddit with default value if Reddit content exists
        const hasRedditContent = transformedContent.some(item => item.platform.toLowerCase() === 'reddit');
        if (hasRedditContent && !subreddit) {
          setSubreddit('technology'); // Default subreddit
        }

        // Initialize Pinterest board selection if Pinterest content exists
        const hasPinterestContent = transformedContent.some(item => item.platform.toLowerCase() === 'pinterest');
        if (hasPinterestContent) {
          fetchPinterestBoards();
        }

        // Update analytics if available (handle platform-specific analytics)
        const analyticsData = workflowResponseData.data?.analytics || workflowResponseData.analytics;
        if (analyticsData && Object.keys(analyticsData).length > 0) {
          // Get analytics for the first platform as overall analytics, or use platform-specific
          const firstPlatform = Object.keys(analyticsData)[0];
          const platformAnalytics = firstPlatform ? analyticsData[firstPlatform] : null;
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

  const handleDownloadImage = async (imageUrl: string, index: number) => {
    try {
      // Add to downloading set
      setDownloadingImages(prev => new Set(prev).add(index));
      
      showNotification('info', 'Downloading Image', 'Preparing image for download...');
      
      // Validate image URL
      if (!imageUrl || imageUrl.trim() === '') {
        throw new Error('No image URL provided');
      }
      
      // Convert relative URL to absolute URL using the API service method
      const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : apiService.getImageUrl(imageUrl);
      
      // Downloading image
      
      // Fetch the image with proper headers
      const response = await fetch(fullImageUrl, {
        method: 'GET',
        headers: {
          'Accept': 'image/*',
        },
        credentials: 'include', // Include cookies for authentication if needed
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      
      // Check if response is actually an image
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        throw new Error('Response is not an image');
      }
      
      // Convert to blob
      const blob = await response.blob();
      
      // Validate blob size
      if (blob.size === 0) {
        throw new Error('Downloaded image is empty');
      }
      
      // Determine file extension from content type or default to png
      const extension = contentType.includes('jpeg') || contentType.includes('jpg') ? 'jpg' : 
                       contentType.includes('gif') ? 'gif' : 
                       contentType.includes('webp') ? 'webp' : 'png';
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `generated-image-${index + 1}.${extension}`;
      link.style.display = 'none'; // Hide the link element
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(url);
      
      showNotification('success', 'Download Started', `Image ${index + 1} download has started successfully!`);
    } catch (error) {
      console.error('Download error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showNotification('error', 'Download Failed', `Failed to download image: ${errorMessage}`);
    } finally {
      // Remove from downloading set
      setDownloadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
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
        const originalPrompt = workflowData?.data?.enhanced_prompt || workflowData?.enhanced_prompt || workflowData?.data?.topic || workflowData?.topic || 'social media content';
        
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
              // Updated image at index
            }
            // Updated generated images
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

  // Check if Reddit is selected and validate subreddit
  const hasReddit = approvedContent.some(item => item.platform.toLowerCase() === 'reddit');
  if (hasReddit) {
    if (!validateSubreddit(subreddit)) {
      showNotification('error', 'Invalid Subreddit', subredditError || 'Please enter a valid subreddit for Reddit posts');
      setIsPosting(false);
      setShowPostAnimation(false);
      return;
    }
    
    // Require verification for Reddit posts
    if (!subredditVerified) {
      showNotification('error', 'Subreddit Not Verified', 'Please verify the subreddit exists before posting to Reddit');
      setIsPosting(false);
      setShowPostAnimation(false);
      return;
    }
  }

  // Check if Pinterest is selected and validate board selection
  const hasPinterest = approvedContent.some(item => item.platform.toLowerCase() === 'pinterest');
  if (hasPinterest) {
    if (!selectedBoardId) {
      showNotification('error', 'Board Required', 'Please select a Pinterest board for your pins');
      setIsPosting(false);
      setShowPostAnimation(false);
      return;
    }
  }

  // Get the original platforms from workflow data to ensure we only post to selected platforms
  const originalPlatforms = workflowData?.data?.platforms || workflowData?.platforms || [];
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
  // Starting posting process with activity tracking
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
  // Activity created with ID

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

  // Store interval IDs for cleanup
  const intervalIds = [messageInterval, progressInterval];

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
          } catch (error) {
            // Failed to convert image path
          }
        }
      }
    }

    // Prepare platforms array with account IDs - only for filtered approved content
    const platformsWithAccounts = filteredApprovedContent.map(item => {
      const platformName = item.platform.toLowerCase();
      const mappedPlatform = mapPlatformToBackend(platformName);
      // Look up account ID using the mapped platform name
      const accountId = accountMapping[mappedPlatform];
      
      if (!accountId) {
        throw new Error(`No account ID found for platform: ${platformName} (mapped to: ${mappedPlatform})`);
      }
      
      const platformEntry: any = {
        platform: mappedPlatform, // Use mapped platform name for backend
        accountId: accountId
      };

      // Add platform-specific data for Reddit
      if (mappedPlatform === 'reddit' && subreddit.trim()) {
        const platformSpecificData: any = {
          subreddit: subreddit.trim()
        };
        // Prefer flair_id when provided; fallback to flair text when set
        if (redditFlairId && redditFlairId.trim()) {
          platformSpecificData.flair_id = redditFlairId.trim();
        } else if (redditFlairText && redditFlairText.trim()) {
          platformSpecificData.flair = redditFlairText.trim();
        }
        platformEntry.platformSpecificData = platformSpecificData;
      }
      
      // Add platform-specific data for Pinterest
      if (mappedPlatform === 'pinterest' && selectedBoardId) {
        platformEntry.platformSpecificData = {
          boardId: selectedBoardId
        };
      } else if (mappedPlatform === 'pinterest' && !selectedBoardId) {
        // Pinterest content found but no board selected
      }
      
      return platformEntry;
    });

    // Combine all content into one string - use the most comprehensive content
    // If there are multiple approved content items, we'll use the one with the most hashtags
    // or the most recently edited one (this could be improved with a UI selection)
    let selectedContent = filteredApprovedContent[0];
    
    // Find the content with the most hashtags (likely the most edited)
    if (filteredApprovedContent.length > 1) {
      selectedContent = filteredApprovedContent.reduce((best, current) => {
        const bestHashtagCount = best.hashtags.length;
        const currentHashtagCount = current.hashtags.length;
        
        // Prefer content with more hashtags, or if equal, prefer longer content
        if (currentHashtagCount > bestHashtagCount) {
          return current;
        } else if (currentHashtagCount === bestHashtagCount && current.content.length > best.content.length) {
          return current;
        }
        return best;
      });
    }
    
    const contentText = selectedContent.content;
    const hashtagsText = selectedContent.hashtags.map(tag => `#${tag}`).join(' ');
    const fullContent = contentText + (hashtagsText ? `\n\n${hashtagsText}` : '');
    
    console.log('Posting content details:', {
      selectedPlatform: selectedContent.platform,
      contentText,
      hashtags: selectedContent.hashtags,
      hashtagsText,
      fullContent,
      allApprovedContent: filteredApprovedContent.map(item => ({
        platform: item.platform,
        content: item.content,
        hashtags: item.hashtags,
        characterCount: item.character_count
      }))
    });

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
    intervalIds.forEach(id => clearInterval(id));
    clearCurrentMessage(activityId);
    updateActivity(activityId, {
      status: 'failed',
      title: 'Content publishing failed',
      description: error.message || 'Failed to post content'
    });

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
    // Clean up intervals
    intervalIds.forEach(id => clearInterval(id));
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
      reddit: 'Reddit',
      pinterest: 'Pinterest',
      tiktok: 'TikTok'
    };
    return platformNames[platform] || platform;
  };

  const validateSubreddit = (subreddit: string): boolean => {
    if (!subreddit || !subreddit.trim()) {
      setSubredditError('Subreddit is required for Reddit posts');
      return false;
    }
    
    const cleanSubreddit = subreddit.trim();
    
    // Should not start with r/ prefix
    if (cleanSubreddit.startsWith('r/')) {
      setSubredditError('Subreddit should not include "r/" prefix');
      return false;
    }
    
    // Should only contain alphanumeric characters and underscores
    if (!cleanSubreddit.replace('_', '').match(/^[a-zA-Z0-9_]+$/)) {
      setSubredditError('Subreddit can only contain letters, numbers, and underscores');
      return false;
    }
    
    // Should not be empty after cleaning
    if (cleanSubreddit.length === 0) {
      setSubredditError('Subreddit cannot be empty');
      return false;
    }
    
    setSubredditError('');
    return true;
  };

  const handleSubredditChange = (value: string) => {
    setSubreddit(value);
    // Clear errors when user starts typing
    if (subredditError) {
      setSubredditError('');
    }
    if (subredditVerificationError) {
      setSubredditVerificationError('');
    }
    // Reset verification status when subreddit changes
    setSubredditVerified(false);
  };

  const verifySubreddit = async () => {
    if (!subreddit.trim()) {
      setSubredditVerificationError('Please enter a subreddit name first');
      return;
    }

    // Validate format first
    if (!validateSubreddit(subreddit)) {
      setSubredditVerificationError('Please fix the subreddit format before verifying');
      return;
    }

    setIsVerifyingSubreddit(true);
    setSubredditVerificationError('');
    setSubredditVerified(false);

    try {
      // Use our backend API to verify subreddit
      const subredditName = subreddit.trim();
      const response = await apiService.verifySubreddit(subredditName);

      if (response.success && response.exists) {
        // Subreddit exists and is accessible
        setSubredditVerified(true);
        setSubredditVerificationError('');
        
        if (response.is_nsfw) {
          showNotification('info', 'NSFW Subreddit', `r/${subredditName} is marked as NSFW. Please review before posting.`);
        } else {
          showNotification('success', 'Subreddit Verified', `r/${subredditName} exists and is available for posting`);
        }
      } else {
        // Subreddit doesn't exist or is not accessible
        setSubredditVerified(false);
        setSubredditVerificationError(response.message || `r/${subredditName} is not accessible`);
        showNotification('error', 'Subreddit Not Found', response.message || `r/${subredditName} is not accessible`);
      }
    } catch (error) {
      console.error('Error verifying subreddit:', error);
      setSubredditVerified(false);
      setSubredditVerificationError('Network error. Please check your connection and try again.');
      showNotification('error', 'Network Error', 'Failed to verify subreddit. Please check your connection and try again.');
    } finally {
      setIsVerifyingSubreddit(false);
    }
  };

  const handleBoardChange = (boardId: string) => {
    setSelectedBoardId(boardId);
    setBoardError('');
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
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
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
                        src={imageUrl.startsWith('http') ? imageUrl : `${getApiUrl()}${imageUrl}`}
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
                        <button 
                          onClick={() => handleDownloadImage(imageUrl, index)} 
                          disabled={downloadingImages.has(index)}
                          className={`px-3 py-2 rounded-md transition-colors text-sm flex items-center justify-center ${
                            downloadingImages.has(index)
                              ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                          title={downloadingImages.has(index) ? 'Downloading...' : 'Download Image'}
                        >
                          {downloadingImages.has(index) ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                              Downloading...
                            </>
                          ) : (
                            <Download className="w-4 h-4" />
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

        {/* Global Reddit Subreddit & Flair Input - Show if any Reddit content exists */}
        {content.some(item => item.platform.toLowerCase() === 'reddit') && (
          <GlassCard className="p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-neutral-950">
              <MessageSquare className="h-5 w-5" />
              Reddit Subreddit Configuration
            </h3>
            <p className="mb-4 text-neutral-800">Configure the subreddit for your Reddit posts</p>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={subreddit}
                  onChange={(e) => handleSubredditChange(e.target.value)}
                  placeholder="Enter subreddit name (e.g., technology, programming)"
                  className={`flex-1 px-3 py-2 border rounded-md text-neutral-950 bg-white ${
                    subredditError ? 'border-red-500' : 
                    subredditVerified ? 'border-green-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  disabled={isVerifyingSubreddit}
                />
                <Button
                  type="button"
                  onClick={verifySubreddit}
                  disabled={isVerifyingSubreddit || !subreddit.trim() || !!subredditError}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isVerifyingSubreddit ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Verify
                    </>
                  )}
                </Button>
              </div>
              {/* Flair inputs (optional; some subreddits require flair) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs text-gray-600">Flair ID (preferred)</label>
                  <input
                    type="text"
                    value={redditFlairId}
                    onChange={(e) => setRedditFlairId(e.target.value)}
                    placeholder="Paste flair_id (e.g., flair template id)"
                    className="w-full px-3 py-2 border rounded-md text-neutral-950 bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-600">Flair Text (fallback)</label>
                  <input
                    type="text"
                    value={redditFlairText}
                    onChange={(e) => setRedditFlairText(e.target.value)}
                    placeholder="e.g., Discussion, Question"
                    className="w-full px-3 py-2 border rounded-md text-neutral-950 bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Some subreddits require a post flair. If your post fails with a flair error, paste a valid Flair ID (recommended)
                or flair text here and retry. Flair ID is more reliable than text.
              </p>
              
              {/* Error Messages */}
              {subredditError && (
                <p className="text-red-500 text-sm">{subredditError}</p>
              )}
              
              {/* Verification Status */}
              {subredditVerificationError && (
                <p className="text-red-500 text-sm">{subredditVerificationError}</p>
              )}
              
              {/* Success Status */}
              {subreddit && !subredditError && subredditVerified && !subredditVerificationError && (
                <p className="text-green-600 text-sm flex items-center gap-1">
                  <Check className="h-4 w-4" />
                  ✓ Subreddit verified: r/{subreddit.trim()}
                </p>
              )}
              
              {/* Basic validation success (without verification) */}
              {subreddit && !subredditError && !subredditVerified && !subredditVerificationError && (
                <p className="text-blue-600 text-sm">Subreddit format valid: r/{subreddit.trim()}</p>
              )}
            </div>
          </GlassCard>
        )}

        {/* Pinterest Board Selection - Show if any Pinterest content exists */}
        {content.some(item => item.platform.toLowerCase() === 'pinterest') && (
          <GlassCard className="p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-neutral-950">
              <Image className="h-5 w-5" />
              Pinterest Board Selection
            </h3>
            <p className="mb-4 text-neutral-800">Choose a board for your Pinterest pins</p>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <select
                  value={selectedBoardId}
                  onChange={(e) => handleBoardChange(e.target.value)}
                  className={`flex-1 px-3 py-2 border rounded-md text-neutral-950 bg-white ${
                    boardError ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  disabled={isLoadingBoards}
                >
                  <option value="">
                    {isLoadingBoards ? 'Loading boards...' : 'Select a Pinterest board'}
                  </option>
                  {pinterestBoards.map((board) => (
                    <option key={board.id} value={board.id}>
                      {board.name}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  onClick={fetchPinterestBoards}
                  disabled={isLoadingBoards}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoadingBoards ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Refresh
                    </>
                  )}
                </Button>
              </div>
              
              {/* Error Messages */}
              {boardError && (
                <p className="text-red-500 text-sm">{boardError}</p>
              )}
              
              {/* Success Status */}
              {selectedBoardId && !boardError && (
                <p className="text-green-600 text-sm flex items-center gap-1">
                  <Check className="h-4 w-4" />
                  ✓ Board selected: {pinterestBoards.find(b => b.id === selectedBoardId)?.name || 'Unknown'}
                </p>
              )}
              
              {/* No boards available */}
              {!isLoadingBoards && pinterestBoards.length === 0 && !boardError && (
                <p className="text-orange-600 text-sm">
                  ⚠️ No Pinterest boards available. Please connect your Pinterest account and create boards.
                </p>
              )}
            </div>
          </GlassCard>
        )}

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
                {workflowData?.data?.topic || workflowData?.topic || 'Social media content'}
              </div>
            </div>
            <div>
              <strong className="text-black">Enhanced Prompt:</strong>
              <div className="p-3 rounded-lg mt-2 text-black border border-gray-700 bg-slate-50">
                {workflowData?.data?.enhanced_prompt || workflowData?.enhanced_prompt || workflowData?.prompt || `Create engaging social media content about ${workflowData?.data?.topic || workflowData?.topic || 'the topic'} that highlights key benefits, 
                maintains ${workflowData?.data?.tone || workflowData?.tone || 'professional'} tone, includes relevant hashtags, and encourages user engagement through 
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
                {content.filter(item => item.status === 'approved').length > 1 && (
                  <p className="text-sm text-blue-600 mt-1">
                    💡 Content with the most hashtags will be used for posting
                  </p>
                )}
                {content.some(item => item.platform.toLowerCase() === 'reddit' && item.status === 'approved') && (
                  <p className="text-sm text-orange-600 mt-1">
                    🔴 Reddit selected: Subreddit required and must be verified for posting
                  </p>
                )}
                {content.some(item => item.platform.toLowerCase() === 'pinterest' && item.status === 'approved') && (
                  <p className="text-sm text-orange-600 mt-1">
                    📌 Pinterest selected: Board selection required for posting
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <input type="datetime-local" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="border border-gray-600 bg-gray-800 text-white rounded-md px-3 py-2 text-sm" min={new Date().toISOString().slice(0, 16)} />
                </div>
                
                <Button variant="outline" onClick={handleSchedule} disabled={isScheduling || !scheduleDate || (content.some(item => item.platform.toLowerCase() === 'reddit' && item.status === 'approved') && (!subreddit.trim() || !!subredditError || !subredditVerified)) || (content.some(item => item.platform.toLowerCase() === 'pinterest' && item.status === 'approved') && !selectedBoardId)} className="flex items-center gap-2 text-neutral-950">
                  <Clock className="h-4 w-4" />
                  Schedule
                </Button>
                
                <Button 
                  onClick={handlePostAll} 
                  disabled={isPosting || (content.some(item => item.platform.toLowerCase() === 'reddit' && item.status === 'approved') && (!subreddit.trim() || !!subredditError || !subredditVerified)) || (content.some(item => item.platform.toLowerCase() === 'pinterest' && item.status === 'approved') && !selectedBoardId)}
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