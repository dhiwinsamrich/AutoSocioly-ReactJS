import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { GlassCard } from './GlassCard';
import { 
  Wand2, 
  Mic, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const platforms = [
  { id: 'facebook', name: 'Facebook', icon: Facebook },
  { id: 'twitter', name: 'Twitter', icon: Twitter },
  { id: 'instagram', name: 'Instagram', icon: Instagram },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin },
];

export const ContentCreationForm = () => {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic for your content.",
        variant: "destructive"
      });
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast({
        title: "Platform Required", 
        description: "Please select at least one social media platform.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate content generation
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Content Generated!",
        description: "Your social media content has been created successfully.",
      });
    }, 2000);
  };

  return (
    <GlassCard className="p-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="bg-gradient-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wand2 className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI-Powered Social Media Content Creator
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
              className="min-h-[100px] pr-12 resize-none border-2 focus:border-primary"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2 text-primary hover:text-primary-dark"
            >
              <Mic className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tone Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Content Tone</Label>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger className="border-2 focus:border-primary">
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {platforms.map((platform) => {
              const Icon = platform.icon;
              const isSelected = selectedPlatforms.includes(platform.id);
              
              return (
                <div
                  key={platform.id}
                  onClick={() => handlePlatformToggle(platform.id)}
                  className={`
                    p-4 rounded-lg border-2 cursor-pointer transition-all duration-300
                    flex flex-col items-center space-y-2 hover:shadow-md
                    ${isSelected 
                      ? 'border-primary bg-primary/5 shadow-md' 
                      : 'border-gray-200 hover:border-primary/50'
                    }
                  `}
                >
                  <Icon className={`h-6 w-6 ${isSelected ? 'text-primary' : 'text-gray-500'}`} />
                  <span className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-gray-700'}`}>
                    {platform.name}
                  </span>
                  <Checkbox 
                    checked={isSelected}
                    onChange={() => {}}
                    className="pointer-events-none"
                  />
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
  );
};