import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";
import passport from "./auth";
import { isAuthenticated, isAdmin } from "./auth";
import { storage } from "./storage";
import { insertVehicleSchema, insertVehicleOfferSchema, insertTransactionSchema } from "@shared/schema";

// Configure multer for file uploads
const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${randomUUID()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: uploadStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // ===== AUTHENTICATION ROUTES =====
  
  // Login
  app.post('/api/auth/login', (req, res, next) => {
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ error: 'Authentication error' });
      }
      if (!user) {
        return res.status(401).json({ error: info?.message || 'Invalid credentials' });
      }
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ error: 'Login error' });
        }
        const { password, ...userWithoutPassword } = user;
        return res.json({ user: userWithoutPassword });
      });
    })(req, res, next);
  });
  
  // Logout
  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: 'Logout error' });
      }
      res.json({ success: true });
    });
  });
  
  // Get current user
  app.get('/api/auth/me', isAuthenticated, (req, res) => {
    const { password, ...userWithoutPassword } = req.user as any;
    res.json({ user: userWithoutPassword });
  });
  
  // Register (optional customer accounts)
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, name, phone } = req.body;
      
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      
      const user = await storage.createUser({
        email,
        password,
        name,
        phone,
        role: 'customer',
      });
      
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // ===== PUBLIC VEHICLE ROUTES =====
  
  // Get all available vehicles
  app.get('/api/vehicles', async (req, res) => {
    try {
      const vehicles = await storage.getAvailableVehicles();
      res.json({ vehicles });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get featured vehicles
  app.get('/api/vehicles/featured', async (req, res) => {
    try {
      const vehicles = await storage.getFeaturedVehicles();
      res.json({ vehicles });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get single vehicle with images and offer
  app.get('/api/vehicles/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vehicle = await storage.getVehicle(id);
      
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }
      
      const images = await storage.getVehicleImages(id);
      const offer = await storage.getActiveOffer(id);
      
      res.json({ vehicle, images, offer });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // ===== ADMIN VEHICLE ROUTES =====
  
  // Get all vehicles (including unavailable)
  app.get('/api/admin/vehicles', isAdmin, async (req, res) => {
    try {
      const vehicles = await storage.getAllVehicles();
      res.json({ vehicles });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Create vehicle
  app.post('/api/admin/vehicles', isAdmin, async (req, res) => {
    try {
      const vehicleData = insertVehicleSchema.parse(req.body);
      const vehicle = await storage.createVehicle(vehicleData);
      res.json({ vehicle });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Update vehicle
  app.patch('/api/admin/vehicles/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vehicle = await storage.updateVehicle(id, req.body);
      
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }
      
      res.json({ vehicle });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Delete vehicle
  app.delete('/api/admin/vehicles/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteVehicle(id);
      
      if (!success) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // ===== IMAGE UPLOAD ROUTES =====
  
  // Upload vehicle image
  app.post('/api/admin/vehicles/:id/images', isAdmin, upload.single('image'), async (req, res) => {
    try {
      const vehicleId = parseInt(req.params.id);
      
      if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded' });
      }
      
      const imageUrl = `/uploads/${req.file.filename}`;
      const image = await storage.addVehicleImage({
        vehicleId,
        imageUrl,
        isPrimary: false,
        displayOrder: 0,
      });
      
      res.json({ image });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Delete vehicle image
  app.delete('/api/admin/vehicles/images/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteVehicleImage(id);
      
      if (!success) {
        return res.status(404).json({ error: 'Image not found' });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Set primary image
  app.patch('/api/admin/vehicles/:vehicleId/images/:imageId/primary', isAdmin, async (req, res) => {
    try {
      const vehicleId = parseInt(req.params.vehicleId);
      const imageId = parseInt(req.params.imageId);
      
      const success = await storage.setPrimaryImage(vehicleId, imageId);
      
      if (!success) {
        return res.status(404).json({ error: 'Image not found' });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // ===== OFFER ROUTES =====
  
  // Create offer
  app.post('/api/admin/offers', isAdmin, async (req, res) => {
    try {
      const offerData = insertVehicleOfferSchema.parse(req.body);
      const offer = await storage.createOffer(offerData);
      res.json({ offer });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Update offer
  app.patch('/api/admin/offers/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const offer = await storage.updateOffer(id, req.body);
      
      if (!offer) {
        return res.status(404).json({ error: 'Offer not found' });
      }
      
      res.json({ offer });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // ===== TRANSACTION ROUTES =====
  
  // Initiate transaction (customer/guest)
  app.post('/api/transactions', async (req, res) => {
    try {
      const transactionData = insertTransactionSchema.parse(req.body);
      
      // Generate guest token if not logged in
      const guestToken = req.isAuthenticated() ? null : randomUUID();
      
      const transaction = await storage.createTransaction({
        ...transactionData,
        buyerId: req.isAuthenticated() ? (req.user as any).id : null,
        guestToken,
        status: 'initiated',
      });
      
      // Create initial event
      await storage.addTransactionEvent({
        transactionId: transaction.id,
        status: 'initiated',
        notes: 'Transaction initiated by buyer',
        createdBy: req.isAuthenticated() ? (req.user as any).id : null,
      });
      
      res.json({ transaction, guestToken });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Get transaction by ID or token
  app.get('/api/transactions/:idOrToken', async (req, res) => {
    try {
      const { idOrToken } = req.params;
      let transaction;
      
      if (idOrToken.includes('-')) {
        // It's a UUID token
        transaction = await storage.getTransactionByToken(idOrToken);
      } else {
        // It's a numeric ID
        const id = parseInt(idOrToken);
        transaction = await storage.getTransaction(id);
        
        // If not admin, verify ownership
        if (transaction && !req.isAuthenticated()) {
          return res.status(403).json({ error: 'Access denied' });
        }
        
        if (transaction && req.isAuthenticated()) {
          const user = req.user as any;
          if (user.role !== 'admin' && transaction.buyerId !== user.id) {
            return res.status(403).json({ error: 'Access denied' });
          }
        }
      }
      
      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      
      const events = await storage.getTransactionEvents(transaction.id);
      const vehicle = await storage.getVehicle(transaction.vehicleId);
      
      res.json({ transaction, events, vehicle });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get user transactions
  app.get('/api/transactions', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const transactions = await storage.getUserTransactions(user.id);
      res.json({ transactions });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // ===== ADMIN TRANSACTION MANAGEMENT =====
  
  // Get all transactions
  app.get('/api/admin/transactions', isAdmin, async (req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      res.json({ transactions });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Update transaction status
  app.patch('/api/admin/transactions/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, bankInfo, notes } = req.body;
      
      const transaction = await storage.updateTransaction(id, {
        status,
        bankInfo,
        notes,
      });
      
      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      
      // Create event
      await storage.addTransactionEvent({
        transactionId: id,
        status,
        notes: notes || `Status updated to ${status}`,
        createdBy: (req.user as any).id,
      });
      
      res.json({ transaction });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    // Static file serving for uploads
    const express = require('express');
    express.static('uploads')(req, res, next);
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
