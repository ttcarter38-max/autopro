import { db } from './db';
import { 
  users, vehicles, vehicleImages, vehicleOffers, transactions, transactionEvents, testimonials, chatMessages,
  type User, type InsertUser,
  type Vehicle, type InsertVehicle,
  type VehicleImage, type InsertVehicleImage,
  type VehicleOffer, type InsertVehicleOffer,
  type Transaction, type InsertTransaction,
  type TransactionEvent, type InsertTransactionEvent,
  type Testimonial, type InsertTestimonial,
  type ChatMessage, type InsertChatMessage
} from '@shared/schema';
import { eq, and, desc, inArray, sql, ne } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export type VehicleWithImage = Vehicle & { image: string | null };

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  verifyPassword(email: string, password: string): Promise<User | null>;
  
  // Vehicle operations
  getAllVehicles(): Promise<Vehicle[]>;
  getAllVehiclesWithImages(): Promise<VehicleWithImage[]>;
  getAvailableVehicles(): Promise<Vehicle[]>;
  getAvailableVehiclesWithImages(): Promise<VehicleWithImage[]>;
  getFeaturedVehicles(): Promise<Vehicle[]>;
  getFeaturedVehiclesWithImages(): Promise<VehicleWithImage[]>;
  getVehicle(id: number): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: number, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: number): Promise<boolean>;
  
  // Vehicle image operations
  getVehicleImages(vehicleId: number): Promise<VehicleImage[]>;
  addVehicleImage(image: InsertVehicleImage): Promise<VehicleImage>;
  deleteVehicleImage(id: number): Promise<boolean>;
  setPrimaryImage(vehicleId: number, imageId: number): Promise<boolean>;
  
  // Vehicle offer operations
  getActiveOffer(vehicleId: number): Promise<VehicleOffer | undefined>;
  getAllOffers(): Promise<VehicleOffer[]>;
  createOffer(offer: InsertVehicleOffer): Promise<VehicleOffer>;
  updateOffer(id: number, offer: Partial<InsertVehicleOffer>): Promise<VehicleOffer | undefined>;
  deleteOffer(id: number): Promise<boolean>;
  
  // Transaction operations
  getAllTransactions(): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionByToken(token: string): Promise<Transaction | undefined>;
  getTransactionBySellerToken(token: string): Promise<Transaction | undefined>;
  getTransactionByProofFile(filePath: string): Promise<Transaction | undefined>;
  getUserTransactions(buyerId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: number): Promise<boolean>;
  
  // Transaction event operations
  getTransactionEvents(transactionId: number): Promise<TransactionEvent[]>;
  addTransactionEvent(event: InsertTransactionEvent): Promise<TransactionEvent>;

  // Testimonial operations
  getActiveTestimonials(): Promise<Testimonial[]>;
  getAllTestimonials(): Promise<Testimonial[]>;
  getTestimonial(id: number): Promise<Testimonial | undefined>;
  createTestimonial(t: InsertTestimonial): Promise<Testimonial>;
  updateTestimonial(id: number, t: Partial<InsertTestimonial>): Promise<Testimonial | undefined>;
  deleteTestimonial(id: number): Promise<boolean>;

  // Chat operations
  getChatMessages(sessionId: string): Promise<ChatMessage[]>;
  createChatMessage(msg: InsertChatMessage): Promise<ChatMessage>;
  getChatSessions(): Promise<{ sessionId: string; visitorName: string | null; visitorEmail: string | null; lastMessage: string; lastAt: Date; unread: number }[]>;
  markSessionRead(sessionId: string, readerType?: 'admin' | 'visitor'): Promise<void>;
  getUnreadCountForSession(sessionId: string, senderType: 'visitor' | 'admin'): Promise<number>;
}

export class PostgresStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const result = await db.insert(users).values({
      ...insertUser,
      password: hashedPassword,
    }).returning();
    return result[0];
  }

  async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  // Vehicle operations
  async getAllVehicles(): Promise<Vehicle[]> {
    return await db.select().from(vehicles).orderBy(desc(vehicles.createdAt));
  }

  async getAllVehiclesWithImages(): Promise<VehicleWithImage[]> {
    const allVehicles = await db.select().from(vehicles).orderBy(desc(vehicles.createdAt));
    if (allVehicles.length === 0) return [];
    
    const vehicleIds = allVehicles.map(v => v.id);
    const relevantImages = await db.select().from(vehicleImages)
      .where(inArray(vehicleImages.vehicleId, vehicleIds))
      .orderBy(vehicleImages.displayOrder);
    
    const imagesByVehicleId = new Map<number, VehicleImage[]>();
    for (const img of relevantImages) {
      if (!imagesByVehicleId.has(img.vehicleId)) {
        imagesByVehicleId.set(img.vehicleId, []);
      }
      imagesByVehicleId.get(img.vehicleId)!.push(img);
    }
    
    return allVehicles.map((vehicle: Vehicle) => {
      const vehicleImagesList = imagesByVehicleId.get(vehicle.id) || [];
      const primaryImage = vehicleImagesList.find((img: VehicleImage) => img.isPrimary) || vehicleImagesList[0];
      return { ...vehicle, image: primaryImage?.imageUrl || null };
    });
  }

  async getAvailableVehicles(): Promise<Vehicle[]> {
    return await db.select().from(vehicles).where(eq(vehicles.available, true)).orderBy(desc(vehicles.createdAt));
  }

  async getAvailableVehiclesWithImages(): Promise<VehicleWithImage[]> {
    const availableVehicles = await db.select().from(vehicles)
      .where(eq(vehicles.available, true))
      .orderBy(desc(vehicles.createdAt));
    if (availableVehicles.length === 0) return [];
    
    const vehicleIds = availableVehicles.map(v => v.id);
    const relevantImages = await db.select().from(vehicleImages)
      .where(inArray(vehicleImages.vehicleId, vehicleIds))
      .orderBy(vehicleImages.displayOrder);
    
    const imagesByVehicleId = new Map<number, VehicleImage[]>();
    for (const img of relevantImages) {
      if (!imagesByVehicleId.has(img.vehicleId)) {
        imagesByVehicleId.set(img.vehicleId, []);
      }
      imagesByVehicleId.get(img.vehicleId)!.push(img);
    }
    
    return availableVehicles.map((vehicle: Vehicle) => {
      const vehicleImagesList = imagesByVehicleId.get(vehicle.id) || [];
      const primaryImage = vehicleImagesList.find((img: VehicleImage) => img.isPrimary) || vehicleImagesList[0];
      return { ...vehicle, image: primaryImage?.imageUrl || null };
    });
  }

  async getFeaturedVehicles(): Promise<Vehicle[]> {
    return await db.select().from(vehicles)
      .where(and(eq(vehicles.featured, true), eq(vehicles.available, true)))
      .orderBy(desc(vehicles.createdAt));
  }

  async getFeaturedVehiclesWithImages(): Promise<VehicleWithImage[]> {
    const featuredVehicles = await db.select().from(vehicles)
      .where(and(eq(vehicles.featured, true), eq(vehicles.available, true)))
      .orderBy(desc(vehicles.createdAt));
    if (featuredVehicles.length === 0) return [];
    
    const vehicleIds = featuredVehicles.map(v => v.id);
    const relevantImages = await db.select().from(vehicleImages)
      .where(inArray(vehicleImages.vehicleId, vehicleIds))
      .orderBy(vehicleImages.displayOrder);
    
    const imagesByVehicleId = new Map<number, VehicleImage[]>();
    for (const img of relevantImages) {
      if (!imagesByVehicleId.has(img.vehicleId)) {
        imagesByVehicleId.set(img.vehicleId, []);
      }
      imagesByVehicleId.get(img.vehicleId)!.push(img);
    }
    
    return featuredVehicles.map((vehicle: Vehicle) => {
      const vehicleImagesList = imagesByVehicleId.get(vehicle.id) || [];
      const primaryImage = vehicleImagesList.find((img: VehicleImage) => img.isPrimary) || vehicleImagesList[0];
      return { ...vehicle, image: primaryImage?.imageUrl || null };
    });
  }

  async getVehicle(id: number): Promise<Vehicle | undefined> {
    const result = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return result[0];
  }

  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const result = await db.insert(vehicles).values(vehicle).returning();
    return result[0];
  }

  async updateVehicle(id: number, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined> {
    const result = await db.update(vehicles).set({ ...vehicle, updatedAt: new Date() }).where(eq(vehicles.id, id)).returning();
    return result[0];
  }

  async deleteVehicle(id: number): Promise<boolean> {
    const result = await db.delete(vehicles).where(eq(vehicles.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Vehicle image operations
  async getVehicleImages(vehicleId: number): Promise<VehicleImage[]> {
    return await db.select().from(vehicleImages)
      .where(eq(vehicleImages.vehicleId, vehicleId))
      .orderBy(vehicleImages.displayOrder);
  }

  async addVehicleImage(image: InsertVehicleImage): Promise<VehicleImage> {
    const result = await db.insert(vehicleImages).values(image).returning();
    return result[0];
  }

  async deleteVehicleImage(id: number): Promise<boolean> {
    const result = await db.delete(vehicleImages).where(eq(vehicleImages.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async setPrimaryImage(vehicleId: number, imageId: number): Promise<boolean> {
    // First, set all images for this vehicle to not primary
    await db.update(vehicleImages)
      .set({ isPrimary: false })
      .where(eq(vehicleImages.vehicleId, vehicleId));
    
    // Then set the specified image as primary
    const result = await db.update(vehicleImages)
      .set({ isPrimary: true })
      .where(and(eq(vehicleImages.id, imageId), eq(vehicleImages.vehicleId, vehicleId)));
    
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Vehicle offer operations
  async getActiveOffer(vehicleId: number): Promise<VehicleOffer | undefined> {
    const result = await db.select().from(vehicleOffers)
      .where(and(eq(vehicleOffers.vehicleId, vehicleId), eq(vehicleOffers.active, true)));
    return (result ?? [])[0];
  }

  async getAllOffers(): Promise<VehicleOffer[]> {
    const result = await db.select().from(vehicleOffers).orderBy(desc(vehicleOffers.createdAt));
    return result ?? [];
  }

  async createOffer(offer: InsertVehicleOffer): Promise<VehicleOffer> {
    const result = await db.insert(vehicleOffers).values(offer).returning();
    return result[0];
  }

  async updateOffer(id: number, offer: Partial<InsertVehicleOffer>): Promise<VehicleOffer | undefined> {
    const result = await db.update(vehicleOffers).set(offer).where(eq(vehicleOffers.id, id)).returning();
    return result[0];
  }

  async deleteOffer(id: number): Promise<boolean> {
    const result = await db.delete(vehicleOffers).where(eq(vehicleOffers.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Transaction operations
  async getAllTransactions(): Promise<Transaction[]> {
    const result = await db.select().from(transactions).orderBy(desc(transactions.createdAt));
    return result ?? [];
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    const result = await db.select().from(transactions).where(eq(transactions.id, id));
    return result[0];
  }

  async getTransactionByToken(token: string): Promise<Transaction | undefined> {
    const result = await db.select().from(transactions).where(eq(transactions.guestToken, token));
    return result[0];
  }

  async getTransactionBySellerToken(token: string): Promise<Transaction | undefined> {
    const result = await db.select().from(transactions).where(eq(transactions.sellerToken, token));
    return result[0];
  }

  async getTransactionByProofFile(filePath: string): Promise<Transaction | undefined> {
    const result = await db.select().from(transactions).where(eq(transactions.paymentProofFile, filePath));
    return result[0];
  }

  async getUserTransactions(buyerId: number): Promise<Transaction[]> {
    return await db.select().from(transactions)
      .where(eq(transactions.buyerId, buyerId))
      .orderBy(desc(transactions.createdAt));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const result = await db.insert(transactions).values(transaction).returning();
    if (result[0]) return result[0];

    // Fallback: Drizzle/Neon HTTP returning() can return empty when using defaults.
    // Re-fetch by guestToken (always set for unauthenticated) or latest by id.
    if (transaction.guestToken) {
      const [existing] = await db
        .select()
        .from(transactions)
        .where(eq(transactions.guestToken, transaction.guestToken))
        .limit(1);
      if (existing) return existing;
    }
    if (transaction.buyerId) {
      const [existing] = await db
        .select()
        .from(transactions)
        .where(eq(transactions.buyerId, transaction.buyerId as number))
        .orderBy(desc(transactions.id))
        .limit(1);
      if (existing) return existing;
    }
    // Last resort: newest row
    const [latest] = await db
      .select()
      .from(transactions)
      .orderBy(desc(transactions.id))
      .limit(1);
    return latest;
  }

  async updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const result = await db.update(transactions)
      .set({ ...transaction, updatedAt: new Date() })
      .where(eq(transactions.id, id))
      .returning();
    if (result[0]) return result[0];
    // Neon HTTP driver fallback — returning() can be empty after UPDATE
    const [existing] = await db.select().from(transactions).where(eq(transactions.id, id)).limit(1);
    return existing;
  }

  async deleteTransaction(id: number): Promise<boolean> {
    const result = await db.delete(transactions).where(eq(transactions.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Transaction event operations
  async getTransactionEvents(transactionId: number): Promise<TransactionEvent[]> {
    return await db.select().from(transactionEvents)
      .where(eq(transactionEvents.transactionId, transactionId))
      .orderBy(desc(transactionEvents.createdAt));
  }

  async addTransactionEvent(event: InsertTransactionEvent): Promise<TransactionEvent> {
    // Strip null integer FK columns — Neon HTTP driver serializes null as '' for integers
    const insertValues: any = { ...event };
    if (insertValues.createdBy == null) delete insertValues.createdBy;

    const result = await db.insert(transactionEvents).values(insertValues).returning();
    if (result[0]) return result[0];

    // Fallback: Drizzle/Neon returning() returns empty when columns use DEFAULT
    const [existing] = await db
      .select()
      .from(transactionEvents)
      .where(eq(transactionEvents.transactionId, event.transactionId))
      .orderBy(desc(transactionEvents.id))
      .limit(1);
    return existing;
  }

  // Testimonial operations
  async getActiveTestimonials(): Promise<Testimonial[]> {
    return await db.select().from(testimonials).where(eq(testimonials.active, true)).orderBy(testimonials.displayOrder, desc(testimonials.id));
  }
  async getAllTestimonials(): Promise<Testimonial[]> {
    return await db.select().from(testimonials).orderBy(testimonials.displayOrder, desc(testimonials.id));
  }
  async getTestimonial(id: number): Promise<Testimonial | undefined> {
    const r = await db.select().from(testimonials).where(eq(testimonials.id, id));
    return r[0];
  }
  async createTestimonial(t: InsertTestimonial): Promise<Testimonial> {
    const r = await db.insert(testimonials).values(t).returning();
    return r[0];
  }
  async updateTestimonial(id: number, t: Partial<InsertTestimonial>): Promise<Testimonial | undefined> {
    const r = await db.update(testimonials).set(t).where(eq(testimonials.id, id)).returning();
    return r[0];
  }
  async deleteTestimonial(id: number): Promise<boolean> {
    const r = await db.delete(testimonials).where(eq(testimonials.id, id)).returning();
    return r.length > 0;
  }

  // Chat operations
  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(chatMessages.createdAt);
  }

  async createChatMessage(msg: InsertChatMessage): Promise<ChatMessage> {
    const r = await db.insert(chatMessages).values(msg).returning();
    if (r[0]) return r[0];
    const [latest] = await db.select().from(chatMessages)
      .where(eq(chatMessages.sessionId, msg.sessionId))
      .orderBy(desc(chatMessages.id)).limit(1);
    return latest;
  }

  async getChatSessions(): Promise<{ sessionId: string; visitorName: string | null; visitorEmail: string | null; lastMessage: string; lastAt: Date; unread: number }[]> {
    const rows = await db.execute(sql`
      SELECT
        cm.session_id AS "sessionId",
        (SELECT visitor_name FROM chat_messages WHERE session_id = cm.session_id AND visitor_name IS NOT NULL ORDER BY id DESC LIMIT 1) AS "visitorName",
        (SELECT visitor_email FROM chat_messages WHERE session_id = cm.session_id AND visitor_email IS NOT NULL ORDER BY id DESC LIMIT 1) AS "visitorEmail",
        (SELECT message FROM chat_messages WHERE session_id = cm.session_id ORDER BY id DESC LIMIT 1) AS "lastMessage",
        MAX(cm.created_at) AS "lastAt",
        COUNT(*) FILTER (WHERE cm.sender_type = 'visitor' AND cm.read = false)::int AS "unread"
      FROM chat_messages cm
      GROUP BY cm.session_id
      ORDER BY MAX(cm.created_at) DESC
    `);
    return (rows.rows || []) as any;
  }

  async markSessionRead(sessionId: string, readerType: 'admin' | 'visitor' = 'admin'): Promise<void> {
    const markSenderType = readerType === 'admin' ? 'visitor' : 'admin';
    await db.update(chatMessages)
      .set({ read: true })
      .where(and(eq(chatMessages.sessionId, sessionId), eq(chatMessages.senderType, markSenderType)));
  }

  async getUnreadCountForSession(sessionId: string, senderType: 'visitor' | 'admin'): Promise<number> {
    const opposite = senderType === 'visitor' ? 'admin' : 'visitor';
    const r = await db.select({ count: sql<number>`count(*)::int` }).from(chatMessages)
      .where(and(
        eq(chatMessages.sessionId, sessionId),
        eq(chatMessages.senderType, opposite),
        eq(chatMessages.read, false)
      ));
    return r[0]?.count || 0;
  }
}

export const storage = new PostgresStorage();
