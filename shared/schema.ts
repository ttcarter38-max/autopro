import { pgTable, text, integer, boolean, timestamp, decimal, pgEnum } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'customer']);
export const vehicleConditionEnum = pgEnum('vehicle_condition', ['new', 'used']);
export const transactionStatusEnum = pgEnum('transaction_status', [
  'initiated',
  'awaiting_admin_approval',
  'awaiting_payment_confirmation',
  'in_transit',
  'inspection',
  'approved',
  'released',
  'cancelled'
]);

// Users table (admin + customers)
export const users = pgTable('users', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  role: userRoleEnum('role').notNull().default('customer'),
  phone: text('phone'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Vehicle categories supported by the marketplace
export const VEHICLE_CATEGORIES = ['car', 'rv', 'boat', 'bike', 'tractor'] as const;
export type VehicleCategory = typeof VEHICLE_CATEGORIES[number];

// Vehicles table
export const vehicles = pgTable('vehicles', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: text('name').notNull(),
  make: text('make').notNull(),
  model: text('model').notNull(),
  year: integer('year').notNull(),
  category: text('category').notNull().default('car'), // car / rv / boat / bike / tractor
  condition: vehicleConditionEnum('condition').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  mileage: integer('mileage'),
  color: text('color').notNull(),
  transmission: text('transmission').notNull(),
  topSpeed: text('top_speed'),
  description: text('description'),
  featured: boolean('featured').default(false),
  available: boolean('available').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const insertVehicleSchema = createInsertSchema(vehicles, {
  category: z.enum(VEHICLE_CATEGORIES).default('car'),
}).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehicles.$inferSelect;

// Vehicle Images table
export const vehicleImages = pgTable('vehicle_images', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  vehicleId: integer('vehicle_id').notNull().references(() => vehicles.id, { onDelete: 'cascade' }),
  imageUrl: text('image_url').notNull(),
  isPrimary: boolean('is_primary').default(false),
  displayOrder: integer('display_order').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const insertVehicleImageSchema = createInsertSchema(vehicleImages).omit({ id: true, createdAt: true });
export type InsertVehicleImage = z.infer<typeof insertVehicleImageSchema>;
export type VehicleImage = typeof vehicleImages.$inferSelect;

// Vehicle Offers table
export const vehicleOffers = pgTable('vehicle_offers', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  vehicleId: integer('vehicle_id').notNull().references(() => vehicles.id, { onDelete: 'cascade' }),
  originalPrice: decimal('original_price', { precision: 10, scale: 2 }).notNull(),
  discountedPrice: decimal('discounted_price', { precision: 10, scale: 2 }).notNull(),
  offerText: text('offer_text'),
  active: boolean('active').default(true),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const insertVehicleOfferSchema = createInsertSchema(vehicleOffers).omit({ id: true, createdAt: true });
export type InsertVehicleOffer = z.infer<typeof insertVehicleOfferSchema>;
export type VehicleOffer = typeof vehicleOffers.$inferSelect;

// Transactions table (escrow purchases)
export const transactions = pgTable('transactions', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  vehicleId: integer('vehicle_id').references(() => vehicles.id),
  buyerId: integer('buyer_id').references(() => users.id),
  buyerName: text('buyer_name').notNull(),
  buyerEmail: text('buyer_email').notNull(),
  buyerPhone: text('buyer_phone').notNull(),
  shippingAddress: text('shipping_address').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  status: transactionStatusEnum('status').notNull().default('initiated'),
  inspectionDays: integer('inspection_days').notNull().default(3),
  guestToken: text('guest_token'),

  // Seller fields
  sellerEmail: text('seller_email'),
  sellerName: text('seller_name'),
  sellerPhone: text('seller_phone'),
  sellerToken: text('seller_token'),       // unique token for seller email links
  sellerStatus: text('seller_status').default('pending'), // pending / accepted / rejected

  // Payment fields (admin-set)
  paymentMethod: text('payment_method').default('bank'), // 'bank' or 'crypto'
  bankInfo: text('bank_info'),             // bank details text (existing)
  cryptoAddress: text('crypto_address'),   // crypto wallet address
  cryptoCoin: text('crypto_coin'),         // BTC / ETH / USDT / BNB / SOL ...

  // Buyer's preferred payment method (set at escrow initiation; admin may override above)
  buyerPaymentMethod: text('buyer_payment_method'),    // 'bank' or 'crypto'
  buyerPreferredCoin: text('buyer_preferred_coin'),    // BTC / ETH / USDT / BNB / SOL (optional)
  buyerPreferredNetwork: text('buyer_preferred_network'), // e.g. TRC-20, ERC-20 (optional, free text)

  // Buyer payment confirmation
  bankRef: text('bank_ref'),               // buyer's bank reference / tx hash
  paymentProof: text('payment_proof'),     // text note from buyer
  paymentProofFile: text('payment_proof_file'), // uploaded file path

  // Custom / Private sale
  customVehicleDescription: text('custom_vehicle_description'),
  notes: text('notes'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const insertTransactionSchema = createInsertSchema(transactions, {
  buyerPaymentMethod: z.enum(['bank', 'crypto']).optional(),
  buyerPreferredCoin: z.string().trim().max(20).optional(),
  buyerPreferredNetwork: z.string().trim().max(40).optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// Transaction Events table (audit trail)
export const transactionEvents = pgTable('transaction_events', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  transactionId: integer('transaction_id').notNull().references(() => transactions.id, { onDelete: 'cascade' }),
  status: transactionStatusEnum('status').notNull(),
  notes: text('notes'),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const insertTransactionEventSchema = createInsertSchema(transactionEvents).omit({ id: true, createdAt: true });
export type InsertTransactionEvent = z.infer<typeof insertTransactionEventSchema>;
export type TransactionEvent = typeof transactionEvents.$inferSelect;

// Customer Testimonials (shown in About page carousel)
export const testimonials = pgTable('testimonials', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  customerName: text('customer_name').notNull(),
  vehicle: text('vehicle'),               // e.g. "2024 Tesla Model Y"
  location: text('location'),             // e.g. "Lagos, Nigeria"
  quote: text('quote').notNull(),
  photoUrl: text('photo_url').notNull(),
  displayOrder: integer('display_order').default(0).notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({ id: true, createdAt: true });
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type Testimonial = typeof testimonials.$inferSelect;
