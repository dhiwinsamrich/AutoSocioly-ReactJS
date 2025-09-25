import { Navigation } from '@/components/Navigation';
import { ContentCreationForm } from '@/components/ContentCreationForm';
const Index = () => {
  return <div className="min-h-screen bg-zinc-950 ">
      <Navigation />
      <div className="container mx-auto px-4 py-12 bg-neutral-950">
        <ContentCreationForm />
      </div>
    </div>;
};
export default Index;