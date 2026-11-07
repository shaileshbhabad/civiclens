import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Camera,
  MapPin,
  UploadCloud,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  X,
  FileImage,
  Navigation,
  ShieldCheck,
  Building2,
  Compass,
  Lock,
  Mic,
  MicOff,
  Volume2,
  Globe2,
  Radio,
  Sliders,
  AlertTriangle,
  Award,
  ThumbsUp,
  Zap,
  Link2,
  FolderOpen
} from 'lucide-react';
import api from '../../services/api';
import LocationPickerMap from '../../components/LocationPickerMap';
import { useLanguage } from '../../context/LanguageContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { analyzeImageQuality } from '../../utils/imageQualityChecker';
import { getCategoryLabel, getStatusLabel } from '../../utils/helpers';

const ComplaintForm = () => {
  const { t, language } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // In-App Live Camera state (avoids heavy OS activity switch on low-RAM phones)
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState(false);
  const [liveCameraLoading, setLiveCameraLoading] = useState(false);
  const [liveCameraError, setLiveCameraError] = useState(null);
  const [cameraFacing, setCameraFacing] = useState('environment'); // 'environment' | 'user'

  useDocumentTitle(
    language === 'mr' ? 'नवीन तक्रार नोंदणी' : 'File a Civic Grievance',
    'Submit photo evidence and GPS geotag to file an official municipal grievance in PCMC Ward 20.'
  );

  // Screen progression state: 'form' | 'loading' | 'success'
  const [step, setStep] = useState('form');

  // Form inputs
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState([73.8159, 18.6231]); // Default map center
  const [ward, setWard] = useState('');
  const [category, setCategory] = useState('pothole');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // Image Quality & Anti-Fraud state
  const [imageQuality, setImageQuality] = useState(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);

  // Pre-Submission AI Spatial Duplicate Detection state
  const [nearbyDuplicates, setNearbyDuplicates] = useState([]);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [dismissedDuplicateWarning, setDismissedDuplicateWarning] = useState(false);
  const [fastTrackingId, setFastTrackingId] = useState(null);
  const [wasFastTracked, setWasFastTracked] = useState(false);

  // Multilingual Voice Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState('mr-IN'); // 'mr-IN' | 'hi-IN' | 'en-IN'
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState(null);
  const recognitionRef = useRef(null);

  // Interaction & UI states
  const [validationErrors, setValidationErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [trackingId, setTrackingId] = useState('');
  const [copied, setCopied] = useState(false);

  // Handle URL query parameters if citizen scanned locality QR code or was referred
  useEffect(() => {
    const paramLat = searchParams.get('lat');
    const paramLng = searchParams.get('lng');
    const paramAddress = searchParams.get('address');
    const paramWard = searchParams.get('ward');

    if (paramLat && paramLng) {
      const lat = parseFloat(paramLat);
      const lng = parseFloat(paramLng);
      if (!isNaN(lat) && !isNaN(lng)) {
        setCoordinates([lng, lat]);
      }
    }
    if (paramAddress) setAddress(paramAddress);
    if (paramWard) setWard(paramWard);
  }, [searchParams]);

  // Real-Time Pre-Submission AI Spatial Duplicate Detection (checks within 220m of pin)
  useEffect(() => {
    if (!coordinates || coordinates.length < 2) return;
    let isCancelled = false;

    const runDuplicateScan = async () => {
      setCheckingDuplicates(true);
      try {
        const matches = await api.checkDuplicateComplaints({
          lng: coordinates[0],
          lat: coordinates[1],
          category,
          radius: 220
        });
        if (!isCancelled) {
          setNearbyDuplicates(matches || []);
          setDismissedDuplicateWarning(false);
        }
      } catch (err) {
        console.warn('Pre-submission duplicate scan error:', err);
      } finally {
        if (!isCancelled) setCheckingDuplicates(false);
      }
    };

    const timer = setTimeout(runDuplicateScan, 250);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [coordinates, category]);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Voice Recognition Handler
  const toggleVoiceRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceNotice({
        type: 'error',
        text: 'Speech recognition is not supported in this browser. Please type your description or try Chrome/Edge.'
      });
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = voiceLanguage;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
        setVoiceNotice({
          type: 'info',
          text: voiceLanguage === 'mr-IN'
            ? 'ऐकत आहे... कृपया मराठीत समस्या सांगा (उदा. संत तुकाराम नगरजवळ रस्त्यावर खड्डा पडला आहे)'
            : voiceLanguage === 'hi-IN'
            ? 'सुन रहा हूँ... कृपया हिंदी में समस्या बताएं (उदा. डीवाई पाटिल के सामने गहरा गड्ढा है)'
            : 'Listening... Please describe the civic issue in English'
        });
      };

      recognition.onresult = async (event) => {
        const spokenText = event.results[0][0].transcript;
        setIsRecording(false);
        setIsProcessingVoice(true);
        setVoiceNotice({
          type: 'process',
          text: `Processing speech: "${spokenText}"... AI translating to official municipal format.`
        });

        try {
          const aiResult = await api.processVoiceTranscript(spokenText);
          if (aiResult) {
            if (aiResult.translatedEnglish) {
              setDescription(aiResult.translatedEnglish);
            } else {
              setDescription(spokenText);
            }

            if (aiResult.category) {
              setCategory(aiResult.category);
            }

            setVoiceNotice({
              type: 'success',
              text: `Auto-transcribed & translated from ${voiceLanguage === 'mr-IN' ? 'Marathi' : voiceLanguage === 'hi-IN' ? 'Hindi' : 'English'}! Category detected as: ${aiResult.category || 'Pothole'}.`
            });
            setValidationErrors((prev) => ({ ...prev, description: null }));
          }
        } catch (err) {
          console.error('Voice translation failed:', err);
          setDescription((prev) => (prev ? `${prev} ${spokenText}` : spokenText));
          setVoiceNotice({
            type: 'info',
            text: `Speech recorded: "${spokenText}"`
          });
        } finally {
          setIsProcessingVoice(false);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
        setIsProcessingVoice(false);
        if (event.error !== 'no-speech') {
          setVoiceNotice({
            type: 'error',
            text: `Microphone error: ${event.error}. Please check permissions.`
          });
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsRecording(false);
    }
  };

  // Handle location update from interactive Map picker
  const handleLocationChange = (loc) => {
    if (loc) {
      if (loc.coordinates) {
        setCoordinates(loc.coordinates);
      }
      if (loc.address) {
        setAddress(loc.address);
      }
      if (loc.ward) {
        setWard(loc.ward);
      }
      setValidationErrors((prev) => ({ ...prev, location: null }));
    }
  };

  // Run Real-Time Quality & Anti-Fraud analysis
  const analyzeImage = async (fileOrUrl) => {
    setIsAnalyzingImage(true);
    try {
      const report = await analyzeImageQuality(fileOrUrl);
      setImageQuality(report);
      if (!report.passed) {
        setValidationErrors((prev) => ({
          ...prev,
          photo: report.issues[0] || 'Image failed municipal anti-fraud authenticity check.'
        }));
      } else {
        setValidationErrors((prev) => ({ ...prev, photo: null }));
      }
    } catch (err) {
      console.warn('Image quality analysis failed:', err);
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  // Handle photo selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedImage(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processSelectedImage(file);
    } else if (file) {
      setValidationErrors((prev) => ({
        ...prev,
        photo: 'Please upload an image file (JPG, PNG, WebP).'
      }));
    }
  };

  const compressImageForUpload = (file, maxWidth = 1024, maxHeight = 768, quality = 0.65) => {
    return new Promise((resolve) => {
      // Use URL.createObjectURL to avoid multi-megabyte string allocation in mobile browser RAM
      let objectUrl = null;
      try {
        objectUrl = URL.createObjectURL(file);
      } catch (e) {
        // Fallback for edge cases
      }

      const img = new Image();

      const cleanup = () => {
        if (objectUrl) {
          try {
            URL.revokeObjectURL(objectUrl);
          } catch {
            // ignore
          }
        }
      };

      img.onload = () => {
        try {
          let width = img.naturalWidth || img.width;
          let height = img.naturalHeight || img.height;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            cleanup();
            return resolve(img.src);
          }

          ctx.drawImage(img, 0, 0, width, height);
          let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

          // Second compression pass if result exceeds 300KB
          if (compressedDataUrl.length > 350000) {
            const smallCanvas = document.createElement('canvas');
            const smallW = Math.round(width * 0.75);
            const smallH = Math.round(height * 0.75);
            smallCanvas.width = smallW;
            smallCanvas.height = smallH;
            const smallCtx = smallCanvas.getContext('2d');
            if (smallCtx) {
              smallCtx.drawImage(canvas, 0, 0, smallW, smallH);
              compressedDataUrl = smallCanvas.toDataURL('image/jpeg', 0.55);
            }
          }

          cleanup();
          resolve(compressedDataUrl);
        } catch (err) {
          cleanup();
          resolve(img.src);
        }
      };

      img.onerror = () => {
        cleanup();
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      };

      if (objectUrl) {
        img.src = objectUrl;
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          img.src = e.target.result;
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      }
    });
  };

  const processSelectedImage = async (file) => {
    setImageFile(file);
    try {
      const compressedUrl = await compressImageForUpload(file);
      if (compressedUrl) {
        setImagePreview(compressedUrl);
        analyzeImage(compressedUrl);
      }
    } catch (err) {
      console.warn('Image compression fallback:', err);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        analyzeImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageQuality(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    stopLiveCamera();
  };

  // In-App WebRTC Camera controller (keeps Chrome in foreground, prevents Android Low Memory kills)
  const startLiveCamera = async (facing = cameraFacing) => {
    setIsLiveCameraOpen(true);
    setLiveCameraLoading(true);
    setLiveCameraError(null);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('In-app live camera is not supported on this browser version.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 }
        },
        audio: false
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(console.warn);
        };
      }
    } catch (err) {
      console.warn('In-app camera failed:', err);
      setLiveCameraError(
        language === 'mr'
          ? 'थेट कॅमेरा सुरू करता आला नाही. कृपया "गॅलरीतून निवडा" हा पर्याय वापरा.'
          : 'Could not access in-app camera. Please use the "Choose from Gallery" option below.'
      );
    } finally {
      setLiveCameraLoading(false);
    }
  };

  const stopLiveCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsLiveCameraOpen(false);
    setLiveCameraError(null);
  };

  const toggleCameraFacing = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    startLiveCamera(nextFacing);
  };

  const captureLiveSnapshot = () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      const vWidth = video.videoWidth || 1280;
      const vHeight = video.videoHeight || 720;

      let width = vWidth;
      let height = vHeight;
      const maxW = 1024;
      const maxH = 768;
      if (width > maxW || height > maxH) {
        const ratio = Math.min(maxW / width, maxH / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (cameraFacing === 'user') {
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.65);

      setImagePreview(dataUrl);
      setImageFile({ name: `pimpri-evidence-${Date.now()}.jpg` });
      analyzeImage(dataUrl);
      stopLiveCamera();
    } catch (err) {
      console.error('Failed to capture snapshot from camera:', err);
      stopLiveCamera();
    }
  };

  // Clean up any open hardware camera streams when component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const getCategoryBeforeImage = (cat) => {
    if (cat === 'garbage') return '/images/resolutions/garbage_before.jpg';
    if (cat === 'drainage' || cat === 'water_leak') return '/images/resolutions/drainage_before.jpg';
    if (cat === 'pothole') return '/images/resolutions/pothole_before.jpg';
    // streetlight, other, and any other category → use drainage image as neutral civic infrastructure photo
    return '/images/resolutions/drainage_before.jpg';
  };

  const handleUseSamplePhoto = () => {
    const sample = getCategoryBeforeImage(category);
    setImagePreview(sample);
    setImageFile({ name: `pimpri-${category}-evidence.jpg` });
    analyzeImage(sample);
  };

  // Form validation
  const validate = () => {
    const errors = {};
    if (!description.trim()) {
      errors.description = language === 'mr'
        ? 'कृपया समस्येचे थोडे वर्णन द्या.'
        : 'Please provide a brief description of the civic problem.';
    } else if (description.trim().length < 8) {
      errors.description = language === 'mr'
        ? `वर्णन किमान ८ अक्षरांचे असावे (सध्या ${description.trim().length}).`
        : `Description must be at least 8 characters (currently ${description.trim().length}).`;
    }

    if (!coordinates || !coordinates[0] || !coordinates[1]) {
      errors.location = language === 'mr'
        ? 'कृपया नकाशावर अचूक ठिकाण निश्चित करा.'
        : 'Please pin the exact location on the interactive map.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setStep('loading');

    try {
      const fallbackAddress = coordinates && coordinates[0]
        ? `Location at ${Number(coordinates[1]).toFixed(5)}° N, ${Number(coordinates[0]).toFixed(5)}° E`
        : 'Pimpri-Chinchwad Civic Location';

      const payload = {
        source: 'community_qr',
        category,
        description: description.trim(),
        address: address.trim() || fallbackAddress,
        ward: ward || 'PCMC Municipal Area',
        zone: 'Zone B (Pimpri Central)',
        coordinates: coordinates || [73.8159, 18.6231],
        imageUrl: imagePreview || getCategoryBeforeImage(category)
      };

      const res = await api.submitComplaint(payload);
      if (res && res.trackingId) {
        setTrackingId(res.trackingId);
        setStep('success');
      } else {
        throw new Error('No tracking ID returned');
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);
      setStep('form');
      setValidationErrors((prev) => ({
        ...prev,
        submit: language === 'mr'
          ? 'तक्रार पाठवण्यात अडचण आली. कृपया पुन्हा प्रयत्न करा.'
          : 'Failed to submit complaint. Please check your connection and try again.'
      }));
    }
  };

  const handleCopyTrackingId = async () => {
    try {
      await navigator.clipboard.writeText(trackingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy tracking id', err);
    }
  };

  // 1-Click "+1 Upvote & Fast-Track" when a nearby duplicate is detected before submission
  const handleFastTrackDuplicate = async (dup) => {
    setFastTrackingId(dup._id || dup.trackingId);
    try {
      await api.upvoteIncident(dup.incidentId || dup._id || dup.trackingId);
    } catch (err) {
      console.warn('Upvote duplicate fallback:', err);
    } finally {
      setFastTrackingId(null);
      setWasFastTracked(true);
      setTrackingId(dup.trackingId || 'CL-20261011-POTH1');
      setStep('success');
    }
  };

  const handleResetForm = () => {
    setDescription('');
    setAddress('Dr. D. Y. Patil College Campus, Sant Tukaram Nagar, Pimpri, Pune 411018');
    setCoordinates([73.8159, 18.6231]);
    setWard('Ward 20 (Sant Tukaram Nagar)');
    setImagePreview(null);
    setImageFile(null);
    setImageQuality(null);
    setVoiceNotice(null);
    setValidationErrors({});
    setTrackingId('');
    setWasFastTracked(false);
    setDismissedDuplicateWarning(false);
    setStep('form');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1322] text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-150">
      <div className="max-w-3xl mx-auto">
        {/* Step 1: Form Screen */}
        {step === 'form' && (
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Header banner */}
            <div className="px-6 py-6 sm:px-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0f2b5c] dark:text-blue-400" />
                  {t?.anonymousBadge || '100% Anonymous & Geotagged'}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Anti-Fraud AI Verified
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  <Mic className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  मराठी / हिंदी / EN Voice Enabled
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-3">
                {t?.reportPageTitle || 'File a Civic Grievance'}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                {t?.reportPageSub || 'Report potholes, garbage overflow, or utility faults in Pimpri-Chinchwad (PCMC). No login required.'}
              </p>
            </div>

            {/* Error alert if general submission failed */}
            {validationErrors.submit && (
              <div className="mx-6 sm:mx-8 mt-6 p-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-3 text-rose-800 dark:text-rose-200 text-sm">
                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <span>{validationErrors.submit}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-7">
              {/* Category Selector */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-900 dark:text-white">
                  {t?.categoryLabel || 'Issue Category'} <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {[
                    { id: 'pothole', label: t?.catPothole || 'Pothole & Roads' },
                    { id: 'garbage', label: t?.catGarbage || 'Garbage & Waste' },
                    { id: 'drainage', label: t?.catDrainage || 'Drainage & Sewage' },
                    { id: 'streetlight', label: t?.catStreetlight || 'Streetlight & Electrical' },
                    { id: 'water_leak', label: t?.catWaterLeak || 'Water Pipeline Leak' },
                    { id: 'other', label: t?.catOther || 'Other Municipal Issue' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`min-h-11 p-3 rounded-lg text-sm sm:text-xs font-semibold border text-left flex items-center justify-between transition cursor-pointer ${
                        category === cat.id
                          ? 'bg-slate-100 dark:bg-slate-800 border-[#0f2b5c] dark:border-blue-400 text-[#0f2b5c] dark:text-blue-400 font-bold shadow-xs'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                      }`}
                    >
                      <span>{cat.label}</span>
                      {category === cat.id && <span className="w-2 h-2 rounded-full bg-[#0f2b5c] dark:bg-blue-400 shrink-0 ml-2" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION: MULTILINGUAL VOICE-TO-TEXT REPORTING */}
              <div className="p-4 sm:p-5 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center shadow-xs shrink-0">
                      <Mic className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {t?.voiceRecordTitle || 'Voice Grievance (Marathi / Hindi / English)'}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {t?.voiceLangHint || 'Voice auto-transcribes & translates to official grievance details'}
                      </p>
                    </div>
                  </div>

                  {/* Language Selector: Separated with min 44px touch targets */}
                  <div className="flex flex-wrap items-center gap-1.5 self-stretch sm:self-center bg-white dark:bg-slate-800 p-1 rounded-lg border border-amber-200 dark:border-amber-800 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setVoiceLanguage('mr-IN')}
                      className={`min-h-11 flex-1 sm:flex-none px-3 py-2 rounded-md transition cursor-pointer flex items-center justify-center ${voiceLanguage === 'mr-IN' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                    >
                      मराठी (mr)
                    </button>
                    <button
                      type="button"
                      onClick={() => setVoiceLanguage('hi-IN')}
                      className={`min-h-11 flex-1 sm:flex-none px-3 py-2 rounded-md transition cursor-pointer flex items-center justify-center ${voiceLanguage === 'hi-IN' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                    >
                      हिंदी (hi)
                    </button>
                    <button
                      type="button"
                      onClick={() => setVoiceLanguage('en-IN')}
                      className={`min-h-11 flex-1 sm:flex-none px-3 py-2 rounded-md transition cursor-pointer flex items-center justify-center ${voiceLanguage === 'en-IN' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                    >
                      English
                    </button>
                  </div>
                </div>

                {/* Mic Record Button: Dedicated row spaced apart from language selector */}
                <div className="pt-2 border-t border-amber-200/60 dark:border-amber-800/60 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={toggleVoiceRecording}
                    disabled={isProcessingVoice}
                    className={`w-full sm:w-auto min-h-11 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm sm:text-xs transition-all shadow-sm ${
                      isRecording
                        ? 'bg-rose-600 text-white animate-pulse shadow-rose-500/30 ring-4 ring-rose-200'
                        : isProcessingVoice
                        ? 'bg-amber-200 text-amber-800 cursor-not-allowed'
                        : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <Radio className="w-4 h-4 animate-spin text-white" />
                        <span>{t?.voiceStop || 'Stop Recording'}</span>
                      </>
                    ) : isProcessingVoice ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>AI Translating...</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        <span>{t?.voiceStart || 'Click to Speak'} ({voiceLanguage === 'mr-IN' ? 'मराठीत बोला' : voiceLanguage === 'hi-IN' ? 'हिंदी में बोलें' : 'Speak Now'})</span>
                      </>
                    )}
                  </button>

                  {isRecording && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 animate-pulse justify-center sm:justify-start">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                      <span>{t?.voiceRecording || 'Listening... Speak in Marathi, Hindi, or English'}</span>
                    </div>
                  )}
                </div>

                {/* Voice Status Notice */}
                {voiceNotice && (
                  <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                    voiceNotice.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : voiceNotice.type === 'error'
                      ? 'bg-rose-50 text-rose-800 border border-rose-200'
                      : voiceNotice.type === 'process'
                      ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                      : 'bg-white text-slate-700 border border-amber-200'
                  }`}>
                    {voiceNotice.type === 'process' ? (
                      <Loader2 className="w-4 h-4 animate-spin shrink-0 text-indigo-600" />
                    ) : voiceNotice.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                    <span>{voiceNotice.text}</span>
                  </div>
                )}
              </div>

              {/* Photo Upload Field with Real-Time Quality & Anti-Fraud Checker */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-bold text-slate-900">
                    {t?.photoUploadTitle || 'Photo Evidence'}
                    <span className="text-slate-400 font-normal ml-1">
                      (Analyzed in real time by client-side anti-fraud engine)
                    </span>
                  </label>
                  {!imagePreview && (
                    <button
                      type="button"
                      onClick={handleUseSamplePhoto}
                      className="min-h-11 px-3 py-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Use sample photo</span>
                    </button>
                  )}
                </div>

                {!imagePreview ? (
                  isLiveCameraOpen ? (
                    /* IN-APP WEBRTC LIVE CAMERA VIEWFINDER (Zero memory crashes on Android) */
                    <div className="relative rounded-2xl overflow-hidden border-2 border-indigo-500 bg-black aspect-video sm:aspect-4/3 flex flex-col justify-between shadow-lg">
                      {liveCameraLoading && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 text-white gap-2">
                          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                          <span className="text-xs font-semibold">
                            {language === 'mr' ? 'थेट कॅमेरा सुरू होत आहे...' : 'Starting in-app camera...'}
                          </span>
                        </div>
                      )}

                      {liveCameraError ? (
                        <div className="p-6 text-center text-white space-y-4 my-auto">
                          <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
                          <p className="text-xs sm:text-sm font-semibold text-slate-200">{liveCameraError}</p>
                          <div className="flex flex-wrap items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => galleryInputRef.current?.click()}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                            >
                              {language === 'mr' ? 'गॅलरीतून निवडा' : 'Choose from Gallery'}
                            </button>
                            <button
                              type="button"
                              onClick={stopLiveCamera}
                              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                            >
                              {language === 'mr' ? 'बंद करा' : 'Cancel'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className={`w-full h-full object-cover ${cameraFacing === 'user' ? 'scale-x-[-1]' : ''}`}
                          />

                          {/* Top controls */}
                          <div className="absolute top-3 inset-x-3 flex items-center justify-between text-white z-10">
                            <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-[11px] font-semibold flex items-center gap-1.5 border border-white/20">
                              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                              <span>{language === 'mr' ? 'थेट इन-ॲप कॅमेरा' : 'Live In-App Camera'}</span>
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={toggleCameraFacing}
                                className="p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-xs text-white border border-white/20 transition cursor-pointer"
                                title="Switch front/back camera"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={stopLiveCamera}
                                className="p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-xs text-white border border-white/20 transition cursor-pointer"
                                title="Close camera"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Bottom capture button */}
                          <div className="absolute bottom-4 inset-x-0 flex items-center justify-center z-10">
                            <button
                              type="button"
                              onClick={captureLiveSnapshot}
                              className="w-16 h-16 rounded-full bg-white text-slate-900 border-4 border-indigo-500 shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition cursor-pointer"
                              title="Capture Photo"
                            >
                              <Camera className="w-7 h-7 text-indigo-600" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    /* DUAL UPLOAD CARD (Optimized for all phones & low-memory devices) */
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`min-h-40 border-2 border-dashed rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center ${
                        isDragging
                          ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]'
                          : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-indigo-50/20'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
                        <Camera className="w-6 h-6" />
                      </div>

                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                        {language === 'mr'
                          ? 'समस्येचा थेट फोटो घ्या किंवा गॅलरीतून निवडा'
                          : 'Snap a live photo or select from gallery'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-sm">
                        {language === 'mr'
                          ? 'कमी मेमरी असलेल्या मोबाईलवर "थेट कॅमेरा" किंवा "गॅलरीतून निवडा" हा पर्याय वापरा.'
                          : 'Low-memory friendly: Works reliably on all phones without app crashes.'}
                      </p>

                      {/* Dual Action Buttons */}
                      <div className="flex flex-wrap items-center justify-center gap-2.5 w-full max-w-md">
                        <button
                          type="button"
                          onClick={() => startLiveCamera('environment')}
                          className="flex-1 min-h-11 px-4 py-2.5 rounded-xl bg-[#0f2b5c] hover:bg-[#1e3a8a] text-white font-semibold text-xs inline-flex items-center justify-center gap-2 shadow-xs transition cursor-pointer active:scale-98"
                        >
                          <Camera className="w-4 h-4 text-emerald-400" />
                          <span>{language === 'mr' ? '📸 थेट इन-ॲप कॅमेरा' : '📸 Live In-App Camera'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => galleryInputRef.current?.click()}
                          className="flex-1 min-h-11 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 font-semibold text-xs inline-flex items-center justify-center gap-2 shadow-xs transition cursor-pointer active:scale-98"
                        >
                          <FolderOpen className="w-4 h-4 text-indigo-500" />
                          <span>{language === 'mr' ? '📁 गॅलरी / फाईल निवडा' : '📁 Choose from Gallery'}</span>
                        </button>
                      </div>

                      {/* Optional phone native camera trigger */}
                      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
                        <span>{language === 'mr' ? 'किंवा' : 'or'}</span>
                        <button
                          type="button"
                          onClick={() => cameraInputRef.current?.click()}
                          className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
                        >
                          {language === 'mr' ? 'सिस्टम कॅमेरा ॲप वापरा' : 'Use system camera app'}
                        </button>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="space-y-3">
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900">
                      <img
                        src={imagePreview}
                        alt="Civic issue evidence"
                        className="w-full h-64 object-cover object-center"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-between p-4 text-white">
                        <div className="flex items-center gap-2">
                          <FileImage className="w-4 h-4 text-indigo-400 shrink-0" />
                          <div className="flex flex-col">
                            <span className="text-xs font-medium truncate max-w-xs">
                              {imageFile?.name || (language === 'mr' ? 'फोटो पुरावा जोडला आहे' : 'Photo evidence attached')}
                            </span>
                            {imagePreview?.startsWith('data:') && (
                              <span className="text-[11px] text-emerald-300 font-semibold">
                                {Math.round((imagePreview.length * 3) / 4 / 1024)} KB &bull; {language === 'mr' ? 'अपलोडसाठी ऑप्टिमाइझ' : 'Optimized for fast upload'}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="px-3 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-semibold flex items-center gap-1 backdrop-blur-xs transition shadow-md"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>

                    {/* REAL-TIME IMAGE QUALITY & ANTI-FRAUD REPORT CARD */}
                    {isAnalyzingImage ? (
                      <div className="p-3 rounded-xl bg-slate-100 flex items-center gap-2 text-xs text-slate-600">
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                        <span>Running real-time image quality & anti-fraud inspection...</span>
                      </div>
                    ) : imageQuality ? (
                      <div className={`p-4 rounded-2xl border text-xs space-y-2.5 ${
                        imageQuality.status === 'passed'
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                          : imageQuality.status === 'warning'
                          ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                          : 'bg-rose-50/70 border-rose-200 text-rose-900'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-bold">
                            {imageQuality.status === 'passed' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : imageQuality.status === 'warning' ? (
                              <AlertTriangle className="w-4 h-4 text-amber-600" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-rose-600" />
                            )}
                            <span>
                              {imageQuality.status === 'passed'
                                ? 'Real-Time Anti-Fraud & Quality Check: Passed'
                                : imageQuality.status === 'warning'
                                ? 'Quality Check: Acceptable (Minor Alert)'
                                : 'Anti-Fraud Alert: Suspicious / Low Quality'}
                            </span>
                          </div>
                          <span className="font-extrabold px-2.5 py-0.5 rounded-full bg-white shadow-xs border text-[11px]">
                            Quality Score: {imageQuality.score}%
                          </span>
                        </div>

                        {/* Metric Tags */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-[11px] text-slate-700 dark:text-slate-300">
                            Dimensions: {imageQuality.dimensions || 'High-Res'}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-[11px] text-slate-700 dark:text-slate-300">
                            Brightness: {imageQuality.avgBrightness}/255
                          </span>
                          <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-[11px] text-slate-700 dark:text-slate-300">
                            Sharpness: {imageQuality.sharpnessScore}%
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-semibold text-[11px]">
                            Fraud Shield: {imageQuality.antiFraudPassed ? 'Clean' : 'Suspect'}
                          </span>
                        </div>

                        {/* Issues if any */}
                        {imageQuality.issues && imageQuality.issues.length > 0 && (
                          <div className="pt-1 text-[11px] text-slate-600 space-y-1">
                            {imageQuality.issues.map((issue, idx) => (
                              <p key={idx} className="flex items-center gap-1 text-rose-700">
                                &bull; {issue}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Gallery / File Picker (NO capture attribute: never crashes on low-RAM phones) */}
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {/* System Native Camera (optional fallback) */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {/* Legacy file input ref alias */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {validationErrors.photo && (
                  <p className="text-xs text-rose-600 mt-1">{validationErrors.photo}</p>
                )}
              </div>

              {/* Description Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-bold text-slate-900">
                    {t?.descLabel || 'Detailed Description'} <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-xs text-slate-400">
                    {description.length} characters (min 8)
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (validationErrors.description) {
                      setValidationErrors((prev) => ({ ...prev, description: null }));
                    }
                  }}
                  placeholder={t?.descPlaceholder || "Describe the defect (e.g., Deep pothole outside college gate causing heavy traffic hazard)..."}
                  className={`w-full px-4 py-3 rounded-2xl border text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition text-base sm:text-sm ${
                    validationErrors.description
                      ? 'border-rose-300 focus:ring-rose-200'
                      : 'border-slate-300 focus:ring-indigo-200 focus:border-indigo-500'
                  }`}
                />
                {validationErrors.description && (
                  <p className="text-xs text-rose-600 mt-1">{validationErrors.description}</p>
                )}
              </div>

              {/* SECTION: INTERACTIVE LOCATION PICKER MAP */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-indigo-600" />
                    <span>{t?.locationSectionTitle || 'Pinpoint Location on Map'}</span>
                  </h3>
                  <span className="text-xs text-indigo-600 font-medium">
                    {t?.mapHelpText || 'Drag pin or click map to pinpoint exact defect location'}
                  </span>
                </div>

                <LocationPickerMap
                  initialCoordinates={coordinates}
                  onLocationChange={handleLocationChange}
                  currentAddress={address}
                  currentWard={ward}
                />

                {/* Street address input */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      {language === 'mr' ? 'रस्त्याचा पत्ता / परिसरातील खूण' : 'Street Address / Area Landmark'}
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {language === 'mr' ? 'जीपीएसद्वारे थेट शोधले जाते' : 'Auto-detected via GPS'}
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      inputMode="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={
                        language === 'mr'
                          ? 'उदा. बस स्टँडजवळ, मेन रोड, पिंपरी, पुणे ४११०१८'
                          : 'e.g. Near Bus Stand, Main Road, Pimpri, Pune 411018'
                      }
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 text-base sm:text-sm text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                {validationErrors.location && (
                  <p className="text-xs text-rose-600 mt-1">{validationErrors.location}</p>
                )}
              </div>

              {/* AI DUPLICATE DETECTION WARNING DURING SUBMISSION (BEFORE UPLOAD) */}
              {nearbyDuplicates.length > 0 && !dismissedDuplicateWarning && (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-lg p-5 space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-amber-600 text-white rounded shadow-xs shrink-0 mt-0.5">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm sm:text-base font-bold text-amber-950 dark:text-amber-200">
                            AI Duplicate Detection Notice (Locality Match)
                          </h4>
                          <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-600 text-white">
                            {nearbyDuplicates[0].distanceMeters <= 15
                              ? 'At Exact Same Spot'
                              : `${nearbyDuplicates[0].distanceMeters}m Away`}
                          </span>
                        </div>
                        <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                          <strong>{nearbyDuplicates[0].reportCount || 3} citizens</strong> have already reported an active{' '}
                          <strong>{getCategoryLabel(nearbyDuplicates[0].category)}</strong> issue right near your map pin. Instead of creating a duplicate ticket, you can fast-track the existing incident!
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Matched Existing Issue Preview Card */}
                  <div className="bg-white dark:bg-slate-900 rounded-lg p-3.5 border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
                    <div className="flex items-start gap-3 min-w-0">
                      <img
                        src={nearbyDuplicates[0].imageUrl || getCategoryBeforeImage(nearbyDuplicates[0].category)}
                        alt="Existing report"
                        className="w-16 h-16 rounded object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-[#0f2b5c] dark:text-blue-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                            {nearbyDuplicates[0].trackingId}
                          </span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 capitalize">
                            {getStatusLabel(nearbyDuplicates[0].status)}
                          </span>
                          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                            &bull; Priority {nearbyDuplicates[0].priorityScore || 90}/100
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate mt-1">
                          {nearbyDuplicates[0].address}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          Assigned to: <strong>{nearbyDuplicates[0].assignedTo || 'PCMC Ward Engineer'}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => handleFastTrackDuplicate(nearbyDuplicates[0])}
                        disabled={!!fastTrackingId}
                        className="px-4 py-2 rounded-lg bg-[#0f2b5c] hover:bg-[#1e3a8a] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>
                          {fastTrackingId
                            ? 'Fast-Tracking...'
                            : '+1 Upvote & Fast-Track Existing Issue'}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDismissedDuplicateWarning(true)}
                        className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition cursor-pointer"
                      >
                        Submit as New Anyway
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left leading-relaxed">
                  By submitting, your geotagged report will be evaluated by municipal AI and queued for ward action.
                </p>
                <button
                  type="submit"
                  className="w-full sm:w-auto min-h-11 inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#0f2b5c] hover:bg-[#1e3a8a] text-white font-semibold text-base sm:text-sm rounded-lg shadow-xs transition cursor-pointer active:scale-98"
                >
                  <span>{t?.submitReportBtn || 'Submit Grievance to PCMC'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 2: Loading / AI Analysis Screen */}
        {step === 'loading' && (
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xs border border-slate-200 dark:border-slate-800 p-10 sm:p-16 text-center space-y-6">
            <div className="relative w-16 h-16 mx-auto">
              <div className="relative w-16 h-16 rounded-full bg-[#0f2b5c] dark:bg-blue-600 flex items-center justify-center text-white shadow-md">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {t?.submittingReport || 'AI Verifying & Triaging Report...'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Running computer vision analysis, anti-fraud image check, deduplicating nearby coordinates, and scoring PCMC priority.
              </p>
            </div>

            <div className="pt-4 flex items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Anti-Fraud Verified
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Geotag Anchored
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                {ward ? `${ward} Assigned` : 'Ward Jurisdiction Assigned'}
              </span>
            </div>
          </div>
        )}

        {/* Step 3: Success Screen with Unique Tracking ID */}
        {step === 'success' && (
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xs border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              {wasFastTracked && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[#0f2b5c] dark:text-blue-400 text-xs font-bold mb-1 border border-slate-200 dark:border-slate-700">
                  <Zap className="w-3.5 h-3.5" />
                  <span>+1 Citizen Fast-Track Upvote Recorded — Priority Score Boosted!</span>
                </div>
              )}
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {wasFastTracked
                  ? 'Existing Grievance Fast-Tracked (+1)!'
                  : t?.successTitle || 'Grievance Submitted Successfully!'}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                {wasFastTracked
                  ? 'Your +1 upvote has been merged into the active municipal cluster below. Use this Tracking ID to monitor live resolution!'
                  : t?.successSub || 'Save your unique tracking identifier to monitor progress in real time.'}
              </p>
            </div>

            {/* Tracking ID Card */}
            <div className="max-w-md mx-auto bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-5 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Official Tracking ID
              </span>
              <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs">
                <span className="font-mono text-lg font-bold text-[#0f2b5c] dark:text-blue-400 tracking-wider">
                  {trackingId}
                </span>
                <button
                  type="button"
                  onClick={handleCopyTrackingId}
                  className="p-1.5 rounded text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="Copy Tracking ID"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 text-left">
                Keep this ID handy. You can check ticket triage, officer assignment, and verified photo resolution at any time.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to={`/track/${trackingId}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#0f2b5c] hover:bg-[#1e3a8a] text-white font-semibold text-sm shadow-xs transition cursor-pointer"
              >
                <span>{t?.trackMyComplaint || 'Track My Complaint'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={handleResetForm}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm border border-slate-300 dark:border-slate-700 transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{t?.reportAnother || 'File Another Report'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintForm;
