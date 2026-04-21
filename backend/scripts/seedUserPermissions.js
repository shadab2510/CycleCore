const mongoose = require('mongoose');
const UserPermission = require('../models/UserPermission');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cyclecorelims';

async function seedUserPermissions() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing permissions
    await UserPermission.deleteMany({});
    console.log('Cleared existing user permissions');

    // Seed initial permissions based on the JSON config
    const initialPermissions = [
      {
        username: 'john_doe',
        allowedTabs: ['complaints', 'complaintsAnalytics'],
        description: 'User with access to only Complaints and Complaints Analytics',
        createdBy: 'system'
      },
      {
        username: 'jane_smith',
        allowedTabs: ['dashboard', 'complaints', 'complaintsAnalytics'],
        description: 'User with access to Dashboard, Complaints and Complaints Analytics',
        createdBy: 'system'
      },
      {
        username: 'labtech',
        allowedTabs: ['complaintsAnalytics', 'complaints'],
        description: 'User with access to complaintsAnalytics, complaints',
        createdBy: 'system'
      },
      {
        username: 'labTech2',
        allowedTabs: ['complaints', 'complaintsAnalytics'],
        description: 'User with access to complaints, complaintsAnalytics',
        createdBy: 'system'
      },
      {
        username: 'shadab',
        allowedTabs: ['complaints', 'complaintsAnalytics'],
        description: 'User with access to complaints, complaintsAnalytics',
        createdBy: 'system'
      },
      {
        username: 'shadab_tech',
        allowedTabs: ['complaints', 'complaintsAnalytics'],
        description: 'User with access to complaints, complaintsAnalytics',
        createdBy: 'system'
      }
    ];

    // Insert permissions
    await UserPermission.insertMany(initialPermissions);
    console.log('Seeded initial user permissions');

    // Display seeded permissions
    const permissions = await UserPermission.find().sort({ username: 1 });
    console.log('\nSeeded permissions:');
    permissions.forEach(p => {
      console.log(`- ${p.username}: ${p.allowedTabs.join(', ')}`);
    });

  } catch (error) {
    console.error('Error seeding user permissions:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
seedUserPermissions();
