import { Navigation } from '@/components/Navigation';
import { ContentCreationForm } from '@/components/ContentCreationForm';
const Index = () => {
  return <div className="min-h-screen bg-zinc-950">
      <Navigation />
      <div className="animate-fadeIn">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 bg-neutral-950">
          <ContentCreationForm />
        </div>
      </div>
    </div>;
};
export default Index;