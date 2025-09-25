import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { 
  Home, 
  LayoutDashboard, 
  Users, 
  Rocket,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/accounts', icon: Users, label: 'Accounts' },
  ];

  return (
    <nav className="bg-white/10 backdrop-blur-md border-b border-white/10 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <NavLink to="/" className="flex items-center space-x-2 font-bold text-xl text-white hover:text-gray-300 transition-colors">
            <Rocket className="h-6 w-6" />
            <span>GetLate Social</span>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            {navItems.map(({ path, icon: Icon, label }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) => 
                  `flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                    isActive 
                      ? 'bg-white/20 text-white font-medium' 
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm" 
            className="md:hidden text-white hover:bg-white/10"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col space-y-2">
              {/* Mobile Theme Toggle */}
              <Button
                variant="ghost"
                className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 text-white/80 hover:text-white hover:bg-white/10 justify-start"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </Button>
              {navItems.map(({ path, icon: Icon, label }) => (
                <NavLink
                  key={path}
                  to={path}
                  className={({ isActive }) => 
                    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                      isActive 
                        ? 'bg-white/20 text-white font-medium' 
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`
                  }
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};