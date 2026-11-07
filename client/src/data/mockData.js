// Mock complaints data located in DY Patil Pimpri 411018 and surrounding Sant Tukaram Nagar premises
export const mockComplaints = [
  {
    _id: 'c1',
    trackingId: 'CL-20261010-A3X9',
    source: 'qr',
    description: 'Dangerous pothole crater right outside Dr. D. Y. Patil Institute of Technology main campus gate on Sant Tukaram Nagar road, causing two-wheelers and college buses to swerve.',
    imageUrl: '/images/resolutions/pothole_before.jpg',
    location: { coordinates: [73.8159, 18.6231] },
    address: 'Dr. D. Y. Patil College Campus Main Gate, Sant Tukaram Nagar, Pimpri, Pune 411018',
    ai_analysis: {
      category: 'pothole',
      severity: 'critical',
      urgency: 'immediate',
      confidence: 0.96,
      imageValid: true,
      explanation: 'Deep crater detected in college student & commuter corridor. High traffic hazard.'
    },
    incidentId: 'i1',
    status: 'assigned',
    createdAt: '2026-10-10T08:30:00Z'
  },
  {
    _id: 'c2',
    trackingId: 'CL-20261010-B7K2',
    source: 'website',
    description: 'Overflowing municipal dustbin opposite YCM Hospital Casualty & Emergency Gate, blocking pedestrian footpath and creating foul stench for patients.',
    imageUrl: '/images/resolutions/garbage_before.jpg',
    location: { coordinates: [73.8208, 18.6220] },
    address: 'Opposite YCM Hospital Emergency Casualty Gate, Sant Tukaram Nagar, Pimpri 411018',
    ai_analysis: {
      category: 'garbage',
      severity: 'high',
      urgency: 'within_24h',
      confidence: 0.94,
      imageValid: true,
      explanation: 'Medical and civic waste accumulation near hospital perimeter requiring urgent clearance.'
    },
    incidentId: 'i2',
    status: 'verified',
    createdAt: '2026-10-10T09:15:00Z'
  },
  {
    _id: 'c3',
    trackingId: 'CL-20261009-M9R4',
    source: 'website',
    description: 'Clogged storm drain and stagnant water pool under Sant Tukaram Nagar Metro Station stairs on Old Pune-Mumbai Highway.',
    imageUrl: '/images/resolutions/drainage_before.jpg',
    location: { coordinates: [73.8158, 18.6146] },
    address: 'Sant Tukaram Nagar Metro Station Exit 2, Old Pune-Mumbai Highway, Pimpri 411018',
    ai_analysis: {
      category: 'drainage',
      severity: 'medium',
      urgency: 'within_3d',
      confidence: 0.90,
      imageValid: true,
      explanation: 'Silt and plastic waste blocking metro station runoff channel.'
    },
    incidentId: 'i3',
    status: 'submitted',
    createdAt: '2026-10-09T14:20:00Z'
  },
  {
    _id: 'c4',
    trackingId: 'CL-20261008-L4T1',
    source: 'qr',
    description: 'Row of three streetlights not illuminating on Vallabh Nagar MSRTC ST Stand passenger approach corridor during evening hours.',
    imageUrl: '/images/resolutions/drainage_before.jpg',
    location: { coordinates: [73.8190, 18.6185] },
    address: 'Vallabh Nagar MSRTC ST Stand Road, near Sant Tukaram Nagar, Pimpri 411018',
    ai_analysis: {
      category: 'streetlight',
      severity: 'high',
      urgency: 'immediate',
      confidence: 0.95,
      imageValid: true,
      explanation: 'Unlit pedestrian corridor near intercity bus terminal creating commuter hazard.'
    },
    incidentId: 'i4',
    status: 'assigned',
    createdAt: '2026-10-08T19:40:00Z'
  },
  {
    _id: 'c5',
    trackingId: 'CL-20261007-W8Q3',
    source: 'website',
    description: 'High pressure potable pipeline rupture flooding road corner near Nehrunagar PCMC Sports Complex & Annabhau Sathe Natyagruh.',
    imageUrl: '/images/resolutions/drainage_before.jpg',
    resolutionImage: '/images/resolutions/drainage_after.jpg',
    location: { coordinates: [73.8230, 18.6280] },
    address: 'Nehrunagar PCMC Sports Complex Chowk, Pimpri, Pune 411018',
    ai_analysis: {
      category: 'water_leak',
      severity: 'critical',
      urgency: 'immediate',
      confidence: 0.97,
      imageValid: true,
      explanation: 'Pressurized water main rupture leading to severe road flooding and potable water loss.'
    },
    incidentId: 'i5',
    status: 'resolved',
    createdAt: '2026-10-07T06:10:00Z'
  },
  {
    _id: 'c6',
    trackingId: 'CL-20261011-P2V8',
    source: 'qr',
    description: 'Multiple asphalt potholes on Mahesh Nagar approach flyover near Pimpri Railway Station.',
    imageUrl: '/images/resolutions/pothole_before.jpg',
    location: { coordinates: [73.8050, 18.6275] },
    address: 'Mahesh Nagar & Pimpri Railway Station Overbridge, Pimpri 411018',
    ai_analysis: {
      category: 'pothole',
      severity: 'medium',
      urgency: 'within_3d',
      confidence: 0.89,
      imageValid: true,
      explanation: 'Surface asphalt deterioration causing vehicle slow down on railway flyover.'
    },
    incidentId: 'i6',
    status: 'analysing',
    createdAt: '2026-10-11T07:45:00Z'
  },
  {
    _id: 'c7',
    trackingId: 'CL-20261006-G5N1',
    source: 'website',
    description: 'Illegal construction debris dumped along service lane near Kharalwadi Grade Separator.',
    imageUrl: '/images/resolutions/garbage_before.jpg',
    location: { coordinates: [73.8110, 18.6210] },
    address: 'Kharalwadi Grade Separator Service Road, Pimpri 411018',
    ai_analysis: {
      category: 'garbage',
      severity: 'low',
      urgency: 'routine',
      confidence: 0.91,
      imageValid: true,
      explanation: 'Rubble obstructing pedestrian walkway.'
    },
    incidentId: 'i7',
    status: 'rejected',
    createdAt: '2026-10-06T11:20:00Z'
  },
  {
    _id: 'c8',
    trackingId: 'CL-20261011-O6Z3',
    source: 'qr',
    description: 'Damaged walkway pavers and broken park bench at Hindustan Antibiotics (HA) Colony Ground promenade.',
    imageUrl: '/images/resolutions/drainage_before.jpg',
    location: { coordinates: [73.8080, 18.6190] },
    address: 'Hindustan Antibiotics (HA) Colony Ground, Mumbai-Pune Road, Pimpri 411018',
    ai_analysis: {
      category: 'other',
      severity: 'low',
      urgency: 'routine',
      confidence: 0.86,
      imageValid: true,
      explanation: 'Civic recreational infrastructure physical damage requiring routine maintenance.'
    },
    incidentId: 'i8',
    status: 'submitted',
    createdAt: '2026-10-11T09:05:00Z'
  }
];

// Mock incidents (merged complaints) in DY Patil Pimpri 411018 vicinity
export const mockIncidents = [
  {
    _id: 'i1',
    category: 'pothole',
    severity: 'critical',
    urgency: 'immediate',
    priorityScore: 94,
    priorityFactors: {
      severityWeight: 30,
      locationWeight: 26,
      frequencyWeight: 20,
      impactWeight: 11,
      historyWeight: 7
    },
    location: { coordinates: [73.8159, 18.6231] },
    address: 'Dr. D. Y. Patil College Campus Main Gate, Sant Tukaram Nagar, Pimpri 411018',
    ward: 'Ward 20 (Sant Tukaram Nagar)',
    zone: 'Zone B (Pimpri Central)',
    complaintIds: ['c1'],
    reportCount: 5,
    assignedTo: { id: 'u1', name: 'Rajesh Kumar', department: 'Roads' },
    department: 'Roads',
    status: 'in_progress',
    createdAt: '2026-10-10T08:30:00Z',
    updatedAt: '2026-10-11T10:00:00Z'
  },
  {
    _id: 'i2',
    category: 'garbage',
    severity: 'high',
    urgency: 'within_24h',
    priorityScore: 86,
    priorityFactors: {
      severityWeight: 26,
      locationWeight: 24,
      frequencyWeight: 18,
      impactWeight: 11,
      historyWeight: 7
    },
    location: { coordinates: [73.8208, 18.6220] },
    address: 'Opposite YCM Hospital Emergency Casualty Gate, Sant Tukaram Nagar, Pimpri 411018',
    ward: 'Ward 20 (Sant Tukaram Nagar / YCMH)',
    zone: 'Zone B (Pimpri Central)',
    complaintIds: ['c2'],
    reportCount: 4,
    assignedTo: { id: 'u2', name: 'Priya Sharma', department: 'Sanitation' },
    department: 'Sanitation',
    status: 'assigned',
    createdAt: '2026-10-10T09:15:00Z',
    updatedAt: '2026-10-10T12:00:00Z'
  },
  {
    _id: 'i3',
    category: 'drainage',
    severity: 'medium',
    urgency: 'within_3d',
    priorityScore: 71,
    priorityFactors: {
      severityWeight: 22,
      locationWeight: 20,
      frequencyWeight: 14,
      impactWeight: 9,
      historyWeight: 6
    },
    location: { coordinates: [73.8158, 18.6146] },
    address: 'Sant Tukaram Nagar Metro Station Exit 2, Old Pune-Mumbai Highway, Pimpri 411018',
    ward: 'Ward 20 (Sant Tukaram Nagar)',
    zone: 'Zone B (Pimpri Central)',
    complaintIds: ['c3'],
    reportCount: 2,
    assignedTo: null,
    department: 'Sanitation',
    status: 'open',
    createdAt: '2026-10-09T14:20:00Z',
    updatedAt: '2026-10-09T14:20:00Z'
  },
  {
    _id: 'i4',
    category: 'streetlight',
    severity: 'high',
    urgency: 'immediate',
    priorityScore: 89,
    priorityFactors: {
      severityWeight: 28,
      locationWeight: 25,
      frequencyWeight: 18,
      impactWeight: 12,
      historyWeight: 6
    },
    location: { coordinates: [73.8190, 18.6185] },
    address: 'Vallabh Nagar MSRTC ST Stand Road, near Sant Tukaram Nagar, Pimpri 411018',
    ward: 'Ward 20 (Vallabh Nagar)',
    zone: 'Zone B (Pimpri Central)',
    complaintIds: ['c4'],
    reportCount: 3,
    assignedTo: { id: 'u4', name: 'Sneha Desai', department: 'Electrical' },
    department: 'Electrical',
    status: 'in_progress',
    createdAt: '2026-10-08T19:40:00Z',
    updatedAt: '2026-10-09T08:15:00Z'
  },
  {
    _id: 'i5',
    category: 'water_leak',
    severity: 'critical',
    urgency: 'immediate',
    priorityScore: 97,
    priorityFactors: {
      severityWeight: 30,
      locationWeight: 29,
      frequencyWeight: 20,
      impactWeight: 12,
      historyWeight: 6
    },
    location: { coordinates: [73.8230, 18.6280] },
    address: 'Nehrunagar PCMC Sports Complex Chowk, Pimpri, Pune 411018',
    ward: 'Ward 19 (Nehrunagar)',
    zone: 'Zone B (Pimpri Central)',
    complaintIds: ['c5'],
    reportCount: 8,
    assignedTo: { id: 'u3', name: 'Amit Patel', department: 'Water Supply' },
    department: 'Water Supply',
    status: 'resolved',
    createdAt: '2026-10-07T06:10:00Z',
    updatedAt: '2026-10-07T16:45:00Z'
  },
  {
    _id: 'i6',
    category: 'pothole',
    severity: 'medium',
    urgency: 'within_3d',
    priorityScore: 65,
    priorityFactors: {
      severityWeight: 19,
      locationWeight: 18,
      frequencyWeight: 13,
      impactWeight: 9,
      historyWeight: 6
    },
    location: { coordinates: [73.8050, 18.6275] },
    address: 'Mahesh Nagar & Pimpri Railway Station Overbridge, Pimpri 411018',
    ward: 'Ward 21 (Pimpri Station)',
    zone: 'Zone B (Pimpri Central)',
    complaintIds: ['c6'],
    reportCount: 2,
    assignedTo: null,
    department: 'Roads',
    status: 'open',
    createdAt: '2026-10-11T07:45:00Z',
    updatedAt: '2026-10-11T07:45:00Z'
  },
  {
    _id: 'i7',
    category: 'garbage',
    severity: 'low',
    urgency: 'routine',
    priorityScore: 38,
    priorityFactors: {
      severityWeight: 12,
      locationWeight: 10,
      frequencyWeight: 7,
      impactWeight: 5,
      historyWeight: 4
    },
    location: { coordinates: [73.8110, 18.6210] },
    address: 'Kharalwadi Grade Separator Service Road, Pimpri 411018',
    ward: 'Ward 20 (Kharalwadi)',
    zone: 'Zone B (Pimpri Central)',
    complaintIds: ['c7'],
    reportCount: 1,
    assignedTo: null,
    department: 'Sanitation',
    status: 'closed',
    createdAt: '2026-10-06T11:20:00Z',
    updatedAt: '2026-10-06T14:30:00Z'
  },
  {
    _id: 'i8',
    category: 'other',
    severity: 'low',
    urgency: 'routine',
    priorityScore: 42,
    priorityFactors: {
      severityWeight: 14,
      locationWeight: 12,
      frequencyWeight: 8,
      impactWeight: 5,
      historyWeight: 3
    },
    location: { coordinates: [73.8080, 18.6190] },
    address: 'Hindustan Antibiotics (HA) Colony Ground, Mumbai-Pune Road, Pimpri 411018',
    ward: 'Ward 22 (HA Colony)',
    zone: 'Zone B (Pimpri Central)',
    complaintIds: ['c8'],
    reportCount: 1,
    assignedTo: null,
    department: 'Parks & Public Works',
    status: 'open',
    createdAt: '2026-10-11T09:05:00Z',
    updatedAt: '2026-10-11T09:05:00Z'
  }
];

// Mock dashboard stats (Synchronized with MongoDB metrics)
export const mockStats = {
  totalComplaints: 20,
  openIncidents: 7,
  resolvedComplaints: 9,
  resolvedThisMonth: 9,
  avgResolutionDays: 2.1,
  complaintsByCategory: [
    { name: 'Pothole', value: 5, color: '#EF4444' },
    { name: 'Garbage', value: 5, color: '#F59E0B' },
    { name: 'Drainage', value: 4, color: '#3B82F6' },
    { name: 'Streetlight', value: 3, color: '#8B5CF6' },
    { name: 'Water Leak', value: 3, color: '#06B6D4' }
  ],
  complaintsTrend: [
    { date: 'Oct 06', complaints: 2, resolved: 2 },
    { date: 'Oct 07', complaints: 3, resolved: 2 },
    { date: 'Oct 08', complaints: 2, resolved: 1 },
    { date: 'Oct 09', complaints: 3, resolved: 2 },
    { date: 'Oct 10', complaints: 4, resolved: 2 },
    { date: 'Oct 11', complaints: 3, resolved: 0 },
    { date: 'Oct 12', complaints: 3, resolved: 0 }
  ],
  departmentPerformance: [
    { department: 'Roads', open: 2, resolved: 1, avgDays: 2.4 },
    { department: 'Sanitation', open: 3, resolved: 2, avgDays: 1.6 },
    { department: 'Water Supply', open: 1, resolved: 1, avgDays: 2.1 },
    { department: 'Electrical', open: 1, resolved: 1, avgDays: 1.8 }
  ]
};

// Mock department authorities for assignment
export const mockAuthorities = [
  { _id: 'u1', name: 'Rajesh Kumar', email: 'rajesh@civiclens.in', role: 'authority', department: 'Roads', zone: 'Zone B (Pimpri)' },
  { _id: 'u2', name: 'Priya Sharma', email: 'priya@civiclens.in', role: 'authority', department: 'Sanitation', zone: 'Zone B (Pimpri)' },
  { _id: 'u3', name: 'Amit Patel', email: 'amit@civiclens.in', role: 'authority', department: 'Water Supply', zone: 'Zone B (Pimpri)' },
  { _id: 'u4', name: 'Sneha Desai', email: 'sneha@civiclens.in', role: 'authority', department: 'Electrical', zone: 'Zone B (Pimpri)' }
];

// Mock physical assets with QR codes in Sant Tukaram Nagar & DY Patil Pimpri 411018 premises
export const mockAssets = [
  {
    qrCode: 'QR-PCMC-01',
    name: 'Dr. D. Y. Patil Institute of Technology Main Campus Gate',
    assetType: 'road',
    coordinates: [73.8159, 18.6231],
    address: 'Sant Tukaram Nagar, near DY Patil Technical Campus Gate, Pimpri, Pune 411018',
    ward: 'Ward 20 (Sant Tukaram Nagar)',
    zone: 'Zone B (Pimpri Central)',
    department: 'Roads & Infrastructure',
    radiusMeters: 50,
    landmark: 'DY Patil Main Campus Entrance Gate'
  },
  {
    qrCode: 'QR-PCMC-02',
    name: 'YCM Hospital Emergency Casualty Gate & Ambulance Bay',
    assetType: 'waste_point',
    coordinates: [73.8208, 18.6220],
    address: 'Yashwantrao Chavan Memorial Hospital, Sant Tukaram Nagar, Pimpri, Pune 411018',
    ward: 'Ward 20 (Sant Tukaram Nagar / YCMH)',
    zone: 'Zone B (Pimpri Central)',
    department: 'Solid Waste Management',
    radiusMeters: 75,
    landmark: 'YCM Hospital Casualty Gate #1'
  },
  {
    qrCode: 'QR-PCMC-03',
    name: 'Sant Tukaram Nagar Metro Station & Highway Corridor',
    assetType: 'road',
    coordinates: [73.8158, 18.6146],
    address: 'Old Pune-Mumbai Highway, Sant Tukaram Nagar Metro Station Entrance, Pimpri 411018',
    ward: 'Ward 20 (Sant Tukaram Nagar)',
    zone: 'Zone B (Pimpri Central)',
    department: 'Roads & Public Works',
    radiusMeters: 60,
    landmark: 'Metro Station Pillar 142'
  },
  {
    qrCode: 'QR-PCMC-04',
    name: 'Vallabh Nagar MSRTC Bus Stand Passenger Concourse',
    assetType: 'utility',
    coordinates: [73.8190, 18.6185],
    address: 'Vallabh Nagar ST Stand Road, adjacent to Sant Tukaram Nagar, Pimpri 411018',
    ward: 'Ward 20 (Vallabh Nagar)',
    zone: 'Zone B (Pimpri Central)',
    department: 'Electrical & Lighting',
    radiusMeters: 60,
    landmark: 'Vallabh Nagar ST Stand Main Inquiry'
  },
  {
    qrCode: 'QR-PCMC-05',
    name: 'Nehrunagar PCMC Sports Complex & Natyagruh',
    assetType: 'utility',
    coordinates: [73.8230, 18.6280],
    address: 'Annabhau Sathe Natyagruh & Sports Ground, Nehrunagar, Pimpri 411018',
    ward: 'Ward 19 (Nehrunagar)',
    zone: 'Zone B (Pimpri Central)',
    department: 'Water Supply & Pipelines',
    radiusMeters: 80,
    landmark: 'Nehrunagar PCMC Stadium Gate'
  },
  {
    qrCode: 'QR-PCMC-06',
    name: 'Mahesh Nagar & Pimpri Railway Station Overbridge',
    assetType: 'road',
    coordinates: [73.8050, 18.6275],
    address: 'Deluxe Chowk & Station Flyover, Mahesh Nagar, Pimpri 411018',
    ward: 'Ward 21 (Pimpri Station)',
    zone: 'Zone B (Pimpri Central)',
    department: 'Roads & Infrastructure',
    radiusMeters: 50,
    landmark: 'Pimpri Station Flyover South Ramp'
  },
  {
    qrCode: 'QR-PCMC-07',
    name: 'Kharalwadi Grade Separator Service Lane Junction',
    assetType: 'waste_point',
    coordinates: [73.8110, 18.6210],
    address: 'Mumbai-Pune Road Grade Separator, Kharalwadi, Pimpri 411018',
    ward: 'Ward 20 (Kharalwadi)',
    zone: 'Zone B (Pimpri Central)',
    department: 'Solid Waste Management',
    radiusMeters: 50,
    landmark: 'Kharalwadi Underpass Entry'
  },
  {
    qrCode: 'QR-PCMC-08',
    name: 'Hindustan Antibiotics (HA) Ground & Colony Gate',
    assetType: 'utility',
    coordinates: [73.8080, 18.6190],
    address: 'HA Colony Promenade, Old Pune-Mumbai Road, Pimpri 411018',
    ward: 'Ward 22 (HA Colony)',
    zone: 'Zone B (Pimpri Central)',
    department: 'Parks & Public Amenities',
    radiusMeters: 75,
    landmark: 'HA Colony Main Security Post'
  },
  {
    qrCode: 'QR-PCMC-09',
    name: 'Dr. D. Y. Patil Medical College OPD & Research Center',
    assetType: 'road',
    coordinates: [73.8165, 18.6240],
    address: 'Medical College OPD Entrance, Sant Tukaram Nagar, Pimpri 411018',
    ward: 'Ward 20 (Sant Tukaram Nagar)',
    zone: 'Zone B (Pimpri Central)',
    department: 'Roads & Infrastructure',
    radiusMeters: 50,
    landmark: 'DY Patil Super Specialty Hospital Gate'
  },
  {
    qrCode: 'QR-PCMC-10',
    name: 'Sant Tukaram Nagar Central Community Park & Bazaar',
    assetType: 'waste_point',
    coordinates: [73.8175, 18.6215],
    address: 'Sector 2, Sant Tukaram Nagar Community Garden, Pimpri 411018',
    ward: 'Ward 20 (Sant Tukaram Nagar)',
    zone: 'Zone B (Pimpri Central)',
    department: 'Solid Waste Management',
    radiusMeters: 50,
    landmark: 'Sant Tukaram Nagar Weekly Market Ground'
  }
];
