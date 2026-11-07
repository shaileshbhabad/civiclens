# CivicLens — Mobile & Technical Architecture Review

This document provides complete, precise answers to the 10 architecture and UI questions for **CivicLens** (PCMC Ward 20 Municipal Public Grievance Redressal Portal).

---

## 1. Framework and Stack
* **Frontend Library:** React 19 (`react: ^19.2.8`, `react-dom: ^19.2.8`)
* **Routing:** React Router v7 (`react-router-dom: ^7.18.4`)
* **Styling & CSS:** Tailwind CSS v4 (`@tailwindcss/vite: ^4.3.3`, `tailwindcss: ^4.3.3`)
* **Iconography:** Lucide React (`lucide-react: ^1.55.0`)
* **Charts & Analytics:** Recharts (`recharts: ^3.10.1`)
* **Mapping Engine:** Leaflet GIS (`leaflet: ^1.9.4`)
* **QR Processing:** HTML5-QRCode (`html5-qrcode: ^2.3.8`, `qrcode.react: ^4.2.0`)
* **Build Tool:** Vite v8 (`vite: ^8.3.4`) using `@vitejs/plugin-react` and `@tailwindcss/vite`
* **Backend Runtime:** Node.js v24 with Express 4.21.2
* **Database & ODM:** MongoDB Community Server with Mongoose 8.12.1
* **AI Engine:** Groq Cloud SDK (`groq-sdk: ^0.15.0`) for real-time vision triage and multivariable grievance scoring

---

## 2. Project Structure
```text
Civiclens/
├── client/                               # Frontend Single Page Application
│   ├── index.html                        # Application entry HTML with responsive viewport
│   ├── vite.config.js                    # Vite configuration (0.0.0.0 binding, port 5173, /api proxy)
│   ├── package.json                      # Client dependencies & scripts
│   ├── src/
│   │   ├── main.jsx                      # React 19 bootstrap
│   │   ├── index.css                     # Tailwind CSS v4 directives & theme definitions
│   │   ├── components/                   # Reusable UI & GIS components
│   │   │   ├── BeforeAfterSlider.jsx     # Touch-enabled split photo verification slider
│   │   │   ├── CommunityQRModal.jsx      # Printable Ward QR code poster modal
│   │   │   ├── HotspotRadar.jsx          # Ward 20 cluster radar visualization
│   │   │   ├── IncidentHeatmap.jsx       # Leaflet spatial defect heatmap
│   │   │   ├── LocationPickerMap.jsx     # Interactive GPS pin selection map
│   │   │   └── ProtectedRoute.jsx        # Role-based route guard
│   │   ├── context/                      # Global React Contexts
│   │   │   ├── AuthContext.jsx           # Citizen & Officer authentication state
│   │   │   ├── LanguageContext.jsx       # Bilingual dictionary provider (English & Marathi)
│   │   │   └── ThemeContext.jsx          # Institutional High-Contrast Light / Dark Mode
│   │   ├── layouts/                      # App page wrappers
│   │   │   ├── MainLayout.jsx            # Citizen portal layout (top bar, navbar, footer modals)
│   │   │   └── AdminLayout.jsx           # Stationary admin sidebar + scrolling content layout
│   │   ├── pages/
│   │   │   ├── HomePage.jsx              # Landing page with stats, workflow steps, & CTAs
│   │   │   ├── LoginPage.jsx             # Role-based credential authentication
│   │   │   ├── NotFoundPage.jsx          # Bilingual institutional 404 page
│   │   │   ├── citizen/
│   │   │   │   ├── ComplaintForm.jsx     # Complaint filing with camera, voice, & AI deduplication
│   │   │   │   ├── TrackComplaint.jsx    # Live grievance tracking & audit history
│   │   │   │   └── CitizenDashboard.jsx  # Citizen activity overview
│   │   │   ├── public/
│   │   │   │   └── PublicDashboard.jsx   # City-wide civic transparency dashboard
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx    # Municipal command center
│   │   │   │   ├── AdminIncidents.jsx    # Departmental queue & ticket assignment
│   │   │   │   ├── AdminAnalytics.jsx    # SLA turnaround & category trend charts
│   │   │   │   ├── AdminUsers.jsx        # Role & authority officer management
│   │   │   │   └── AdminIncidentDetail.jsx # Deep incident inspection & triage
│   │   │   └── authority/
│   │   │       ├── AuthorityDashboard.jsx
│   │   │       └── AuthorityIncidentDetail.jsx
│   │   ├── services/
│   │   │   └── api.js                    # API service layer with in-memory 12s cache & mock fallbacks
│   │   └── utils/
│   │       ├── helpers.js                # Status badges, date formatting, category mappings
│   │       ├── imageQualityChecker.js    # Client-side anti-fraud canvas scanner
│   │       ├── qrParser.js               # Locality QR code payload parser
│   │       └── exportUtils.js            # CSV and printable report generators
│   └── public/
│       ├── favicon.svg                   # Official municipal landmark SVG favicon
│       └── images/resolutions/           # Compressed resolution before & after photos
└── server/                               # Backend REST API
    ├── package.json
    └── src/
        ├── index.js                      # Express server entry point (0.0.0.0 binding, CORS)
        ├── config/db.js                  # Mongoose MongoDB connection
        ├── models/                       # Complaint.js, Incident.js, User.js
        ├── routes/                       # complaintRoutes, incidentRoutes, dashboardRoutes, authRoutes
        ├── controllers/                  # complaintController, incidentController, dashboardController
        └── services/                     # groqService (AI), hotspotService, adminService
```

---

## 3. The Viewport Tag
Yes, `client/index.html` includes a fully configured mobile viewport tag. Below is the complete `<head>` section:

```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
  
  <!-- Title & Meta Descriptions -->
  <title>CivicLens</title>
  <meta
    name="description"
    content="Official Pimpri-Chinchwad Municipal Corporation (PCMC) Ward 20 public portal for civic grievance redressal, SLA tracking, and automated defect verification."
  />
  <meta name="keywords" content="PCMC, CivicLens, Pimpri Chinchwad, Municipal Corporation, Ward 20, grievance, pothole, garbage, civic defects, SLA tracking" />
  <meta name="author" content="Pimpri-Chinchwad Municipal Corporation (PCMC)" />
  <meta name="theme-color" content="#091a38" />

  <!-- Open Graph / Social Meta -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content="CivicLens" />
  <meta property="og:description" content="File, track, and verify municipal civic grievances across PCMC Ward 20 with photographic proof and SLA timeline accountability." />
  <meta property="og:site_name" content="PCMC CivicLens" />

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="apple-touch-icon" href="/favicon.svg" />

  <!-- Leaflet Map CSS & Script -->
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
</head>
```

---

## 4. How the App Is Viewed on Mobile
* **Access Method:** Direct local Wi-Fi connection from the smartphone browser to the host machine's LAN IP.
* **Target Mobile URL:** `http://10.91.43.78:5173`
* **Vite Server Arguments:** `npx vite --host 0.0.0.0 --port 5173`
* **Network & Proxy Architecture:**
  * `client/vite.config.js` binds to `0.0.0.0:5173` and proxies all `/api` traffic directly to the Express backend on `http://127.0.0.1:5000`.
  * Express backend listens on `0.0.0.0:5000` with open CORS configured for local development.

---

## 5. What “Looks Bad” Means on Mobile (Key Areas to Optimize)
On standard smartphone screens (360px–412px width), these specific areas require mobile attention:
1. **Touch Targets & Form Inputs (`ComplaintForm.jsx`):**
   * Category buttons and photo upload drop zones require minimum 44×44px touch targets.
   * Spacing between speech-to-text mic buttons, language selectors, and submission buttons must prevent mis-taps.
2. **Scroll Collision on Interactive Maps (`LocationPickerMap.jsx`):**
   * When citizens scroll down the form using their thumb, touching the Leaflet map container can accidentally trigger map panning instead of page scrolling. Gesture handling and clear margin touch buffers ensure smooth vertical page scrolling.
3. **Data Tables & Horizontal Overflow (`TrackComplaint.jsx`, `CitizenDashboard.jsx`):**
   * Multi-column tabular data (Tracking ID, Address, Status, Ward, SLA, Action) must switch to stacked, touch-friendly card views on mobile (`< 640px`) rather than requiring horizontal scrolling.
4. **Hero CTA Button Stacking (`HomePage.jsx`):**
   * The 3 primary action buttons ("File a Civic Grievance", "Locality QR Poster", "Track Status") must span full-width (`w-full`) and stack cleanly on narrow mobile viewports.

---

## 6. The Main Layout CSS (Tailwind Classes)

### Top Municipal Banner (`MainLayout.jsx`)
```jsx
<div className="bg-[#091a38] text-slate-200 text-[11px] py-1 border-b border-slate-800">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <span className="font-semibold tracking-wider text-slate-300 uppercase">
        {isMr ? 'महाराष्ट्र शासन • पिंपरी-चिंचवड महानगरपालिका' : 'Government of Maharashtra • PCMC Municipal Corporation'}
      </span>
    </div>
    <div className="flex items-center gap-4 text-slate-300">
      <a href="tel:18002097262" className="text-amber-300 font-medium hover:underline flex items-center gap-1 cursor-pointer">
        <PhoneCall className="w-3 h-3" />
        <span>{isMr ? 'हेल्पलाईन: १८००-२०९-७२६२' : 'Helpline: 1800-209-7262'}</span>
      </a>
    </div>
  </div>
</div>
```

### Sticky Header & Navbar (`MainLayout.jsx`)
```jsx
<header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-150 shadow-xs">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-16">
      {/* Brand Logo & Title */}
      <Link to="/" className="flex items-center gap-3 group">
        <div className="w-10 h-10 rounded-lg bg-[#0f2b5c] text-white flex items-center justify-center font-bold">
          <Landmark className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg leading-tight tracking-tight text-slate-900 dark:text-white">CivicLens</span>
          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">PCMC Citizen Public Portal</span>
        </div>
      </Link>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">...</nav>
      {/* Mobile Hamburger Button */}
      <div className="flex md:hidden items-center gap-2">
        <button onClick={() => setMobileMenuOpen(true)} className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </div>
  </div>
</header>
```

### Hero Section (`HomePage.jsx`)
```jsx
<section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-12 lg:py-16">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
      <div className="lg:col-span-7 space-y-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          <Landmark className="w-4 h-4 text-[#0f2b5c] dark:text-blue-400" />
          <span>Pimpri-Chinchwad Municipal Corporation • Public Grievance Portal</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
          PCMC Ward 20 Civic Grievance & SLA Tracking Portal
        </h1>
        {/* Responsive Button Group */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">...</div>
      </div>
    </div>
  </div>
</section>
```

---

## 7. Navigation
* **Primary Route Links (4 items):**
  1. **Home** (`/`)
  2. **File Complaint** (`/report`)
  3. **Track Grievance** (`/track`)
  4. **Ward Transparency Dashboard** (`/dashboard`)
* **Header Controls:**
  * Bilingual switch (`English | मराठी`)
  * Institutional Theme toggle (`Sun / Moon` for Light and Dark mode)
  * Account link (`Login` or User Profile Dropdown)
* **Mobile Menu Drawer:**
  * Yes, an off-canvas drawer is implemented with `Menu` and `X` toggle icons.
  * Tapping the hamburger button slides out a drawer (`w-72 bg-white dark:bg-slate-900 fixed inset-y-0 right-0 z-50 shadow-2xl`).
  * Features a dark modal backdrop (`fixed inset-0 bg-slate-900/60 z-40`).
  * Closes automatically on any link click, on route changes, or on `Escape` key press.

---

## 8. Forms and Interactive Components
* **Complaint Filing Form (`ComplaintForm.jsx`):**
  * Speech-to-text voice input via Web Speech API with auto-translation and category detection.
  * Photo evidence upload with camera capture integration (`capture="environment"`).
  * Client-side Canvas downscaler & image compressor (`compressImageForUpload`).
  * Real-time anti-fraud brightness/blur scanner (`imageQualityChecker.js`).
  * Pre-submission duplicate warning banner.
* **Before / After Resolution Slider (`BeforeAfterSlider.jsx`):**
  * Interactive touch-drag comparison slider with touch events (`onTouchStart`, `onTouchMove`, `onTouchEnd`).
* **GIS Location Picker Map (`LocationPickerMap.jsx`):**
  * Interactive Leaflet pin selection, browser GPS geolocation button, and quick-select Ward 20 landmark chips.
* **Modal Dialogs:**
  * Locality QR poster generation modal (`CommunityQRModal.jsx`).
  * 4 bilingual municipal policy modals (Citizen Charter, Privacy Policy, RTI Disclosure, Hyperlinking Policy).

---

## 9. Fixed Sizes & Viewport Restraints
* **No `100vw`:** All layouts use `w-full` with `overflow-x-hidden` on `MainLayout.jsx` and `body` to avoid horizontal scrolling or viewport bounce on mobile browsers.
* **Fluid Layout Containers:** Standard responsive Tailwind containers (`max-w-7xl`, `max-w-6xl`, `max-w-4xl`, `mx-auto`, `px-4 sm:px-6`).
* **Absolute Positioning:** Restricted strictly to floating map markers, modal overlays (`fixed inset-0`), and the draggable handle on the before/after slider.
* **Responsive Tables:** Tabular views in dashboards use `overflow-x-auto` to allow smooth horizontal swipe on desktop tables when viewed on narrow screens.

---

## 10. Desktop Must-Keep Details
1. **Institutional Government Branding:** Deep Navy (`#0f2b5c`, `#091a38`), clean high-contrast neutral slate card surfaces, and strict avoidance of decorative gradients or glassmorphism.
2. **Stationary Admin Sidebar:** In `AdminLayout.jsx`, the left sidebar is locked in place (`fixed inset-y-0 left-0 w-64`) while the right dashboard content panel scrolls independently.
3. **Header Switcher Alignment:** The bilingual toggle (`English | मराठी`) and the dark/light mode toggle must remain side-by-side in both public and admin headers.
4. **Browser Tab Title:** The browser document title must remain strictly **`CivicLens`**.
5. **Full Database & API Functionality:** MongoDB queries, 12-second in-memory caching, and Vite proxy to Express port 5000 must be preserved.
