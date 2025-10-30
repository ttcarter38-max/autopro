import { storage } from './storage';

async function seed() {
  try {
    console.log('Seeding database...');
    
    // Create admin user
    const existingAdmin = await storage.getUserByEmail('admin@autopro.com');
    
    if (!existingAdmin) {
      const admin = await storage.createUser({
        email: 'admin@autopro.com',
        password: 'admin123', // Will be hashed by storage
        name: 'Admin User',
        role: 'admin',
        phone: '1-800-CAR-DEAL',
      });
      console.log('✅ Admin user created:', admin.email);
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    console.log('Seeding completed!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
