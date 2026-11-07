import { User } from '../models/User.js';

/**
 * Ensures the database contains the single authorized admin: Shailesh Bhabad
 */
export async function ensureSingleAdmin() {
  try {
    // Check if admin user exists
    let admin = await User.findOne({
      $or: [
        { role: 'admin' },
        { email: 'admin@civiclens.in' },
        { name: 'Shailesh Bhabad' }
      ]
    });

    if (admin) {
      admin.name = 'Shailesh Bhabad';
      admin.email = 'admin@civiclens.in';
      admin.role = 'admin';
      admin.password = '171264';
      admin.department = 'Central Administration (PCMC)';
      admin.zone = 'PCMC Headquarters';
      await admin.save();
      console.log(`[AdminService] Verified single admin in database: ${admin.name} (${admin.email})`);
    } else {
      admin = new User({
        name: 'Shailesh Bhabad',
        email: 'admin@civiclens.in',
        password: '171264',
        role: 'admin',
        department: 'Central Administration (PCMC)',
        zone: 'PCMC Headquarters'
      });
      await admin.save();
      console.log(`[AdminService] Created single admin in database: ${admin.name} (${admin.email})`);
    }

    // Clean up any extra admin accounts so there is strictly ONE single admin
    await User.deleteMany({
      role: 'admin',
      _id: { $ne: admin._id }
    });

    return admin;
  } catch (error) {
    console.error('[AdminService] Error ensuring single admin:', error.message);
  }
}
