import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { User } from './models/User.js';
import { Complaint } from './models/Complaint.js';
import { Incident } from './models/Incident.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('[Seed] Clearing existing collections...');
    await User.deleteMany({});
    await Complaint.deleteMany({});
    await Incident.deleteMany({});

    console.log('[Seed] Inserting users...');
    // Single designated Admin (Shailesh Bhabad) + Field Department Officers
    const users = await User.create([
      {
        name: 'Shailesh Bhabad',
        email: 'admin@civiclens.in',
        password: '171264',
        role: 'admin',
        department: 'Central Administration (PCMC)',
        zone: 'PCMC Headquarters'
      },
      {
        name: 'Rajesh Kumar (Roads Engineer)',
        email: 'authority@civiclens.in',
        password: 'authority_disabled',
        role: 'authority',
        department: 'Roads',
        zone: 'Zone B (Pimpri)'
      },
      {
        name: 'Priya Sharma (Sanitation Officer)',
        email: 'priya@civiclens.in',
        password: 'authority_disabled',
        role: 'authority',
        department: 'Sanitation',
        zone: 'Zone B (Pimpri)'
      },
      {
        name: 'Amit Patel (Water Supply Lead)',
        email: 'amit@civiclens.in',
        password: 'authority_disabled',
        role: 'authority',
        department: 'Water Supply',
        zone: 'Zone B (Pimpri)'
      },
      {
        name: 'Sneha Desai (Electrical Engineer)',
        email: 'sneha@civiclens.in',
        password: 'authority_disabled',
        role: 'authority',
        department: 'Electrical',
        zone: 'Zone B (Pimpri)'
      }
    ]);
    console.log(`[Seed] Created ${users.length} users with single admin: Shailesh Bhabad.`);

    console.log('[Seed] Seeding 12 incidents & 20 complaints near DY Patil Pimpri 411018 premises...');

    const now = Date.now();
    const oneDay = 86400000;

    // ==========================================
    // 1. ROADS DEPARTMENT (3 Incidents, 5 Complaints)
    // ==========================================

    // Incident 1: Pothole Cluster at DY Patil Main Gate (in_progress)
    const inc1 = await Incident.create({
      title: 'POTHOLE Cluster outside Dr. D. Y. Patil College Campus Gate 1 & 2',
      category: 'pothole',
      severity: 'critical',
      urgency: 'immediate',
      priorityScore: 95,
      location: { type: 'Point', coordinates: [73.8159, 18.6231] },
      address: 'Dr. D. Y. Patil College Campus Main Gate, Sant Tukaram Nagar, Pimpri, Pune 411018',
      ward: 'Ward 20 (Sant Tukaram Nagar)',
      zone: 'Zone B (Pimpri Central)',
      department: 'Roads',
      status: 'in_progress',
      reportCount: 2,
      assignedTo: {
        name: 'Rajesh Kumar',
        email: 'authority@civiclens.in',
        department: 'Roads',
        assignedAt: new Date(now - oneDay * 2)
      },
      createdAt: new Date(now - oneDay * 2),
      updatedAt: new Date(now - oneDay)
    });

    const c1 = await Complaint.create({
      trackingId: 'CL-20261011-POTH1',
      description: 'Deep dangerous pothole right outside Dr. D. Y. Patil Institute of Technology main gate, causing two-wheelers and student buses to swerve into oncoming traffic.',
      imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600',
      category: 'pothole',
      severity: 'critical',
      urgency: 'immediate',
      status: 'in_progress',
      source: 'community_qr',
      location: { type: 'Point', coordinates: [73.8159, 18.6231] },
      address: 'Dr. D. Y. Patil College Campus Main Gate, Sant Tukaram Nagar, Pimpri, Pune 411018',
      ward: 'Ward 20 (Sant Tukaram Nagar)',
      zone: 'Zone B (Pimpri Central)',
      incidentId: inc1._id,
      isMerged: true,
      mergedReportsCount: 2,
      mergeReason: 'Consolidated locality cluster with 2 citizen reports within 150m radius of DY Patil College campus.',
      ai_analysis: {
        category: 'pothole',
        severity: 'critical',
        urgency: 'immediate',
        confidence: 0.96,
        explanation: 'Deep crater detected in active college student & pedestrian corridor. Immediate road crew deployment required.'
      },
      createdAt: new Date(now - oneDay * 2)
    });

    const c2 = await Complaint.create({
      trackingId: 'CL-20261011-POTH2',
      description: 'Duplicate report for the same pothole opposite college canteen and medical campus entrance.',
      imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600',
      category: 'pothole',
      severity: 'high',
      urgency: 'immediate',
      status: 'in_progress',
      source: 'community_qr',
      location: { type: 'Point', coordinates: [73.8162, 18.6233] },
      address: 'Near DY Patil Medical Campus Entrance, Sant Tukaram Nagar, Pimpri 411018',
      ward: 'Ward 20 (Sant Tukaram Nagar)',
      zone: 'Zone B (Pimpri Central)',
      incidentId: inc1._id,
      isMerged: true,
      mergedReportsCount: 2,
      mergeReason: 'Consolidated duplicate report within 40m radius of active pothole incident.',
      ai_analysis: {
        category: 'pothole',
        severity: 'high',
        urgency: 'immediate',
        confidence: 0.94,
        explanation: 'Spatial cluster verified near DY Patil campus road.'
      },
      createdAt: new Date(now - oneDay * 2 + 3600000)
    });

    inc1.complaints = [c1._id, c2._id];
    await inc1.save();

    // Incident 2: Pothole on Mahesh Nagar Railway Bridge (open)
    const inc2 = await Incident.create({
      title: 'POTHOLE & road surface erosion on Mahesh Nagar Pimpri Station Flyover',
      category: 'pothole',
      severity: 'medium',
      urgency: 'within_3d',
      priorityScore: 78,
      location: { type: 'Point', coordinates: [73.8050, 18.6275] },
      address: 'Mahesh Nagar & Pimpri Railway Station Overbridge, Pimpri 411018',
      ward: 'Ward 21 (Pimpri Station)',
      zone: 'Zone B (Pimpri Central)',
      department: 'Roads',
      status: 'open',
      reportCount: 1,
      createdAt: new Date(now - oneDay)
    });

    const c3 = await Complaint.create({
      trackingId: 'CL-20261011-POTH3',
      description: 'Sharp asphalt crater on the ascending ramp of Pimpri railway overbridge causing heavy vehicle slowdowns during morning office rush.',
      imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600',
      category: 'pothole',
      severity: 'medium',
      urgency: 'within_3d',
      status: 'submitted',
      source: 'website',
      location: { type: 'Point', coordinates: [73.8050, 18.6275] },
      address: 'Mahesh Nagar & Pimpri Railway Station Overbridge, Pimpri 411018',
      ward: 'Ward 21 (Pimpri Station)',
      zone: 'Zone B (Pimpri Central)',
      incidentId: inc2._id,
      ai_analysis: {
        category: 'pothole',
        severity: 'medium',
        urgency: 'within_3d',
        confidence: 0.91,
        explanation: 'Surface defect detected on flyover approach incline.'
      },
      createdAt: new Date(now - oneDay)
    });

    inc2.complaints = [c3._id];
    await inc2.save();

    // Incident 3: Resolved Potholes on Sant Tukaram Nagar Main Road (resolved)
    const inc3 = await Incident.create({
      title: 'POTHOLE cluster along Sant Tukaram Nagar Metro Corridor Road',
      category: 'pothole',
      severity: 'high',
      urgency: 'within_24h',
      priorityScore: 84,
      location: { type: 'Point', coordinates: [73.8175, 18.6215] },
      address: 'Sant Tukaram Nagar Main Road near Metro Pillar 42, Pimpri 411018',
      ward: 'Ward 20 (Sant Tukaram Nagar)',
      zone: 'Zone B (Pimpri Central)',
      department: 'Roads',
      status: 'resolved',
      reportCount: 2,
      resolutionNotes: 'Hot mix asphalt macadam applied and steam-roller leveled by PCMC Roads Maintenance Wing.',
      resolutionImage: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=600',
      resolvedAt: new Date(now - oneDay * 3),
      resolvedBy: { name: 'Rajesh Kumar', department: 'Roads' },
      createdAt: new Date(now - oneDay * 4),
      updatedAt: new Date(now - oneDay * 3)
    });

    const c4 = await Complaint.create({
      trackingId: 'CL-20261010-POTH4',
      description: 'Multiple potholes along Sant Tukaram Nagar bus stop corridor damaging commuter two-wheelers.',
      imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600',
      category: 'pothole',
      severity: 'high',
      urgency: 'within_24h',
      status: 'resolved',
      source: 'community_qr',
      location: { type: 'Point', coordinates: [73.8175, 18.6215] },
      address: 'Sant Tukaram Nagar Main Road near Metro Pillar 42, Pimpri 411018',
      ward: 'Ward 20 (Sant Tukaram Nagar)',
      zone: 'Zone B (Pimpri Central)',
      incidentId: inc3._id,
      isMerged: true,
      mergedReportsCount: 2,
      resolutionNotes: 'Hot mix asphalt macadam applied and steam-roller leveled by PCMC Roads Maintenance Wing.',
      resolutionImage: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=600',
      resolvedAt: new Date(now - oneDay * 3),
      resolvedBy: { name: 'Rajesh Kumar', department: 'Roads' },
      createdAt: new Date(now - oneDay * 4)
    });

    const c5 = await Complaint.create({
      trackingId: 'CL-20261010-POTH5',
      description: 'Road depression near metro pillar 42 swerving buses.',
      imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600',
      category: 'pothole',
      severity: 'medium',
      urgency: 'within_24h',
      status: 'resolved',
      source: 'website',
      location: { type: 'Point', coordinates: [73.8178, 18.6218] },
      address: 'Sant Tukaram Nagar Main Road near Metro Pillar 42, Pimpri 411018',
      ward: 'Ward 20 (Sant Tukaram Nagar)',
      zone: 'Zone B (Pimpri Central)',
      incidentId: inc3._id,
      isMerged: true,
      mergedReportsCount: 2,
      resolutionNotes: 'Hot mix asphalt macadam applied and steam-roller leveled by PCMC Roads Maintenance Wing.',
      resolutionImage: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=600',
      resolvedAt: new Date(now - oneDay * 3),
      resolvedBy: { name: 'Rajesh Kumar', department: 'Roads' },
      createdAt: new Date(now - oneDay * 4 + 1800000)
    });

    inc3.complaints = [c4._id, c5._id];
    await inc3.save();

    // ==========================================
    // 2. SANITATION DEPARTMENT (3 Incidents, 5 Complaints)
    // ==========================================

    // Incident 4: Garbage Overflow opposite YCM Hospital (assigned)
    const inc4 = await Incident.create({
      title: 'GARBAGE overflow opposite YCM Hospital Emergency Casualty Gate',
      category: 'garbage',
      severity: 'high',
      urgency: 'within_24h',
      priorityScore: 88,
      location: { type: 'Point', coordinates: [73.8208, 18.6220] },
      address: 'Opposite YCM Hospital Emergency Casualty Gate, Sant Tukaram Nagar, Pimpri 411018',
      ward: 'Ward 20 (Sant Tukaram Nagar / YCMH)',
      zone: 'Zone B (Pimpri Central)',
      department: 'Sanitation',
      status: 'assigned',
      reportCount: 2,
      assignedTo: {
        name: 'Priya Sharma',
        email: 'priya@civiclens.in',
        department: 'Sanitation',
        assignedAt: new Date(now - oneDay)
      },
      createdAt: new Date(now - oneDay * 2)
    });

    const c6 = await Complaint.create({
      trackingId: 'CL-20261011-GARB1',
      description: 'Municipal garbage bin overflowing onto road directly opposite YCM Hospital Casualty Gate, creating foul stench and stray dog hazard for ambulances and emergency patients.',
      imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600',
      category: 'garbage',
      severity: 'high',
      urgency: 'within_24h',
      status: 'assigned',
      source: 'community_qr',
      location: { type: 'Point', coordinates: [73.8208, 18.6220] },
      address: 'Opposite YCM Hospital Emergency Casualty Gate, Sant Tukaram Nagar, Pimpri 411018',
      ward: 'Ward 20 (Sant Tukaram Nagar / YCMH)',
      zone: 'Zone B (Pimpri Central)',
      incidentId: inc4._id,
      isMerged: true,
      mergedReportsCount: 2,
      ai_analysis: {
        category: 'garbage',
        severity: 'high',
        urgency: 'within_24h',
        confidence: 0.95,
        explanation: 'Waste overflow detected near hospital emergency ingress.'
      },
      createdAt: new Date(now - oneDay * 2)
    });

    const c7 = await Complaint.create({
      trackingId: 'CL-20261011-GARB2',
      description: 'Medical and civic waste bags scattered across footpath outside YCM Doctors hostel.',
      imageUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600',
      category: 'garbage',
      severity: 'high',
      urgency: 'within_24h',
      status: 'assigned',
      source: 'website',
      location: { type: 'Point', coordinates: [73.8214, 18.6225] },
      address: 'Near YCM Hospital Doctors Quarters Lane, Pimpri 411018',
      ward: 'Ward 20 (Sant Tukaram Nagar / YCMH)',
      zone: 'Zone B (Pimpri Central)',
      incidentId: inc4._id,
      isMerged: true,
      mergedReportsCount: 2,
      ai_analysis: {
        category: 'garbage',
        severity: 'high',
        urgency: 'within_24h',
        confidence: 0.93,
        explanation: 'Clustered refuse near hospital perimeter.'
      },
      createdAt: new Date(now - oneDay * 2 + 7200000)
    });

    inc4.complaints = [c6._id, c7._id];
    await inc4.save();

    // Incident 5: Garbage behind Vallabh Nagar Market (open)
    const inc5 = await Incident.create({
      title: 'GARBAGE accumulation behind Vallabh Nagar Vegetable Market',
      category: 'garbage',
      severity: 'medium',
      urgency: 'within_3d',
      priorityScore: 70,
      location: { type: 'Point', coordinates: [73.8182, 18.6178] },
      address: 'Behind Vallabh Nagar Vegetable Market, near Sant Tukaram Nagar, Pimpri 411018',
      ward: 'Ward 20 (Vallabh Nagar)',
      zone: 'Zone B (Pimpri Central)',
      department: 'Sanitation',
      status: 'open',
      reportCount: 1,
      createdAt: new Date(now - oneDay)
    });

    const c8 = await Complaint.create({
      trackingId: 'CL-20261011-GARB3',
      description: 'Organic waste and vegetable crates dumped along open backlane creating foul odor and blocking delivery trucks.',
      imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600',
      category: 'garbage',
      severity: 'medium',
      urgency: 'within_3d',
      status: 'submitted',
      source: 'community_qr',
      location: { type: 'Point', coordinates: [73.8182, 18.6178] },
      address: 'Behind Vallabh Nagar Vegetable Market, near Sant Tukaram Nagar, Pimpri 411018',
      ward: 'Ward 20 (Vallabh Nagar)',
      zone: 'Zone B (Pimpri Central)',
      incidentId: inc5._id,
      ai_analysis: {
        category: 'garbage',
        severity: 'medium',
        urgency: 'within_3d',
        confidence: 0.89,
        explanation: 'Market waste accumulation in commercial loading zone.'
      },
      createdAt: new Date(now - oneDay)
    });

    inc5.complaints = [c8._id];
    await inc5.save();

    // Incident 6: Resolved Garbage Dump on Kharalwadi Service Road (resolved)
    const inc6 = await Incident.create({
      title: 'GARBAGE dumping on Kharalwadi Grade Separator Service Road',
      category: 'garbage',
      severity: 'medium',
      urgency: 'within_24h',
      priorityScore: 68,
      location: { type: 'Point', coordinates: [73.8110, 18.6210] },
      address: 'Kharalwadi Grade Separator Service Road, Pimpri 411018',
      ward: 'Ward 20 (Kharalwadi)',
      zone: 'Zone B (Pimpri Central)',
      department: 'Sanitation',
      status: 'resolved',
      reportCount: 2,
      resolutionNotes: 'Mechanical sweeping and compactor truck cleared all accumulated debris; anti-dumping sign erected.',
      resolutionImage: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=600',
      resolvedAt: new Date(now - oneDay * 5),
      resolvedBy: { name: 'Priya Sharma', department: 'Sanitation' },
      createdAt: new Date(now - oneDay * 6),
      updatedAt: new Date(now - oneDay * 5)
    });

    const c9 = await Complaint.create({
      trackingId: 'CL-20261009-GARB4',
      description: 'Commercial packaging debris and cardboard dumped along Kharalwadi flyover wall.',
      imageUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600',
      category: 'garbage',
      severity: 'medium',
      urgency: 'within_24h',
      status: 'resolved',
      source: 'website',
      location: { type: 'Point', coordinates: [73.8110, 18.6210] },
      address: 'Kharalwadi Grade Separator Service Road, Pimpri 411018',
      ward: 'Ward 20 (Kharalwadi)',
      zone: 'Zone B (Pimpri Central)',
      incidentId: inc6._id,
      isMerged: true,
      mergedReportsCount: 2,
      resolutionNotes: 'Mechanical sweeping and compactor truck cleared all accumulated debris; anti-dumping sign erected.',
      resolutionImage: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=600',
      resolvedAt: new Date(now - oneDay * 5),
      resolvedBy: { name: 'Priya Sharma', department: 'Sanitation' },
      createdAt: new Date(now - oneDay * 6)
    });

    const c10 = await Complaint.create({
      trackingId: 'CL-20261009-GARB5',
      description: 'Waste cartons dumped near pedestrian subway.',
      imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600',
      category: 'garbage',
      severity: 'low',
      urgency: 'routine',
      status: 'resolved',
      source: 'community_qr',
      location: { type: 'Point', coordinates: [73.8114, 18.6212] },
      address: 'Kharalwadi Grade Separator Service Road, Pimpri 411018',
      ward: 'Ward 20 (Kharalwadi)',
      zone: 'Zone B (Pimpri Central)',
      incidentId: inc6._id,
      isMerged: true,
      mergedReportsCount: 2,
      resolutionNotes: 'Mechanical sweeping and compactor truck cleared all accumulated debris; anti-dumping sign erected.',
      resolutionImage: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=600',
      resolvedAt: new Date(now - oneDay * 5),
      resolvedBy: { name: 'Priya Sharma', department: 'Sanitation' },
      createdAt: new Date(now - oneDay * 6 + 3600000)
    });

    inc6.complaints = [c9._id, c10._id];
    await inc6.save();

    // ==========================================
    // 3. DRAINAGE & SEWAGE (2 Incidents, 4 Complaints)
    // ==========================================

    // Incident 7: Drainage at Sant Tukaram Metro Exit (in_progress)
    const inc7 = await Incident.create({
      title: 'DRAINAGE water stagnation under Sant Tukaram Nagar Metro Station Exit 2',
      category: 'drainage',
      severity: 'high',
      urgency: 'within_24h',
      priorityScore: 82,
      location: { type: 'Point', coordinates: [73.8158, 18.6146] },
      address: 'Sant Tukaram Nagar Metro Station Exit 2, Old Pune-Mumbai Highway, Pimpri 411018',
      ward: 'Ward 20 (Sant Tukaram Nagar)',
      zone: 'Zone B (Pimpri Central)',
      department: 'Sanitation',
      status: 'in_progress',
      reportCount: 2,
      assignedTo: {
        name: 'Priya Sharma',
        email: 'priya@civiclens.in',
        department: 'Sanitation',
        assignedAt: new Date(now - oneDay)
      },
      createdAt: new Date(now - oneDay * 2)
    });

    const c11 = await Complaint.create({
      trackingId: 'CL-20261011-DRAN1',
      description: 'Stormwater drain overflowing with silt and plastic waste directly under Metro exit stairs creating black water ponding.',
      imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600',
      category: 'drainage',
      severity: 'high',
      urgency: 'within_24h',
      status: 'in_progress',
      source: 'community_qr',
      location: { type: 'Point', coordinates: [73.8158, 18.6146] },
      address: 'Sant Tukaram Nagar Metro Station Exit 2, Old Pune-Mumbai Highway, Pimpri 411018',
      ward: 'Ward 20 (Sant Tukaram Nagar)',
      zone: 'Zone B (Pimpri Central)',
      incidentId: inc7._id,
      isMerged: true,
      mergedReportsCount: 2,
      ai_analysis: {
        category: 'drainage',
        severity: 'high',
        urgency: 'within_24h',
        confidence: 0.92,
        explanation: 'Runoff channel obstruction near metro station escalator.'
      },
      createdAt: new Date(now - oneDay * 2)
    });

    const c12 = await Complaint.create({
      trackingId: 'CL-20261011-DRAN2',
      description: 'Waterlogging on highway service road under metro viaduct causing pedestrian slip hazards.',
      imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600',
      category: 'drainage',
      severity: 'medium',
      urgency: 'within_24h',
      status: 'in_progress',
      source: 'website',
      location: { type: 'Point', coordinates: [73.8160, 18.6148] },
      address: 'Old Pune-Mumbai Highway Service Road, near Sant Tukaram Metro, Pimpri 411018',
      ward: 'Ward 20 (Sant Tukaram Nagar)',
      zone: 'Zone B (Pimpri Central)',
      incidentId: inc7._id,
      isMerged: true,
      mergedReportsCount: 2,
      ai_analysis: {
        category: 'drainage',
        severity: 'medium',
        urgency: 'within_24h',
        confidence: 0.90,
        explanation: 'Stagnant wastewater pooling along pedestrian corridor.'
      },
      createdAt: new Date(now - oneDay * 2 + 5400000)
    });

    inc7.complaints = [c11._id, c12._id];
    await inc7.save();

    // Incident 8: Resolved Drainage Culvert at Pimpri Station Subway (resolved)
    const inc8 = await Incident.create({
      title: 'DRAINAGE culvert blockage at Pimpri Station Pedestrian Subway',
      category: 'drainage',
      severity: 'medium',
      urgency: 'within_3d',
      priorityScore: 76,
      location: { type: 'Point', coordinates: [73.8060, 18.6265] },
      address: 'Pimpri Railway Station Pedestrian Subway, Pimpri 411018',
      ward: 'Ward 21 (Pimpri Station)',
      zone: 'Zone B (Pimpri Central)',
      department: 'Sanitation',
      status: 'resolved',
      reportCount: 2,
      resolutionNotes: 'Suction jetting machine cleared choked culvert pipe; concrete grating reinstalled.',
      resolutionImage: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=600',
      resolvedAt: new Date(now - oneDay * 4),
      resolvedBy: { name: 'Priya Sharma', department: 'Sanitation' },
      createdAt: new Date(now - oneDay * 5),
      updatedAt: new Date(now - oneDay * 4)
    });

    const c13 = await Complaint.create({
      trackingId: 'CL-20261010-DRAN3',
      description: 'Monsoon drain overflow flooding pedestrian subway entrance at Pimpri station.',
      imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600',
      category: 'drainage',
      severity: 'medium',
      urgency: 'within_3d',
      status: 'resolved',
      source: 'community_qr',
      location: { type: 'Point', coordinates: [73.8060, 18.6265] },
      address: 'Pimpri Railway Station Pedestrian Subway, Pimpri 411018',
      ward: 'Ward 21 (Pimpri Station)',
      zone: 'Zone B (Pimpri Central)',
      incidentId: inc8._id,
      isMerged: true,
      mergedReportsCount: 2,
      resolutionNotes: 'Suction jetting machine cleared choked culvert pipe; concrete grating reinstalled.',
      resolutionImage: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=600',
      resolvedAt: new Date(now - oneDay * 4),
      resolvedBy: { name: 'Priya Sharma', department: 'Sanitation' },
      createdAt: new Date(now - oneDay * 5)
    });

    const c14 = await Complaint.create({
      trackingId: 'CL-20261010-DRAN4',
      description: 'Sewage water seepage inside railway subway corridor.',
      imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600',
      category: 'drainage',
      severity: 'medium',
      urgency: 'within_3d',
      status: 'resolved',
      source: 'website',
      location: { type: 'Point', coordinates: [73.8062, 18.6268] },
      address: 'Pimpri Railway Station Pedestrian Subway, Pimpri 411018',
      ward: 'Ward 21 (Pimpri Station)',
      zone: 'Zone B (Pimpri Central)',
      incidentId: inc8._id,
      isMerged: true,
      mergedReportsCount: 2,
      resolutionNotes: 'Suction jetting machine cleared choked culvert pipe; concrete grating reinstalled.',
      resolutionImage: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=600',
      resolvedAt: new Date(now - oneDay * 4),
      resolvedBy: { name: 'Priya Sharma', department: 'Sanitation' },
      createdAt: new Date(now - oneDay * 5 + 1800000)
    });

    inc8.complaints = [c13._id, c14._id];
    await inc8.save();

    // ==========================================
    // 4. ELECTRICAL DEPARTMENT (2 Incidents, 3 Complaints)
    // ==========================================

    // Incident 9: Streetlight Outage at Vallabh Nagar ST Stand (assigned)
    const inc9 = await Incident.create({
      title: 'STREETLIGHT outage along Vallabh Nagar ST Stand Passenger Corridor',
      category: 'streetlight',
      severity: 'medium',
      urgency: 'within_3d',
      priorityScore: 72,
      location: { type: 'Point', coordinates: [73.8190, 18.6185] },
      address: 'Vallabh Nagar MSRTC ST Stand Road, near Sant Tukaram Nagar, Pimpri 411018',
      ward: 'Ward 20 (Vallabh Nagar)',
      zone: 'Zone B (Pimpri Central)',
      department: 'Electrical',
      status: 'assigned',
      reportCount: 1,
      assignedTo: {
        name: 'Sneha Desai',
        email: 'sneha@civiclens.in',
        department: 'Electrical',
        assignedAt: new Date(now - oneDay)
      },
      createdAt: new Date(now - oneDay * 2)
    });

    const c15 = await Complaint.create({
      trackingId: 'CL-20261011-LITE1',
      description: 'Row of three streetlights completely dark along Vallabh Nagar intercity bus stand approach road. Commuters facing pitch dark footpath.',
      imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600',
      category: 'streetlight',
      severity: 'medium',
      urgency: 'within_3d',
      status: 'assigned',
      source: 'community_qr',
      location: { type: 'Point', coordinates: [73.8190, 18.6185] },
      address: 'Vallabh Nagar MSRTC ST Stand Road, near Sant Tukaram Nagar, Pimpri 411018',
      ward: 'Ward 20 (Vallabh Nagar)',
      zone: 'Zone B (Pimpri Central)',
      incidentId: inc9._id,
      ai_analysis: {
        category: 'streetlight',
        severity: 'medium',
        urgency: 'within_3d',
        confidence: 0.92,
        explanation: 'Public illumination outage on high pedestrian bus terminal connector.'
      },
      createdAt: new Date(now - oneDay * 2)
    });

    inc9.complaints = [c15._id];
    await inc9.save();

    // Incident 10: Resolved High-Mast Light at DY Patil Campus (resolved)
    const inc10 = await Incident.create({
      title: 'STREETLIGHT high-mast pole failure outside DY Patil Engineering Quadrangle',
      category: 'streetlight',
      severity: 'high',
      urgency: 'within_24h',
      priorityScore: 75,
      location: { type: 'Point', coordinates: [73.8165, 18.6238] },
      address: 'Dr. D. Y. Patil Engineering Front Quadrangle, Pimpri 411018',
      ward: 'Ward 20 (Sant Tukaram Nagar)',
      zone: 'Zone B (Pimpri Central)',
      department: 'Electrical',
      status: 'resolved',
      reportCount: 2,
      resolutionNotes: 'Burnt fuse and MCB switch replaced in control junction box; 120W LED fixtures tested functional.',
      resolutionImage: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=600',
      resolvedAt: new Date(now - oneDay * 6),
      resolvedBy: { name: 'Sneha Desai', department: 'Electrical' },
      createdAt: new Date(now - oneDay * 7),
      updatedAt: new Date(now - oneDay * 6)
    });

    const c16 = await Complaint.create({
      trackingId: 'CL-20261008-LITE2',
      description: 'Campus access road high-mast LED fixture flickering and dark near engineering library block.',
      imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600',
      category: 'streetlight',
      severity: 'high',
      urgency: 'within_24h',
      status: 'resolved',
      source: 'community_qr',
      location: { type: 'Point', coordinates: [73.8165, 18.6238] },
      address: 'Dr. D. Y. Patil Engineering Front Quadrangle, Pimpri 411018',
      ward: 'Ward 20 (Sant Tukaram Nagar)',
      zone: 'Zone B (Pimpri Central)',
      incidentId: inc10._id,
      isMerged: true,
      mergedReportsCount: 2,
      resolutionNotes: 'Burnt fuse and MCB switch replaced in control junction box; 120W LED fixtures tested functional.',
      resolutionImage: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=600',
      resolvedAt: new Date(now - oneDay * 6),
      resolvedBy: { name: 'Sneha Desai', department: 'Electrical' },
      createdAt: new Date(now - oneDay * 7)
    });

    const c17 = await Complaint.create({
      trackingId: 'CL-20261008-LITE3',
      description: 'Dark patch along college boundary wall road causing security risk for night hostel students.',
      imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600',
      category: 'streetlight',
      severity: 'medium',
      urgency: 'within_24h',
      status: 'resolved',
      source: 'website',
      location: { type: 'Point', coordinates: [73.8168, 18.6240] },
      address: 'Dr. D. Y. Patil Engineering Front Quadrangle, Pimpri 411018',
      ward: 'Ward 20 (Sant Tukaram Nagar)',
      zone: 'Zone B (Pimpri Central)',
      incidentId: inc10._id,
      isMerged: true,
      mergedReportsCount: 2,
      resolutionNotes: 'Burnt fuse and MCB switch replaced in control junction box; 120W LED fixtures tested functional.',
      resolutionImage: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=600',
      resolvedAt: new Date(now - oneDay * 6),
      resolvedBy: { name: 'Sneha Desai', department: 'Electrical' },
      createdAt: new Date(now - oneDay * 7 + 3600000)
    });

    inc10.complaints = [c16._id, c17._id];
    await inc10.save();

    // ==========================================
    // 5. WATER SUPPLY DEPARTMENT (2 Incidents, 3 Complaints)
    // ==========================================

    // Incident 11: Resolved Pipe Burst at Nehrunagar PCMC Sports Complex (resolved)
    const inc11 = await Incident.create({
      title: 'WATER LEAK main potable pipe burst near Nehrunagar PCMC Sports Complex',
      category: 'water_leak',
      severity: 'critical',
      urgency: 'immediate',
      priorityScore: 92,
      location: { type: 'Point', coordinates: [73.8230, 18.6280] },
      address: 'Nehrunagar PCMC Sports Complex Chowk, Pimpri, Pune 411018',
      ward: 'Ward 19 (Nehrunagar)',
      zone: 'Zone B (Pimpri Central)',
      department: 'Water Supply',
      status: 'resolved',
      reportCount: 1,
      resolutionNotes: 'Main pipeline ruptured joint replaced with heavy collar clamp; asphalt resurfaced over trench by PCMC Water Supply Division.',
      resolutionImage: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=600',
      resolvedAt: new Date(now - oneDay * 3),
      resolvedBy: { name: 'Amit Patel', department: 'Water Supply' },
      createdAt: new Date(now - oneDay * 4),
      updatedAt: new Date(now - oneDay * 3)
    });

    const c18 = await Complaint.create({
      trackingId: 'CL-20261010-WATR1',
      description: 'Major underground water supply pipe fracture flooding junction near Nehrunagar Sports Complex gate.',
      imageUrl: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=600',
      category: 'water_leak',
      severity: 'critical',
      urgency: 'immediate',
      status: 'resolved',
      source: 'community_qr',
      location: { type: 'Point', coordinates: [73.8230, 18.6280] },
      address: 'Nehrunagar PCMC Sports Complex Chowk, Pimpri, Pune 411018',
      ward: 'Ward 19 (Nehrunagar)',
      zone: 'Zone B (Pimpri Central)',
      incidentId: inc11._id,
      resolutionNotes: 'Main pipeline ruptured joint replaced with heavy collar clamp; asphalt resurfaced over trench by PCMC Water Supply Division.',
      resolutionImage: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=600',
      resolvedAt: new Date(now - oneDay * 3),
      resolvedBy: { name: 'Amit Patel', department: 'Water Supply' },
      ai_analysis: {
        category: 'water_leak',
        severity: 'critical',
        urgency: 'immediate',
        confidence: 0.98,
        explanation: 'Pressurized water pipe fracture verified.'
      },
      createdAt: new Date(now - oneDay * 4)
    });

    inc11.complaints = [c18._id];
    await inc11.save();

    // Incident 12: Pipeline Breach near Morwadi Court Road (open)
    const inc12 = await Incident.create({
      title: 'WATER LEAK pipeline breach near Morwadi District Court Road',
      category: 'water_leak',
      severity: 'high',
      urgency: 'within_24h',
      priorityScore: 86,
      location: { type: 'Point', coordinates: [73.8130, 18.6320] },
      address: 'Morwadi Court Road, near PCMC Pimpri Water Works, Pimpri 411018',
      ward: 'Ward 18 (Morwadi)',
      zone: 'Zone B (Pimpri Central)',
      department: 'Water Supply',
      status: 'open',
      reportCount: 2,
      createdAt: new Date(now - oneDay)
    });

    const c19 = await Complaint.create({
      trackingId: 'CL-20261011-WATR2',
      description: 'Fresh potable drinking water gushing from underground pipeline joint onto footpath near court entrance.',
      imageUrl: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=600',
      category: 'water_leak',
      severity: 'high',
      urgency: 'within_24h',
      status: 'submitted',
      source: 'community_qr',
      location: { type: 'Point', coordinates: [73.8130, 18.6320] },
      address: 'Morwadi Court Road, near PCMC Pimpri Water Works, Pimpri 411018',
      ward: 'Ward 18 (Morwadi)',
      zone: 'Zone B (Pimpri Central)',
      incidentId: inc12._id,
      isMerged: true,
      mergedReportsCount: 2,
      ai_analysis: {
        category: 'water_leak',
        severity: 'high',
        urgency: 'within_24h',
        confidence: 0.94,
        explanation: 'High pressure drinking water loss on major municipal feeder.'
      },
      createdAt: new Date(now - oneDay)
    });

    const c20 = await Complaint.create({
      trackingId: 'CL-20261011-WATR3',
      description: 'Water pressure loss in commercial shops opposite court due to Morwadi main pipe crack.',
      imageUrl: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=600',
      category: 'water_leak',
      severity: 'medium',
      urgency: 'within_24h',
      status: 'submitted',
      source: 'website',
      location: { type: 'Point', coordinates: [73.8133, 18.6322] },
      address: 'Morwadi Court Road, near PCMC Pimpri Water Works, Pimpri 411018',
      ward: 'Ward 18 (Morwadi)',
      zone: 'Zone B (Pimpri Central)',
      incidentId: inc12._id,
      isMerged: true,
      mergedReportsCount: 2,
      ai_analysis: {
        category: 'water_leak',
        severity: 'medium',
        urgency: 'within_24h',
        confidence: 0.91,
        explanation: 'Clustered grievance on same feeder section.'
      },
      createdAt: new Date(now - oneDay + 1800000)
    });

    inc12.complaints = [c19._id, c20._id];
    await inc12.save();

    console.log('[Seed] Database seeding completed successfully:');
    console.log(`- 12 Incidents (7 Open, 5 Resolved)`);
    console.log(`- 20 Complaints (11 Open, 9 Resolved)`);
    console.log(`- Across 4 PCMC Departments: Roads, Sanitation, Electrical, Water Supply`);
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Error seeding database:', err);
    process.exit(1);
  }
};

seedDatabase();
