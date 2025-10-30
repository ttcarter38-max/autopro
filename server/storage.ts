import { db } from './db';
import { 
  users, vehicles, vehicleImages, vehicleOffers, transactions, transactionEvents,
  type User, type InsertUser,
  type Vehicle, type InsertVehicle,
  type VehicleImage, type InsertVehicleImage,
  type VehicleOffer, type InsertVehicleOffer,
  type Transaction, type InsertTransaction,
  type TransactionEvent, type InsertTransactionEvent
} from '@shared/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';
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
  createOffer(offer: InsertVehicleOffer): Promise<VehicleOffer>;
  updateOffer(id: number, offer: Partial<InsertVehicleOffer>): Promise<VehicleOffer | undefined>;
  deleteOffer(id: number): Promise<boolean>;
  
  // Transaction operations
  getAllTransactions(): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionByToken(token: string): Promise<Transaction | undefined>;
  getUserTransactions(buyerId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  
  // Transaction event operations
  getTransactionEvents(transactionId: number): Promise<TransactionEvent[]>;
  addTransactionEvent(event: InsertTransactionEvent): Promise<TransactionEvent>;
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
    return result[0];
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
    return await db.select().from(transactions).orderBy(desc(transactions.createdAt));
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    const result = await db.select().from(transactions).where(eq(transactions.id, id));
    return result[0];
  }

  async getTransactionByToken(token: string): Promise<Transaction | undefined> {
    const result = await db.select().from(transactions).where(eq(transactions.guestToken, token));
    return result[0];
  }

  async getUserTransactions(buyerId: number): Promise<Transaction[]> {
    return await db.select().from(transactions)
      .where(eq(transactions.buyerId, buyerId))
      .orderBy(desc(transactions.createdAt));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const result = await db.insert(transactions).values(transaction).returning();
    return result[0];
  }

  async updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const result = await db.update(transactions)
      .set({ ...transaction, updatedAt: new Date() })
      .where(eq(transactions.id, id))
      .returning();
    return result[0];
  }

  // Transaction event operations
  async getTransactionEvents(transactionId: number): Promise<TransactionEvent[]> {
    return await db.select().from(transactionEvents)
      .where(eq(transactionEvents.transactionId, transactionId))
      .orderBy(desc(transactionEvents.createdAt));
  }

  async addTransactionEvent(event: InsertTransactionEvent): Promise<TransactionEvent> {
    const result = await db.insert(transactionEvents).values(event).returning();
    return result[0];
  }
}

export const storage = new PostgresStorage();
