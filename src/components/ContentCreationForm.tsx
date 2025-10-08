import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { GlassCard } from './GlassCard';
import { NotificationToast } from './NotificationToast';
import { VoiceInput } from './VoiceInput';
import { useNotification } from '../hooks/useNotification';
import { useActivity } from '../contexts/ActivityContext';
import { apiService } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter, faFacebookF, faInstagram, faLinkedinIn, faRedditAlien, faPinterestP } from '@fortawesome/free-brands-svg-icons';
import { 
  Wand2, 
  Mic, 
  Loader2,
  Image
} from 'lucide-react';

const platforms = [
  { 
    id: 'facebook', 
    name: 'Facebook', 
    icon: faFacebookF,
    color: '#1877F2',
    glowColor: 'rgba(24, 119, 242, 0.4)'
  },
  { 
    id: 'x', 
    name: 'X', 
    icon: faXTwitter,
    color: '#000000',
    glowColor: 'rgba(0, 0, 0, 0.4)'
  },
  { 
    id: 'instagram', 
    name: 'Instagram', 
    icon: faInstagram,
    color: '#E4405F',
    glowColor: 'rgba(228, 64, 95, 0.4)'
  },
  { 
    id: 'linkedin', 
    name: 'LinkedIn', 
    icon: faLinkedinIn,
    color: '#0077B5',
    glowColor: 'rgba(0, 119, 181, 0.4)'
  },
  { 
    id: 'reddit', 
    name: 'Reddit', 
    icon: faRedditAlien,
    color: '#FF4500',
    glowColor: 'rgba(255, 69, 0, 0.4)'
  },
  { 
    id: 'pinterest', 
    name: 'Pinterest', 
    icon: faPinterestP,
    color: '#BD081C',
    glowColor: 'rgba(189, 8, 28, 0.4)'
  },
];

export const ContentCreationForm = () => {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [useReferenceImage, setUseReferenceImage] = useState(false);
  const { notifications, showNotification, removeNotification } = useNotification();
  const { addActivity, updateActivity, addLiveMessage, clearCurrentMessage, showPopup } = useActivity();
  const navigate = useNavigate();

  const handlePlatformToggle = (platformId: string) => {
    try {
      setSelectedPlatforms(prev => {
        const newSelection = prev.includes(platformId) 
          ? prev.filter(id => id !== platformId)
          : [...prev, platformId];
        console.log(`Platform toggle: ${platformId}, new selection:`, newSelection);
        return newSelection;
      });
    } catch (error) {
      console.error('Error toggling platform:', error);
      showNotification('error', 'Platform Selection Error', 'Failed to select platform. Please try again.');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        showNotification('error', 'File Too Large', 'Please select an image smaller than 10MB.');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        showNotification('error', 'Invalid File Type', 'Please select a valid image file.');
        return;
      }
      
      setReferenceImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setUseReferenceImage(true);
    }
  };

  const removeReferenceImage = () => {
    setReferenceImage(null);
    setImagePreview(null);
    setUseReferenceImage(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!topic.trim()) {
      showNotification('error', 'Topic Required', 'Please enter a topic for your content.');
      return;
    }

    if (selectedPlatforms.length === 0) {
      showNotification('error', 'Platform Required', 'Please select at least one social media platform.');
      return;
    }

    setIsLoading(true);
    showPopup(); // Show the activity popup

    // Add activity tracking
    const activityId = addActivity({
      type: 'processing',
      title: 'Creating content',
      description: `Generating content for: ${topic.trim()}`,
      platform: selectedPlatforms.join(', '),
      status: 'in_progress',
      progress: 0,
    });

    // Add live messages for content creation
    const messages = [
      'Initializing content generation...',
      'Analyzing topic and requirements...',
      'Generating engaging captions...',
      'Creating relevant hashtags...',
      'Optimizing for selected platforms...',
      'Generating accompanying image...',
      'Finalizing content package...'
    ];

    let messageIndex = 0;
    let progress = 0;

    const messageInterval = setInterval(() => {
      if (messageIndex < messages.length) {
        addLiveMessage(activityId, messages[messageIndex]);
        messageIndex++;
      }
    }, 1000);

    const progressInterval = setInterval(() => {
      progress += Math.random() * 18;
      if (progress >= 90) {
        progress = 90;
        clearInterval(progressInterval);
      } else {
        updateActivity(activityId, { progress });
      }
    }, 800);

    try {
      const contentTone = tone || 'professional';
      
      const requestData: any = {
        topic: topic.trim(),
        platforms: selectedPlatforms,
        tone: contentTone,
        include_image: true,
        caption_length: 'short',
        hashtag_count: 10
      };

      // Add reference image if provided
      if (useReferenceImage && referenceImage) {
        requestData.reference_image = referenceImage;
        requestData.use_reference_image = true;
      }
      
      const response = await apiService.createContent(requestData);

      // Debug logging
      console.log('Content creation response:', response);
      console.log('Response success:', response.success);
      console.log('Workflow ID:', response.workflow_id);

      if (response.success) {
        // Clear intervals and update activity on success
        clearInterval(messageInterval);
        clearInterval(progressInterval);
        clearCurrentMessage(activityId);
        updateActivity(activityId, {
          status: 'completed',
          progress: 100,
          title: 'Content created successfully',
          description: 'Your content is ready for review',
        });
        
        setIsLoading(false);
        showNotification('success', 'Content Generated!', 'Your social media content has been created successfully.');
        
        // Debug navigation
        console.log('Navigating to review-content with workflowId:', response.workflow_id);
        
        // Navigate immediately to prevent repeated calls
        navigate('/review-content', { state: { workflowId: response.workflow_id } });
      } else {
        // Clear intervals and update activity on failure
        clearInterval(messageInterval);
        clearInterval(progressInterval);
        clearCurrentMessage(activityId);
        updateActivity(activityId, {
          status: 'failed',
          title: 'Content creation failed',
          description: response.message || response.error || 'Failed to generate content',
        });
        
        setIsLoading(false);
        showNotification('error', 'Generation Failed', response.message || response.error || 'Failed to generate content. Please try again.');
      }
    } catch (error) {
      // Clear intervals and update activity on error
      clearInterval(messageInterval);
      clearInterval(progressInterval);
      clearCurrentMessage(activityId);
      updateActivity(activityId, {
        status: 'failed',
        title: 'Content creation failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
      
      setIsLoading(false);
      console.error('Content creation error:', error);
      showNotification('error', 'Generation Error', 'An error occurred while generating content. Please try again.');
    }
  };

  return (
    <>
      
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          type={notification.type}
          title={notification.title}
          description={notification.description}
          isVisible={notification.isVisible}
          onClose={() => removeNotification(notification.id)}
        />
      ))}

      <GlassCard className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-br from-black to-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wand2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Prompt! Review! Grow!
          </h1>
          <p className="text-gray-600">
            Generate engaging content for all your social media platforms in seconds
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Topic Input */}
          <div className="space-y-2">
            <Label htmlFor="topic" className="text-sm font-medium text-gray-700">
              What would you like to create content about?
            </Label>
            
            {/* Standalone Voice Input for Transcript Display */}
            <VoiceInput
              onTranscript={(transcript) => setTopic(transcript)}
              showTranscript={true}
              isEmbedded={false}
            />
            
            <Textarea
              id="topic"
              placeholder="Enter your topic, idea, or let our AI suggest trending topics... You can also use voice input!"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="min-h-[100px] resize-none border-2 focus:border-black"
            />
          </div>

          {/* Tone Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Content Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger className="border-2 focus:border-black">
                <SelectValue placeholder="Select content tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="humorous">Humorous</SelectItem>
                <SelectItem value="inspirational">Inspirational</SelectItem>
                <SelectItem value="educational">Educational</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reference Image Upload */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              Reference Image (Optional)
            </Label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="reference-image"
              />
              <label
                htmlFor="reference-image"
                className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-black transition-colors flex items-center space-x-2"
              >
                <Image className="h-4 w-4" />
                <span>Upload Reference Image</span>
              </label>
              {useReferenceImage && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={removeReferenceImage}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </Button>
              )}
            </div>
            {imagePreview && (
              <div className="mt-3">
                <img
                  src={imagePreview}
                  alt="Reference preview"
                  className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Reference image will be used to guide AI generation
                </p>
              </div>
            )}
          </div>

          {/* Platform Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Select Platforms</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4">
              {platforms.map((platform) => {
                const isSelected = selectedPlatforms.includes(platform.id);
                
                return (
                  <div
                    key={platform.id}
                    onClick={() => handlePlatformToggle(platform.id)}
                    className={`
                      p-4 rounded-lg border-2 cursor-pointer transition-all duration-300
                      flex flex-col items-center space-y-2 hover:shadow-md relative
                      ${isSelected 
                        ? 'border-black bg-black/5 shadow-lg' 
                        : 'border-gray-200 hover:border-black/50'
                      }
                    `}
                    style={isSelected ? {
                      boxShadow: `0 0 15px ${platform.glowColor}, 0 0 30px ${platform.glowColor}`
                    } : {}}
                  >
                    <FontAwesomeIcon 
                      icon={platform.icon} 
                      className="h-6 w-6"
                      style={{ 
                        color: isSelected ? platform.color : '#6B7280'
                      }}
                    />
                    <span className={`text-sm font-medium ${isSelected ? 'text-black' : 'text-gray-700'}`}>
                      {platform.name}
                    </span>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      isSelected ? 'bg-black border-black' : 'border-gray-300'
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              variant="gradient"
              className="w-full py-3 text-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Amazing Content...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-5 w-5" />
                  Generate Content
                </>
              )}
            </Button>
          </div>
        </form>
      </GlassCard>
    </>
  );
};
