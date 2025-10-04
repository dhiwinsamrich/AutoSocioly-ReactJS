import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, LayoutDashboard, Users, Rocket, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navItems = [{
    path: '/',
    icon: Home,
    label: 'Home'
  }, {
    path: '/dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard'
  }, {
    path: '/accounts',
    icon: Users,
    label: 'Accounts'
  }];
  return <nav className="bg-black border-b border-gray-800 z-50">
      <div className="container mx-auto px-4 bg-neutral-950">
        <div className="flex items-center justify-between h-16 bg-neutral-950">
          {/* Brand */}
          <NavLink to="/" className="flex items-center space-x-2 font-bold text-xl text-white hover:text-gray-300 transition-colors">
            <Rocket className="h-6 w-6" />
            <span>AutoSocioly</span>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map(({
            path,
            icon: Icon,
            label
          }) => <NavLink key={path} to={path} className={({
            isActive
          }) => `flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${isActive ? 'bg-white/20 text-white font-medium' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </NavLink>)}
          </div>

          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="md:hidden text-white hover:bg-white/10 transition-all duration-300" 
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="relative w-5 h-5">
              <Menu className={cn(
                "h-5 w-5 absolute transition-all duration-300 ease-in-out",
                isOpen ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"
              )} />
              <X className={cn(
                "h-5 w-5 absolute transition-all duration-300 ease-in-out",
                isOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"
              )} />
            </div>
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}>
          <div className="py-4 border-t border-white/10">
            <div className="flex flex-col space-y-2">
              {navItems.map(({
                path,
                icon: Icon,
                label
              }, index) => (
                <NavLink 
                  key={path} 
                  to={path} 
                  className={({ isActive }) => cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 transform",
                    isActive ? 'bg-white/20 text-white font-medium' : 'text-white/80 hover:text-white hover:bg-white/10',
                    isOpen ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
                  )}
                  style={{
                    transitionDelay: isOpen ? `${index * 100}ms` : '0ms'
                  }}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>;
};