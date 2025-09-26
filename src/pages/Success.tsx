import { Navigation } from '@/components/Navigation';
import { GlassCard } from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { CheckCircle, Home, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
interface SuccessProps {
  title?: string;
  message?: string;
}
export default function Success({
  title = "Success!",
  message = "Your action was completed successfully."
}: SuccessProps) {
  const navigate = useNavigate();
  return <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-950">
      <GlassCard className="p-12 text-center max-w-md w-full">
        <div className="mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse bg-green-400">
            <CheckCircle className="h-10 w-10 text-white bg-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{title}</h1>
          <p className="text-gray-600 text-lg">{message}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => navigate('/')} variant="gradient-success">
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Button>
          <Button onClick={() => navigate('/dashboard')} variant="outline" className="border-black text-black hover:bg-black/5">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </div>
      </GlassCard>
    </div>;
}