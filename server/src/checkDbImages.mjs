import mongoose from 'mongoose';

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/civiclens');
  const db = mongoose.connection.db;

  const complaints = await db.collection('complaints').find({}).toArray();
  console.log(`Found ${complaints.length} complaints in database.`);

  let fixedComplaints = 0;
  for (const c of complaints) {
    let newImg = c.imageUrl;
    let newResImg = c.resolutionImage;

    if (c.category === 'streetlight' || c.category === 'other') {
      if (c.imageUrl && c.imageUrl.includes('pothole')) {
        newImg = '/images/resolutions/drainage_before.jpg';
      }
      if (c.resolutionImage && c.resolutionImage.includes('pothole')) {
        newResImg = '/images/resolutions/drainage_after.jpg';
      }
    }

    if (newImg !== c.imageUrl || newResImg !== c.resolutionImage) {
      await db.collection('complaints').updateOne(
        { _id: c._id },
        { $set: { imageUrl: newImg, resolutionImage: newResImg } }
      );
      console.log(`Fixed complaint ${c.trackingId} (${c.category}): ${c.imageUrl} -> ${newImg}`);
      fixedComplaints++;
    }
  }

  const incidents = await db.collection('incidents').find({}).toArray();
  console.log(`Found ${incidents.length} incidents in database.`);

  let fixedIncidents = 0;
  for (const inc of incidents) {
    let newImg = inc.imageUrl;
    let newResImg = inc.resolutionImage;

    if (inc.category === 'streetlight' || inc.category === 'other') {
      if (inc.imageUrl && inc.imageUrl.includes('pothole')) {
        newImg = '/images/resolutions/drainage_before.jpg';
      }
      if (inc.resolutionImage && inc.resolutionImage.includes('pothole')) {
        newResImg = '/images/resolutions/drainage_after.jpg';
      }
    }

    if (newImg !== inc.imageUrl || newResImg !== inc.resolutionImage) {
      await db.collection('incidents').updateOne(
        { _id: inc._id },
        { $set: { imageUrl: newImg, resolutionImage: newResImg } }
      );
      console.log(`Fixed incident ${inc.title || inc._id} (${inc.category})`);
      fixedIncidents++;
    }
  }

  console.log(`Done. Updated ${fixedComplaints} complaints and ${fixedIncidents} incidents.`);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
