import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { SearchHeader } from "@/components/layout/search-header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Navigation, Car, Clock, MapPin } from "lucide-react";

const postRideSchema = z.object({
  rideType: z.enum(['offer', 'request']),
  pickupLocation: z.string().min(2, "Pickup location is required"),
  destination: z.string().min(2, "Destination is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  availableSeats: z.number().min(1, "At least 1 seat is required").max(7, "Maximum 7 seats"),
  price: z.number().min(0, "Price must be 0 or greater"),
  notes: z.string().optional(),
});

type PostRideFormValues = z.infer<typeof postRideSchema>;

export default function PostRidePage() {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [rideType, setRideType] = useState<'offer' | 'request'>('offer');

  const form = useForm<PostRideFormValues>({
    resolver: zodResolver(postRideSchema),
    defaultValues: {
      rideType: 'offer',
      pickupLocation: '',
      destination: '',
      date: '',
      time: '',
      availableSeats: 1,
      price: 0,
      notes: '',
    },
  });

  const postRideMutation = useMutation({
    mutationFn: async (data: PostRideFormValues) => {
      // Combine date and time into a single datetime string
      const dateTime = new Date(`${data.date}T${data.time}`);
      
      const rideData = {
        rideType: data.rideType,
        pickupLocation: data.pickupLocation,
        destination: data.destination,
        dateTime: dateTime.toISOString(),
        availableSeats: data.availableSeats,
        price: Math.round(data.price * 100), // Convert to cents for storage
        notes: data.notes,
      };
      
      const res = await apiRequest("POST", "/api/rides", rideData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rides"] });
      toast({
        title: "Ride posted",
        description: "Your ride has been posted successfully.",
      });
      navigate("/my-rides");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to post ride",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PostRideFormValues) => {
    postRideMutation.mutate(data);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 md:ml-64 pb-16 md:pb-0">
        <SearchHeader />
        
        <main className="container mx-auto px-4 py-6">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-dark-900">Post a Ride</h1>
              <p className="text-gray-600">Share your journey or find someone going your way</p>
            </div>
            
            <Card className="mb-8">
              <CardContent className="pt-6">
                <Tabs defaultValue="offer" onValueChange={(value) => {
                  setRideType(value as 'offer' | 'request');
                  form.setValue('rideType', value as 'offer' | 'request');
                }}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="offer" className="flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      <span>Offering a Ride</span>
                    </TabsTrigger>
                    <TabsTrigger value="request" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>Requesting a Ride</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="offer">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold mb-2">Offer a ride to other students</h3>
                      <p className="text-gray-600 text-sm">
                        Share your commute, split costs, and help others get where they need to go.
                      </p>
                    </div>
                    <PostRideForm 
                      form={form} 
                      onSubmit={onSubmit} 
                      isPending={postRideMutation.isPending} 
                    />
                  </TabsContent>
                  
                  <TabsContent value="request">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold mb-2">Request a ride from other students</h3>
                      <p className="text-gray-600 text-sm">
                        Need a lift? Post your travel needs and connect with drivers going your way.
                      </p>
                    </div>
                    <PostRideForm 
                      form={form} 
                      onSubmit={onSubmit} 
                      isPending={postRideMutation.isPending} 
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ride Posting Tips</CardTitle>
                <CardDescription>
                  How to get the most responses to your ride
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex gap-2 items-start">
                    <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Post in advance</p>
                      <p className="text-sm text-gray-600">Try to post rides at least 24 hours before departure for better matching</p>
                    </div>
                  </li>
                  <li className="flex gap-2 items-start">
                    <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Be specific about locations</p>
                      <p className="text-sm text-gray-600">Provide clear pickup and drop-off points to increase your chances of matching</p>
                    </div>
                  </li>
                  <li className="flex gap-2 items-start">
                    <Navigation className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Add useful details</p>
                      <p className="text-sm text-gray-600">Mention if you have space for luggage, can make stops, or have other requirements</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      
      <MobileNav />
    </div>
  );
}

function PostRideForm({ 
  form, 
  onSubmit, 
  isPending 
}: { 
  form: any; 
  onSubmit: (data: PostRideFormValues) => void; 
  isPending: boolean;
}) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="pickupLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pickup Location</FormLabel>
                <FormControl>
                  <Input placeholder="Enter pickup location" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="destination"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destination</FormLabel>
                <FormControl>
                  <Input placeholder="Enter destination" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input type="date" className="pl-10" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input type="time" className="pl-10" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="availableSeats"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Available Seats</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1" 
                    max="7" 
                    placeholder="1-7 seats" 
                    {...field} 
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price per Seat ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    step="0.5" 
                    placeholder="Enter amount" 
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes</FormLabel>
              <FormControl>
                <Textarea 
                  rows={3} 
                  placeholder="Add any details about your ride (e.g., space for luggage, meeting point details, etc.)" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full md:w-auto bg-primary text-white py-2 px-6"
          disabled={isPending}
        >
          {isPending ? "Posting..." : "Post Ride"}
        </Button>
      </form>
    </Form>
  );
}
