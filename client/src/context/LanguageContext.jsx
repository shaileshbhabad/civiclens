import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

// Comprehensive dictionary for English ('en') and Marathi ('mr')
export const translations = {
  en: {
    // Nav & Brand
    brandName: 'CivicLens',
    portalSub: 'Citizen Portal',
    navHome: 'Home',
    navReport: 'Report Issue',
    navTrack: 'Track',
    navDashboard: 'Dashboard',
    adminLogin: 'Admin Login',
    myDashboard: 'My Dashboard',
    signOut: 'Sign Out',
    langSelect: 'Language',

    // Home Page
    heroTag: 'Next-Gen Smart Civic Governance',
    heroTitle: 'Report Civic Issues in Seconds',
    heroSubtitle: 'CivicLens uses AI to verify, prioritise, and route your civic complaints. Scan a QR code or report online — no login needed.',
    reportBtn: 'Report an Issue',
    qrPosterBtn: 'Locality QR Poster',
    trackStatusBtn: 'Track Status',
    anonymousTag: 'Anonymous & Private',
    geotaggedTag: 'GPS Geotagged',
    slaTag: 'Direct Municipal SLA',

    // Stats
    complaintsFiled: 'Complaints Filed',
    openIncidents: 'Open Incidents',
    resolvedIssues: 'Resolved Issues',
    avgResolutionTime: 'Avg Resolution Time',
    pimpriWard: 'Pimpri-Chinchwad Ward 20',
    activeInQueues: 'Active in department queues',
    completedPhoto: 'Completed with photo verification',
    slaDepartments: 'SLA across PCMC departments',

    // How it works
    howItWorks: 'How CivicLens Works',
    howItWorksSub: 'From an instant mobile snapshot to verified municipal resolution in 4 seamless steps.',
    step1Title: 'Report in Seconds',
    step1Desc: 'Snap a photo of the civic issue, describe it, and submit anonymously with automatic GPS geotagging.',
    step2Title: 'AI Analyses & Verifies',
    step2Desc: 'Vision AI detects defect severity, deduplicates identical reports, and determines urgency level in real time.',
    step3Title: 'Dynamic Priority Queue',
    step3Desc: 'Issues are scored by citizen impact, school/hospital proximity, and clustered directly into municipal incident queues.',
    step4Title: 'Rapid Resolution',
    step4Desc: 'Ward officers dispatch field crews with SLA timers, updating live status accessible via your tracking ID.',

    // CTA
    readyToImprove: 'Ready to Make Your Neighborhood Better?',
    readySub: 'Join thousands of Pimpri-Chinchwad citizens using AI to build a cleaner, safer, and pothole-free city.',
    fileGrievanceNow: 'File a Grievance Now',
    viewDashboard: 'View Transparency Dashboard',

    // Report Form
    reportPageTitle: 'File a Civic Grievance',
    reportPageSub: 'Report potholes, garbage overflow, or utility faults in Pimpri-Chinchwad (PCMC). No login required.',
    anonymousBadge: '100% Anonymous & Geotagged',
    photoUploadTitle: 'Photo Evidence',
    photoUploadHint: 'Click to capture or drop photo (JPEG, PNG)',
    photoQualityGood: 'Photo Quality Verified (Optimal clarity & brightness)',
    photoQualityWarn: 'Quality Warning',
    voiceRecordTitle: 'Voice Grievance (Marathi / Hindi / English)',
    voiceRecording: 'Listening... Speak in Marathi, Hindi, or English',
    voiceStart: 'Click to Speak',
    voiceStop: 'Stop Recording',
    voiceLangHint: 'Voice auto-transcribes & translates to official grievance details',
    descLabel: 'Detailed Description',
    descPlaceholder: 'Describe the defect (e.g., Deep pothole outside college gate causing heavy traffic hazard)...',
    categoryLabel: 'Issue Category',
    locationSectionTitle: 'Pinpoint Location on Map',
    detectGpsBtn: 'Detect My Location',
    mapHelpText: 'Drag pin or click map to pinpoint exact defect location',
    submitReportBtn: 'Submit Grievance to PCMC',
    submittingReport: 'AI Verifying & Triaging Report...',
    successTitle: 'Grievance Submitted Successfully!',
    successSub: 'Save your unique tracking identifier to monitor progress in real time.',
    trackMyComplaint: 'Track My Complaint',
    reportAnother: 'File Another Report',

    // Categories
    catPothole: 'Pothole & Roads',
    catGarbage: 'Garbage & Waste',
    catDrainage: 'Drainage & Sewage',
    catStreetlight: 'Streetlight & Electrical',
    catWaterLeak: 'Water Pipeline Leak',
    catOther: 'Other Municipal Issue',

    // Tracking Page
    trackingTitle: 'Track Complaint Status',
    trackingSearchPlaceholder: 'Enter tracking ID (e.g. CL-20261011-POTH1)',
    trackBtn: 'Track',
    liveSyncBadge: 'Live Auto-Sync Active',
    timelineSubmitted: 'Submitted',
    timelineAnalysing: 'Analysing',
    timelineVerified: 'Verified',
    timelineAssigned: 'Assigned',
    timelineResolved: 'Resolved',
    beforeAfterTitle: 'Visual Before vs. After Resolution Verification',
    beforeTag: 'Before (Reported)',
    afterTag: 'After (Remediated)',
    resolutionProofNote: 'Official Municipal Resolution Note:',

    // Public Dashboard
    dashboardTitle: 'City-Wide Civic Transparency Dashboard',
    dashboardSub: 'Open civic governance data powered by AI diagnostics, geo-clustering, and accountable departmental resolution tracking.',
    topIncidentsTitle: 'Top Priority Incidents (AI Triaged)',
    upvoteBtn: '+1 Affects Me Too',
    upvotedSuccess: 'Upvoted! Priority escalated',
    exportCsv: 'Export CSV Report',
    exportPdf: 'Print Ward Audit PDF',

    // Admin & Common
    adminDashboard: 'Admin Dashboard',
    incidentQueue: 'Incident Queue',
    municipalAnalytics: 'Municipal Analytics',
    userDirectory: 'User Directory',
    systemAdmin: 'System Administrator',
    fieldAuthority: 'Municipal Field Authority',

    // Footer
    footerPCMC: 'Pimpri-Chinchwad Municipal Corporation (PCMC)',
    footerSLA: 'Transparent SLA Tracking'
  },

  mr: {
    // Nav & Brand
    brandName: 'सिव्हिकलेन्स',
    portalSub: 'नागरिक पोर्टल',
    navHome: 'मुख्यपृष्ठ',
    navReport: 'तक्रार नोंदवा',
    navTrack: 'स्थिती तपासा',
    navDashboard: 'डॅशबोर्ड',
    adminLogin: 'प्रशासक लॉगिन',
    myDashboard: 'माझे डॅशबोर्ड',
    signOut: 'लॉग आउट',
    langSelect: 'भाषा',

    // Home Page
    heroTag: 'पुढील पिढीचे स्मार्ट नागरी प्रशासन',
    heroTitle: 'काही सेकंदात नागरी तक्रार नोंदवा',
    heroSubtitle: 'सिव्हिकलेन्स एआय द्वारे तुमच्या तक्रारींची पडताळणी, प्राधान्यक्रम आणि निवारण करते. क्यूआर कोड स्कॅन करा किंवा ऑनलाइन नोंदवा — लॉगिनची गरज नाही.',
    reportBtn: 'समस्या नोंदवा',
    qrPosterBtn: 'परिसर क्यूआर पोस्टर',
    trackStatusBtn: 'स्थिती ट्रॅक करा',
    anonymousTag: 'निनावी आणि सुरक्षित',
    geotaggedTag: 'जीपीएस जिओटॅग केलेले',
    slaTag: 'थेट महानगरपालिका मुदत',

    // Stats
    complaintsFiled: 'नोंदवलेल्या तक्रारी',
    openIncidents: 'सक्रिय तक्रारी',
    resolvedIssues: 'निवारण झालेल्या तक्रारी',
    avgResolutionTime: 'सरासरी निवारण वेळ',
    pimpriWard: 'पिंपरी-चिंचवड प्रभाग २०',
    activeInQueues: 'विभागाच्या कामात सक्रिय',
    completedPhoto: 'फोटो पुराव्यासह पूर्ण',
    slaDepartments: 'पीसीएमसी विभागांची मुदत',

    // How it works
    howItWorks: 'सिव्हिकलेन्स कसे कार्य करते',
    howItWorksSub: 'मोबाईल फोटोपासून ते पडताळणी केलेल्या महापालिका निवारणापर्यंत ४ सोप्या टप्प्यांत.',
    step1Title: 'क्षणार्धात नोंदणी',
    step1Desc: 'समस्येचा फोटो काढा, माहिती सांगा आणि स्वयंचलित जीपीएस सह निनावीपणे सबमिट करा.',
    step2Title: 'एआय विश्लेषण व तपासणी',
    step2Desc: 'व्हिजन एआय समस्येचे गांभीर्य शोधते, दुबार तक्रारी एकत्रित करते आणि तात्काळ प्राधान्य ठरवते.',
    step3Title: 'गतिमान प्राधान्य क्रम',
    step3Desc: 'नागरिकांवरील प्रभाव आणि शाळा/रुग्णालयांच्या जवळ्यानुसार समस्या थेट महापालिका रांगेत पाठवल्या जातात.',
    step4Title: 'जलद निवारण',
    step4Desc: 'प्रभाग अधिकारी मुदतीच्या आत प्रत्यक्ष पथके पाठवतात आणि ट्रॅकिंग आयडीवर थेट प्रगती दिसते.',

    // CTA
    readyToImprove: 'तुमचा परिसर अधिक चांगला करण्यास सज्ज आहात का?',
    readySub: 'स्वच्छ, खड्डेमुक्त आणि सुरक्षित पिंपरी-चिंचवडसाठी हजारो नागरिकांसोबत सहभागी व्हा.',
    fileGrievanceNow: 'आताच तक्रार नोंदवा',
    viewDashboard: 'पारदर्शकता डॅशबोर्ड पहा',

    // Report Form
    reportPageTitle: 'नागरी तक्रार नोंदवा',
    reportPageSub: 'पिंपरी-चिंचवड (PCMC) मधील खड्डे, कचरा किंवा सांडपाण्याची समस्या नोंदवा. लॉगिनची गरज नाही.',
    anonymousBadge: '१००% निनावी व जीपीएस टॅग केलेले',
    photoUploadTitle: 'समस्येचा फोटो पुरावा',
    photoUploadHint: 'फोटो काढण्यासाठी किंवा निवडण्यासाठी क्लिक करा (JPEG, PNG)',
    photoQualityGood: 'फोटो गुणवत्ता प्रमाणित (उत्तम स्पष्टता)',
    photoQualityWarn: 'गुणवत्ता इशारा',
    voiceRecordTitle: 'व्हॉइस द्वारे तक्रार (मराठी / हिंदी / इंग्रजी)',
    voiceRecording: 'ऐकत आहे... कृपया मराठी, हिंदी किंवा इंग्रजीत समस्या सांगा',
    voiceStart: 'बोलण्यासाठी येथे क्लिक करा',
    voiceStop: 'रेकॉर्डिंग थांबवा',
    voiceLangHint: 'आवाज स्वयंचलितपणे ऐकून अधिकृत तक्रारीत रूपांतरित केला जातो',
    descLabel: 'समस्येचे सविस्तर वर्णन',
    descPlaceholder: 'समस्येचे वर्णन करा (उदा. कॉलेजच्या प्रवेशद्वाराबाहेर रस्त्यावर खोल खड्डा पडला असून वाहतुकीस अडथळा येत आहे)...',
    categoryLabel: 'समस्येचा प्रवर्ग',
    locationSectionTitle: 'नकाशावर अचूक ठिकाण निश्चित करा',
    detectGpsBtn: 'माझे थेट स्थान शोधा',
    mapHelpText: 'अचूक ठिकाण निवडण्यासाठी पिन ओढा किंवा नकाशावर क्लिक करा',
    submitReportBtn: 'पीसीएमसीला तक्रार पाठवा',
    submittingReport: 'एआय पडताळणी व प्राधान्यक्रम ठरवत आहे...',
    successTitle: 'तक्रार यशस्वीरित्या नोंदवली गेली!',
    successSub: 'प्रगती ट्रॅक करण्यासाठी तुमचा युनिक ट्रॅकिंग आयडी जतन करा.',
    trackMyComplaint: 'माझी तक्रार ट्रॅक करा',
    reportAnother: 'दुसरी तक्रार नोंदवा',

    // Categories
    catPothole: 'रस्त्यावरील खड्डा व रस्ते',
    catGarbage: 'कचरा व घनकचरा व्यवस्थापन',
    catDrainage: 'ड्रेनेज व सांडपाणी समस्या',
    catStreetlight: 'पथदिवे व विद्युत समस्या',
    catWaterLeak: 'पिण्याचे पाणी पाईपलाईन गळती',
    catOther: 'इतर महापालिका समस्या',

    // Tracking Page
    trackingTitle: 'तक्रार स्थिती तपासा',
    trackingSearchPlaceholder: 'ट्रॅकिंग आयडी प्रविष्ट करा (उदा. CL-20261011-POTH1)',
    trackBtn: 'तपासा',
    liveSyncBadge: 'थेट ऑटो-सिंक सक्रिय',
    timelineSubmitted: 'नोंदणी झाली',
    timelineAnalysing: 'एआय विश्लेषण',
    timelineVerified: 'पडताळणी पूर्ण',
    timelineAssigned: 'पथकाकडे सुपूर्द',
    timelineResolved: 'निवारण झाले',
    beforeAfterTitle: 'निवारणापूर्वी व नंतरची पडताळणी (Before vs After)',
    beforeTag: 'आधी (तक्रार वेळ)',
    afterTag: 'नंतर (दुरुस्ती पूर्ण)',
    resolutionProofNote: 'अधिकृत महापालिका दुरुस्ती नोंद:',

    // Public Dashboard
    dashboardTitle: 'शहरव्यापी नागरी पारदर्शकता डॅशबोर्ड',
    dashboardSub: 'एआय विश्लेषण, जिओ-क्लस्टरिंग आणि जबाबदार विभागीय निवारणाद्वारे खुला नागरी डेटा.',
    topIncidentsTitle: 'सर्वोच्च प्राधान्य समस्या (एआय क्रमवारी)',
    upvoteBtn: '+१ मलाही त्रास होत आहे',
    upvotedSuccess: 'मत नोंदवले! प्राधान्य वाढवले गेले',
    exportCsv: 'सीएसव्ही रिपोर्ट डाउनलोड करा',
    exportPdf: 'प्रभाग ऑडिट पीडीएफ प्रिंट करा',

    // Admin & Common
    adminDashboard: 'प्रशासक डॅशबोर्ड',
    incidentQueue: 'तक्रार रांग',
    municipalAnalytics: 'महापालिका विश्लेषण',
    userDirectory: 'अधिकारी यादी',
    systemAdmin: 'प्रणाली प्रशासक',
    fieldAuthority: 'महापालिका क्षेत्रीय अधिकारी',

    // Footer
    footerPCMC: 'पिंपरी-चिंचवड महानगरपालिका (PCMC)',
    footerSLA: 'पारदर्शक मुदतीत निवारण'
  }
};

// Global Comprehensive DOM English-to-Marathi Translation Dictionary covering EVERY page & instruction
export const DOM_TRANSLATIONS = {
  // === Full sentences & instructions (matched first) ===
  "Paste one universal CivicLens QR poster on your residential society gate, community notice board, or street lamp. Anyone scanning it with their smartphone camera is taken straight to the report form with interactive map geotagging.": "तुमच्या सोसायटीच्या गेटवर, सूचना फलकावर किंवा रस्त्यावरील खांबावर एक सिव्हिकलेन्स क्यूआर पोस्टर लावा. मोबाईल कॅमेऱ्याने स्कॅन करताच नागरिक नकाशा जिओटॅगिंगसह थेट तक्रार नोंदवू शकतात.",
  "CivicLens uses AI to verify, prioritise, and route your civic complaints. Scan a QR code or report online — no login needed.": "सिव्हिकलेन्स एआय द्वारे तुमच्या तक्रारींची पडताळणी, प्राधान्यक्रम आणि निवारण करते. क्यूआर कोड स्कॅन करा किंवा ऑनलाइन नोंदवा — लॉगिनची गरज नाही.",
  "Open civic governance data powered by AI diagnostics, geo-clustering, and accountable departmental resolution tracking.": "एआय विश्लेषण, जिओ-क्लस्टरिंग आणि जबाबदार विभागीय निवारण ट्रॅकिंगद्वारे खुला नागरी प्रशासन डेटा.",
  "Spatial clustering engine detecting defect concentrations within customizable locality radii across PCMC.": "पीसीएमसी परिसरातील तक्रारींचे केंद्रीकरण शोधणारी क्षेत्रीय क्लस्टरिंग प्रणाली.",
  "Prioritized civic issue clusters aggregated from automated citizen reports across PCMC.": "पीसीएमसीमध्ये नागरिकांच्या तक्रारींवरून एआय द्वारे एकत्रित केलेली प्राधान्य रांग.",
  "Prioritized civic issue clusters aggregated from automated citizen reports.": "नागरिकांच्या तक्रारींवरून एआय द्वारे एकत्रित केलेली प्राधान्य रांग.",
  "Deep-dive operational metrics, department throughput, and civic resolution velocity for PCMC Ward 20.": "पीसीएमसी प्रभाग २० साठी सविस्तर कामकाज मेट्रिक्स, विभागीय कार्यक्षमता आणि निवारण वेग.",
  "Deep-dive operational metrics, department throughput, and civic resolution velocity.": "सविस्तर कामकाज मेट्रिक्स, विभागीय कार्यक्षमता आणि नागरी निवारण वेग.",
  "Manage municipal field department officers, assigned zones, and jurisdictional access in MongoDB.": "महापालिका क्षेत्रीय अधिकारी, नियुक्त विभाग आणि डेटाबेस प्रवेश व्यवस्थापित करा.",
  "Real-time civic intelligence, incident prioritization, and municipal department performance.": "रिअल-टाइम नागरी माहिती, समस्या प्राधान्यक्रम आणि महापालिका विभागांची कामगिरी.",
  "Urgent civic issues scored by AI severity, frequency, and community risk": "एआय तीव्रता, वारंवारता आणि सार्वजनिक धोक्यानुसार क्रमवारी केलेल्या तातडीच्या समस्या",
  "From an instant mobile snapshot to verified municipal resolution in 4 seamless steps.": "मोबाईल फोटोपासून ते पडताळणी केलेल्या महापालिका निवारणापर्यंत ४ सोप्या टप्प्यांत.",
  "Snap a photo of the civic issue, describe it, and submit anonymously with automatic GPS geotagging.": "समस्येचा फोटो काढा, माहिती सांगा आणि स्वयंचलित जीपीएस सह निनावीपणे सबमिट करा.",
  "Vision AI detects defect severity, deduplicates identical reports, and determines urgency level in real time.": "व्हिजन एआय समस्येचे गांभीर्य शोधते, दुबार तक्रारी एकत्रित करते आणि तात्काळ प्राधान्य ठरवते.",
  "Issues are scored by citizen impact, school/hospital proximity, and clustered directly into municipal incident queues.": "नागरिकांवरील प्रभाव आणि शाळा/रुग्णालयांच्या जवळ्यानुसार समस्या थेट महापालिका रांगेत पाठवल्या जातात.",
  "Ward officers dispatch field crews with SLA timers, updating live status accessible via your tracking ID.": "प्रभाग अधिकारी मुदतीच्या आत प्रत्यक्ष पथके पाठवतात आणि ट्रॅकिंग आयडीवर थेट प्रगती दिसते.",
  "Updates occur instantly when municipal authorities or field staff update this issue.": "महापालिका अधिकारी किंवा क्षेत्रीय पथकाने स्थिती बदलताच येथे तात्काळ अपडेट दिसते.",
  "Not an administrator? Citizens can report and track issues freely without logging in:": "प्रशासक नाही आहात? नागरिक लॉगिनशिवाय तक्रार नोंदवू आणि ट्रॅक करू शकतात:",
  "Secure municipal portal for oversight, dispatch, and cluster triage.": "महापालिका नियंत्रण, पथक नियुक्ती आणि तक्रार निवारणासाठी सुरक्षित प्रशासक पोर्टल.",
  "By submitting, your geotagged report will be evaluated by municipal AI and queued for ward action.": "सबमिट केल्यानंतर, तुमच्या जिओटॅग केलेल्या तक्रारीचे महापालिका एआय द्वारे मूल्यांकन करून प्रभाग कारवाईसाठी पाठवले जाईल.",
  "Keep this ID handy. You can check ticket triage, officer assignment, and verified photo resolution at any time.": "हा आयडी जपून ठेवा. याद्वारे तुम्ही कधीही अधिकारी नियुक्ती आणि फोटो पुराव्यासह निवारण तपासू शकता.",
  "Drag the vertical handle left or right to inspect the official municipal site remediation.": "महापालिकेने केलेल्या प्रत्यक्ष दुरुस्तीची तुलना करण्यासाठी मधली रेषा डावीकडे किंवा उजवीकडे सरकवा.",
  "AI analysis clustered multiple geo-tagged citizen submissions based on proximity threshold and visual semantic matching.": "एआय प्रणालीने परिसरातील अंतराच्या आणि फोटो साम्याच्या आधारे अनेक नागरिकांच्या तक्रारी एकत्रित केल्या आहेत.",
  "Provide action details, inspection notes, contractor assignment, or resolution report...": "कारवाईचा तपशील, पाहणी अहवाल, कंत्राटदार नियुक्ती किंवा निवारण माहिती लिहा...",
  "Search by officer name, email, department or zone...": "अधिकाऱ्याचे नाव, ईमेल, विभाग किंवा प्रभागानुसार शोधा...",
  "Real-time synchronization for civic grievances near DY Patil Pimpri 411018 and Sant Tukaram Nagar.": "डी. वाय. पाटील पिंपरी ४११०१८ आणि संत तुकाराम नगर परिसरातील तक्रारींचे रिअल-टाइम सिंक्रोनायझेशन.",
  "Click anywhere on the map or drag the pin to mark the exact issue spot": "समस्येचे अचूक ठिकाण चिन्हांकित करण्यासाठी नकाशावर क्लिक करा किंवा पिन ओढा",
  "Click map or drag the pin to adjust position": "जागा बदलण्यासाठी नकाशावर क्लिक करा किंवा पिन ओढा",
  "Enter tracking ID (e.g. CL-20261011-POTH1)": "ट्रॅकिंग आयडी प्रविष्ट करा (उदा. CL-20261011-POTH1)",
  "(One-click status change to demonstrate instant reactive updates)": "(तात्काळ रिअल-टाइम अपडेट तपासण्यासाठी एका क्लिकवर स्थिती बदला)",
  "Accepts camera snaps, JPG, PNG • Real-time brightness, blur & fraud verification": "कॅमेरा फोटो, JPG, PNG स्वीकारतो • रिअल-टाइम प्रकाश, स्पष्टता व अँटी-फ्रॉड तपासणी",
  "(Analyzed in real time by client-side anti-fraud engine)": "(अँटी-फ्रॉड इंजिनद्वारे रिअल-टाइम तपासणी)",

  // === Map & Geotagging ===
  "Exact Location Geotag": "अचूक ठिकाण जिओटॅग",
  "Detect My Location": "माझे थेट स्थान शोधा",
  "Acquiring GPS...": "जीपीएस शोधत आहे...",
  "Resolving street address...": "पत्ता शोधत आहे...",
  "Quick PCMC Locality Pins:": "पीसीएमसी परिसर द्रुत पिन:",
  "High-Credibility GPS Pinpoint": "अचूक जीपीएस स्थान निश्चित",
  "Latitude": "अक्षांश (Latitude)",
  "Longitude": "रेखांश (Longitude)",
  "PCMC Administrative Division:": "पीसीएमसी प्रशासकीय विभाग:",
  "Location Coordinates Locked": "जीपीएस निर्देशांक लॉक केले",

  // === Home Page & Layout ===
  "CivicLens": "सिव्हिकलेन्स",
  "Citizen Portal": "नागरिक पोर्टल",
  "Home": "मुख्यपृष्ठ",
  "Report Issue": "तक्रार नोंदवा",
  "Track": "स्थिती तपासा",
  "Dashboard": "डॅशबोर्ड",
  "Admin Login": "प्रशासक लॉगिन",
  "My Dashboard": "माझे डॅशबोर्ड",
  "Sign Out": "बाहेर पडा",
  "Public Home": "सार्वजनिक मुख्यपृष्ठ",
  "Report Civic Issues in Seconds": "काही सेकंदात नागरी तक्रार नोंदवा",
  "Next-Gen Smart Civic Governance": "पुढील पिढीचे स्मार्ट नागरी प्रशासन",
  "Report an Issue": "समस्या नोंदवा",
  "Locality QR Poster": "परिसर क्यूआर पोस्टर",
  "Track Status": "स्थिती ट्रॅक करा",
  "Anonymous & Private": "निनावी व सुरक्षित",
  "GPS Geotagged": "जीपीएस जिओटॅग",
  "Direct Municipal SLA": "थेट महापालिका मुदत",
  "Live AI Pipeline": "थेट एआय प्रणाली",
  "Dangerous Road Depression": "रस्त्यावरील धोकादायक खड्डा",
  "AI Confidence": "एआय अचूकता",
  "96.8% Validated": "९६.८% प्रमाणित",
  "Ward Action": "प्रभाग कृती",
  "Road Dept #4": "रस्ते विभाग #४",
  "Status: Field Crew Assigned": "स्थिती: पथक नियुक्त केले",
  "SLA: 24h Remaining": "मुदत: २४ तास बाकी",
  "Cluster deduplication active": "क्लस्टर एकत्रीकरण सक्रिय",
  "View Map": "नकाशा पहा",
  "Citywide Civic Impact": "शहरव्यापी नागरी प्रभाव",
  "Real-time metrics powering cleaner cities": "स्वच्छ व सुरक्षित शहरासाठी रिअल-टाइम कामगिरी",
  "Workflow": "कार्यपद्धती",
  "How CivicLens Works": "सिव्हिकलेन्स कसे कार्य करते",
  "No Login Needed": "लॉगिनची गरज नाही",
  "Automated AI": "स्वयंचलित एआय",
  "Smart Routing": "स्मार्ट राउटिंग",
  "Full SLA Tracking": "पूर्ण मुदत ट्रॅकिंग",
  "Community Civic Action": "सामुदायिक नागरी उपक्रम",
  "Locality QR Poster for Your Street": "तुमच्या परिसरासाठी क्यूआर पोस्टर",
  "View & Print Locality QR Poster": "परिसर क्यूआर पोस्टर पहा व प्रिंट करा",
  "Report an Issue Directly with Map Pin": "नकाशा पिनसह थेट समस्या नोंदवा",
  "Credibility Verified via GPS": "जीपीएस द्वारे विश्वासार्हता पडताळणी",
  "No Mobile App Needed": "मोबाईल ॲपची गरज नाही",
  "Automated AI Verification": "स्वयंचलित एआय पडताळणी",

  // === Stats & Dashboard ===
  "Total Complaints": "एकूण तक्रारी",
  "Open Incidents": "सक्रिय तक्रारी",
  "Resolved Issues": "निवारण झालेल्या तक्रारी",
  "Resolved This Month": "या महिन्यात निवारण",
  "Avg Resolution Time": "सरासरी निवारण वेळ",
  "Avg Resolution Days": "सरासरी निवारण दिवस",
  "Complaints Filed": "नोंदवलेल्या तक्रारी",
  "City-wide citizen submissions": "शहरभरातील नागरिकांच्या तक्रारी",
  "Requiring action or in-progress": "कारवाई आवश्यक किंवा प्रगतीपथावर",
  "Within target municipal SLA": "महापालिका मुदतीच्या आत पूर्ण",
  "Turnaround across departments": "सर्व विभागांमधील सरासरी वेळ",
  "All-time platform submissions": "आतापर्यंतच्या एकूण तक्रारी",
  "Active pending remediation": "दुरुस्तीसाठी प्रलंबित",
  "Target SLA completion": "मुदतीत निवारण उद्दिष्ट",
  "City turnaround average": "शहर निवारण सरासरी",
  "Public Civic Intelligence": "सार्वजनिक नागरी विश्लेषण",
  "City-Wide Civic Transparency Dashboard": "शहरव्यापी नागरी पारदर्शकता डॅशबोर्ड",
  "Live City Data Feed": "थेट शहर डेटा फीड",
  "Export CSV Report": "सीएसव्ही रिपोर्ट डाउनलोड",
  "Print Ward Audit PDF": "प्रभाग ऑडिट पीडीएफ प्रिंट",
  "Export CSV": "सीएसव्ही डाउनलोड",
  "Print PDF Audit": "पीडीएफ ऑडिट प्रिंट",
  "Print PDF": "पीडीएफ प्रिंट",
  "Complaints by Category": "प्रवर्गानुसार तक्रारी",
  "Distribution of citizen reported issues across municipal sectors": "महापालिका विभागांनुसार नागरिकांच्या तक्रारींचे वर्गीकरण",
  "Distribution across primary civic sectors": "मुख्य नागरी क्षेत्रांनुसार वर्गीकरण",
  "7-Day Resolution Velocity": "७ दिवसांचा निवारण वेग",
  "7-Day Activity Trend": "७ दिवसांचा कार्य कल",
  "Incoming grievance volume vs. verified resolved municipal tasks": "आलेल्या तक्रारी विरुद्ध पूर्ण झालेली महापालिका कामे",
  "Reported vs resolved complaints": "नोंदवलेल्या विरुद्ध सोडवलेल्या तक्रारी",
  "Departmental SLA Efficiency": "विभागीय कार्यक्षमता (SLA)",
  "Operational speed and resolution rates across civic divisions": "नागरी विभागांमधील कामाचा वेग आणि निवारण प्रमाण",
  "Department Performance Comparison": "विभागीय कामगिरीची तुलना",
  "Open vs. Resolved incidents by municipal division": "विभागानुसार सक्रिय विरुद्ध सोडवलेल्या तक्रारी",
  "Average Turnaround Time (Days)": "सरासरी निवारण कालावधी (दिवस)",
  "Mean time to resolution per department": "प्रत्येक विभागाचा सरासरी निवारण वेळ",
  "Avg Resolution (Days)": "सरासरी निवारण (दिवस)",
  "Resolution Rate": "निवारण प्रमाण",
  "Top Priority Incidents (AI Triaged)": "सर्वोच्च प्राधान्य समस्या (एआय क्रमवारी)",
  "Highest Priority Incidents": "सर्वोच्च प्राधान्य तक्रारी",
  "View All Incidents": "सर्व तक्रारी पहा",
  "+1 Affects Me Too": "+१ मलाही त्रास होत आहे",
  "✓ Upvoted (+1)": "✓ मत नोंदवले (+१)",

  // === Hotspot Radar ===
  "Locality Hotspot Intelligence Radar": "परिसर हॉटस्पॉट इंटेलिजन्स रडार",
  "Radius:": "त्रिज्या:",
  "CRITICAL HOTSPOT": "अतिगंभीर हॉटस्पॉट",
  "HIGH PRIORITY": "उच्च प्राधान्य",
  "MODERATE": "मध्यम",
  "STABLE": "स्थिर",
  "Locality Radius": "परिसर त्रिज्या",
  "Primary:": "मुख्य समस्या:",
  "Risk Score": "धोका निर्देशांक (Risk Score)",
  "Total": "एकूण",
  "Active": "सक्रिय",
  "Resolved": "पूर्ण",
  "Municipal Recommendation:": "महापालिका शिफारस:",
  "Reports in this cluster:": "या समूहातील तक्रारी:",
  "View on Google Maps": "गूगल मॅपवर पहा",
  "Scanning locality coordinates and defect clusters...": "परिसरातील जीपीएस निर्देशांक आणि समस्या समूह तपासले जात आहेत...",

  // === Admin Pages ===
  "Admin Overview": "प्रशासक मुख्य आढावा (Admin Overview)",
  "Incident Queue": "तक्रार समूह रांग (Incident Queue)",
  "Municipal Analytics": "महापालिका विश्लेषण (Analytics)",
  "Authority User Directory": "महापालिका अधिकारी निर्देशिका",
  "Filters & Search": "फिल्टर व शोध",
  "Reset All": "सर्व रीसेट करा",
  "Priority": "प्राधान्य",
  "Category": "प्रवर्ग",
  "Severity": "तीव्रता",
  "Urgency": "तातडी",
  "Location / Address": "ठिकाण / पत्ता",
  "Address": "पत्ता",
  "Ward": "प्रभाग",
  "Reports": "तक्रारी",
  "Report Count": "तक्रार संख्या",
  "Assigned To": "नेमलेले अधिकारी",
  "Assigned Officer": "नेमलेले अधिकारी",
  "Status": "स्थिती",
  "Action": "कृती",
  "Actions": "कृती",
  "View": "पहा",
  "Back to Incident Queue": "तक्रार रांगेकडे परत जा",
  "Back to Incidents": "तक्रारींकडे परत जा",
  "Priority Score": "प्राधान्य गुण",
  "Composite Risk": "एकूण धोका",
  "Priority Factors Breakdown": "प्राधान्य घटकांचे विश्लेषण",
  "Severity Weight": "तीव्रता भारांक (Severity)",
  "Location Risk": "ठिकाणाचा धोका (Location Risk)",
  "Frequency / Velocity": "वारंवारता / वेग (Frequency)",
  "Citizen Impact": "नागरिकांवरील प्रभाव (Impact)",
  "Historical Recurrence": "पूर्वीची वारंवारता (History)",
  "AI Prioritization Explanation": "एआय प्राधान्यक्रम स्पष्टीकरण",
  "Model Confidence: 94%": "मॉडेल विश्वासार्हता: ९४%",
  "Deduplication Algorithm: Proximity & Visual Semantic": "डुप्लिकेट शोध अल्गोरिदम: अंतर व फोटो साम्य",
  "Incident Coordinates & Map": "तक्रार जीपीएस निर्देशांक व नकाशा",
  "Merged Complaints": "एकत्रित केलेल्या तक्रारी",
  "Reports Clustered": "तक्रारी एकत्रित",
  "150m Locality Cluster Consolidation": "१५० मीटर परिसर समूह एकत्रीकरण",
  "Administrative Actions & Incident Dispatch": "प्रशासकीय कारवाई व पथक नियुक्ती",
  "Update Status": "स्थिती बदला",
  "Assign Authority Officer": "अधिकारी नियुक्त करा",
  "-- Select Authority Officer --": "-- महापालिका अधिकारी निवडा --",
  "Resolution / Dispatch Note": "निवारण / कार्यवाही नोंद",
  "Save Incident Changes": "बदल जतन करा",
  "Saving Updates...": "बदल जतन होत आहेत...",
  "Add Authority Officer": "नवीन अधिकारी जोडा",
  "Sync": "सिंक करा",
  "Total Registered:": "एकूण नोंदणीकृत:",
  "Active in Field:": "क्षेत्रात कार्यरत:",
  "Officer Name": "अधिकाऱ्याचे नाव",
  "Email Address": "ईमेल पत्ता",
  "Department": "विभाग",
  "Assigned Zone": "नियुक्त क्षेत्र / प्रभाग",
  "Super Admin": "मुख्य प्रशासक",

  // === Login Page ===
  "System Administrator Portal": "प्रणाली प्रशासक पोर्टल",
  "Admin Sign In": "प्रशासक साइन इन",
  "Admin Name / Email": "प्रशासक नाव / ईमेल",
  "Password": "पासवर्ड",
  "Sign In as Admin": "प्रशासक म्हणून साइन इन करा",
  "Public Transparency": "सार्वजनिक पारदर्शकता",

  // === Track Complaint Page ===
  "Track Your Complaint": "तुमची तक्रार ट्रॅक करा",
  "Track Complaint Status": "तक्रार स्थिती तपासा",
  "Sample Pimpri Grievances:": "नमुना पिंपरी तक्रारी:",
  "Tracking Identifier": "ट्रॅकिंग आयडी",
  "Municipal Priority:": "महापालिका प्राधान्य:",
  "Live Auto-Sync Active": "थेट ऑटो-सिंक सक्रिय",
  "Admin Live Controller": "प्रशासक थेट नियंत्रक",
  "Submitted On": "नोंदणी दिनांक",
  "Location / Landmark": "ठिकाण / खूण",
  "Consolidated Locality Incident Report": "एकत्रित परिसर तक्रार अहवाल",
  "Complaint Description": "तक्रारीचे वर्णन",
  "Attached Evidence Photo": "जोडलेला फोटो पुरावा",
  "CivicLens AI Diagnostics & Triage": "सिव्हिकलेन्स एआय निदान व वर्गीकरण",
  "Automated Verification": "स्वयंचलित पडताळणी",
  "Detected Category": "ओळखलेला प्रवर्ग",
  "Assessed Severity": "ठरवलेली तीव्रता",
  "Action Urgency": "कारवाईची तातडी",
  "AI Classifier Confidence": "एआय वर्गीकरण अचूकता",
  "AI Explanation:": "एआय स्पष्टीकरण:",
  "Visual Before vs. After Resolution Verification": "निवारणापूर्वी व नंतरची पडताळणी (Before vs After)",
  "Before (Reported)": "आधी (तक्रार वेळ)",
  "After (Remediated)": "नंतर (दुरुस्ती पूर्ण)",
  "Official Municipal Resolution Note:": "अधिकृत महापालिका दुरुस्ती नोंद:",
  "Complaint Resolution Timeline": "तक्रार निवारण प्रगती टप्पे",
  "Submitted": "नोंदणी झाली",
  "Grievance received": "तक्रार प्राप्त झाली",
  "Analysing": "विश्लेषण सुरू",
  "AI classification": "एआय वर्गीकरण",
  "Verified": "पडताळणी पूर्ण",
  "Validated by system": "प्रणालीद्वारे प्रमाणित",
  "Assigned": "पथक नियुक्त",
  "Sent to department": "विभागाकडे पाठवले",
  "Resolved": "निवारण झाले",
  "Resolution confirmed": "दुरुस्तीची पुष्टी झाली",

  // === Categories, Statuses & Departments ===
  "Pothole": "रस्त्यावरील खड्डा",
  "Garbage": "कचरा समस्या",
  "Drainage": "ड्रेनेज व सांडपाणी",
  "Streetlight": "पथदिवे",
  "Water Leak": "पाणी गळती",
  "Other": "इतर",
  "Roads": "रस्ते विभाग",
  "Sanitation": "स्वच्छता विभाग",
  "Water Supply": "पाणीपुरवठा विभाग",
  "Electrical": "विद्युत विभाग",
  "Drainage & Storm": "ड्रेनेज विभाग",
  "CRITICAL": "अतिगंभीर",
  "HIGH": "गंभीर",
  "MEDIUM": "मध्यम",
  "LOW": "कमी",
  "IMMEDIATE": "तात्काळ",
  "URGENT": "तातडीने",
  "ROUTINE": "नियमित",
  "Open": "सक्रिय (Open)",
  "In Progress": "प्रगतीपथावर",

  // === New Features: Citizen Dispute, Geospatial Heatmap & AI Duplicate Detection ===
  "Live Status Simulator": "थेट स्थिती सिम्युलेटर (Live Simulator)",
  "48-Hour Citizen Anti-Fake Resolution Audit Window": "४८-तास नागरिक दुरुस्ती पडताळणी खिडकी (Anti-Fake Resolution)",
  "Are you satisfied with this on-site municipal resolution?": "या प्रत्यक्ष महापालिका दुरुस्तीबद्दल आपण समाधानी आहात का?",
  "Satisfied (Rate 1–5 ★)": "समाधानी (१–५ ★ रेटिंग द्या)",
  "Not Fixed Properly — Re-open Issue": "योग्य दुरुस्ती नाही — तक्रार पुन्हा उघडा (Re-open)",
  "Re-opened by Citizen (Disputed Resolution)": "नागरिकाने पुन्हा उघडलेली तक्रार (दुरुस्तीवर आक्षेप)",
  "+15 Priority Boost Escalated": "+१५ प्राधान्य गुण वाढवले",
  "Dispute Fake / Incomplete Resolution & Re-open Ticket": "अपूर्ण दुरुस्तीवर आक्षेप नोंदवा व तक्रार पुन्हा सुरू करा",
  "Marked resolved without visiting site": "प्रत्यक्ष पाहणी न करताच निवारण दाखवले",
  "Temporary patchwork already came off": "तात्पुरती डागडुजी पुन्हा उखडली आहे",
  "Garbage / debris still lying at spot": "कचरा / राडारोडा अजूनही जागेवरच आहे",
  "Water leakage / blockage still active": "पाणी गळती / तुंबणे अजूनही सुरूच आहे",
  "Attach Current Site Photo (Optional)": "सध्याचा जागेचा फोटो जोडा (ऐच्छिक)",
  "Re-open Issue & Boost Priority (+15)": "तक्रार पुन्हा उघडा (+१५ प्राधान्य)",
  "Confirm & Verify Fix ✓": "दुरुस्तीची पुष्टी करा ✓",
  "Interactive Geospatial Heatmap & Cluster Map": "परस्परसंवादी भौगोलिक हीटमॅप आणि क्लस्टर नकाशा",
  "Live GIS Telemetry (411018)": "थेट जीआयएस प्रणाली (४११०१८)",
  "Combined View": "संयुक्त दृश्य (Combined)",
  "Thermal Heatmap": "थर्मल हीटमॅप",
  "Cluster Pins": "क्लस्टर पिन",
  "Critical Hotspot": "अतिगंभीर हॉटस्पॉट",
  "High Severity": "गंभीर तीव्रता",
  "Selected Cluster Pin": "निवडलेला क्लस्टर पिन",
  "Show All Clusters": "सर्व क्लस्टर पहा",
  "Click to fly to pin": "नकाशावर पाहण्यासाठी क्लिक करा",
  "Inspect & Manage Incident": "तक्रार तपासा व व्यवस्थापित करा",
  "AI Duplicate Detection Warning (Before Upload)": "एआय डुप्लिकेट तक्रार इशारा (अपलोड करण्यापूर्वी)",
  "At Exact Same Spot": "अगदी याच ठिकाणी",
  "+1 Upvote & Fast-Track Existing Issue": "+१ अपव्होट करा व आधीची तक्रार फास्ट-ट्रॅक करा",
  "Submit as New Anyway": "तरीही नवीन तक्रार नोंदवा",
  "Existing Grievance Fast-Tracked (+1)!": "अस्तित्वातील तक्रार फास्ट-ट्रॅक केली (+१)!",

  // === Common UI & Form Labels ===
  "Language": "भाषा",
  "English": "इंग्रजी",
  "Marathi": "मराठी",
  "Loading...": "लोड होत आहे...",
  "Save": "जतन करा",
  "Cancel": "रद्द करा",
  "Close": "बंद करा",
  "Submit": "सबमिट करा",
  "Edit": "संपादित करा",
  "Delete": "हटवा",
  "Add": "जोडा",
  "Remove": "काढा",
  "Confirm": "पुष्टी करा",
  "Back": "मागे जा",
  "Next": "पुढे",
  "Yes": "होय",
  "No": "नाही",
  "Search": "शोधा",
  "Filter": "फिल्टर",
  "Reset": "रीसेट",
  "Refresh": "रीफ्रेश",
  "Download": "डाउनलोड",
  "Upload": "अपलोड",
  "Print": "प्रिंट",
  "Share": "शेअर",
  "Copy": "कॉपी करा",
  "Copied!": "कॉपी झाले!",
  "None": "काहीही नाही",
  "All": "सर्व",
  "Select": "निवडा",
  "or": "किंवा",
  "and": "आणि",
  "of": "पैकी",
  "by": "द्वारे",
  "for": "साठी",
  "from": "पासून",
  "to": "पर्यंत",
  "in": "मध्ये",
  "at": "येथे",
  "on": "वर",

  // === Form & Submission ===
  "File a Civic Grievance": "नागरी तक्रार नोंदवा",
  "Report potholes, garbage overflow, or utility faults in Pimpri-Chinchwad (PCMC). No login required.": "पिंपरी-चिंचवड (PCMC) मधील खड्डे, कचरा किंवा सुविधा दोष नोंदवा. लॉगिन आवश्यक नाही.",
  "100% Anonymous & Geotagged": "१००% निनावी व जिओटॅग केलेले",
  "Photo Evidence": "फोटो पुरावा",
  "Voice Grievance (Marathi / Hindi / English)": "व्हॉइस तक्रार (मराठी / हिंदी / इंग्रजी)",
  "Listening... speak in Marathi, Hindi or English": "ऐकत आहे... मराठी, हिंदी किंवा इंग्रजीत सांगा",
  "Click to record voice grievance": "तक्रार बोलण्यासाठी क्लिक करा",
  "Stop Recording": "रेकॉर्डिंग थांबवा",
  "Detailed Description": "सविस्तर वर्णन",
  "Issue Category": "समस्येचा प्रकार",
  "Pothole / Road Defect": "खड्डा / रस्ते दोष",
  "Garbage / Solid Waste": "कचरा / घनकचरा",
  "Drainage / Sewage": "ड्रेनेज / सांडपाणी",
  "Streetlight / Electrical": "पथदिवे / विद्युत",
  "Water Pipeline Leak": "पाणी पाईपलाईन गळती",
  "Other Municipal Issue": "इतर महापालिका समस्या",
  "Submit Report to PCMC": "पीसीएमसीला तक्रार पाठवा",
  "AI Verifying & Prioritising...": "एआय पडताळणी व प्राधान्यक्रम ठरवत आहे...",
  "Report Submitted Successfully!": "तक्रार यशस्वीरित्या नोंदवली गेली!",
  "Save this ID to track your complaint": "प्रगती ट्रॅक करण्यासाठी हा आयडी जपून ठेवा",
  "Track My Complaint": "माझी तक्रार ट्रॅक करा",
  "Submit Another Report": "दुसरी तक्रार नोंदवा",
  "Use Sample Photo": "नमुना फोटो वापरा",
  "Change Photo": "फोटो बदला",
  "Remove Photo": "फोटो काढा",
  "Anti-Fraud Score": "अँटी-फ्रॉड गुण",
  "Image rejected by anti-fraud check.": "अँटी-फ्रॉड तपासणीत फोटो नाकारला.",
  "Please upload a clear photo of the civic defect.": "कृपया नागरी समस्येचा स्पष्ट फोटो अपलोड करा.",
  "Quality Warning": "गुणवत्ता इशारा",
  "Photo Quality Verified": "फोटो गुणवत्ता प्रमाणित",
  "Checking...": "तपासत आहे...",
  "Checking for duplicates...": "डुप्लिकेट तपासत आहे...",
  "No nearby duplicates found.": "जवळपास डुप्लिकेट तक्रार आढळली नाही.",
  "citizens already reported this": "नागरिकांनी आधीच नोंदवले आहे",
  "Assigned to": "नेमलेले",
  "Priority": "प्राधान्य",

  // === Status Labels ===
  "Submitted": "नोंदणी झाली",
  "Analysing": "विश्लेषण सुरू",
  "Verified": "पडताळणी पूर्ण",
  "Assigned": "पथक नियुक्त",
  "Resolved": "निवारण झाले",
  "Rejected": "नाकारले",
  "In Progress": "प्रगतीपथावर",
  "Open": "सक्रिय",
  "Closed": "बंद",
  "pending": "प्रलंबित",
  "in_progress": "प्रगतीपथावर",
  "resolved": "निवारण झाले",
  "rejected": "नाकारले",
  "submitted": "नोंदणी झाली",
  "analysing": "विश्लेषण सुरू",
  "verified": "पडताळणी पूर्ण",
  "assigned": "नियुक्त",
  "closed": "बंद",

  // === Severity & Urgency Labels ===
  "Critical": "अतिगंभीर",
  "High": "गंभीर",
  "Medium": "मध्यम",
  "Low": "कमी",
  "Immediate": "तात्काळ",
  "Urgent": "तातडीने",
  "Routine": "नियमित",
  "critical": "अतिगंभीर",
  "high": "गंभीर",
  "medium": "मध्यम",
  "low": "कमी",
  "immediate": "तात्काळ",
  "within_24h": "२४ तासांत",
  "within_3d": "३ दिवसांत",
  "routine": "नियमित",

  // === Heatmap Specific ===
  "Active Pimpri Clusters": "सक्रिय पिंपरी क्लस्टर",
  "Click any numbered cluster pin or thermal ring around DY Patil Campus, Sant Tukaram Nagar & YCM Hospital to inspect live grievance clusters.": "डीवाय पाटील कॅम्पस, संत तुकाराम नगर व वाय.सी.एम. रुग्णालयाच्या सभोवतालच्या क्लस्टर पिनवर क्लिक करा.",
  "Current Status": "सध्याची स्थिती",
  "Citizen Reports Merged": "नागरिकांच्या तक्रारी एकत्रित",
  "Upvoted (+1)": "मत नोंदवले (+१)",
  "+1 Affects Me Too": "+१ मलाही त्रास होत आहे",
  "Track": "ट्रॅक करा",
  "Score": "गुण",
  "⚠️ Re-opened by Citizen": "⚠️ नागरिकाने पुन्हा उघडले",
  "Re-opened by Citizen (Disputed Fix)": "नागरिकाने पुन्हा उघडलेली (दुरुस्तीवर आक्षेप)",

  // === Track Complaint page extras ===
  "Live Status Simulator": "थेट स्थिती सिम्युलेटर",
  "Admin Live Controller": "प्रशासक थेट नियंत्रक",
  "Dispute Fake": "खोटी दुरुस्ती आक्षेप",
  "Updates occur instantly when municipal authorities or field staff update this issue.": "महापालिका अधिकारी किंवा पथकाने बदल केल्यावर ताबडतोब अपडेट होते.",
  "Source": "स्रोत",
  "QR Scan": "क्यूआर स्कॅन",
  "Website": "वेबसाईट",
  "Community QR": "समुदाय क्यूआर",
  "qr": "क्यूआर स्कॅन",
  "website": "वेबसाईट",
  "community_qr": "समुदाय क्यूआर",
  "Days ago": "दिवसांपूर्वी",
  "Today": "आज",
  "Yesterday": "काल",
  "just now": "आत्ताच",

  // === Admin Dashboard extras ===
  "Incident Detail": "तक्रार तपशील",
  "Back to Dashboard": "डॅशबोर्डवर परत जा",
  "Department": "विभाग",
  "Zone": "क्षेत्र",
  "Ward": "प्रभाग",
  "Resolution Note": "निवारण नोंद",
  "Save Changes": "बदल जतन करा",
  "Saving...": "जतन होत आहे...",
  "Officer": "अधिकारी",
  "Field Team": "क्षेत्रीय पथक",
  "PCMC Field Team": "पीसीएमसी क्षेत्रीय पथक",
  "Authority": "अधिकारी",
  "Admin": "प्रशासक",
  "User": "वापरकर्ता",
  "Name": "नाव",
  "Email": "ईमेल",
  "Role": "भूमिका",
  "Active": "सक्रिय",
  "Inactive": "निष्क्रिय",
  "Add New Officer": "नवीन अधिकारी जोडा",
  "Total Incidents": "एकूण तक्रारी",
  "My Open Incidents": "माझ्या सक्रिय तक्रारी",
  "Resolved by Me": "माझ्याद्वारे निवारण",
  "Welcome": "स्वागत आहे",

  // === Dispute & Reopen extras ===
  "Star Rating": "स्टार रेटिंग",
  "Your Feedback": "तुमची प्रतिक्रिया",
  "Optional": "ऐच्छिक",
  "Attach Photo": "फोटो जोडा",
  "Submitting...": "सबमिट होत आहे...",
  "Dispute Recorded": "आक्षेप नोंदवला गेला",
  "Priority Boosted": "प्राधान्य वाढवले",
  "Thank you": "धन्यवाद",
  "Citizen Verification recorded": "नागरिक पडताळणी नोंदवली गेली",

  // === Additional Form & Verification Strings ===
  "Snap or upload a photo of the problem, or": "समस्येचा फोटो काढा किंवा अपलोड करा, किंवा",
  "browse files": "फायली निवडा",
  "Street Address / Area Landmark": "रस्त्याचा पत्ता / परिसरातील खूण",
  "Auto-detected via GPS": "जीपीएसद्वारे थेट शोधले जाते",
  "Photo evidence attached": "फोटो पुरावा जोडला आहे",
  "Optimized for fast upload": "अपलोडसाठी ऑप्टिमाइझ",
  "characters (min 8)": "अक्षरे (किमान ८)",
  "Use sample photo": "नमुना फोटो वापरा",
  "AI Duplicate Detection Notice (Locality Match)": "एआय दुबार तक्रार शोध सूचना (परिसर जुळणी)",
  "Fast-Track This Incident (+1)": "या तक्रारीला गती द्या (+१)",
  "Dismiss & File New Report Anyway": "दुर्लक्ष करा आणि नवीन तक्रार नोंदवा",
  "Running real-time image quality & anti-fraud inspection...": "रिअल-टाइम फोटो गुणवत्ता व फ्रॉड तपासणी सुरू आहे...",
  "Submitting to PCMC Grievance Portal...": "पीसीएमसी तक्रार पोर्टलवर पाठवत आहे...",
  "AI Model Verification & Routing": "एआय मॉडेल पडताळणी व वर्गीकरण",
  "Saving grievance to MongoDB Atlas...": "तक्रार डेटाबेसमध्ये जतन करत आहे...",
  "Generating cryptographic tracking ID...": "ट्रॅकिंग आयडी तयार करत आहे...",
  "Locating your exact street via GPS...": "जीपीएस द्वारे अचूक पत्ता शोधत आहे...",
  "Detecting live GPS location…": "थेट जीपीएस स्थान शोधत आहे…",
  "Detecting live location…": "थेट स्थान शोधत आहे…",
  "Live location locked via GPS": "जीपीएस द्वारे थेट स्थान निश्चित झाले",
  "Live location detected via network": "नेटवर्कद्वारे थेट स्थान शोधले गेले",
  "Drag pin to refine": "अचूकतेसाठी पिन ओढा",
  "accuracy": "अचूकता",
  "Click to Speak": "बोलण्यासाठी क्लिक करा",
  "AI Translating...": "एआय भाषांतर करत आहे...",
  "Listening... Speak in Marathi, Hindi, or English": "ऐकत आहे... कृपया मराठी, हिंदी किंवा इंग्रजीत समस्या सांगा",
  "Voice auto-transcribes & translates to official grievance details": "आवाज स्वयंचलितपणे ऐकून अधिकृत तक्रारीत रूपांतरित केला जातो",
  "Grievance Filed Successfully!": "तक्रार यशस्वीरित्या नोंदवली गेली!",
  "Official PCMC Tracking ID:": "अधिकृत पीसीएमसी ट्रॅकिंग आयडी:",
  "Your tracking ID has been copied to your clipboard!": "तुमचा ट्रॅकिंग आयडी क्लिपबोर्डवर कॉपी झाला आहे!",
  "Copy Tracking ID": "ट्रॅकिंग आयडी कॉपी करा",
  "Copied!": "कॉपी झाले!",
  "Track Complaint Now": "आताच तक्रार ट्रॅक करा",
  "Submit Another Grievance": "दुसरी तक्रार नोंदवा",
  "Back to Home": "मुख्यपृष्ठावर परत जा",
  "Real-Time Image Quality Assessment": "रिअल-टाइम फोटो गुणवत्ता मूल्यांकन",
  "Passed Quality Check": "गुणवत्ता पडताळणी उत्तीर्ण",
  "Optimal for AI processing": "एआय विश्लेषणासाठी उत्तम",
  "May reduce AI confidence": "एआय अचूकता कमी होऊ शकते",
  "Brightness:": "प्रकाश:",
  "Sharpness:": "स्पष्टता:",
  "Fraud Shield:": "फ्रॉड शील्ड:",
  "Clean": "सुरक्षित",
  "Suspect": "संशयित",
  "Track Grievance Resolution": "तक्रार निवारण ट्रॅक करा",
  "Official Municipal Action Log": "अधिकृत महापालिका कारवाई नोंद",
  "Field Crew Notes:": "क्षेत्रीय पथकाची नोंद:",
  "Assigned Officer:": "नेमलेले अधिकारी:",
  "Target SLA:": "निवारण मुदत:",
  "Time Remaining:": "शिल्लक वेळ:",
  "Visual Proof of Resolution": "निवारणाचा फोटो पुरावा",
  "Before (Reported Defect)": "आधी (तक्रार वेळचा फोटो)",
  "After (Municipal Remediation)": "नंतर (महापालिकेने केलेले काम)",
  "Pending Inspection": "पाहणी प्रलंबित",
  "Under Review": "पुनरावलोकन सुरू",
  "Pothole": "रस्त्यावरील खड्डा",
  "Garbage": "कचरा समस्या",
  "Drainage": "ड्रेनेज समस्या",
  "Streetlight": "पथदिवा समस्या",
  "Water Leak": "पाणी गळती समस्या",
  "Other": "इतर समस्या",
  "Pothole & Roads": "रस्त्यावरील खड्डा व रस्ते",
  "Garbage & Waste": "कचरा व घनकचरा व्यवस्थापन",
  "Drainage & Sewage": "ड्रेनेज व सांडपाणी समस्या",
  "Streetlight & Electrical": "पथदिवे व विद्युत समस्या",
  "Water Pipeline Leak": "पिण्याचे पाणी पाईपलाईन गळती",
  "Other Municipal Issue": "इतर महापालिका समस्या",
  "Drag pin or click map to pinpoint exact defect location": "अचूक ठिकाण निवडण्यासाठी पिन ओढा किंवा नकाशावर क्लिक करा",
  "Pinpoint Location on Map": "नकाशावर अचूक ठिकाण निश्चित करा",
  "Anti-Fraud Verified": "अँटी-फ्रॉड पडताळणी पूर्ण",
  "Geotag Anchored": "जीपीएस जिओटॅग निश्चित",
  "Ward Jurisdiction Assigned": "प्रभाग अधिकारक्षेत्र निश्चित",
  "Official Tracking ID": "अधिकृत ट्रॅकिंग आयडी",
  "Running computer vision analysis, anti-fraud image check, deduplicating nearby coordinates, and scoring PCMC priority.": "कॉम्प्युटर व्हिजन विश्लेषण, अँटी-फ्रॉड तपासणी, परिसरातील डुप्लिकेट शोध आणि पीसीएमसी प्राधान्यक्रम तपासत आहे.",

  // === Track Complaint & Diagnostics Strings ===
  "Grievance received": "तक्रार प्राप्त झाली",
  "AI classification": "एआय वर्गीकरण",
  "Validated by system": "प्रणालीद्वारे पडताळणी",
  "Sent to department": "विभागाकडे पाठवले",
  "Resolution confirmed": "निवारण निश्चित झाले",
  "Tracking Identifier": "ट्रॅकिंग आयडी",
  "Last synchronized:": "शेवटचे सिंक्रोनायझेशन:",
  "Municipal Priority:": "महापालिका प्राधान्यक्रम:",
  "Complaint Not Found": "तक्रार आढळली नाही",
  "Clear & Search Again": "साफ करा व पुन्हा शोधा",
  "Report New Grievance": "नवीन तक्रार नोंदवा",
  "Retrieving live grievance status...": "थेट तक्रार स्थिती मिळवत आहे...",
  "Citizen View (Stage Changes Restricted)": "नागरिक दृश्य (टप्पे बदलण्यास बंदी)",
  "(Only administrators can modify complaint stages. Citizens cannot change stage.)": "(फक्त प्रशासक तक्रारीचे टप्पे बदलू शकतात. नागरिक टप्पा बदलू शकत नाहीत.)",
  "(Click any stage to transition complaint lifecycle)": "(तक्रारीचा टप्पा बदलण्यासाठी कोणत्याही पायरीवर क्लिक करा)",
  "Admin Log In": "प्रशासक लॉगिन",
  "Click any issue to track": "तक्रार पाहण्यासाठी क्लिक करा",
  "Track Live Status & Audit Proof": "थेट स्थिती व पडताळणी पुरावा पहा",
  "Within 24h": "२४ तासांत",
  "Within 48h": "४८ तासांत",
  "Completed": "पूर्ण झाले",
  "Inspect": "तपासा",
  "Submitted On": "नोंदणी दिनांक",
  "Location / Landmark": "ठिकाण / खूण",
  "Consolidated Locality Incident Report": "एकत्रित परिसर तक्रार अहवाल",
  "Citizen Reports Clustered": "नागरिकांच्या तक्रारी एकत्रित",
  "Subsequent Auto-Adjustment Active:": "स्वयंचलित सिंक्रोनायझेशन सक्रिय:",
  "When field authorities resolve this municipal incident, all linked reports (including your tracking ID) update to resolved synchronously.": "क्षेत्रीय अधिकाऱ्यांनी समस्येचे निवारण केल्यास, सर्व संबंधित तक्रारी (तुमच्या ट्रॅकिंग आयडीसह) आपोआप निवारण म्हणून अपडेट होतात.",
  "Complaint Description": "तक्रारीचे वर्णन",
  "No detailed description provided.": "सविस्तर वर्णन दिलेले नाही.",
  "Channel:": "माध्यम:",
  "Attached Evidence Photo": "जोडलेला फोटो पुरावा",
  "CivicLens AI Diagnostics & Triage": "सिव्हिकलेन्स एआय विश्लेषण व तपासणी",
  "Automated Verification": "स्वयंचलित पडताळणी",
  "Detected Category": "शोधलेला प्रवर्ग",
  "Assessed Severity": "ठरलेली तीव्रता",
  "Action Urgency": "कारवाईची तातडी",
  "AI Classifier Confidence": "एआय विश्वासार्हता",
  "AI Explanation:": "एआय स्पष्टीकरण:",
  "Re-opened by Citizen (Disputed Resolution)": "नागरिकाने पुन्हा उघडलेली (दुरुस्तीवर आक्षेप)",
  "+15 Priority Boost Escalated": "+१५ प्राधान्य वाढवण्यात आले",
  "Anti-Fake Resolution Audit triggered — Ticket returned to In-Progress queue for immediate municipal re-inspection.": "बनावट दुरुस्ती ऑडिट सुरू झाले — तात्काळ महापालिका फेरतपासणीसाठी तक्रार प्रगतीपथावर पाठवली गेली.",
  "Citizen Dispute Statement:": "नागरिकाचे आक्षेप निवेदन:",
  "Citizen Re-inspection Proof Photo:": "नागरिकाने पाठवलेला फेरतपासणी फोटो:",
  "48-Hour Citizen Anti-Fake Resolution Audit Window": "४८ तास नागरिक बनावट-विरोधी पडताळणी कालावधी",
  "Are you satisfied with this on-site municipal resolution?": "तुम्ही महापालिकेने केलेल्या या जागेवरील दुरुस्तीवर समाधानी आहात का?",
  "Inspect the Before vs. After comparison above. If the field work was incomplete or falsely marked resolved, you can dispute and re-open this ticket immediately.": "वरील 'आधी आणि नंतर' तुलना तपासा. जर काम अपूर्ण असेल किंवा चुकीचे पूर्ण दाखवले असेल, तर तुम्ही आक्षेप नोंदवून ही तक्रार पुन्हा उघडू शकता.",
  "Satisfied (Rate 1–5 ★)": "समाधानी (१-५ ★ रेटिंग द्या)",
  "Not Fixed Properly — Re-open Issue": "काम व्यवस्थित झाले नाही — पुन्हा तक्रार उघडा",
  "Rate Municipal Field Resolution Quality:": "महापालिकेच्या कामाच्या गुणवत्तेला रेटिंग द्या:",
  "Stars": "तारे"
};

// Reverse Dictionary for Marathi-to-English restoration
export const REVERSE_DOM_TRANSLATIONS = {};
for (const [enKey, mrVal] of Object.entries(DOM_TRANSLATIONS)) {
  if (mrVal && mrVal !== enKey && !REVERSE_DOM_TRANSLATIONS[mrVal]) {
    REVERSE_DOM_TRANSLATIONS[mrVal] = enKey;
  }
}

// Sort phrase keys by length descending to match full sentences before single words
const SORTED_EN_KEYS = Object.keys(DOM_TRANSLATIONS).sort((a, b) => b.length - a.length);
const SORTED_MR_KEYS = Object.keys(REVERSE_DOM_TRANSLATIONS).sort((a, b) => b.length - a.length);

// Precompile word boundary regexes for short ASCII words to prevent substring corruption (e.g. "Admin" -> "Admमध्ये")
const COMPILED_EN_PATTERNS = SORTED_EN_KEYS.map((key) => {
  const isShortWord = key.length <= 4 && /^[a-zA-Z]+$/.test(key);
  const regex = isShortWord ? new RegExp(`\\b${key}\\b`, 'g') : null;
  return { key, val: DOM_TRANSLATIONS[key], regex };
});

export const translateTextToMarathi = (text) => {
  if (!text || typeof text !== 'string') return text;
  const trimmed = text.trim();
  if (!trimmed || !/[a-zA-Z]/.test(trimmed)) return text;

  // Direct full-phrase match
  if (DOM_TRANSLATIONS[trimmed]) {
    return text.replace(trimmed, DOM_TRANSLATIONS[trimmed]);
  }

  let result = text;
  for (const { key, val, regex } of COMPILED_EN_PATTERNS) {
    if (regex) {
      regex.lastIndex = 0;
      if (regex.test(result)) {
        regex.lastIndex = 0;
        result = result.replace(regex, val);
      }
    } else if (result.includes(key)) {
      result = result.split(key).join(val);
    }
  }
  return result;
};

export const translateTextToEnglish = (text) => {
  if (!text || typeof text !== 'string') return text;
  const trimmed = text.trim();
  if (!trimmed || !/[\u0900-\u097F]/.test(trimmed)) return text; // already english / non-devanagari

  // Direct full-phrase match
  if (REVERSE_DOM_TRANSLATIONS[trimmed]) {
    return text.replace(trimmed, REVERSE_DOM_TRANSLATIONS[trimmed]);
  }

  let result = text;
  for (const mrKey of SORTED_MR_KEYS) {
    if (result.includes(mrKey)) {
      result = result.split(mrKey).join(REVERSE_DOM_TRANSLATIONS[mrKey]);
    }
  }
  return result;
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('civiclens_lang') || 'en';
  });

  const originalTexts = useRef(new WeakMap());
  const originalPlaceholders = useRef(new WeakMap());
  const observerRef = useRef(null);

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('civiclens_lang', newLang);
  };

  // Translation function that works both as t('key') and as t.key
  const tFn = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };
  const t = new Proxy(tFn, {
    get(target, prop) {
      if (typeof prop === 'string' && (prop in (translations[lang] || {}) || prop in (translations['en'] || {}))) {
        return translations[lang]?.[prop] || translations['en']?.[prop];
      }
      return target[prop];
    }
  });

  // Direct helper: tx('English', 'मराठी')
  const tx = (enText, mrText) => (lang === 'mr' ? mrText : enText);

  // Global DOM Tree Translator Effect — instant, seamless, zero-reload
  useEffect(() => {
    const root = document.getElementById('root') || document.body;
    if (!root) return;

    // Track whether we're currently inside our own translation pass to avoid observer feedback loops
    let isTranslating = false;

    const translateTextNode = (node) => {
      const parentTag = node.parentNode?.tagName;
      if (parentTag === 'SCRIPT' || parentTag === 'STYLE' || parentTag === 'NOSCRIPT') return;

      const text = node.textContent;
      if (!text || !text.trim()) return;

      if (lang === 'mr') {
        // Only save as original if it's not already Marathi
        if (!/[\u0900-\u097F]/.test(text) && !originalTexts.current.has(node)) {
          originalTexts.current.set(node, text);
        }
        const orig = originalTexts.current.get(node) || text;
        const replaced = translateTextToMarathi(orig);
        if (replaced !== text) {
          node.textContent = replaced;
        }
      } else {
        // Reverting to English
        if (originalTexts.current.has(node)) {
          const orig = originalTexts.current.get(node);
          if (orig && !/[\u0900-\u097F]/.test(orig)) {
            if (node.textContent !== orig) {
              node.textContent = orig;
            }
            return;
          }
        }
        // Fallback reverse translation for nodes rendered while in Marathi
        if (/[\u0900-\u097F]/.test(text)) {
          const replaced = translateTextToEnglish(text);
          if (replaced !== text) {
            node.textContent = replaced;
          }
        }
      }
    };

    const translateElement = (node) => {
      // Input / Textarea Placeholders
      if (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA') {
        const ph = node.getAttribute('placeholder');
        if (ph && ph.trim()) {
          if (lang === 'mr') {
            if (!/[\u0900-\u097F]/.test(ph) && !originalPlaceholders.current.has(node)) {
              originalPlaceholders.current.set(node, ph);
            }
            const origPh = originalPlaceholders.current.get(node) || ph;
            const replacedPh = translateTextToMarathi(origPh);
            if (replacedPh !== ph) node.setAttribute('placeholder', replacedPh);
          } else {
            if (originalPlaceholders.current.has(node)) {
              const origPh = originalPlaceholders.current.get(node);
              if (origPh && !/[\u0900-\u097F]/.test(origPh)) {
                node.setAttribute('placeholder', origPh);
                return;
              }
            }
            if (/[\u0900-\u097F]/.test(ph)) {
              node.setAttribute('placeholder', translateTextToEnglish(ph));
            }
          }
        }
      }

      // Select / Option elements
      if (node.tagName === 'OPTION') {
        const text = node.textContent;
        if (text && text.trim()) {
          if (lang === 'mr') {
            if (!/[\u0900-\u097F]/.test(text) && !originalTexts.current.has(node)) {
              originalTexts.current.set(node, text);
            }
            const orig = originalTexts.current.get(node) || text;
            const replaced = translateTextToMarathi(orig);
            if (replaced !== text) node.textContent = replaced;
          } else {
            if (originalTexts.current.has(node)) {
              const orig = originalTexts.current.get(node);
              if (orig && !/[\u0900-\u097F]/.test(orig)) {
                if (node.textContent !== orig) node.textContent = orig;
                return;
              }
            }
            if (/[\u0900-\u097F]/.test(text)) {
              node.textContent = translateTextToEnglish(text);
            }
          }
        }
      }

      // aria-label, title attributes
      for (const attr of ['aria-label', 'title']) {
        const val = node.getAttribute(attr);
        if (val && val.trim()) {
          const dataKey = `data-orig-${attr}`;
          if (lang === 'mr') {
            if (!/[\u0900-\u097F]/.test(val) && !node.getAttribute(dataKey)) {
              node.setAttribute(dataKey, val);
            }
            const orig = node.getAttribute(dataKey) || val;
            const replaced = translateTextToMarathi(orig);
            if (replaced !== val) node.setAttribute(attr, replaced);
          } else {
            const origVal = node.getAttribute(dataKey);
            if (origVal && !/[\u0900-\u097F]/.test(origVal)) {
              node.setAttribute(attr, origVal);
            } else if (/[\u0900-\u097F]/.test(val)) {
              node.setAttribute(attr, translateTextToEnglish(val));
            }
          }
        }
      }
    };

    const translateNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        translateTextNode(node);
        return;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        translateElement(node);

        // Recurse child nodes
        const walker = document.createTreeWalker(
          node,
          NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
          null
        );
        let child;
        while ((child = walker.nextNode())) {
          if (child.nodeType === Node.TEXT_NODE) {
            translateTextNode(child);
          } else if (child.nodeType === Node.ELEMENT_NODE) {
            translateElement(child);
          }
        }
      }
    };

    // Perform synchronous initial full-tree scan
    isTranslating = true;
    translateNode(root);
    isTranslating = false;

    // Follow-up scans for late-rendering async API data or lazy components
    const t1 = setTimeout(() => { isTranslating = true; translateNode(root); isTranslating = false; }, 80);
    const t2 = setTimeout(() => { isTranslating = true; translateNode(root); isTranslating = false; }, 300);
    const t3 = setTimeout(() => { isTranslating = true; translateNode(root); isTranslating = false; }, 800);
    const t4 = setTimeout(() => { isTranslating = true; translateNode(root); isTranslating = false; }, 1800);

    // Observe future dynamic DOM mutations
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    let pendingFrame = null;
    const nodesToTranslate = new Set();

    const flushTranslations = () => {
      pendingFrame = null;
      if (nodesToTranslate.size === 0) return;
      isTranslating = true;
      for (const n of nodesToTranslate) {
        if (n.isConnected) translateNode(n);
      }
      nodesToTranslate.clear();
      isTranslating = false;
    };

    const observer = new MutationObserver((mutations) => {
      if (isTranslating) return;

      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          for (const added of mutation.addedNodes) {
            nodesToTranslate.add(added);
          }
        } else if (mutation.type === 'characterData') {
          nodesToTranslate.add(mutation.target);
        }
      }

      if (!pendingFrame) {
        pendingFrame = requestAnimationFrame(flushTranslations);
      }
    });

    observer.observe(root, { childList: true, subtree: true, characterData: true });
    observerRef.current = observer;

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      if (pendingFrame) cancelAnimationFrame(pendingFrame);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [lang]);

  return (
    <LanguageContext.Provider
      value={{
        lang,
        language: lang,
        changeLanguage,
        setLanguage: changeLanguage,
        t,
        tx
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    const tFallback = (k) => k;
    return {
      lang: 'en',
      language: 'en',
      changeLanguage: () => {},
      setLanguage: () => {},
      t: new Proxy(tFallback, { get: (target, prop) => prop }),
      tx: (en) => en
    };
  }
  return context;
};

export default LanguageContext;
