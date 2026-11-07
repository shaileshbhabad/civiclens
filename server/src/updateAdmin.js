import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { User } from './models/User.js';

dotenv.config();

const updateAdmin = async () => {
  try {
    await connectDB();
    let u = await User.findOne({
      $or: [{ email: 'admin@civiclens.in' }, { name: 'Shailesh Bhabad' }]
    });

    if (u) {
      u.name = 'Shailesh Bhabad';
      u.email = 'admin@civiclens.in';
      u.password = '171264';
      u.role = 'admin';
      u.department = 'Central Administration (PCMC)';
      u.zone = 'PCMC Headquarters';
      await u.save();
      console.log('[Admin] Updated existing admin user:', u.name, u.email);
    } else {
      u = new User({
        name: 'Shailesh Bhabad',
        email: 'admin@civiclens.in',
        password: '171264',
        role: 'admin',
        department: 'Central Administration (PCMC)',
        zone: 'PCMC Headquarters'
      });
      await u.save();
      console.log('[Admin] Created new admin user:', u.name, u.email);
    }

    console.log('[Admin] Successfully verified admin user credentials.');
    process.exit(0);
  } catch (err) {
    console.error('[Admin] Error updating admin user:', err);
    process.exit(1);
  }
};

updateAdmin();
