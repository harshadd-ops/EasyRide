import { useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useLocation } from "wouter";

interface PostRideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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

export function PostRideModal({ isOpen, onClose }: PostRideModalProps) {
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
      onClose();
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
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle className="text-lg font-bold text-dark-900">Post a Ride</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-5 w-5 rounded-full p-0">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label className="block text-sm font-medium text-dark-700 mb-1">Ride Type</Label>
              <div className="flex space-x-3 mb-3">
                <Button
                  type="button"
                  className={`flex-1 py-2 ${rideType === 'offer' ? 'bg-primary text-white' : 'bg-white border border-gray-300 text-dark-700'}`}
                  onClick={() => {
                    setRideType('offer');
                    form.setValue('rideType', 'offer');
                  }}
                >
                  Offering Ride
                </Button>
                <Button
                  type="button"
                  className={`flex-1 py-2 ${rideType === 'request' ? 'bg-primary text-white' : 'bg-white border border-gray-300 text-dark-700'}`}
                  onClick={() => {
                    setRideType('request');
                    form.setValue('rideType', 'request');
                  }}
                >
                  Requesting Ride
                </Button>
              </div>
            </div>
            
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
            
            <div className="flex space-x-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
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
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      rows={3} 
                      placeholder="Add any details about your ride" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full bg-primary text-white font-medium py-2.5 rounded-lg hover:bg-indigo-600 transition"
              disabled={postRideMutation.isPending}
            >
              {postRideMutation.isPending ? "Posting..." : "Post Ride"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
