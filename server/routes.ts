import express, { type Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";
import passport from "./auth";
import { isAuthenticated, isAdmin } from "./auth";
import { storage } from "./storage";
import { insertVehicleSchema, insertVehicleOfferSchema, insertTransactionSchema } from "@shared/schema";
import {
  sendBuyerTransactionInitiated,
  sendSellerTransactionNotification,
  sendTransactionStatusUpdate,
  sendBuyerPaymentInstructions,
  sendBuyerPaymentReceived,
  sendAdminPaymentConfirmation,
  sendSellerPaymentReceived,
  sendSellerFundsReleased,
} from "./email";

// Seller action password (configurable via env var)
const SELLER_PASSWORD = process.env.SELLER_PASSWORD || 'escrow2024';

// HTML page returned after seller clicks Accept/Reject in email
function sellerResponsePage(type: 'success' | 'rejected' | 'info' | 'error', title: string, message: string): string {
  const colors = {
    success: { bg: '#16a34a', icon: '&#10003;' },
    rejected: { bg: '#dc2626', icon: '&#10007;' },
    info: { bg: '#2563eb', icon: '&#8505;' },
    error: { bg: '#9ca3af', icon: '&#33;' },
  };
  const { bg, icon } = colors[type];
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — AutoPro Escrow</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; background: #f4f4f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { background: #fff; border-radius: 12px; padding: 48px 40px; max-width: 500px; width: 90%; text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .icon { width: 72px; height: 72px; border-radius: 50%; background: ${bg}; color: #fff; font-size: 36px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
    .header { background: #111; color: #fff; font-size: 14px; font-weight: bold; letter-spacing: 2px; padding: 10px 20px; border-radius: 6px; display: inline-block; margin-bottom: 32px; }
    h1 { font-size: 24px; color: #111; margin-bottom: 16px; }
    p { font-size: 15px; color: #555; line-height: 1.7; }
    .footer { margin-top: 32px; font-size: 12px; color: #999; border-top: 1px solid #e5e7eb; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">AUTOPRO ESCROW</div>
    <div class="icon">${icon}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <div class="footer">Questions? Contact us: escrow@autopro.com &nbsp;|&nbsp; 1-800-CAR-DEAL</div>
  </div>
</body>
</html>`;
}

// Configure multer for vehicle image uploads (images only)
const imageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, 'uploads/'),
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${randomUUID()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/jpeg|jpg|png|gif|webp/.test(path.extname(file.originalname).toLowerCase()) &&
        /image/.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Configure multer for payment proof uploads (images + PDF)
const proofStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, 'uploads/proofs/'),
  filename: (_req, file, cb) => {
    cb(null, `proof-${Date.now()}-${randomUUID()}${path.extname(file.originalname)}`);
  },
});
const uploadProof = multer({
  storage: proofStorage,
  limits: { fileSize: 16 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (/jpeg|jpg|png|gif|webp|pdf/.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDF files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {

  // ===== AUTHENTICATION ROUTES =====

  app.post('/api/auth/login', (req, res, next) => {
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) return res.status(500).json({ error: 'Authentication error' });
      if (!user) return res.status(401).json({ error: info?.message || 'Invalid credentials' });
      req.logIn(user, (err) => {
        if (err) return res.status(500).json({ error: 'Login error' });
        const { password, ...userWithoutPassword } = user;
        return res.json({ user: userWithoutPassword });
      });
    })(req, res, next);
  });

  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ error: 'Logout error' });
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/auth/me', (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: 'Not authenticated' });
    const { password, ...userWithoutPassword } = req.user as any;
    res.json({ user: userWithoutPassword });
  });

  // ===== VEHICLE ROUTES =====

  app.get('/api/vehicles', async (req, res) => {
    try {
      const { make, condition, minPrice, maxPrice, search } = req.query;
      const vehicles = await storage.getAvailableVehiclesWithImages();
      let filtered = vehicles;
      if (make) filtered = filtered.filter(v => v.make.toLowerCase().includes((make as string).toLowerCase()));
      if (condition) filtered = filtered.filter(v => v.condition === condition);
      if (minPrice) filtered = filtered.filter(v => parseFloat(v.price) >= parseFloat(minPrice as string));
      if (maxPrice) filtered = filtered.filter(v => parseFloat(v.price) <= parseFloat(maxPrice as string));
      if (search) {
        const s = (search as string).toLowerCase();
        filtered = filtered.filter(v => v.name.toLowerCase().includes(s) || v.make.toLowerCase().includes(s) || v.model.toLowerCase().includes(s));
      }
      res.json({ vehicles: filtered });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/vehicles/featured', async (_req, res) => {
    try {
      const vehicles = await storage.getFeaturedVehiclesWithImages();
      res.json({ vehicles });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/vehicles/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vehicle = await storage.getVehicle(id);
      if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
      const images = await storage.getVehicleImages(id);
      const offer = await storage.getActiveOffer(id);
      res.json({ vehicle, images, offer });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== ADMIN VEHICLE ROUTES =====

  app.get('/api/admin/vehicles', isAdmin, async (_req, res) => {
    try {
      const vehicles = await storage.getAllVehiclesWithImages();
      res.json({ vehicles });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/admin/vehicles', isAdmin, upload.array('images', 10), async (req, res) => {
    try {
      const vehicleData = insertVehicleSchema.parse({
        ...req.body,
        year: parseInt(req.body.year),
        price: req.body.price,
        mileage: req.body.mileage ? parseInt(req.body.mileage) : undefined,
        featured: req.body.featured === 'true',
        available: req.body.available !== 'false',
      });
      const vehicle = await storage.createVehicle(vehicleData);
      const files = req.files as Express.Multer.File[];
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          await storage.addVehicleImage({
            vehicleId: vehicle.id,
            imageUrl: `/uploads/${files[i].filename}`,
            isPrimary: i === 0,
            displayOrder: i,
          });
        }
      }
      res.status(201).json({ vehicle });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch('/api/admin/vehicles/:id', isAdmin, upload.array('images', 10), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData: any = { ...req.body };
      if (req.body.year) updateData.year = parseInt(req.body.year);
      if (req.body.mileage) updateData.mileage = parseInt(req.body.mileage);
      if (req.body.featured !== undefined) updateData.featured = req.body.featured === 'true';
      if (req.body.available !== undefined) updateData.available = req.body.available !== 'false';
      const vehicle = await storage.updateVehicle(id, updateData);
      if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
      const files = req.files as Express.Multer.File[];
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          await storage.addVehicleImage({
            vehicleId: vehicle.id,
            imageUrl: `/uploads/${files[i].filename}`,
            isPrimary: false,
            displayOrder: i,
          });
        }
      }
      res.json({ vehicle });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete('/api/admin/vehicles/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteVehicle(id);
      if (!success) return res.status(404).json({ error: 'Vehicle not found' });
      res.json({ message: 'Vehicle deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/admin/vehicles/:vehicleId/images', isAdmin, upload.single('image'), async (req, res) => {
    try {
      const vehicleId = parseInt(req.params.vehicleId);
      const file = req.file as Express.Multer.File | undefined;
      if (!file) return res.status(400).json({ error: 'No image file provided' });
      const existingImages = await storage.getVehicleImages(vehicleId);
      const isPrimary = existingImages.length === 0;
      const image = await storage.addVehicleImage({
        vehicleId,
        imageUrl: `/uploads/${file.filename}`,
        isPrimary,
        displayOrder: existingImages.length,
      });
      res.status(201).json({ image });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/admin/vehicles/:vehicleId/images/:imageId', isAdmin, async (req, res) => {
    try {
      const imageId = parseInt(req.params.imageId);
      const success = await storage.deleteVehicleImage(imageId);
      if (!success) return res.status(404).json({ error: 'Image not found' });
      res.json({ message: 'Image deleted' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch('/api/admin/vehicles/:vehicleId/images/:imageId/primary', isAdmin, async (req, res) => {
    try {
      const vehicleId = parseInt(req.params.vehicleId);
      const imageId = parseInt(req.params.imageId);
      await storage.setPrimaryImage(vehicleId, imageId);
      res.json({ message: 'Primary image updated' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== VEHICLE OFFERS =====

  app.get('/api/vehicles/:id/offer', async (req, res) => {
    try {
      const offer = await storage.getActiveOffer(parseInt(req.params.id));
      res.json({ offer });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/offers', async (_req, res) => {
    try {
      const offers = await storage.getAllOffers();
      res.json({ offers });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/admin/offers', isAdmin, async (req, res) => {
    try {
      const offerData = insertVehicleOfferSchema.parse(req.body);
      const offer = await storage.createOffer(offerData);
      res.status(201).json({ offer });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch('/api/admin/offers/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const offer = await storage.updateOffer(id, req.body);
      if (!offer) return res.status(404).json({ error: 'Offer not found' });
      res.json({ offer });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete('/api/admin/offers/:id', isAdmin, async (req, res) => {
    try {
      const success = await storage.deleteOffer(parseInt(req.params.id));
      if (!success) return res.status(404).json({ error: 'Offer not found' });
      res.json({ message: 'Offer deleted' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== TRANSACTION ROUTES =====

  // Initiate transaction (customer/guest — dealership vehicle)
  app.post('/api/transactions', async (req, res) => {
    try {
      const transactionData = insertTransactionSchema.parse(req.body);
      const guestToken = req.isAuthenticated() ? null : randomUUID();
      const sellerToken = randomUUID();

      const insertData: any = {
        ...transactionData,
        guestToken,
        sellerToken,
        sellerStatus: 'pending',
        status: 'initiated',
      };
      if (req.isAuthenticated()) {
        const rawId = (req.user as any).id;
        const parsedId = parseInt(String(rawId), 10);
        if (!isNaN(parsedId)) insertData.buyerId = parsedId;
      }

      const transaction = await storage.createTransaction(insertData);

      await storage.addTransactionEvent({
        transactionId: transaction.id,
        status: 'initiated',
        notes: 'Transaction initiated by buyer',
        createdBy: req.isAuthenticated() ? (req.user as any).id : null,
      });

      try {
        await sendBuyerTransactionInitiated({
          id: transaction.id,
          buyerName: transaction.buyerName,
          buyerEmail: transaction.buyerEmail,
          guestToken: transaction.guestToken!,
          amount: transaction.amount,
          inspectionDays: transaction.inspectionDays,
        });
        if (transaction.sellerEmail) {
          await sendSellerTransactionNotification({
            id: transaction.id,
            sellerName: transaction.sellerName,
            sellerEmail: transaction.sellerEmail,
            sellerToken: transaction.sellerToken!,
            buyerName: transaction.buyerName,
            customVehicleDescription: transaction.customVehicleDescription,
            amount: transaction.amount,
          });
        }
      } catch (emailError) {
        console.error('Email error:', emailError);
      }

      res.json({ transaction, guestToken: transaction.guestToken });
    } catch (error: any) {
      console.error('Transaction error:', error);
      res.status(400).json({ error: error.message || 'Failed to create transaction' });
    }
  });

  // Initiate custom escrow (private sale)
  app.post('/api/transactions/custom', async (req, res) => {
    try {
      const {
        customVehicleDescription, amount, buyerName, buyerEmail, buyerPhone,
        shippingAddress, inspectionDays, sellerEmail, sellerName, sellerPhone,
      } = req.body;

      if (!customVehicleDescription || !amount || !buyerName || !buyerEmail || !buyerPhone || !shippingAddress) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const guestToken = randomUUID();
      const sellerToken = randomUUID();

      const safeBuyerId: number | null = req.isAuthenticated()
        ? (() => { const p = parseInt(String((req.user as any).id), 10); return isNaN(p) ? null : p; })()
        : null;

      const transactionData: any = {
        guestToken,
        sellerToken,
        sellerStatus: 'pending',
        status: 'initiated',
        buyerName: String(buyerName).trim(),
        buyerEmail: String(buyerEmail).trim(),
        buyerPhone: String(buyerPhone).trim(),
        shippingAddress: String(shippingAddress).trim(),
        amount: parseFloat(String(amount)).toFixed(2),
        inspectionDays: parseInt(String(inspectionDays)) || 3,
        customVehicleDescription: String(customVehicleDescription).trim(),
        sellerEmail: sellerEmail && String(sellerEmail).trim() ? String(sellerEmail).trim() : null,
        sellerName: sellerName && String(sellerName).trim() ? String(sellerName).trim() : null,
        sellerPhone: sellerPhone && String(sellerPhone).trim() ? String(sellerPhone).trim() : null,
        notes: 'Custom escrow transaction for private sale',
      };

      if (safeBuyerId !== null) transactionData.buyerId = safeBuyerId;

      const transaction = await storage.createTransaction(transactionData);

      await storage.addTransactionEvent({
        transactionId: transaction.id,
        status: 'initiated',
        notes: 'Custom escrow transaction initiated by buyer',
        createdBy: req.isAuthenticated() ? (req.user as any).id : null,
      });

      try {
        await sendBuyerTransactionInitiated({
          id: transaction.id,
          buyerName: transaction.buyerName,
          buyerEmail: transaction.buyerEmail,
          guestToken: transaction.guestToken!,
          customVehicleDescription: transaction.customVehicleDescription,
          amount: transaction.amount,
          inspectionDays: transaction.inspectionDays,
        });
        if (sellerEmail) {
          await sendSellerTransactionNotification({
            id: transaction.id,
            sellerName: transaction.sellerName,
            sellerEmail,
            sellerToken: transaction.sellerToken!,
            buyerName: transaction.buyerName,
            customVehicleDescription: transaction.customVehicleDescription,
            amount: transaction.amount,
          });
        }
      } catch (emailError) {
        console.error('Email notification error:', emailError);
      }

      res.json({
        id: transaction.id,
        guestToken: transaction.guestToken,
        message: 'Custom escrow transaction created successfully. Check your email for details.',
      });
    } catch (error: any) {
      console.error('Custom transaction error:', error);
      res.status(400).json({ error: error.message || 'Failed to create custom transaction' });
    }
  });

  // ===== SELLER ACTION ROUTES (no auth — protected by password + token) =====

  // Get transaction info for seller (public, by seller token)
  app.get('/api/seller/:token', async (req, res) => {
    try {
      const transaction = await storage.getTransactionBySellerToken(req.params.token);
      if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
      // Return only safe seller-relevant fields
      res.json({
        id: transaction.id,
        buyerName: transaction.buyerName,
        amount: transaction.amount,
        customVehicleDescription: transaction.customVehicleDescription,
        sellerName: transaction.sellerName,
        sellerStatus: transaction.sellerStatus,
        status: transaction.status,
        inspectionDays: transaction.inspectionDays,
        createdAt: transaction.createdAt,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Seller accepts transaction (one-click GET from email link)
  app.get('/api/seller/:token/accept', async (req, res) => {
    try {
      let transaction = null;
      try { transaction = await storage.getTransactionBySellerToken(req.params.token); } catch (_) {}

      if (!transaction) {
        return res.send(sellerResponsePage('error', 'Invalid Link', 'This link is invalid or has expired. Please contact support.'));
      }
      if (transaction.sellerStatus !== 'pending') {
        const msg = transaction.sellerStatus === 'accepted'
          ? 'You have already accepted this transaction. Our team will be in touch shortly.'
          : 'You have already rejected this transaction.';
        return res.send(sellerResponsePage('info', 'Already Responded', msg));
      }

      await storage.updateTransaction(transaction.id, {
        sellerStatus: 'accepted',
        status: 'awaiting_admin_approval',
      });

      await storage.addTransactionEvent({
        transactionId: transaction.id,
        status: 'awaiting_admin_approval',
        notes: 'Seller accepted the transaction via email link',
      });

      // Notify buyer that seller accepted
      try {
        await sendTransactionStatusUpdate({
          id: transaction.id,
          status: 'awaiting_admin_approval',
          buyerName: transaction.buyerName,
          buyerEmail: transaction.buyerEmail,
          guestToken: transaction.guestToken,
        });
      } catch (e) { console.error('Email error:', e); }

      return res.send(sellerResponsePage('success', 'Transaction Accepted', `Thank you! You have accepted the escrow transaction for <strong>${transaction.customVehicleDescription || 'the vehicle'}</strong> ($${parseFloat(transaction.amount).toLocaleString()}). Our team will now review the transaction and send payment instructions to the buyer. We will keep you updated by email throughout the process.`));
    } catch (error: any) {
      res.send(sellerResponsePage('error', 'Error', 'Something went wrong. Please try again or contact support.'));
    }
  });

  // Seller rejects transaction (one-click GET from email link)
  app.get('/api/seller/:token/reject', async (req, res) => {
    try {
      let transaction = null;
      try { transaction = await storage.getTransactionBySellerToken(req.params.token); } catch (_) {}

      if (!transaction) {
        return res.send(sellerResponsePage('error', 'Invalid Link', 'This link is invalid or has expired. Please contact support.'));
      }
      if (transaction.sellerStatus !== 'pending') {
        const msg = transaction.sellerStatus === 'accepted'
          ? 'You have already accepted this transaction.'
          : 'You have already rejected this transaction.';
        return res.send(sellerResponsePage('info', 'Already Responded', msg));
      }

      await storage.updateTransaction(transaction.id, {
        sellerStatus: 'rejected',
        status: 'cancelled',
      });

      await storage.addTransactionEvent({
        transactionId: transaction.id,
        status: 'cancelled',
        notes: 'Seller rejected the transaction via email link',
      });

      // Notify buyer that seller rejected
      try {
        await sendTransactionStatusUpdate({
          id: transaction.id,
          status: 'cancelled',
          buyerName: transaction.buyerName,
          buyerEmail: transaction.buyerEmail,
          guestToken: transaction.guestToken,
        });
      } catch (e) { console.error('Email error:', e); }

      return res.send(sellerResponsePage('rejected', 'Transaction Rejected', `You have rejected the escrow transaction for <strong>${transaction.customVehicleDescription || 'the vehicle'}</strong>. The buyer will be notified. If this was a mistake, please contact our support team immediately.`));
    } catch (error: any) {
      res.send(sellerResponsePage('error', 'Error', 'Something went wrong. Please try again or contact support.'));
    }
  });

  // ===== PAYMENT PROOF UPLOAD =====

  app.post('/api/transactions/:idOrToken/payment-proof', uploadProof.single('proof'), async (req, res) => {
    try {
      const { idOrToken } = req.params;
      const { bankRef } = req.body;

      let transaction;
      if (idOrToken.includes('-')) {
        transaction = await storage.getTransactionByToken(idOrToken);
      } else {
        transaction = await storage.getTransaction(parseInt(idOrToken));
      }
      if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

      const updateData: any = {};
      if (bankRef) updateData.bankRef = bankRef;
      if (req.file) updateData.paymentProofFile = `/uploads/proofs/${req.file.filename}`;

      const updated = await storage.updateTransaction(transaction.id, updateData);

      // Notify admin, buyer, and seller
      try {
        await sendAdminPaymentConfirmation({
          id: transaction.id,
          buyerName: transaction.buyerName,
          buyerEmail: transaction.buyerEmail,
          amount: transaction.amount,
          bankRef: bankRef || null,
          hasProofFile: !!req.file,
        });
        // Confirm to buyer that their payment proof was received
        await sendBuyerPaymentReceived({
          id: transaction.id,
          buyerName: transaction.buyerName,
          buyerEmail: transaction.buyerEmail,
          amount: transaction.amount,
          guestToken: transaction.guestToken,
        });
        // Notify seller if they have an email
        if (transaction.sellerEmail) {
          await sendSellerPaymentReceived({
            id: transaction.id,
            sellerName: transaction.sellerName,
            sellerEmail: transaction.sellerEmail,
            buyerName: transaction.buyerName,
            amount: transaction.amount,
          });
        }
      } catch (emailError) {
        console.error('Email error:', emailError);
      }

      res.json({ message: 'Payment proof submitted successfully', transaction: updated });
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
        transaction = await storage.getTransactionByToken(idOrToken);
      } else {
        const id = parseInt(idOrToken);
        transaction = await storage.getTransaction(id);
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

      if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

      const events = await storage.getTransactionEvents(transaction.id);
      const vehicle = transaction.vehicleId ? await storage.getVehicle(transaction.vehicleId) : null;

      res.json({ transaction, events, vehicle });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

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

  app.get('/api/admin/transactions', isAdmin, async (_req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      res.json({ transactions });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete transaction (admin)
  app.delete('/api/admin/transactions/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTransaction(id);
      if (!success) return res.status(404).json({ error: 'Transaction not found' });
      res.json({ message: 'Transaction deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update transaction (admin)
  app.patch('/api/admin/transactions/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, bankInfo, paymentMethod, cryptoAddress, cryptoCoin, notes } = req.body;

      const previousTransaction = await storage.getTransaction(id);
      if (!previousTransaction) return res.status(404).json({ error: 'Transaction not found' });

      const updateData: any = {};
      if (status) updateData.status = status;
      if (bankInfo !== undefined) updateData.bankInfo = bankInfo;
      if (paymentMethod) updateData.paymentMethod = paymentMethod;
      if (cryptoAddress !== undefined) updateData.cryptoAddress = cryptoAddress;
      if (cryptoCoin !== undefined) updateData.cryptoCoin = cryptoCoin;
      if (notes) updateData.notes = notes;

      const transaction = await storage.updateTransaction(id, updateData);
      if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

      await storage.addTransactionEvent({
        transactionId: id,
        status: status || previousTransaction.status,
        notes: notes || `Status updated to ${status || previousTransaction.status}`,
        createdBy: (req.user as any).id,
      });

      // Trigger emails based on status change
      try {
        if (status && status !== previousTransaction.status) {
          if (status === 'awaiting_payment_confirmation') {
            // Buyer gets payment instructions
            await sendBuyerPaymentInstructions({
              id: transaction.id,
              buyerName: transaction.buyerName,
              buyerEmail: transaction.buyerEmail,
              guestToken: transaction.guestToken,
              amount: transaction.amount,
              paymentMethod: transaction.paymentMethod || 'bank',
              bankInfo: transaction.bankInfo,
              cryptoAddress: transaction.cryptoAddress,
              cryptoCoin: transaction.cryptoCoin,
            });
            // Seller notified that payment details were sent
            if (transaction.sellerEmail) {
              await sendTransactionStatusUpdate({
                id: transaction.id,
                sellerName: transaction.sellerName,
                sellerEmail: transaction.sellerEmail,
                buyerName: transaction.buyerName,
                amount: transaction.amount,
                status,
                forSeller: true,
              });
            }
          } else if (status === 'released') {
            // Buyer notified of completion
            await sendTransactionStatusUpdate({
              id: transaction.id,
              buyerName: transaction.buyerName,
              buyerEmail: transaction.buyerEmail,
              guestToken: transaction.guestToken,
              status: 'released',
            });
            // Seller gets funds released email
            if (transaction.sellerEmail) {
              await sendSellerFundsReleased({
                id: transaction.id,
                sellerName: transaction.sellerName,
                sellerEmail: transaction.sellerEmail,
                buyerName: transaction.buyerName,
                amount: transaction.amount,
                customVehicleDescription: transaction.customVehicleDescription,
              });
            }
          } else {
            // All other status changes — notify buyer
            await sendTransactionStatusUpdate({
              id: transaction.id,
              buyerName: transaction.buyerName,
              buyerEmail: transaction.buyerEmail,
              guestToken: transaction.guestToken,
              status,
              bankInfo: transaction.bankInfo,
            });
            // Also notify seller of every step
            if (transaction.sellerEmail) {
              await sendTransactionStatusUpdate({
                id: transaction.id,
                sellerName: transaction.sellerName,
                sellerEmail: transaction.sellerEmail,
                buyerName: transaction.buyerName,
                amount: transaction.amount,
                status,
                forSeller: true,
              });
            }
          }
        }
      } catch (emailError) {
        console.error('Email error:', emailError);
      }

      res.json({ transaction });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  const httpServer = createServer(app);
  return httpServer;
}
