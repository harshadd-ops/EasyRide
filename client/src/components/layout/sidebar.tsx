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
        <div className="h-10 w-10 overflow-hidden rounded-lg">
          <img src="/attached_assets/ChatGPT Image Apr 22, 2025, 07_58_53 PM.png" alt="EasyRide Logo" className="w-full h-full object-cover" />
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
