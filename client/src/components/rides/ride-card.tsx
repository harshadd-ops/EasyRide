import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Circle, MapPin, Users } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface RideUser {
  id: number;
  username: string;
  fullName: string;
  profileImage?: string | null;
  avgRating: number;
  totalReviews: number;
}

export interface RideProps {
  id: number;
  userId: number;
  rideType: string;
  pickupLocation: string;
  destination: string;
  dateTime: string;
  availableSeats: number;
  price: number;
  notes?: string;
  status: string;
  createdAt: string;
  user?: RideUser;
}

export function RideCard({ ride }: { ride: RideProps }) {
  const { toast } = useToast();
  const { user } = useAuth();

  const formatPrice = (price: number) => {
    return `$${(price / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    const names = name.split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const getPostedTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: false });
  };

  const requestRideMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/ride-requests", {
        rideId: ride.id,
        message: `I'd like to join your ride to ${ride.destination}!`
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rides"] });
      toast({
        title: "Ride requested",
        description: "Your request has been sent to the driver."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Request failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleRequestRide = () => {
    if (ride.userId === user?.id) {
      toast({
        title: "Cannot request your own ride",
        description: "You cannot request a ride that you're offering.",
        variant: "destructive"
      });
      return;
    }
    requestRideMutation.mutate();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-dark-900">{ride.pickupLocation} to {ride.destination}</h3>
            <p className="text-gray-500 text-sm">{formatDate(ride.dateTime)}</p>
          </div>
          <span className="bg-secondary text-white px-2 py-0.5 rounded-full text-xs font-medium">
            {formatPrice(ride.price)}
          </span>
        </div>
        
        <div className="flex items-start mb-4">
          <div className="mt-1 mr-3 flex flex-col items-center">
            <Circle className="w-2.5 h-2.5 text-primary fill-primary" />
            <div className="w-0.5 h-12 bg-gray-300 my-1"></div>
            <MapPin className="w-2.5 h-2.5 text-accent fill-accent" />
          </div>
          <div className="flex-1">
            <div className="mb-3">
              <p className="text-dark-800 font-medium">{ride.pickupLocation}</p>
              <p className="text-gray-500 text-sm">Pickup point</p>
            </div>
            <div>
              <p className="text-dark-800 font-medium">{ride.destination}</p>
              <p className="text-gray-500 text-sm">Destination</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center border-t border-gray-100 pt-4">
          {ride.user ? (
            <Link href={`/profile/${ride.user.id}`}>
              <a className="flex items-center">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={ride.user.profileImage || ""} />
                  <AvatarFallback>{getInitials(ride.user.fullName)}</AvatarFallback>
                </Avatar>
                <div className="ml-2">
                  <p className="text-sm font-medium text-dark-900">{ride.user.fullName.split(' ')[0]} {ride.user.fullName.split(' ').length > 1 ? ride.user.fullName.split(' ')[1][0] + '.' : ''}</p>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-xs text-gray-500 ml-1">{ride.user.avgRating.toFixed(1)}</span>
                  </div>
                </div>
              </a>
            </Link>
          ) : (
            <div className="flex items-center">
              <Avatar className="h-8 w-8">
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="ml-2">
                <p className="text-sm font-medium text-dark-900">Unknown User</p>
                <div className="flex items-center">
                  <span className="text-xs text-gray-500 ml-1">N/A</span>
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center text-dark-800">
            <Users className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium ml-1">{ride.availableSeats} {ride.availableSeats === 1 ? 'seat' : 'seats'} left</span>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-3 flex justify-between items-center">
        <span className="text-xs text-gray-500">Posted {getPostedTime(ride.createdAt)} ago</span>
        <button 
          className="text-primary font-medium text-sm hover:text-indigo-700"
          onClick={handleRequestRide}
          disabled={requestRideMutation.isPending}
        >
          {requestRideMutation.isPending ? 'Processing...' : 'Request Ride'}
        </button>
      </div>
    </div>
  );
}
