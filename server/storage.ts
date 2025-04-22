import { 
  users, 
  rides, 
  rideRequests, 
  messages, 
  reviews, 
  type User, 
  type InsertUser, 
  type Ride, 
  type InsertRide, 
  type RideRequest, 
  type InsertRideRequest, 
  type Message, 
  type InsertMessage, 
  type Review, 
  type InsertReview 
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Ride methods
  getRide(id: number): Promise<Ride | undefined>;
  getRides(filters?: RideFilters): Promise<Ride[]>;
  getRidesByUser(userId: number): Promise<Ride[]>;
  createRide(ride: InsertRide): Promise<Ride>;
  updateRide(id: number, ride: Partial<Ride>): Promise<Ride | undefined>;
  deleteRide(id: number): Promise<boolean>;

  // Ride request methods
  getRideRequest(id: number): Promise<RideRequest | undefined>;
  getRideRequestsByRide(rideId: number): Promise<RideRequest[]>;
  getRideRequestsByUser(userId: number): Promise<RideRequest[]>;
  createRideRequest(request: InsertRideRequest): Promise<RideRequest>;
  updateRideRequest(id: number, request: Partial<RideRequest>): Promise<RideRequest | undefined>;
  
  // Message methods
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesByUser(userId: number): Promise<Message[]>;
  getConversation(user1Id: number, user2Id: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<Message | undefined>;
  
  // Review methods
  getReview(id: number): Promise<Review | undefined>;
  getReviewsByReviewer(reviewerId: number): Promise<Review[]>;
  getReviewsByReviewee(revieweeId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export type RideFilters = {
  rideType?: string;
  dateFrom?: Date;
  dateTo?: Date;
  pickupLocation?: string;
  destination?: string;
  availableSeats?: number;
  status?: string;
}

export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private ridesMap: Map<number, Ride>;
  private rideRequestsMap: Map<number, RideRequest>;
  private messagesMap: Map<number, Message>;
  private reviewsMap: Map<number, Review>;
  sessionStore: session.SessionStore;
  
  private userIdCounter: number;
  private rideIdCounter: number;
  private rideRequestIdCounter: number;
  private messageIdCounter: number;
  private reviewIdCounter: number;

  constructor() {
    this.usersMap = new Map();
    this.ridesMap = new Map();
    this.rideRequestsMap = new Map();
    this.messagesMap = new Map();
    this.reviewsMap = new Map();
    
    this.userIdCounter = 1;
    this.rideIdCounter = 1;
    this.rideRequestIdCounter = 1;
    this.messageIdCounter = 1;
    this.reviewIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id, avgRating: 0, totalReviews: 0 };
    this.usersMap.set(id, user);
    return user;
  }

  async updateUser(id: number, updateData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updateData };
    this.usersMap.set(id, updatedUser);
    return updatedUser;
  }

  // Ride methods
  async getRide(id: number): Promise<Ride | undefined> {
    return this.ridesMap.get(id);
  }

  async getRides(filters?: RideFilters): Promise<Ride[]> {
    let rides = Array.from(this.ridesMap.values());
    
    if (filters) {
      if (filters.rideType) {
        rides = rides.filter(ride => ride.rideType === filters.rideType);
      }
      
      if (filters.dateFrom) {
        rides = rides.filter(ride => new Date(ride.dateTime) >= filters.dateFrom!);
      }
      
      if (filters.dateTo) {
        rides = rides.filter(ride => new Date(ride.dateTime) <= filters.dateTo!);
      }
      
      if (filters.pickupLocation) {
        rides = rides.filter(ride => 
          ride.pickupLocation.toLowerCase().includes(filters.pickupLocation!.toLowerCase())
        );
      }
      
      if (filters.destination) {
        rides = rides.filter(ride => 
          ride.destination.toLowerCase().includes(filters.destination!.toLowerCase())
        );
      }
      
      if (filters.availableSeats) {
        rides = rides.filter(ride => ride.availableSeats >= filters.availableSeats!);
      }
      
      if (filters.status) {
        rides = rides.filter(ride => ride.status === filters.status);
      }
    }
    
    // Sort by dateTime (newest first)
    return rides.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
  }

  async getRidesByUser(userId: number): Promise<Ride[]> {
    return Array.from(this.ridesMap.values())
      .filter(ride => ride.userId === userId)
      .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
  }

  async createRide(insertRide: InsertRide): Promise<Ride> {
    const id = this.rideIdCounter++;
    const now = new Date();
    const ride: Ride = { 
      ...insertRide, 
      id, 
      status: 'active', 
      createdAt: now 
    };
    this.ridesMap.set(id, ride);
    return ride;
  }

  async updateRide(id: number, updateData: Partial<Ride>): Promise<Ride | undefined> {
    const ride = await this.getRide(id);
    if (!ride) return undefined;

    const updatedRide = { ...ride, ...updateData };
    this.ridesMap.set(id, updatedRide);
    return updatedRide;
  }

  async deleteRide(id: number): Promise<boolean> {
    return this.ridesMap.delete(id);
  }

  // Ride request methods
  async getRideRequest(id: number): Promise<RideRequest | undefined> {
    return this.rideRequestsMap.get(id);
  }

  async getRideRequestsByRide(rideId: number): Promise<RideRequest[]> {
    return Array.from(this.rideRequestsMap.values())
      .filter(request => request.rideId === rideId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getRideRequestsByUser(userId: number): Promise<RideRequest[]> {
    return Array.from(this.rideRequestsMap.values())
      .filter(request => request.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createRideRequest(insertRequest: InsertRideRequest): Promise<RideRequest> {
    const id = this.rideRequestIdCounter++;
    const now = new Date();
    const request: RideRequest = { 
      ...insertRequest, 
      id, 
      status: 'pending', 
      createdAt: now 
    };
    this.rideRequestsMap.set(id, request);
    return request;
  }

  async updateRideRequest(id: number, updateData: Partial<RideRequest>): Promise<RideRequest | undefined> {
    const request = await this.getRideRequest(id);
    if (!request) return undefined;

    const updatedRequest = { ...request, ...updateData };
    this.rideRequestsMap.set(id, updatedRequest);
    return updatedRequest;
  }

  // Message methods
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messagesMap.get(id);
  }

  async getMessagesByUser(userId: number): Promise<Message[]> {
    return Array.from(this.messagesMap.values())
      .filter(message => message.senderId === userId || message.receiverId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getConversation(user1Id: number, user2Id: number): Promise<Message[]> {
    return Array.from(this.messagesMap.values())
      .filter(message => 
        (message.senderId === user1Id && message.receiverId === user2Id) || 
        (message.senderId === user2Id && message.receiverId === user1Id)
      )
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const now = new Date();
    const message: Message = { 
      ...insertMessage, 
      id, 
      isRead: false, 
      createdAt: now 
    };
    this.messagesMap.set(id, message);
    return message;
  }

  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const message = await this.getMessage(id);
    if (!message) return undefined;

    const updatedMessage = { ...message, isRead: true };
    this.messagesMap.set(id, updatedMessage);
    return updatedMessage;
  }

  // Review methods
  async getReview(id: number): Promise<Review | undefined> {
    return this.reviewsMap.get(id);
  }

  async getReviewsByReviewer(reviewerId: number): Promise<Review[]> {
    return Array.from(this.reviewsMap.values())
      .filter(review => review.reviewerId === reviewerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getReviewsByReviewee(revieweeId: number): Promise<Review[]> {
    return Array.from(this.reviewsMap.values())
      .filter(review => review.revieweeId === revieweeId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.reviewIdCounter++;
    const now = new Date();
    const review: Review = { 
      ...insertReview, 
      id, 
      createdAt: now 
    };
    this.reviewsMap.set(id, review);
    
    // Update user rating
    const user = await this.getUser(insertReview.revieweeId);
    if (user) {
      const totalRating = user.avgRating * user.totalReviews + insertReview.rating;
      const totalReviews = user.totalReviews + 1;
      const avgRating = Math.round(totalRating / totalReviews);
      
      await this.updateUser(user.id, {
        avgRating,
        totalReviews
      });
    }
    
    return review;
  }
}

export const storage = new MemStorage();
