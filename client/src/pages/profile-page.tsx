import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { SearchHeader } from "@/components/layout/search-header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useParams, useLocation } from "wouter";
import { User } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { RideProps } from "@/components/rides/ride-card";
import { Link } from "wouter";
import { 
  User as UserIcon, 
  Mail, 
  School, 
  BookOpen, 
  MapPin, 
  Calendar, 
  Star, 
  Clock, 
  Edit, 
  Loader2, 
  MessageSquare, 
  Car,
  Plus,
  Users
} from "lucide-react";

interface Review {
  id: number;
  rideId: number;
  reviewerId: number;
  revieweeId: number;
  rating: number;
  comment?: string;
  createdAt: string;
  reviewer?: {
    id: number;
    username: string;
    fullName: string;
    profileImage?: string;
  };
}

const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  college: z.string().optional(),
  department: z.string().optional(),
  bio: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const params = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [profileId, setProfileId] = useState<number | null>(null);
  
  useEffect(() => {
    if (params && params.id) {
      const id = parseInt(params.id);
      if (!isNaN(id)) {
        setProfileId(id);
        setIsOwnProfile(user?.id === id);
      }
    } else {
      setIsOwnProfile(true);
      setProfileId(user?.id || null);
    }
  }, [params, user]);
  
  const { data: profileUser, isLoading: isLoadingUser } = useQuery<Omit<User, "password">>({
    queryKey: isOwnProfile ? ["/api/user"] : [`/api/users/${profileId}`],
    enabled: !!profileId,
    staleTime: 300000, // 5 minutes
  });
  
  const { data: userRides, isLoading: isLoadingRides } = useQuery<RideProps[]>({
    queryKey: [`/api/user/rides`],
    enabled: isOwnProfile,
    staleTime: 60000, // 1 minute
  });
  
  const { data: reviews, isLoading: isLoadingReviews } = useQuery<Review[]>({
    queryKey: [`/api/reviews/user/${profileId}`],
    enabled: !!profileId,
    staleTime: 300000, // 5 minutes
  });
  
  const getInitials = (name: string) => {
    if (!name) return "U";
    const names = name.split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };
  
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 md:ml-64 pb-16 md:pb-0">
        <SearchHeader />
        
        <main className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-dark-900">
              {isOwnProfile ? "My Profile" : `${profileUser?.fullName || "User"}'s Profile`}
            </h1>
            <p className="text-gray-600">
              {isOwnProfile ? "Manage your profile information" : "View profile and ride history"}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <ProfileCard 
                user={profileUser} 
                isOwnProfile={isOwnProfile} 
                isLoading={isLoadingUser} 
              />
            </div>
            
            <div className="md:col-span-2">
              <Card>
                <CardContent className="p-0">
                  <Tabs defaultValue={isOwnProfile ? "edit" : "reviews"} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3">
                      {isOwnProfile && (
                        <TabsTrigger value="edit" className="text-sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Profile
                        </TabsTrigger>
                      )}
                      <TabsTrigger value="reviews" className="text-sm">
                        <Star className="h-4 w-4 mr-2" />
                        Reviews
                      </TabsTrigger>
                      <TabsTrigger value="rides" className="text-sm">
                        <Car className="h-4 w-4 mr-2" />
                        Rides
                      </TabsTrigger>
                    </TabsList>
                    
                    {isOwnProfile && (
                      <TabsContent value="edit" className="p-6">
                        <EditProfileForm user={profileUser} isLoading={isLoadingUser} />
                      </TabsContent>
                    )}
                    
                    <TabsContent value="reviews" className="p-6">
                      <UserReviews 
                        reviews={reviews} 
                        isLoading={isLoadingReviews}
                        userName={profileUser?.fullName || "User"}
                      />
                    </TabsContent>
                    
                    <TabsContent value="rides" className="p-6">
                      <UserRides 
                        rides={userRides}
                        isLoading={isLoadingRides || isLoadingUser}
                        isOwnProfile={isOwnProfile}
                        userId={profileId}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
      
      <MobileNav />
    </div>
  );
}

function ProfileCard({ 
  user, 
  isOwnProfile, 
  isLoading 
}: { 
  user?: Omit<User, "password">;
  isOwnProfile: boolean;
  isLoading: boolean;
}) {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  
  const getInitials = (name: string) => {
    if (!name) return "U";
    const names = name.split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="flex justify-center mb-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
          <p>Loading profile information...</p>
        </CardContent>
      </Card>
    );
  }
  
  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-red-500">User not found</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate("/")}
          >
            Go to Home Page
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={user.profileImage || ""} />
            <AvatarFallback className="text-xl">{getInitials(user.fullName)}</AvatarFallback>
          </Avatar>
          
          <h2 className="text-xl font-bold text-center">{user.fullName}</h2>
          
          <div className="flex items-center justify-center mt-1 mb-4">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
            <span className="text-gray-700">{user.avgRating?.toFixed(1) || "0.0"}</span>
            <span className="text-gray-500 text-sm ml-1">({user.totalReviews || 0} reviews)</span>
          </div>
          
          <div className="w-full space-y-3 mt-2">
            <div className="flex items-center text-gray-700">
              <UserIcon className="h-4 w-4 text-gray-500 mr-3" />
              <span className="text-sm">@{user.username}</span>
            </div>
            
            <div className="flex items-center text-gray-700">
              <Mail className="h-4 w-4 text-gray-500 mr-3" />
              <span className="text-sm truncate">{user.email}</span>
            </div>
            
            {user.college && (
              <div className="flex items-center text-gray-700">
                <School className="h-4 w-4 text-gray-500 mr-3" />
                <span className="text-sm">{user.college}</span>
              </div>
            )}
            
            {user.department && (
              <div className="flex items-center text-gray-700">
                <BookOpen className="h-4 w-4 text-gray-500 mr-3" />
                <span className="text-sm">{user.department}</span>
              </div>
            )}
          </div>
          
          {user.bio && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg w-full">
              <p className="text-sm text-gray-700">{user.bio}</p>
            </div>
          )}
          
          {!isOwnProfile && (
            <div className="mt-6 w-full">
              <Link href={`/messages/${user.id}`}>
                <div className={buttonVariants({ className: "w-full cursor-pointer" })}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </div>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EditProfileForm({ 
  user, 
  isLoading 
}: { 
  user?: Omit<User, "password">;
  isLoading: boolean;
}) {
  const { toast } = useToast();
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      college: user?.college || "",
      department: user?.department || "",
      bio: user?.bio || "",
    },
  });
  
  // Update form values when user data is loaded
  useEffect(() => {
    if (user) {
      form.reset({
        fullName: user.fullName,
        college: user.college || "",
        department: user.department || "",
        bio: user.bio || "",
      });
    }
  }, [user, form]);
  
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const res = await apiRequest("PUT", "/api/user/profile", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Your full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="college"
            render={({ field }) => (
              <FormItem>
                <FormLabel>College/University</FormLabel>
                <FormControl>
                  <Input placeholder="Your institution" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <FormControl>
                  <Input placeholder="Your department" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Tell others a bit about yourself" 
                  {...field} 
                  rows={4}
                />
              </FormControl>
              <FormDescription>
                Share some information about your ride preferences, interests, or schedule.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          disabled={updateProfileMutation.isPending}
          className="w-full md:w-auto"
        >
          {updateProfileMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </form>
    </Form>
  );
}

function UserReviews({ 
  reviews, 
  isLoading,
  userName
}: { 
  reviews?: Review[];
  isLoading: boolean;
  userName: string;
}) {
  const getInitials = (name: string) => {
    if (!name) return "U";
    const names = name.split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric'
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium mb-1">No Reviews Yet</h3>
        <p className="text-gray-500">
          {userName} hasn't received any reviews yet.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center mb-2">
        <h3 className="text-lg font-medium">Reviews</h3>
        <div className="ml-2 flex items-center bg-gray-100 px-2 py-1 rounded-full">
          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
          <span className="text-sm font-medium">
            {(reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)}
          </span>
          <span className="text-xs text-gray-500 ml-1">({reviews.length})</span>
        </div>
      </div>
      
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                {review.reviewer ? (
                  <Link href={`/profile/${review.reviewer.id}`}>
                    <div className="flex items-center cursor-pointer">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={review.reviewer.profileImage || ""} />
                        <AvatarFallback>{getInitials(review.reviewer.fullName)}</AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <p className="font-medium">{review.reviewer.fullName}</p>
                        <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <p className="font-medium">Anonymous User</p>
                      <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
            </div>
            
            {review.comment && (
              <div className="mt-3 text-gray-700">
                {review.comment}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function UserRides({
  rides,
  isLoading,
  isOwnProfile,
  userId
}: {
  rides?: RideProps[];
  isLoading: boolean;
  isOwnProfile: boolean;
  userId: number | null;
}) {
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
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!isOwnProfile) {
    return (
      <div className="text-center py-8">
        <Car className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium mb-1">Ride History Not Available</h3>
        <p className="text-gray-500">
          You can only view your own ride history.
        </p>
      </div>
    );
  }
  
  if (!rides || rides.length === 0) {
    return (
      <div className="text-center py-8">
        <Car className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium mb-1">No Rides Yet</h3>
        <p className="text-gray-500 mb-4">
          You haven't posted any rides yet.
        </p>
        <Link href="/post-ride">
          <div className={buttonVariants({ variant: "default", className: "cursor-pointer" })}>
            Post Your First Ride
          </div>
        </Link>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Your Posted Rides</h3>
        <Link href="/post-ride">
          <div className={buttonVariants({ variant: "outline", size: "sm", className: "cursor-pointer" })}>
            <Plus className="h-4 w-4 mr-2" />
            Post New Ride
          </div>
        </Link>
      </div>
      
      <div className="space-y-4">
        {rides.map((ride) => (
          <div key={ride.id} className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center text-lg font-semibold text-dark-900 mb-1">
                  <MapPin className="h-5 w-5 text-primary mr-1" />
                  {ride.pickupLocation} to {ride.destination}
                </div>
                
                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                    {formatDate(ride.dateTime)}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-500 mr-1" />
                    {formatTime(ride.dateTime)}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-gray-500 mr-1" />
                    {ride.availableSeats} seats
                  </div>
                  <div className="bg-secondary text-white px-2 py-0.5 rounded-full text-xs font-medium">
                    {formatPrice(ride.price)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                  ride.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                </div>
                <Link href="/my-rides">
                  <div className={buttonVariants({ variant: "outline", size: "sm", className: "cursor-pointer" })}>
                    View Details
                  </div>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
