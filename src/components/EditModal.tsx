import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { VoiceTextarea } from './VoiceInput';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Save, RefreshCw } from 'lucide-react';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EditData) => void;
  initialData: EditData;
  type: 'caption' | 'hashtags' | 'image';
}

interface EditData {
  content?: string;
  hashtags?: string[];
  imagePrompt?: string;
}

export const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  type
}) => {
  const [content, setContent] = useState(initialData.content || '');
  const [hashtags, setHashtags] = useState<string[]>(initialData.hashtags || []);
  const [newHashtag, setNewHashtag] = useState('');
  const [imagePrompt, setImagePrompt] = useState(initialData.imagePrompt || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave({
        content,
        hashtags,
        imagePrompt
      });
      onClose();
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addHashtag = () => {
    if (newHashtag.trim() && !hashtags.includes(newHashtag.trim())) {
      setHashtags([...hashtags, newHashtag.trim()]);
      setNewHashtag('');
    }
  };

  const removeHashtag = (tagToRemove: string) => {
    setHashtags(hashtags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && type === 'hashtags') {
      e.preventDefault();
      addHashtag();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {type === 'caption' && 'Edit Caption'}
            {type === 'hashtags' && 'Edit Hashtags'}
            {type === 'image' && 'Edit Image'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {type === 'caption' && (
            <div className="space-y-2">
              <Label htmlFor="content">Caption</Label>
              <VoiceTextarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onVoiceTranscript={(transcript) => setContent(transcript)}
                placeholder="Enter your caption... You can also use voice input!"
                className="min-h-[120px]"
                showVoiceButton={true}
              />
              <div className="text-sm text-gray-500">
                {content.length} characters
              </div>
            </div>
          )}

          {type === 'hashtags' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hashtags">Current Hashtags</Label>
                <div className="flex flex-wrap gap-2">
                  {hashtags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      #{tag}
                      <button
                        onClick={() => removeHashtag(tag)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-hashtag">Add New Hashtag</Label>
                <div className="flex gap-2">
                  <Input
                    id="new-hashtag"
                    value={newHashtag}
                    onChange={(e) => setNewHashtag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter hashtag (without #)"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={addHashtag}
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {type === 'image' && (
            <div className="space-y-2">
              <Label htmlFor="image-prompt">Image Modification Prompt</Label>
              <Textarea
                id="image-prompt"
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="Describe how you want to modify the image (e.g., 'Make it more colorful', 'Add a sunset background', 'Change the style to minimalist')"
                className="min-h-[100px]"
              />
              <div className="text-sm text-gray-500">
                Be specific about what changes you want to make to the image
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Saving...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
