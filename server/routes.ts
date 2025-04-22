import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { 
  insertRideSchema, 
  insertRideRequestSchema, 
  insertMessageSchema, 
  insertReviewSchema 
} from "@shared/schema";

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Rides API
  app.get("/api/rides", async (req, res) => {
    try {
      const rides = await storage.getRides({
        rideType: req.query.rideType as string | undefined,
        dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
        dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
        pickupLocation: req.query.pickupLocation as string | undefined,
        destination: req.query.destination as string | undefined,
        availableSeats: req.query.availableSeats ? parseInt(req.query.availableSeats as string) : undefined,
        status: req.query.status as string | undefined,
      });
      
      // Get user info for each ride
      const ridesWithUserInfo = await Promise.all(
        rides.map(async (ride) => {
          const user = await storage.getUser(ride.userId);
          return {
            ...ride,
            user: user ? { 
              id: user.id,
              username: user.username,
              fullName: user.fullName,
              profileImage: user.profileImage,
              avgRating: user.avgRating,
              totalReviews: user.totalReviews,
            } : null
          };
        })
      );
      
      res.json(ridesWithUserInfo);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rides" });
    }
  });

  app.get("/api/rides/:id", async (req, res) => {
    try {
      const ride = await storage.getRide(parseInt(req.params.id));
      if (!ride) {
        return res.status(404).json({ message: "Ride not found" });
      }
      
      const user = await storage.getUser(ride.userId);
      const rideWithUser = {
        ...ride,
        user: user ? { 
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          profileImage: user.profileImage,
          avgRating: user.avgRating,
          totalReviews: user.totalReviews,
        } : null
      };
      
      res.json(rideWithUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ride" });
    }
  });

  app.post("/api/rides", isAuthenticated, async (req, res) => {
    try {
      const user = req.user!;
      const validatedData = insertRideSchema.parse({
        ...req.body,
        userId: user.id
      });
      
      const ride = await storage.createRide(validatedData);
      res.status(201).json(ride);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create ride" });
    }
  });

  app.put("/api/rides/:id", isAuthenticated, async (req, res) => {
    try {
      const rideId = parseInt(req.params.id);
      const ride = await storage.getRide(rideId);
      
      if (!ride) {
        return res.status(404).json({ message: "Ride not found" });
      }
      
      if (ride.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to update this ride" });
      }
      
      const updatedRide = await storage.updateRide(rideId, req.body);
      res.json(updatedRide);
    } catch (error) {
      res.status(500).json({ message: "Failed to update ride" });
    }
  });

  app.delete("/api/rides/:id", isAuthenticated, async (req, res) => {
    try {
      const rideId = parseInt(req.params.id);
      const ride = await storage.getRide(rideId);
      
      if (!ride) {
        return res.status(404).json({ message: "Ride not found" });
      }
      
      if (ride.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to delete this ride" });
      }
      
      await storage.deleteRide(rideId);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete ride" });
    }
  });

  app.get("/api/user/rides", isAuthenticated, async (req, res) => {
    try {
      const rides = await storage.getRidesByUser(req.user!.id);
      res.json(rides);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user rides" });
    }
  });

  // Ride requests API
  app.get("/api/ride-requests/ride/:rideId", isAuthenticated, async (req, res) => {
    try {
      const rideId = parseInt(req.params.rideId);
      const ride = await storage.getRide(rideId);
      
      if (!ride) {
        return res.status(404).json({ message: "Ride not found" });
      }
      
      if (ride.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to view these requests" });
      }
      
      const requests = await storage.getRideRequestsByRide(rideId);
      
      // Get user info for each request
      const requestsWithUserInfo = await Promise.all(
        requests.map(async (request) => {
          const user = await storage.getUser(request.userId);
          return {
            ...request,
            user: user ? { 
              id: user.id,
              username: user.username,
              fullName: user.fullName,
              profileImage: user.profileImage,
              avgRating: user.avgRating,
              totalReviews: user.totalReviews,
            } : null
          };
        })
      );
      
      res.json(requestsWithUserInfo);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ride requests" });
    }
  });

  app.get("/api/ride-requests/user", isAuthenticated, async (req, res) => {
    try {
      const requests = await storage.getRideRequestsByUser(req.user!.id);
      
      // Get ride info for each request
      const requestsWithRideInfo = await Promise.all(
        requests.map(async (request) => {
          const ride = await storage.getRide(request.rideId);
          return {
            ...request,
            ride
          };
        })
      );
      
      res.json(requestsWithRideInfo);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user requests" });
    }
  });

  app.post("/api/ride-requests", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const validatedData = insertRideRequestSchema.parse({
        ...req.body,
        userId
      });
      
      const ride = await storage.getRide(validatedData.rideId);
      if (!ride) {
        return res.status(404).json({ message: "Ride not found" });
      }
      
      if (ride.userId === userId) {
        return res.status(400).json({ message: "Cannot request your own ride" });
      }
      
      const existingRequests = await storage.getRideRequestsByRide(validatedData.rideId);
      const alreadyRequested = existingRequests.some(r => r.userId === userId);
      
      if (alreadyRequested) {
        return res.status(400).json({ message: "You already requested this ride" });
      }
      
      const request = await storage.createRideRequest(validatedData);
      res.status(201).json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create ride request" });
    }
  });

  app.put("/api/ride-requests/:id", isAuthenticated, async (req, res) => {
    try {
      const requestId = parseInt(req.params.id);
      const request = await storage.getRideRequest(requestId);
      
      if (!request) {
        return res.status(404).json({ message: "Ride request not found" });
      }
      
      const ride = await storage.getRide(request.rideId);
      if (!ride) {
        return res.status(404).json({ message: "Ride not found" });
      }
      
      if (ride.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to update this request" });
      }
      
      const updatedRequest = await storage.updateRideRequest(requestId, { status: req.body.status });
      
      // If accepting request and available seats > 0, decrement available seats
      if (req.body.status === 'accepted' && ride.availableSeats > 0) {
        await storage.updateRide(ride.id, {
          availableSeats: ride.availableSeats - 1
        });
      }
      
      res.json(updatedRequest);
    } catch (error) {
      res.status(500).json({ message: "Failed to update ride request" });
    }
  });

  // Messages API
  app.get("/api/messages", isAuthenticated, async (req, res) => {
    try {
      const messages = await storage.getMessagesByUser(req.user!.id);
      
      // Group messages by conversation participants
      const conversationsMap = new Map<number, {
        userId: number,
        lastMessage: string,
        lastMessageDate: Date,
        unreadCount: number
      }>();
      
      for (const message of messages) {
        const isIncoming = message.receiverId === req.user!.id;
        const otherUserId = isIncoming ? message.senderId : message.receiverId;
        
        if (!conversationsMap.has(otherUserId) || 
            new Date(message.createdAt) > new Date(conversationsMap.get(otherUserId)!.lastMessageDate)) {
          
          conversationsMap.set(otherUserId, {
            userId: otherUserId,
            lastMessage: message.content,
            lastMessageDate: new Date(message.createdAt),
            unreadCount: isIncoming && !message.isRead ? 1 : 0
          });
        } else if (isIncoming && !message.isRead) {
          const conv = conversationsMap.get(otherUserId)!;
          conv.unreadCount++;
        }
      }
      
      // Get user info for each conversation
      const conversations = await Promise.all(
        Array.from(conversationsMap.entries()).map(async ([userId, convo]) => {
          const user = await storage.getUser(userId);
          return {
            ...convo,
            user: user ? { 
              id: user.id,
              username: user.username,
              fullName: user.fullName,
              profileImage: user.profileImage,
            } : null
          };
        })
      );
      
      // Sort conversations by last message date
      conversations.sort((a, b) => 
        new Date(b.lastMessageDate).getTime() - new Date(a.lastMessageDate).getTime()
      );
      
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.get("/api/messages/:userId", isAuthenticated, async (req, res) => {
    try {
      const otherUserId = parseInt(req.params.userId);
      const otherUser = await storage.getUser(otherUserId);
      
      if (!otherUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const messages = await storage.getConversation(req.user!.id, otherUserId);
      
      // Mark incoming messages as read
      for (const message of messages) {
        if (message.receiverId === req.user!.id && !message.isRead) {
          await storage.markMessageAsRead(message.id);
        }
      }
      
      // Get updated messages after marking as read
      const updatedMessages = await storage.getConversation(req.user!.id, otherUserId);
      
      res.json({
        messages: updatedMessages,
        user: {
          id: otherUser.id,
          username: otherUser.username,
          fullName: otherUser.fullName,
          profileImage: otherUser.profileImage,
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  app.post("/api/messages", isAuthenticated, async (req, res) => {
    try {
      const senderId = req.user!.id;
      const validatedData = insertMessageSchema.parse({
        ...req.body,
        senderId
      });
      
      // Check if receiver exists
      const receiver = await storage.getUser(validatedData.receiverId);
      if (!receiver) {
        return res.status(404).json({ message: "Receiver not found" });
      }
      
      const message = await storage.createMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Reviews API
  app.get("/api/reviews/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const reviews = await storage.getReviewsByReviewee(userId);
      
      // Get reviewer info for each review
      const reviewsWithUserInfo = await Promise.all(
        reviews.map(async (review) => {
          const reviewer = await storage.getUser(review.reviewerId);
          return {
            ...review,
            reviewer: reviewer ? { 
              id: reviewer.id,
              username: reviewer.username,
              fullName: reviewer.fullName,
              profileImage: reviewer.profileImage,
            } : null
          };
        })
      );
      
      res.json(reviewsWithUserInfo);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post("/api/reviews", isAuthenticated, async (req, res) => {
    try {
      const reviewerId = req.user!.id;
      const validatedData = insertReviewSchema.parse({
        ...req.body,
        reviewerId
      });
      
      // Check if reviewee exists
      const reviewee = await storage.getUser(validatedData.revieweeId);
      if (!reviewee) {
        return res.status(404).json({ message: "Reviewee not found" });
      }
      
      // Check if ride exists
      const ride = await storage.getRide(validatedData.rideId);
      if (!ride) {
        return res.status(404).json({ message: "Ride not found" });
      }
      
      // Check if reviewer is part of the ride (either driver or passenger)
      if (ride.userId !== reviewerId && ride.userId !== validatedData.revieweeId) {
        return res.status(403).json({ message: "Not authorized to review this user for this ride" });
      }
      
      const review = await storage.createReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Profile API
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send password in response
      const { password, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.put("/api/user/profile", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { fullName, college, department, bio } = req.body;
      
      const updatedUser = await storage.updateUser(userId, {
        fullName,
        college,
        department,
        bio
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send password in response
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
