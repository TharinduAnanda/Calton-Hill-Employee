const bcrypt = require('bcrypt');
const { executeQuery } = require('./config/db');

/**
 * Seed owner account if it doesn't exist
 */
async function seedOwner() {
  try {
    // Check if owner exists
    const owners = await executeQuery('SELECT * FROM owner');
    
    if (owners.length === 0) {
      console.log('No owner found, creating default owner account...');
      
      // Create default owner
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      await executeQuery(
        'INSERT INTO owner (Name, Email, Password, Phone_Number, Address) VALUES (?, ?, ?, ?, ?)',
        ['Admin', 'admin@yoursystem.com', hashedPassword, '1234567890', 'System Admin Office']
      );
      
      console.log('✅ Owner account seeded successfully');
    } else {
      console.log('👍 Owner account already exists, skipping seed');
    }
  } catch (error) {
    console.error('❌ Owner seeding failed:', error);
    throw error;
  }
}

module.exports = seedOwner;