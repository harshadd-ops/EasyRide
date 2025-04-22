import { useAuth } from "@/hooks/use-auth";
import { Bell, Search, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";
import { Navigation } from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  Home, 
  PlusCircle, 
  Car, 
  MessageSquare, 
  User,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function SearchHeader() {
  const { user, logoutMutation } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  if (!user) return null;

  const getInitials = (name: string) => {
    if (!name) return "U";
    const names = name.split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Search for:", searchQuery);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="md:hidden flex items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <SheetHeader className="pb-5">
                <SheetTitle className="flex items-center">
                  <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor">
                      <path d="M12 3C7.5 3 4 5.5 4 9.5V15c0 .5.5 1 1 1h1v-1.5c0-2.5 2.5-4.5 6-4.5s6 2 6 4.5V16h1c.5 0 1-.5 1-1V9.5C20 5.5 16.5 3 12 3zm-3 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm6 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
                      <path d="M15 16v1c0 1.7-1.3 3-3 3s-3-1.3-3-3v-1h6m-3-2c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z"/>
                    </svg>
                  </div>
                  <span className="ml-2 text-lg font-bold">EasyRide</span>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col space-y-2">
                <Link href="/">
                  <a className="flex items-center py-2 px-3 rounded-md hover:bg-gray-100">
                    <Home className="h-5 w-5 mr-3" />
                    Home
                  </a>
                </Link>
                <Link href="/post-ride">
                  <a className="flex items-center py-2 px-3 rounded-md hover:bg-gray-100">
                    <PlusCircle className="h-5 w-5 mr-3" />
                    Post a Ride
                  </a>
                </Link>
                <Link href="/my-rides">
                  <a className="flex items-center py-2 px-3 rounded-md hover:bg-gray-100">
                    <Car className="h-5 w-5 mr-3" />
                    My Rides
                  </a>
                </Link>
                <Link href="/messages">
                  <a className="flex items-center py-2 px-3 rounded-md hover:bg-gray-100">
                    <MessageSquare className="h-5 w-5 mr-3" />
                    Messages
                    <span className="ml-auto bg-primary text-white px-2 py-0.5 rounded-full text-xs">2</span>
                  </a>
                </Link>
                <Link href="/profile">
                  <a className="flex items-center py-2 px-3 rounded-md hover:bg-gray-100">
                    <User className="h-5 w-5 mr-3" />
                    Profile
                  </a>
                </Link>
                <Button 
                  variant="ghost" 
                  className="justify-start px-3"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Logout
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/">
            <div className="flex items-center ml-2 cursor-pointer">
              <div className="h-9 w-9 bg-primary rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor">
                      <path d="M12 3C7.5 3 4 5.5 4 9.5V15c0 .5.5 1 1 1h1v-1.5c0-2.5 2.5-4.5 6-4.5s6 2 6 4.5V16h1c.5 0 1-.5 1-1V9.5C20 5.5 16.5 3 12 3zm-3 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm6 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
                      <path d="M15 16v1c0 1.7-1.3 3-3 3s-3-1.3-3-3v-1h6m-3-2c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z"/>
                    </svg>
              </div>
              <h1 className="ml-2 text-lg font-bold text-dark-900">EasyRide</h1>
            </div>
          </Link>
        </div>

        <form onSubmit={handleSearch} className="relative flex-1 max-w-2xl mx-4">
          <input 
            type="text" 
            placeholder="Search rides by destination or campus" 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
        </form>

        <div className="flex items-center">
          <button className="relative p-2 text-gray-600 hover:text-primary">
            <Bell className="h-6 w-6" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full"></span>
          </button>
          <Link href="/profile">
            <div className="hidden md:block ml-4 cursor-pointer">
              <Avatar className="h-9 w-9 border-2 border-white">
                <AvatarImage src={user.profileImage || ""} />
                <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
              </Avatar>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}