import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  college: text("college"),
  department: text("department"),
  profileImage: text("profile_image"),
  bio: text("bio"),
  avgRating: integer("avg_rating").default(0),
  totalReviews: integer("total_reviews").default(0),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
  college: true,
  department: true,
});

export const rides = pgTable("rides", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  rideType: text("ride_type").notNull(), // 'offer' or 'request'
  pickupLocation: text("pickup_location").notNull(),
  destination: text("destination").notNull(),
  dateTime: timestamp("date_time").notNull(),
  availableSeats: integer("available_seats").notNull(),
  price: integer("price").notNull(), // Stored in cents
  notes: text("notes"),
  status: text("status").default("active"), // 'active', 'completed', 'cancelled'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRideSchema = createInsertSchema(rides).pick({
  userId: true,
  rideType: true,
  pickupLocation: true,
  destination: true,
  dateTime: true,
  availableSeats: true,
  price: true,
  notes: true,
});

export const rideRequests = pgTable("ride_requests", {
  id: serial("id").primaryKey(),
  rideId: integer("ride_id").notNull(),
  userId: integer("user_id").notNull(),
  status: text("status").default("pending"), // 'pending', 'accepted', 'rejected'
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRideRequestSchema = createInsertSchema(rideRequests).pick({
  rideId: true,
  userId: true,
  message: true,
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  senderId: true,
  receiverId: true,
  content: true,
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  rideId: integer("ride_id").notNull(),
  reviewerId: integer("reviewer_id").notNull(),
  revieweeId: integer("reviewee_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReviewSchema = createInsertSchema(reviews).pick({
  rideId: true,
  reviewerId: true,
  revieweeId: true,
  rating: true,
  comment: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertRide = z.infer<typeof insertRideSchema>;
export type Ride = typeof rides.$inferSelect;

export type InsertRideRequest = z.infer<typeof insertRideRequestSchema>;
export type RideRequest = typeof rideRequests.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;
