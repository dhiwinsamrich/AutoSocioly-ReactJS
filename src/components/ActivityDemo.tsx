import { Button } from '@/components/ui/button';
import { useActivity } from '@/contexts/ActivityContext';
import { useEffect, useRef } from 'react';

export const ActivityDemo = () => {
  const { addActivity, updateActivity, addLiveMessage, clearCurrentMessage, showPopup } = useActivity();
  const intervalsRef = useRef<Set<NodeJS.Timeout>>(new Set());

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      for (const interval of intervalsRef.current) {
        clearInterval(interval);
      }
      intervalsRef.current.clear();
    };
  }, []);

  const addInterval = (interval: NodeJS.Timeout) => {
    intervalsRef.current.add(interval);
  };

  const clearIntervalSafe = (interval: NodeJS.Timeout) => {
    intervalsRef.current.delete(interval);
    clearInterval(interval);
  };

  const simulateContentAnalysis = () => {
    const activityId = addActivity({
      type: 'analyzing',
      title: 'Analyzing content',
      description: 'Using AI to analyze your content for optimal engagement',
      platform: 'Instagram',
      status: 'in_progress',
      progress: 0,
    });

    showPopup();

    // Terminal-style messages
    const messages = [
      'Initializing AI analysis engine...',
      'Loading content optimization models...',
      'Analyzing text sentiment and tone...',
      'Checking hashtag relevance and trends...',
      'Evaluating engagement potential...',
      'Generating optimization recommendations...',
      'Finalizing analysis results...'
    ];

    let messageIndex = 0;
    let progress = 0;

    const messageInterval = setInterval(() => {
      if (messageIndex < messages.length) {
        addLiveMessage(activityId, messages[messageIndex]);
        messageIndex++;
      }
    }, 800);
    addInterval(messageInterval);

    const progressInterval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearIntervalSafe(messageInterval);
        clearIntervalSafe(progressInterval);
        clearCurrentMessage(activityId);
        updateActivity(activityId, {
          status: 'completed',
          title: 'Content analysis completed',
          description: 'Your content has been analyzed and optimized',
        });
      } else {
        updateActivity(activityId, { progress });
      }
    }, 600);
    addInterval(progressInterval);
  };

  const simulateImageGeneration = () => {
    const activityId = addActivity({
      type: 'generating',
      title: 'Generating image',
      description: 'Creating a stunning visual for your post',
      platform: 'Facebook',
      status: 'in_progress',
      progress: 0,
    });

    showPopup();

    // Terminal-style messages for image generation
    const messages = [
      'Starting image generation process...',
      'Analyzing prompt and extracting key elements...',
      'Initializing DALL-E 3 model...',
      'Generating initial concept sketches...',
      'Refining image details and composition...',
      'Applying style filters and enhancements...',
      'Optimizing image resolution and quality...',
      'Finalizing generated image...'
    ];

    let messageIndex = 0;
    let progress = 0;

    const messageInterval = setInterval(() => {
      if (messageIndex < messages.length) {
        addLiveMessage(activityId, messages[messageIndex]);
        messageIndex++;
      }
    }, 1000);
    addInterval(messageInterval);

    const progressInterval = setInterval(() => {
      progress += Math.random() * 12;
      if (progress >= 100) {
        progress = 100;
        clearIntervalSafe(messageInterval);
        clearIntervalSafe(progressInterval);
        clearCurrentMessage(activityId);
        updateActivity(activityId, {
          status: 'completed',
          title: 'Image generated successfully',
          description: 'Your custom image is ready to use',
        });
      } else {
        updateActivity(activityId, { progress });
      }
    }, 800);
    addInterval(progressInterval);
  };

  const simulateContentPosting = () => {
    const activityId = addActivity({
      type: 'posting',
      title: 'Publishing content',
      description: 'Posting to Instagram, Facebook, and Twitter',
      platform: 'Instagram, Facebook, Twitter',
      status: 'in_progress',
      progress: 0,
    });

    showPopup();

    // Terminal-style messages for posting
    const messages = [
      'Preparing content for multi-platform posting...',
      'Validating content against platform guidelines...',
      'Authenticating with Instagram API...',
      'Uploading media to Instagram...',
      'Publishing to Instagram ✓',
      'Authenticating with Facebook API...',
      'Uploading media to Facebook...',
      'Publishing to Facebook ✓',
      'Authenticating with Twitter API...',
      'Publishing to Twitter ✓',
      'All platforms updated successfully!'
    ];

    let messageIndex = 0;
    let progress = 0;

    const messageInterval = setInterval(() => {
      if (messageIndex < messages.length) {
        addLiveMessage(activityId, messages[messageIndex]);
        messageIndex++;
      }
    }, 700);
    addInterval(messageInterval);

    const progressInterval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearIntervalSafe(messageInterval);
        clearIntervalSafe(progressInterval);
        clearCurrentMessage(activityId);
        updateActivity(activityId, {
          status: 'completed',
          title: 'Content published successfully',
          description: 'Your post is now live on all platforms',
        });
      } else {
        updateActivity(activityId, { progress });
      }
    }, 600);
    addInterval(progressInterval);
  };

  const simulateError = () => {
    const activityId = addActivity({
      type: 'posting',
      title: 'Publishing content',
      description: 'Attempting to post to LinkedIn',
      platform: 'LinkedIn',
      status: 'in_progress',
      progress: 0,
    });

    showPopup();

    // Terminal-style messages for error simulation
    const messages = [
      'Initializing LinkedIn API connection...',
      'Validating authentication credentials...',
      'Preparing content for LinkedIn...',
      'Attempting to upload media...',
      'ERROR: Authentication failed!',
      'Checking account connection status...',
      'ERROR: Account not properly connected',
      'Please reconnect your LinkedIn account'
    ];

    let messageIndex = 0;
    let progress = 0;

    const messageInterval = setInterval(() => {
      if (messageIndex < messages.length) {
        addLiveMessage(activityId, messages[messageIndex]);
        messageIndex++;
      }
    }, 600);
    addInterval(messageInterval);

    const progressInterval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 45) {
        progress = 45;
        clearIntervalSafe(messageInterval);
        clearIntervalSafe(progressInterval);
        clearCurrentMessage(activityId);
        updateActivity(activityId, {
          status: 'failed',
          title: 'Publishing failed',
          description: 'Failed to authenticate with LinkedIn. Please reconnect your account.',
          progress: 45,
        });
      } else {
        updateActivity(activityId, { progress });
      }
    }, 500);
    addInterval(progressInterval);
  };

  const simulateMultipleActivities = () => {
    // Start multiple activities
    simulateContentAnalysis();
    setTimeout(() => simulateImageGeneration(), 1000);
    setTimeout(() => simulateContentPosting(), 3000);
  };

  return (
    <div className="p-6 space-y-4">
      <h3 className="text-lg font-semibold text-black mb-4">Activity Popup Demo</h3>
      <div className="flex flex-col gap-3">
        <Button onClick={simulateContentAnalysis} variant="outline" className="text-black">
          Simulate Content Analysis
        </Button>
        <Button onClick={simulateImageGeneration} variant="outline" className="text-black">
          Simulate Image Generation
        </Button>
        <Button onClick={simulateContentPosting} variant="outline" className="text-black">
          Simulate Content Posting
        </Button>
        <Button onClick={simulateError} variant="outline" className="text-black">
          Simulate Error
        </Button>
        <Button onClick={simulateMultipleActivities} variant="outline" className="text-black">
          Simulate Multiple Activities
        </Button>
      </div>
    </div>
  );
};
