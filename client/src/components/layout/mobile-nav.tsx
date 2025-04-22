import { useLocation, Link } from "wouter";
import { 
  Home, 
  PlusCircle, 
  Car, 
  MessageSquare, 
  User 
} from "lucide-react";

export function MobileNav() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  const NavItem = ({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) => {
    const active = isActive(href);
    return (
      <Link href={href}>
        <a className={`flex flex-col items-center p-3 ${active ? "text-primary" : "text-dark-700"}`}>
          {icon}
          <span className="text-xs mt-1">{label}</span>
        </a>
      </Link>
    );
  };
  
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
      <div className="flex justify-around items-center">
        <NavItem href="/" icon={<Home className="h-6 w-6" />} label="Home" />
        <NavItem href="/post-ride" icon={<PlusCircle className="h-6 w-6" />} label="Post" />
        <NavItem href="/my-rides" icon={<Car className="h-6 w-6" />} label="My Rides" />
        <NavItem 
          href="/messages" 
          icon={
            <div className="relative">
              <MessageSquare className="h-6 w-6" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-primary rounded-full"></span>
            </div>
          } 
          label="Messages" 
        />
        <NavItem href="/profile" icon={<User className="h-6 w-6" />} label="Profile" />
      </div>
    </nav>
  );
}
