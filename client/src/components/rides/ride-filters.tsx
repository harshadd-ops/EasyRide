import { useState } from "react";
import { Filter, Calendar, CalendarRange, Clock, MapPin, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface FiltersProps {
  onFilterChange: (filters: any) => void;
}

export function RideFilters({ onFilterChange }: FiltersProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>(['available-seats']);

  const handleFilterClick = (filter: string) => {
    let newFilters;
    
    if (filter === 'today' || filter === 'tomorrow' || filter === 'this-week') {
      // These are mutually exclusive, remove other date filters
      newFilters = activeFilters.filter(f => !['today', 'tomorrow', 'this-week'].includes(f));
      newFilters.push(filter);
    } else if (activeFilters.includes(filter)) {
      newFilters = activeFilters.filter(f => f !== filter);
    } else {
      newFilters = [...activeFilters, filter];
    }
    
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const isFilterActive = (filter: string) => {
    return activeFilters.includes(filter);
  };

  return (
    <div className="flex overflow-x-auto pb-4 md:pb-0 md:flex-wrap gap-2 mb-6 -mx-4 px-4 md:mx-0 md:px-0">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center whitespace-nowrap">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Filter Rides</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleFilterClick('cheapest')}>
            Cheapest first
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFilterClick('most-seats')}>
            Most available seats
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFilterClick('highest-rated')}>
            Highest rated drivers
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Button 
        variant={isFilterActive('today') ? "default" : "outline"} 
        className="whitespace-nowrap"
        onClick={() => handleFilterClick('today')}
      >
        <Calendar className="h-4 w-4 mr-2" />
        Today
      </Button>
      
      <Button 
        variant={isFilterActive('tomorrow') ? "default" : "outline"} 
        className="whitespace-nowrap"
        onClick={() => handleFilterClick('tomorrow')}
      >
        <CalendarRange className="h-4 w-4 mr-2" />
        Tomorrow
      </Button>
      
      <Button 
        variant={isFilterActive('this-week') ? "default" : "outline"} 
        className="whitespace-nowrap"
        onClick={() => handleFilterClick('this-week')}
      >
        <Clock className="h-4 w-4 mr-2" />
        This Week
      </Button>
      
      <Button 
        variant={isFilterActive('available-seats') ? "primary" : "outline"} 
        className={isFilterActive('available-seats') ? "bg-primary text-white" : ""}
        onClick={() => handleFilterClick('available-seats')}
      >
        <Users className="h-4 w-4 mr-2" />
        Available Seats
      </Button>
      
      <Button 
        variant={isFilterActive('north-campus') ? "default" : "outline"} 
        className="whitespace-nowrap"
        onClick={() => handleFilterClick('north-campus')}
      >
        <MapPin className="h-4 w-4 mr-2" />
        North Campus
      </Button>
      
      <Button 
        variant={isFilterActive('south-campus') ? "default" : "outline"} 
        className="whitespace-nowrap"
        onClick={() => handleFilterClick('south-campus')}
      >
        <MapPin className="h-4 w-4 mr-2" />
        South Campus
      </Button>
      
      <Button 
        variant={isFilterActive('downtown') ? "default" : "outline"} 
        className="whitespace-nowrap"
        onClick={() => handleFilterClick('downtown')}
      >
        <MapPin className="h-4 w-4 mr-2" />
        Downtown
      </Button>
    </div>
  );
}
