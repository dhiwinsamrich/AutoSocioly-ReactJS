import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { GlassCard } from './GlassCard';
import { GeneratingLoader } from './GeneratingLoader';
import { NotificationToast } from './NotificationToast';
import { useNotification } from '../hooks/useNotification';
import { apiService } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter, faFacebookF, faInstagram, faLinkedinIn, faRedditAlien, faPinterestP } from '@fortawesome/free-brands-svg-icons';
import { 
  Wand2, 
  Mic, 
  Loader2
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
  const { notifications, showNotification, removeNotification } = useNotification();
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

    try {
      const contentTone = tone || 'professional';
      
      const response = await apiService.createContent({
        topic: topic.trim(),
        platforms: selectedPlatforms,
        tone: contentTone,
        include_image: false,
        caption_length: 'short',
        hashtag_count: 10
      });

      if (response.success) {
        setIsLoading(false);
        showNotification('success', 'Content Generated!', 'Your social media content has been created successfully.');
        
        setTimeout(() => {
          navigate('/review-content');
        }, 2000);
      } else {
        setIsLoading(false);
        showNotification('error', 'Generation Failed', response.message || response.error || 'Failed to generate content. Please try again.');
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Content creation error:', error);
      showNotification('error', 'Generation Error', 'An error occurred while generating content. Please try again.');
    }
  };

  return (
    <>
      <GeneratingLoader isVisible={isLoading} text="GENERATING" />
      
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

      <GlassCard className="p-8 max-w-4xl mx-auto">
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
            <div className="relative">
              <Textarea
                id="topic"
                placeholder="Enter your topic, idea, or let our AI suggest trending topics..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="min-h-[100px] pr-12 resize-none border-2 focus:border-black"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 text-black hover:text-gray-800"
              >
                <Mic className="h-4 w-4" />
              </Button>
            </div>
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

          {/* Platform Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Select Platforms</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
