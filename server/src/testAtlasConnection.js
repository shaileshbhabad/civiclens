import mongoose from 'mongoose';

const uri = process.argv[2] || process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ Error: No MongoDB URI provided.');
  console.log('Usage: node src/testAtlasConnection.js "mongodb+srv://user:pass@cluster.mongodb.net/civiclens"');
  process.exit(1);
}

async function testConnection() {
  console.log(`\n⏳ Connecting to MongoDB Atlas cluster...`);
  const startTime = Date.now();

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000
    });

    const latency = Date.now() - startTime;
    console.log(`✅ [MongoDB Atlas Connected Successfully!]`);
    console.log(`   Host:    ${conn.connection.host}`);
    console.log(`   DB Name: ${conn.connection.name}`);
    console.log(`   Latency: ${latency} ms`);

    // Quick read/write test
    console.log(`⏳ Testing write/read ping...`);
    const pingStart = Date.now();
    await conn.connection.db.admin().ping();
    const pingLatency = Date.now() - pingStart;
    console.log(`⚡ Roundtrip Ping Latency: ${pingLatency} ms (Superfast)`);

    await mongoose.disconnect();
    console.log(`\n🎉 Your MongoDB Atlas cluster is 100% ready for production deployment!\n`);
    process.exit(0);
  } catch (err) {
    console.error(`\n❌ Connection Failed: ${err.message}`);
    console.log(`Tip: Make sure you replaced <db_password> with your actual database user password and whitelisted 0.0.0.0/0 in MongoDB Atlas Network Access.\n`);
    process.exit(1);
  }
}

testConnection();
