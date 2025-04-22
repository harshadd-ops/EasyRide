import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { SearchHeader } from "@/components/layout/search-header";
import { RideFilters } from "@/components/rides/ride-filters";
import { HomeBanner } from "@/components/rides/home-banner";
import { RideCard, RideProps } from "@/components/rides/ride-card";
import { MobileNav } from "@/components/layout/mobile-nav";
import { PostRideModal } from "@/components/rides/post-ride-modal";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const [showPostModal, setShowPostModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>(['available-seats']);
  const [filteredRides, setFilteredRides] = useState<RideProps[]>([]);
  const [visibleRides, setVisibleRides] = useState<number>(6);

  const { data: rides, isLoading, error } = useQuery<RideProps[]>({
    queryKey: ['/api/rides'],
    staleTime: 60000, // 1 minute
  });

  useEffect(() => {
    if (!rides) return;
    
    let filtered = [...rides];
    
    // Apply filters
    if (activeFilters.includes('today')) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      filtered = filtered.filter(ride => {
        const rideDate = new Date(ride.dateTime);
        return rideDate >= today && rideDate < tomorrow;
      });
    }
    
    if (activeFilters.includes('tomorrow')) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
      
      filtered = filtered.filter(ride => {
        const rideDate = new Date(ride.dateTime);
        return rideDate >= tomorrow && rideDate < dayAfterTomorrow;
      });
    }
    
    if (activeFilters.includes('this-week')) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      filtered = filtered.filter(ride => {
        const rideDate = new Date(ride.dateTime);
        return rideDate >= today && rideDate < nextWeek;
      });
    }
    
    if (activeFilters.includes('available-seats')) {
      filtered = filtered.filter(ride => ride.availableSeats > 0);
    }
    
    if (activeFilters.includes('north-campus')) {
      filtered = filtered.filter(ride => 
        ride.pickupLocation.toLowerCase().includes('north') || 
        ride.destination.toLowerCase().includes('north')
      );
    }
    
    if (activeFilters.includes('south-campus')) {
      filtered = filtered.filter(ride => 
        ride.pickupLocation.toLowerCase().includes('south') || 
        ride.destination.toLowerCase().includes('south')
      );
    }
    
    if (activeFilters.includes('downtown')) {
      filtered = filtered.filter(ride => 
        ride.pickupLocation.toLowerCase().includes('downtown') || 
        ride.destination.toLowerCase().includes('downtown')
      );
    }
    
    if (activeFilters.includes('cheapest')) {
      filtered.sort((a, b) => a.price - b.price);
    }
    
    if (activeFilters.includes('most-seats')) {
      filtered.sort((a, b) => b.availableSeats - a.availableSeats);
    }
    
    if (activeFilters.includes('highest-rated')) {
      filtered.sort((a, b) => {
        const ratingA = a.user?.avgRating || 0;
        const ratingB = b.user?.avgRating || 0;
        return ratingB - ratingA;
      });
    }
    
    setFilteredRides(filtered);
  }, [rides, activeFilters]);

  const handleFilterChange = (filters: string[]) => {
    setActiveFilters(filters);
  };

  const handleLoadMore = () => {
    setVisibleRides(prev => prev + 6);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 md:ml-64 pb-16 md:pb-0">
        <SearchHeader />
        
        <main className="container mx-auto px-4 py-6">
          <HomeBanner />
          
          <RideFilters onFilterChange={handleFilterChange} />
          
          <h2 className="text-2xl font-bold text-dark-900 mb-4">Available Rides</h2>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">Error loading rides: {(error as Error).message}</p>
            </div>
          ) : filteredRides.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
              <p className="text-gray-500">No rides found matching your filters.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setActiveFilters(['available-seats'])}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredRides.slice(0, visibleRides).map(ride => (
                  <RideCard key={ride.id} ride={ride} />
                ))}
              </div>
              
              {visibleRides < filteredRides.length && (
                <div className="flex justify-center mt-8 mb-16">
                  <Button 
                    variant="outline" 
                    className="flex items-center px-5 py-2.5"
                    onClick={handleLoadMore}
                  >
                    Load More Rides
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
      
      <MobileNav />
      
      <PostRideModal isOpen={showPostModal} onClose={() => setShowPostModal(false)} />
    </div>
  );
}
