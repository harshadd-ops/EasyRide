import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  PlusCircle, 
  Car, 
  MessageSquare, 
  User, 
  Navigation 
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Sidebar() {
  const { user } = useAuth();
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  const NavItem = ({ href, icon, label, count }: { 
    href: string; 
    icon: React.ReactNode; 
    label: string;
    count?: number;
  }) => {
    const active = isActive(href);
    return (
      <Link href={href}>
        <div className={`flex items-center px-4 py-3 rounded-lg font-medium cursor-pointer ${
          active 
            ? "text-primary bg-indigo-50" 
            : "text-dark-700 hover:bg-gray-100"
        }`}>
          {icon}
          {label}
          {count !== undefined && (
            <span className="ml-auto bg-primary text-white px-2 py-0.5 rounded-full text-xs">
              {count}
            </span>
          )}
        </div>
      </Link>
    );
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    const names = name.split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className="hidden md:flex md:w-64 md-sidebar-fixed flex-col bg-white border-r border-gray-200 p-5 h-screen">
      <div className="flex items-center mb-8">
        <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="currentColor">
            <path d="M12 3C7.5 3 4 5.5 4 9.5V15c0 .5.5 1 1 1h1v-1.5c0-2.5 2.5-4.5 6-4.5s6 2 6 4.5V16h1c.5 0 1-.5 1-1V9.5C20 5.5 16.5 3 12 3zm-3 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm6 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
            <path d="M15 16v1c0 1.7-1.3 3-3 3s-3-1.3-3-3v-1h6m-3-2c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z"/>
          </svg>
        </div>
        <h1 className="ml-3 text-xl font-bold text-dark-900">EasyRide</h1>
      </div>
      
      <nav className="flex-1 space-y-1">
        <NavItem href="/" icon={<Home className="h-5 w-5 mr-3" />} label="Home" />
        <NavItem href="/post-ride" icon={<PlusCircle className="h-5 w-5 mr-3" />} label="Post a Ride" />
        <NavItem href="/my-rides" icon={<Car className="h-5 w-5 mr-3" />} label="My Rides" />
        <NavItem href="/messages" icon={<MessageSquare className="h-5 w-5 mr-3" />} label="Messages" count={2} />
        <NavItem href="/profile" icon={<User className="h-5 w-5 mr-3" />} label="Profile" />
      </nav>
      
      {user && (
        <div className="mt-auto pt-5 border-t border-gray-200">
          <div className="flex items-center px-4 py-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.profileImage || ""} />
              <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium text-dark-900">{user.fullName}</p>
              <p className="text-xs text-gray-500">{user.college || "College Student"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
