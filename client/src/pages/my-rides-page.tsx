import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { SearchHeader } from "@/components/layout/search-header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { RideProps } from "@/components/rides/ride-card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "@/components/ui/avatar";
import { 
  Button,
  buttonVariants
} from "@/components/ui/button";
import {
  Users,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  Loader2,
  CalendarRange,
  Car,
  PlusCircle
} from "lucide-react";

interface RideRequest {
  id: number;
  rideId: number;
  userId: number;
  status: string;
  message?: string;
  createdAt: string;
  user?: {
    id: number;
    username: string;
    fullName: string;
    profileImage?: string;
    avgRating: number;
    totalReviews: number;
  };
  ride?: RideProps;
}

export default function MyRidesPage() {
  const [activeTab, setActiveTab] = useState("offered");
  const { toast } = useToast();
  
  const { data: offeredRides, isLoading: isLoadingOffered } = useQuery<RideProps[]>({
    queryKey: ['/api/user/rides'],
    staleTime: 60000, // 1 minute
  });
  
  const { data: rideRequests, isLoading: isLoadingRequests } = useQuery<RideRequest[]>({
    queryKey: ['/api/ride-requests/user'],
    staleTime: 60000, // 1 minute
  });
  
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 md:ml-64 pb-16 md:pb-0">
        <SearchHeader />
        
        <main className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-dark-900">My Rides</h1>
              <p className="text-gray-600">Manage your ride offers and requests</p>
            </div>
            <Link href="/post-ride">
              <a className={buttonVariants({ className: "hidden md:flex items-center gap-2" })}>
                <PlusCircle className="h-4 w-4" />
                Post a Ride
              </a>
            </Link>
          </div>
          
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="offered" className="flex items-center justify-center gap-2">
                <Car className="h-4 w-4" />
                Rides I'm Offering
              </TabsTrigger>
              <TabsTrigger value="requested" className="flex items-center justify-center gap-2">
                <Users className="h-4 w-4" />
                Rides I've Requested
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="offered">
              {isLoadingOffered ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : !offeredRides || offeredRides.length === 0 ? (
                <EmptyState 
                  title="No rides offered"
                  description="You haven't offered any rides yet."
                  buttonText="Offer a Ride"
                  buttonHref="/post-ride"
                />
              ) : (
                <div className="grid gap-4">
                  {offeredRides.map(ride => (
                    <OfferedRideCard key={ride.id} ride={ride} />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="requested">
              {isLoadingRequests ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : !rideRequests || rideRequests.length === 0 ? (
                <EmptyState 
                  title="No ride requests"
                  description="You haven't requested any rides yet."
                  buttonText="Find a Ride"
                  buttonHref="/"
                />
              ) : (
                <div className="grid gap-4">
                  {rideRequests.map(request => (
                    <RequestedRideCard key={request.id} request={request} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
      
      <MobileNav />
    </div>
  );
}

function OfferedRideCard({ ride }: { ride: RideProps }) {
  const { toast } = useToast();
  const [showRequests, setShowRequests] = useState(false);
  
  const { data: rideRequests, isLoading: isLoadingRequests } = useQuery<RideRequest[]>({
    queryKey: [`/api/ride-requests/ride/${ride.id}`],
    staleTime: 60000, // 1 minute
    enabled: showRequests,
  });
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric'
    });
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };
  
  const formatPrice = (price: number) => {
    return `$${(price / 100).toFixed(2)}`;
  };
  
  const cancelRideMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/rides/${ride.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/rides"] });
      toast({
        title: "Ride cancelled",
        description: "Your ride has been cancelled successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to cancel ride",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleCancelRide = () => {
    if (window.confirm("Are you sure you want to cancel this ride?")) {
      cancelRideMutation.mutate();
    }
  };
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 md:p-6 bg-white">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-lg font-semibold text-dark-900">
                <MapPin className="h-5 w-5 text-primary" />
                {ride.pickupLocation} to {ride.destination}
              </div>
              
              <div className="flex flex-wrap gap-4 text-gray-700">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{formatDate(ride.dateTime)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{formatTime(ride.dateTime)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span>{ride.availableSeats} {ride.availableSeats === 1 ? 'seat' : 'seats'} available</span>
                </div>
                <div className="bg-secondary text-white px-2 py-0.5 rounded-full text-xs font-medium">
                  {formatPrice(ride.price)}
                </div>
              </div>
              
              {ride.notes && (
                <div className="text-gray-600 text-sm border-t border-gray-100 pt-2 mt-2">
                  {ride.notes}
                </div>
              )}
            </div>
            
            <div className="flex flex-row md:flex-col gap-2 justify-start">
              <div className="text-xs px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-800 self-start">
                {ride.status === 'active' ? 'Active' : ride.status}
              </div>
              <Button 
                variant="destructive" 
                size="sm" 
                className="h-8"
                onClick={handleCancelRide}
                disabled={cancelRideMutation.isPending || ride.status !== 'active'}
              >
                {cancelRideMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                Cancel
              </Button>
            </div>
          </div>
          
          <div className="mt-4 flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRequests(!showRequests)}
              className="text-primary border-primary hover:bg-primary/10"
            >
              {showRequests ? "Hide Requests" : "Show Requests"}
            </Button>
          </div>
          
          {showRequests && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h3 className="font-medium mb-3">Ride Requests</h3>
              {isLoadingRequests ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : !rideRequests || rideRequests.length === 0 ? (
                <div className="text-gray-500 text-sm py-2">
                  No requests received yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {rideRequests.map(request => (
                    <RideRequestCard key={request.id} request={request} rideId={ride.id} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function RequestedRideCard({ request }: { request: RideRequest }) {
  if (!request.ride) return null;
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric'
    });
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };
  
  const formatPrice = (price: number) => {
    return `$${(price / 100).toFixed(2)}`;
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <div className="text-xs px-2 py-1 rounded-full font-medium bg-yellow-100 text-yellow-800">Pending</div>;
      case 'accepted':
        return <div className="text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-800">Accepted</div>;
      case 'rejected':
        return <div className="text-xs px-2 py-1 rounded-full font-medium bg-red-100 text-red-800">Rejected</div>;
      default:
        return <div className="text-xs px-2 py-1 rounded-full font-medium bg-gray-100 text-gray-800">{status}</div>;
    }
  };
  
  const getInitials = (name: string) => {
    if (!name) return "U";
    const names = name.split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 md:p-6 bg-white">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-lg font-semibold text-dark-900">
                <MapPin className="h-5 w-5 text-primary" />
                {request.ride.pickupLocation} to {request.ride.destination}
              </div>
              
              <div className="flex flex-wrap gap-4 text-gray-700">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{formatDate(request.ride.dateTime)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{formatTime(request.ride.dateTime)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span>{request.ride.availableSeats} {request.ride.availableSeats === 1 ? 'seat' : 'seats'} available</span>
                </div>
                <div className="bg-secondary text-white px-2 py-0.5 rounded-full text-xs font-medium">
                  {formatPrice(request.ride.price)}
                </div>
              </div>
            </div>
            
            <div className="flex flex-row md:flex-col gap-2 justify-start">
              {getStatusBadge(request.status)}
              <p className="text-xs text-gray-500">
                Requested on {new Date(request.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center">
              <div className="mr-3 text-sm text-gray-600">Driver:</div>
              {request.ride.user ? (
                <Link href={`/profile/${request.ride.user.id}`}>
                  <a className="flex items-center">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={request.ride.user.profileImage || ""} />
                      <AvatarFallback>{getInitials(request.ride.user.fullName)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-2">
                      <p className="text-sm font-medium text-dark-900">{request.ride.user.fullName}</p>
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-xs text-gray-500 ml-1">{request.ride.user.avgRating.toFixed(1)}</span>
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
                    <p className="text-sm font-medium text-dark-900">Unknown Driver</p>
                  </div>
                </div>
              )}
            </div>
            
            <Link href={`/messages/${request.ride.userId}`}>
              <a className={buttonVariants({ variant: "outline", size: "sm" })}>
                Message Driver
              </a>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RideRequestCard({ 
  request, 
  rideId 
}: { 
  request: RideRequest; 
  rideId: number;
}) {
  const { toast } = useToast();
  
  const updateRequestMutation = useMutation({
    mutationFn: async (status: string) => {
      const res = await apiRequest("PUT", `/api/ride-requests/${request.id}`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/ride-requests/ride/${rideId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/rides"] });
      toast({
        title: "Request updated",
        description: "The ride request status has been updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update request",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleAccept = () => {
    updateRequestMutation.mutate('accepted');
  };
  
  const handleReject = () => {
    updateRequestMutation.mutate('rejected');
  };
  
  const getInitials = (name: string) => {
    if (!name) return "U";
    const names = name.split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };
  
  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          {request.user ? (
            <Link href={`/profile/${request.user.id}`}>
              <a className="flex items-center">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={request.user.profileImage || ""} />
                  <AvatarFallback>{getInitials(request.user.fullName)}</AvatarFallback>
                </Avatar>
                <div className="ml-2">
                  <p className="text-sm font-medium text-dark-900">{request.user.fullName}</p>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-xs text-gray-500 ml-1">{request.user.avgRating.toFixed(1)}</span>
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
              </div>
            </div>
          )}
        </div>
        <div className="text-xs px-2 py-1 rounded-full font-medium">
          {request.status === 'pending' && <div className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Pending</div>}
          {request.status === 'accepted' && <div className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Accepted</div>}
          {request.status === 'rejected' && <div className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full">Rejected</div>}
        </div>
      </div>
      
      {request.message && (
        <div className="mt-2 text-sm text-gray-600 bg-white p-2 rounded border border-gray-200">
          "{request.message}"
        </div>
      )}
      
      {request.status === 'pending' && (
        <div className="flex gap-2 mt-3">
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1"
            onClick={handleAccept}
            disabled={updateRequestMutation.isPending}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Accept
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={handleReject}
            disabled={updateRequestMutation.isPending}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Decline
          </Button>
        </div>
      )}
      
      {(request.status === 'accepted' || request.status === 'rejected') && (
        <div className="mt-3 text-right">
          <Link href={`/messages/${request.userId}`}>
            <a className={buttonVariants({ variant: "outline", size: "sm" })}>
              Message Rider
            </a>
          </Link>
        </div>
      )}
    </div>
  );
}

function EmptyState({ 
  title, 
  description, 
  buttonText, 
  buttonHref 
}: { 
  title: string;
  description: string;
  buttonText: string;
  buttonHref: string;
}) {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center text-center">
        <div className="rounded-full w-20 h-20 bg-gray-100 flex items-center justify-center mb-4">
          <CalendarRange className="h-10 w-10 text-gray-400" />
        </div>
        <p className="text-gray-500 mb-6">{description}</p>
        <Link href={buttonHref}>
          <a className={buttonVariants({ size: "lg" })}>
            {buttonText}
          </a>
        </Link>
      </CardContent>
    </Card>
  );
}
