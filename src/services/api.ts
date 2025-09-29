const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface APIResponse {
  success: boolean;
  data?: any;
  error?: string;
  workflow_id?: string;
  message?: string;
  history?: any[];
  scheduled_posts?: any[];
  accounts?: any;
  publicUrl?: string;
  mediaItems?: any[];
  scheduledFor?: string;
}

class APIService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // Enhanced method to get full image URL with proper ngrok conversion handling
  getImageUrl(imagePath: string): string {
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // For local paths, return as-is since backend will handle ngrok conversion
    if (imagePath.startsWith('/static/') || imagePath.startsWith('static/')) {
      // Return the path as-is - backend will convert to ngrok URL during posting
      return imagePath;
    }
    
    if (imagePath.startsWith('/')) {
      return `${this.baseUrl}${imagePath}`;
    }
    
    return `${this.baseUrl}/${imagePath}`;
  }

  // Method to explicitly convert local paths to public URLs via backend
  async convertToPublicUrl(localPath: string): Promise<string> {
    try {
      const response = await this.request('/api/convert-to-public-url', {
        method: 'POST',
        body: JSON.stringify({ localPath })
      });
      
      if (response.success && response.publicUrl) {
        return response.publicUrl;
      }
      
      // Fallback to original path
      return localPath;
    } catch (error) {
      console.error('Failed to convert to public URL:', error);
      return localPath;
    }
  }

  async request(endpoint: string, options: RequestInit = {}): Promise<APIResponse> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for authentication
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Content creation endpoint with FormData support
  async createContent(data: Record<string, any>): Promise<APIResponse> {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });
    
    const response = await fetch(`${this.baseUrl}/create-content`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
      // Let browser set content-type for FormData
    });

    if (!response.ok) {
      // Try to get error message from response
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (jsonError) {
        // If response is not JSON, get text
        try {
          const textError = await response.text();
          errorMessage = textError || errorMessage;
        } catch (textError) {
          // Fallback to status error
        }
      }
      throw new Error(errorMessage);
    }
    
    // Try to parse JSON response
    try {
      return await response.json();
    } catch (jsonError) {
      console.error('Failed to parse JSON response:', jsonError);
      // If JSON parsing fails, return a success response with default data
      return {
        success: true,
        message: 'Content created successfully',
        workflow_id: 'default-workflow-id'
      };
    }
  }

  // Health check
  async healthCheck(): Promise<APIResponse> {
    return this.request('/health');
  }

  // Get workflow data
  async getWorkflow(workflowId: string): Promise<APIResponse> {
    return this.request(`/api/workflow/${workflowId}`);
  }

  // Enhanced post content method with proper media handling
  async postContent(data: Record<string, any>): Promise<APIResponse> {
    try {
      // Check if this is the new format with content and platforms array
      if (data.content && data.platforms && Array.isArray(data.platforms)) {
        // New format: direct posting with content and platforms
        const requestData: any = {
          content: data.content,
          platforms: data.platforms,
          publishNow: data.publishNow !== undefined ? data.publishNow : true,
          timezone: data.timezone || "America/New_York"
        };

        // Add media items if provided - they will be converted to ngrok URLs in backend
        if (data.mediaItems && data.mediaItems.length > 0) {
          requestData.mediaItems = data.mediaItems;
          console.log(`Adding ${data.mediaItems.length} media items to request`);
        }

        // Add workflow ID if provided
        if (data.workflow_id) {
          requestData.workflow_id = data.workflow_id;
        }

        // Add scheduling if provided
        if (data.scheduledFor) {
          requestData.scheduledFor = data.scheduledFor;
          delete requestData.publishNow;
        }

        console.log('Sending new format payload with media items:', requestData);

        const response = await fetch(`${this.baseUrl}/api/publish-content`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(requestData)
        });

        if (!response.ok) {
          let errorMessage = `HTTP error! status: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (jsonError) {
            try {
              const textError = await response.text();
              errorMessage = textError || errorMessage;
            } catch (textError) {
              // Fallback to status error
            }
          }
          throw new Error(errorMessage);
        }

        return await response.json();
      } 
      // Check if this is workflow-based posting format
      else if (data.workflow_id || data.platform_content) {
        // Legacy workflow format handling
        const requestData: any = {
          workflow_id: data.workflow_id,
          platforms: data.platforms || [],
          platform_content: data.platform_content || {},
          generated_images: data.generated_images || [],
          publishNow: data.publishNow !== undefined ? data.publishNow : true
        };

        // Add media items if provided
        if (data.mediaItems && data.mediaItems.length > 0) {
          requestData.mediaItems = data.mediaItems;
        }

        // If scheduling is required
        if (data.scheduledFor) {
          requestData.scheduledFor = data.scheduledFor;
          delete requestData.publishNow;
        }

        console.log('Sending legacy workflow payload:', requestData);

        const response = await fetch(`${this.baseUrl}/api/publish-content`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(requestData)
        });

        if (!response.ok) {
          let errorMessage = `HTTP error! status: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (jsonError) {
            try {
              const textError = await response.text();
              errorMessage = textError || errorMessage;
            } catch (textError) {
              // Fallback to status error
            }
          }
          throw new Error(errorMessage);
        }

        return await response.json();
      }
      // Single platform posting format
      else if (data.platform && (data.content || data.platform_content)) {
        // Single platform format - convert to new format
        const content = data.content || data.platform_content?.content || '';
        const hashtags = data.hashtags || data.platform_content?.hashtags || [];
        const hashtagsText = hashtags.map(tag => `#${tag}`).join(' ');
        const fullContent = content + (hashtagsText ? `\n\n${hashtagsText}` : '');

        const requestData: any = {
          content: fullContent,
          platforms: [{
            platform: data.platform.toLowerCase(),
            accountId: data.accountId || 'unknown'
          }],
          publishNow: data.publishNow !== undefined ? data.publishNow : true
        };

        // Add media items if provided
        if (data.media_urls && data.media_urls.length > 0) {
          requestData.mediaItems = data.media_urls.map(url => ({
            type: 'image',
            url: url
          }));
        } else if (data.mediaItems && data.mediaItems.length > 0) {
          requestData.mediaItems = data.mediaItems;
        }

        // Add workflow ID if provided
        if (data.workflow_id) {
          requestData.workflow_id = data.workflow_id;
        }

        console.log('Sending single platform payload:', requestData);

        const response = await fetch(`${this.baseUrl}/api/publish-content`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(requestData)
        });

        if (!response.ok) {
          let errorMessage = `HTTP error! status: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (jsonError) {
            try {
              const textError = await response.text();
              errorMessage = textError || errorMessage;
            } catch (textError) {
              // Fallback to status error
            }
          }
          throw new Error(errorMessage);
        }

        return await response.json();
      }
      else {
        throw new Error('Invalid payload format: missing required fields (content + platforms, or workflow_id + platform_content, or platform + content)');
      }

    } catch (error) {
      console.error('Failed to post content:', error);
      throw error;
    }
  }

  // Get analytics data
  async getAnalytics(): Promise<APIResponse> {
    return this.request('/api/analytics');
  }

  // Analyze content using Gemini AI
  async analyzeContent(content: string, platform: string): Promise<APIResponse> {
    return this.request('/api/analyze-content', {
      method: 'POST',
      body: JSON.stringify({ content, platform }),
    });
  }

  async reviewContent(data: Record<string, any>): Promise<APIResponse> {
    return this.request('/api/review-content', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get accounts data
  async getAccounts(): Promise<APIResponse> {
    return this.request('/api/posting/accounts');
  }

  // Connect account
  async connectAccount(platform: string, credentials: Record<string, any>): Promise<APIResponse> {
    return this.request('/api/connect-account', {
      method: 'POST',
      body: JSON.stringify({ platform, credentials }),
    });
  }

  // Disconnect account
  async disconnectAccount(platform: string): Promise<APIResponse> {
    return this.request('/api/disconnect-account', {
      method: 'POST',
      body: JSON.stringify({ platform }),
    });
  }

  // Get posting history
  async getPostingHistory(): Promise<APIResponse> {
    return this.request('/api/posting-history');
  }

  // Schedule post
  async schedulePost(data: Record<string, any>): Promise<APIResponse> {
    return this.request('/api/schedule-post', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get scheduled posts
  async getScheduledPosts(): Promise<APIResponse> {
    return this.request('/api/scheduled-posts');
  }

  // Cancel scheduled post
  async cancelScheduledPost(postId: string): Promise<APIResponse> {
    return this.request('/api/cancel-scheduled-post', {
      method: 'POST',
      body: JSON.stringify({ post_id: postId }),
    });
  }

  // Upload image
  async uploadImage(file: File): Promise<APIResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${this.baseUrl}/api/upload-image`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }
}

export const apiService = new APIService();