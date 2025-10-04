import { useCallback } from 'react';
import { useActivity } from '@/contexts/ActivityContext';
import { ActivityItem } from '@/components/BackgroundActivityPopup';

export const useActivityTracking = () => {
  const { addActivity, updateActivity } = useActivity();

  const trackApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    activityConfig: {
      type: ActivityItem['type'];
      title: string;
      description?: string;
      platform?: string;
    }
  ): Promise<T> => {
    const activityId = addActivity({
      type: activityConfig.type,
      title: activityConfig.title,
      description: activityConfig.description,
      platform: activityConfig.platform,
      status: 'in_progress',
      progress: 0,
    });

    try {
      // Simulate progress updates for long-running operations
      const progressInterval = setInterval(() => {
        updateActivity(activityId, { progress: Math.min(90, Math.random() * 30 + 10) });
      }, 1000);

      const result = await apiCall();

      clearInterval(progressInterval);
      updateActivity(activityId, {
        status: 'completed',
        progress: 100,
        title: `${activityConfig.title} completed`,
      });

      return result;
    } catch (error) {
      updateActivity(activityId, {
        status: 'failed',
        title: `${activityConfig.title} failed`,
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
      throw error;
    }
  }, [addActivity, updateActivity]);

  const trackContentAnalysis = useCallback(async (content: string, platform: string) => {
    return trackApiCall(
      async () => {
        // This would be replaced with actual API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        return { analyzed: true };
      },
      {
        type: 'analyzing',
        title: 'Analyzing content',
        description: `Analyzing content for ${platform}`,
        platform,
      }
    );
  }, [trackApiCall]);

  const trackImageGeneration = useCallback(async (prompt: string, platform?: string) => {
    return trackApiCall(
      async () => {
        // This would be replaced with actual API call
        await new Promise(resolve => setTimeout(resolve, 3000));
        return { imageUrl: 'generated-image.png' };
      },
      {
        type: 'generating',
        title: 'Generating image',
        description: `Creating image: ${prompt.substring(0, 50)}...`,
        platform,
      }
    );
  }, [trackApiCall]);

  const trackContentPosting = useCallback(async (platforms: string[], content: string) => {
    return trackApiCall(
      async () => {
        // This would be replaced with actual API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        return { posted: true };
      },
      {
        type: 'posting',
        title: 'Publishing content',
        description: `Posting to ${platforms.join(', ')}`,
        platform: platforms.join(', '),
      }
    );
  }, [trackApiCall]);

  const trackImageUpload = useCallback(async (file: File) => {
    return trackApiCall(
      async () => {
        // This would be replaced with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { uploaded: true };
      },
      {
        type: 'uploading',
        title: 'Uploading image',
        description: `Uploading ${file.name}`,
      }
    );
  }, [trackApiCall]);

  const trackContentScheduling = useCallback(async (platforms: string[], scheduledTime: string) => {
    return trackApiCall(
      async () => {
        // This would be replaced with actual API call
        await new Promise(resolve => setTimeout(resolve, 800));
        return { scheduled: true };
      },
      {
        type: 'scheduling',
        title: 'Scheduling content',
        description: `Scheduling for ${new Date(scheduledTime).toLocaleString()}`,
        platform: platforms.join(', '),
      }
    );
  }, [trackApiCall]);

  const trackContentProcessing = useCallback(async (description: string) => {
    return trackApiCall(
      async () => {
        // This would be replaced with actual API call
        await new Promise(resolve => setTimeout(resolve, 1200));
        return { processed: true };
      },
      {
        type: 'processing',
        title: 'Processing content',
        description,
      }
    );
  }, [trackApiCall]);

  return {
    trackApiCall,
    trackContentAnalysis,
    trackImageGeneration,
    trackContentPosting,
    trackImageUpload,
    trackContentScheduling,
    trackContentProcessing,
  };
};
