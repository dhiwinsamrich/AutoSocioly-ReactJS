import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, CheckCircle, AlertCircle, Settings } from 'lucide-react';

interface ApiKeyChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => Promise<void>;
  currentApiKey?: string;
}

export function ApiKeyChangeModal({ isOpen, onClose, onSave, currentApiKey }: ApiKeyChangeModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [confirmApiKey, setConfirmApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showConfirmApiKey, setShowConfirmApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setError('');
    setSuccess(false);

    // Validation
    if (!apiKey.trim()) {
      setError('API key is required');
      return;
    }

    if (apiKey !== confirmApiKey) {
      setError('API keys do not match');
      return;
    }

    if (apiKey.length < 10) {
      setError('API key seems too short. Please check your input.');
      return;
    }

    try {
      setIsLoading(true);
      await onSave(apiKey);
      setSuccess(true);
      
      // Reset form after successful save
      setTimeout(() => {
        setApiKey('');
        setConfirmApiKey('');
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update API key');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setApiKey('');
      setConfirmApiKey('');
      setError('');
      setSuccess(false);
      onClose();
    }
  };

  const maskApiKey = (key: string) => {
    if (!key) return '';
    if (key.length <= 8) return key;
    return key.substring(0, 4) + '•'.repeat(key.length - 8) + key.substring(key.length - 4);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg w-full max-w-[90vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Update GetLate API Key
          </DialogTitle>
          <DialogDescription>
            Enter your new GetLate API key to update the configuration. This will be saved to your environment settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Current API Key Display */}
          {currentApiKey && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Current API Key</Label>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                <code className="text-sm font-mono text-gray-600 flex-1">
                  {maskApiKey(currentApiKey)}
                </code>
              </div>
            </div>
          )}

          {/* New API Key Input */}
          <div className="space-y-2">
            <Label htmlFor="apiKey" className="text-sm font-medium text-gray-700">
              New API Key *
            </Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your new GetLate API key"
                className="pr-10 w-full"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowApiKey(!showApiKey)}
                disabled={isLoading}
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>

          {/* Confirm API Key Input */}
          <div className="space-y-2">
            <Label htmlFor="confirmApiKey" className="text-sm font-medium text-gray-700">
              Confirm API Key *
            </Label>
            <div className="relative">
              <Input
                id="confirmApiKey"
                type={showConfirmApiKey ? 'text' : 'password'}
                value={confirmApiKey}
                onChange={(e) => setConfirmApiKey(e.target.value)}
                placeholder="Confirm your new API key"
                className="pr-10 w-full"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmApiKey(!showConfirmApiKey)}
                disabled={isLoading}
              >
                {showConfirmApiKey ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                API key updated successfully!
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading || !apiKey || !confirmApiKey}
              className="min-w-[100px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

