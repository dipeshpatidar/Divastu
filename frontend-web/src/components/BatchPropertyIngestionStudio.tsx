import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Mic,
  MicOff,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  Scissors,
  Image as ImageIcon,
  Building2,
  Phone,
  MapPin,
  IndianRupee,
  Layers,
  ArrowRight,
  Trash2,
  Copy
} from 'lucide-react';
import { propertyService } from '../services/propertyService';
import { compressImageToWebP } from '../utils/imageOptimizer';

interface StagedProperty {
  id: string;
  promptIndex: number;
  title: string;
  bhk: string;
  type: string;
  sector: string;
  city: string;
  address: string;
  rentAmount: number;
  rentVal: string;
  depositVal: string;
  ownerPhone: string;
  furnishingStatus: string;
  vastuFacing: string;
  mediaUrls: string[];
  localPhotos: File[];
  localPhotoPreviews: string[];
  isConfirmed: boolean;
  isValid: boolean;
  missingFields: string[];
}

interface BatchPropertyIngestionStudioProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (publishedCount: number) => void;
}

const COLOR_PALETTES = [
  { border: 'border-blue-500/40', bg: 'bg-blue-500/10', text: 'text-blue-400', badge: 'bg-blue-500/20 text-blue-300' },
  { border: 'border-emerald-500/40', bg: 'bg-emerald-500/10', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300' },
  { border: 'border-purple-500/40', bg: 'bg-purple-500/10', text: 'text-purple-400', badge: 'bg-purple-500/20 text-purple-300' },
  { border: 'border-amber-500/40', bg: 'bg-amber-500/10', text: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300' },
  { border: 'border-cyan-500/40', bg: 'bg-cyan-500/10', text: 'text-cyan-400', badge: 'bg-cyan-500/20 text-cyan-300' },
];
const ADMIN_PHONE_PATTERN = /^\\+91\\s?[6-9]\\d{4}[\\s-]?\\d{5}$/;

export const BatchPropertyIngestionStudio: React.FC<BatchPropertyIngestionStudioProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [rawPrompts, setRawPrompts] = useState<string>(
    `1) 2 BHK Flat in Vijay Nagar, Rent: 18000, Owner: +91 98260 11111\n2) 3 BHK House in Palasia, Rent: 35000, Owner: +91 98260 22222\n3) 1 RK Flat in Bhawarkua, Rent: 8000, Owner: +91 98260 33333`
  );
  const [stagedCards, setStagedCards] = useState<StagedProperty[]>([]);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [detectedCount, setDetectedCount] = useState<number>(3);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const batchSpeechBaseTextRef = useRef<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Live Delimiter Property Counting
  useEffect(() => {
    if (!rawPrompts.trim()) {
      setDetectedCount(0);
      return;
    }
    const chunks = rawPrompts
      .split(/(?:\r?\n\s*\r?\n+|---|(?:\b(?:next\s*property|next\s*flat)\b)|^(?:\d+[\)\.]|#\d+)\s+)/gmi)
      .filter((c) => c && c.trim().length >= 8);
    setDetectedCount(Math.max(1, chunks.length));
  }, [rawPrompts]);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN'; // Optimized for Indian English & Hinglish terms

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = 0; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += (finalTranscript ? ' ' : '') + text.trim();
        } else {
          interimTranscript += (interimTranscript ? ' ' : '') + text.trim();
        }
      }

      // Voice cue splitter: if user said "next property" or "next flat", automatically inject clean numbered line
      let formattedFinal = finalTranscript
        .replace(/(?:next\s*property|next\s*flat|next\s*one|agli\s*property|dusra\s*flat)/gi, '\n\n')
        .replace(/(?:rent\s+is\s+|kiraya\s+)/gi, 'Rent: ');

      const base = batchSpeechBaseTextRef.current || '';
      const separator = base && !base.endsWith('\n') ? ' ' : '';
      const combined = [base, formattedFinal, interimTranscript].filter(Boolean).join(separator);
      setRawPrompts(combined);
    };

    recognition.onerror = (err: any) => {
      console.warn('Speech recognition warning:', err);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const toggleSpeech = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        batchSpeechBaseTextRef.current = rawPrompts.trim();
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start voice listener', err);
      }
    }
  };

  // 1. Batch Parse Prompts via Spring Boot REST API
  const handleParseBatch = async () => {
    if (!rawPrompts.trim()) return;
    setIsParsing(true);

    try {
      const dtos = await propertyService.parseBatchPrompts(rawPrompts);
      const mapped: StagedProperty[] = dtos.map((dto: any, idx: number) => {
        const hasPhone = Boolean(dto.ownerPhone && ADMIN_PHONE_PATTERN.test(dto.ownerPhone.trim()));
        const hasSector = Boolean(dto.sector && dto.sector !== 'Not Specified');
        const hasCity = Boolean(dto.city && dto.city !== 'Not Specified');
        const hasRent = Boolean(dto.rentAmount && dto.rentAmount > 0);
        const hasBhk = Boolean(dto.bhk && dto.bhk !== 'Unspecified');
        const hasType = Boolean(dto.type && dto.type !== 'Not Specified');
        const hasDeposit = Boolean(dto.depositVal && dto.depositVal !== 'Not Specified' && dto.depositVal !== 'Unspecified');

        const missing = new Set<string>();
        if (!hasPhone) missing.add('Owner Phone (+91)');
        if (!hasSector) missing.add('Locality / Sector');
        if (!hasCity) missing.add('City');
        if (!hasRent) missing.add('Monthly Rent');
        if (!hasBhk) missing.add('BHK Layout');
        if (!hasType) missing.add('Property Type');
        if (!hasDeposit) missing.add('Security Deposit');

        return {
          id: `staged-${idx}-${Date.now()}`,
          promptIndex: dto.promptIndex || idx + 1,
          title: dto.title || 'Untitled property',
          bhk: dto.bhk === 'Unspecified' ? '' : (dto.bhk || ''),
          type: dto.type === 'Not Specified' ? '' : (dto.type || ''),
          sector: dto.sector || '',
          city: dto.city || '',
          address: dto.address || '',
          rentAmount: dto.rentAmount || 0,
          rentVal: dto.rentVal || 'Unspecified',
          depositVal: dto.depositVal || 'Unspecified',
          ownerPhone: dto.ownerPhone || '',
          furnishingStatus: dto.furnishingStatus || 'UNSPECIFIED',
          vastuFacing: dto.vastuFacing || 'Not Specified',
          mediaUrls: dto.mediaUrls || [],
          localPhotos: [],
          localPhotoPreviews: [],
          isConfirmed: false,
          isValid: false,
          missingFields: Array.from(missing)
        };
      });

      setStagedCards(mapped);
      if (mapped.length > 0) {
        setActiveCardId(mapped[0].id);
      }
    } catch (err) {
      console.error('Failed to parse batch prompts:', err);
      alert('Error parsing batch prompts. Please verify backend connection.');
    } finally {
      setIsParsing(false);
    }
  };

  // Add photos to a specific card with client-side WebP compression
  const attachPhotosToCard = async (cardId: string, files: FileList | File[]) => {
    const card = stagedCards.find((c) => c.id === cardId);
    if (!card) return;

    const fileArray = Array.from(files);
    const compressedFiles: File[] = [];
    const previews: string[] = [];

    for (const f of fileArray) {
      const optimized = await compressImageToWebP(f, 1920, 1080, 0.82);
      compressedFiles.push(optimized);
      previews.push(URL.createObjectURL(optimized));
    }

    setStagedCards((prev) =>
      prev.map((c) =>
        c.id === cardId
          ? {
              ...c,
              localPhotos: [...c.localPhotos, ...compressedFiles],
              localPhotoPreviews: [...c.localPhotoPreviews, ...previews]
            }
          : c
      )
    );
  };

  // Direct Clipboard Pasting (Cmd+V / Ctrl+V) onto Active Card
  const handleCardPaste = useCallback(
    async (e: React.ClipboardEvent, cardId: string) => {
      const items = e.clipboardData.items;
      const imageFiles: File[] = [];

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) imageFiles.push(file);
        }
      }

      if (imageFiles.length > 0) {
        e.preventDefault();
        await attachPhotosToCard(cardId, imageFiles);
      }
    },
    [stagedCards]
  );

  // Remove photo from card
  const handleRemovePhoto = (cardId: string, photoIdx: number) => {
    setStagedCards((prev) =>
      prev.map((c) => {
        if (c.id !== cardId) return c;
        const newFiles = [...c.localPhotos];
        const newPreviews = [...c.localPhotoPreviews];
        newFiles.splice(photoIdx, 1);
        newPreviews.splice(photoIdx, 1);
        return { ...c, localPhotos: newFiles, localPhotoPreviews: newPreviews };
      })
    );
  };

  // Card Field Inline Quick-Edit
  const handleUpdateField = (cardId: string, field: keyof StagedProperty, value: any) => {
    setStagedCards((prev) =>
      prev.map((c) => {
        if (c.id !== cardId) return c;
        const updated = { ...c, [field]: value };
        const hasPhone = ADMIN_PHONE_PATTERN.test(updated.ownerPhone.trim());
        const hasSector = Boolean(updated.sector && updated.sector.trim().length > 0);
        const hasCity = Boolean(updated.city && updated.city.trim().length > 0 && updated.city !== 'Not Specified');
        const hasRent = Boolean(updated.rentAmount && updated.rentAmount > 0);
        const hasBhk = Boolean(updated.bhk && updated.bhk.trim().length > 0);
        const hasType = Boolean(updated.type && updated.type.trim().length > 0 && updated.type !== 'Not Specified');
        const hasDeposit = Boolean(updated.depositVal && updated.depositVal !== 'Unspecified');
        const missing: string[] = [];
        if (!hasPhone) missing.push('Owner Phone (+91)');
        if (!hasSector) missing.push('Locality / Sector');
        if (!hasCity) missing.push('City');
        if (!hasRent) missing.push('Monthly Rent');
        if (!hasBhk) missing.push('BHK Layout');
        if (!hasType) missing.push('Property Type');
        if (!hasDeposit) missing.push('Security Deposit');

        updated.isValid = updated.isConfirmed && missing.length === 0;
        updated.missingFields = missing;
        return updated;
      })
    );
  };

  const handleConfirmCard = (cardId: string, isConfirmed: boolean) => {
    setStagedCards((prev) => prev.map((card) => {
      if (card.id !== cardId) return card;
      const missing = [...card.missingFields];
      return {
        ...card,
        isConfirmed,
        isValid: isConfirmed && missing.length === 0
      };
    }));
  };

  // Batch Publish All Staged Properties
  const handlePublishAll = async () => {
    const validCards = stagedCards.filter((c) => c.isValid);
    if (validCards.length === 0) {
      alert('Please fix missing required fields on staged cards before publishing.');
      return;
    }

    setIsPublishing(true);

    try {
      const payloadListings = validCards.map((c) => ({
        title: c.title,
        bhk: c.bhk,
        type: c.type,
        sector: c.sector,
        city: c.city,
        address: c.address,
        rentAmount: c.rentAmount,
        depositVal: c.depositVal,
        ownerPhone: c.ownerPhone,
        furnishingStatus: c.furnishingStatus,
        vastuFacing: c.vastuFacing,
        mediaUrls: c.mediaUrls,
        adminVerified: c.isConfirmed
      }));

      const res = await propertyService.createBatchProperties(payloadListings);

      // Upload local compressed photos for created listings if any
      if (res.createdIds && Array.isArray(res.createdIds)) {
        for (let i = 0; i < res.createdIds.length; i++) {
          const propId = res.createdIds[i];
          const card = validCards[i];
          if (card && card.localPhotos.length > 0) {
            try {
              await propertyService.uploadPhotosToCloudinary(propId, card.localPhotos);
            } catch (mediaErr) {
              console.warn(`Photos upload deferred for property ${propId}:`, mediaErr);
            }
          }
        }
      }

      window.dispatchEvent(new Event('pathome_property_published'));
      onSuccess(res.successCount || validCards.length);
      onClose();
    } catch (err) {
      console.error('Batch publish failed:', err);
      alert('Failed to publish batch properties. Check server logs.');
    } finally {
      setIsPublishing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Dim Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-all"
        />

        {/* 3D Spring Tilt Pop-in Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, rotateX: 14 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          exit={{ opacity: 0, scale: 0.85, rotateX: 14 }}
          transition={{ type: 'spring', stiffness: 480, damping: 25 }}
          className="relative w-full max-w-7xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden z-10 text-slate-100"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-slate-950 shadow-lg shadow-orange-500/20">
                <Sparkles className="w-5 h-5 font-black" />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                  Multi-Property & Voice Ingestion Studio
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Review Required
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Dictate or paste multi-unit broker listings. Auto-splits, stages photos, and batch-publishes in seconds.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Content Split Screen */}
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Panel: Voice & Text Prompt Input (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase text-slate-300">Prompt / Voice Feed</span>
                  <span className="px-2 py-0.5 text-[11px] font-black rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    ⚡ {detectedCount} {detectedCount === 1 ? 'Unit' : 'Units'} Detected
                  </span>
                </div>

                {speechSupported && (
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={toggleSpeech}
                    type="button"
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
                      isListening
                        ? 'bg-rose-500 text-white shadow-rose-500/30 animate-pulse'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-amber-400" />}
                    {isListening ? 'Listening (Say "Next")...' : '🎤 Voice Input'}
                  </motion.button>
                )}
              </div>

              <div className="relative flex-1 min-h-[220px]">
                <textarea
                  ref={textareaRef}
                  value={rawPrompts}
                  onChange={(e) => setRawPrompts(e.target.value)}
                  placeholder={`Speak or paste multiple listings here...\n\nExample:\n1) 2 BHK in Vijay Nagar rent 18 hazar owner +91 98260 12345\nnext property\n3 BHK in Palasia rent 35 hazar owner +91 98260 54321`}
                  className="w-full h-full min-h-[260px] p-4 text-xs font-mono bg-slate-950/80 border border-slate-700/80 rounded-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none shadow-inner"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    setRawPrompts(
                      `1) 2 BHK Flat in Vijay Nagar, Rent 18 hazar, Deposit 2 mahina, Owner: +91 98260 12345\n` +
                      `2) 3 BHK House in Palasia, Rent 35k, Furnished, Phone: +91 98260 67890\n` +
                      `3) 1 RK Flat in Bhawarkua, Rent 8000, Call: +91 98260 99999`
                    )
                  }
                  className="text-[11px] text-amber-400/80 hover:text-amber-300 underline underline-offset-2 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" /> Load Sample Prompt
                </button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleParseBatch}
                  disabled={isParsing || !rawPrompts.trim()}
                  className="px-5 py-2.5 rounded-xl font-black text-xs bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 shadow-lg shadow-orange-500/20 hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isParsing ? (
                    <span>Extracting property details…</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Extract & Stage Units</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            {/* Right Panel: Staging Cards & Filmstrip (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {stagedCards.length === 0 ? (
                <div className="h-full min-h-[360px] flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-2xl p-8 text-center bg-slate-950/40">
                  <div className="w-14 h-14 rounded-3xl bg-slate-800/80 flex items-center justify-center text-slate-400 mb-3">
                    <Building2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-200">No Units Staged Yet</h3>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">
                    Paste raw text or click <span className="text-amber-400 font-bold">🎤 Voice Input</span> on the left, then click <span className="text-amber-400 font-bold">"Extract & Stage Units"</span>.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {/* Magnetic Filmstrip Overview Ribbon */}
                  <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-2xl shadow-md">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2">
                      <span className="flex items-center gap-1.5">
                        <Scissors className="w-3.5 h-3.5 text-amber-400" />
                        Unit Timeline Ribbon
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {stagedCards.length} {stagedCards.length === 1 ? 'Unit' : 'Units'} Staged
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      {stagedCards.map((card, idx) => {
                        const palette = COLOR_PALETTES[idx % COLOR_PALETTES.length];
                        const photoCount = card.localPhotos.length + card.mediaUrls.length;
                        return (
                          <button
                            key={card.id}
                            onClick={() => setActiveCardId(card.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 whitespace-nowrap ${
                              activeCardId === card.id
                                ? `${palette.bg} ${palette.border} ${palette.text} shadow-md`
                                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <span className="font-mono">#{idx + 1}</span>
                            <span>{card.bhk} {card.sector || 'Unit'}</span>
                            <span className="px-1.5 py-0.2 rounded-md bg-slate-800 text-[10px] text-slate-300 font-mono">
                              📸 {photoCount}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Staged Cards Grid */}
                  <div className="flex flex-col gap-3.5 max-h-[500px] overflow-y-auto pr-1">
                    {stagedCards.map((card, idx) => {
                      const palette = COLOR_PALETTES[idx % COLOR_PALETTES.length];
                      const totalPhotos = card.localPhotos.length + card.mediaUrls.length;

                      return (
                        <div
                          key={card.id}
                          tabIndex={0}
                          onPaste={(e) => handleCardPaste(e, card.id)}
                          onClick={() => setActiveCardId(card.id)}
                          className={`p-4 rounded-2xl border transition-all bg-slate-950/70 shadow-lg ${
                            activeCardId === card.id ? `${palette.border} ring-1 ${palette.border}` : 'border-slate-800/80 hover:border-slate-700'
                          }`}
                        >
                          {/* Card Header */}
                          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                            <div className="flex items-center gap-2.5">
                              <span className={`px-2 py-0.5 rounded-lg text-xs font-black uppercase font-mono ${palette.badge}`}>
                                #{idx + 1}
                              </span>
                              <input
                                type="text"
                                value={card.title}
                                onChange={(e) => handleUpdateField(card.id, 'title', e.target.value)}
                                className="text-xs font-bold text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-amber-500 focus:outline-none max-w-[240px] truncate"
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              {card.isValid ? (
                                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                                  <CheckCircle2 className="w-3 h-3" /> Ready
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30" title={card.missingFields.join(', ')}>
                                  <AlertCircle className="w-3 h-3" /> Needs {card.missingFields[0]}
                                </span>
                              )}
                            </div>
                          </div>

                          <label className="mb-3 flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-[11px] text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={card.isConfirmed}
                              onChange={(e) => handleConfirmCard(card.id, e.target.checked)}
                              className="h-3.5 w-3.5 accent-emerald-500"
                            />
                            I reviewed this listing and confirm its values are ready to publish.
                          </label>

                          {/* Inline Fields Row */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3 text-xs">
                            <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">BHK</label>
                              <input
                                type="text"
                                value={card.bhk}
                                onChange={(e) => handleUpdateField(card.id, 'bhk', e.target.value)}
                                className="w-full bg-transparent font-bold text-slate-100 focus:outline-none"
                              />
                            </div>

                            <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Sector</label>
                              <input
                                type="text"
                                value={card.sector}
                                onChange={(e) => handleUpdateField(card.id, 'sector', e.target.value)}
                                className="w-full bg-transparent font-bold text-slate-100 focus:outline-none"
                              />
                            </div>

                            <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">City</label>
                              <input
                                type="text"
                                value={card.city === 'Not Specified' ? '' : card.city}
                                placeholder="Indore"
                                onChange={(e) => handleUpdateField(card.id, 'city', e.target.value)}
                                className="w-full bg-transparent font-bold text-slate-100 focus:outline-none"
                              />
                            </div>

                            <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Property Type</label>
                              <input
                                type="text"
                                value={card.type}
                                placeholder="Flat, House, Plot"
                                onChange={(e) => handleUpdateField(card.id, 'type', e.target.value)}
                                className="w-full bg-transparent font-bold text-slate-100 focus:outline-none"
                              />
                            </div>

                            <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Rent (₹)</label>
                              <input
                                type="number"
                                value={card.rentAmount}
                                onChange={(e) => handleUpdateField(card.id, 'rentAmount', Number(e.target.value))}
                                className="w-full bg-transparent font-bold text-slate-100 focus:outline-none"
                              />
                            </div>

                            <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Owner Phone</label>
                              <input
                                type="text"
                                value={card.ownerPhone}
                                placeholder="+91 98260 12345"
                                onChange={(e) => handleUpdateField(card.id, 'ownerPhone', e.target.value)}
                                className={`w-full bg-transparent font-bold focus:outline-none ${!card.ownerPhone.startsWith('+') ? 'text-amber-400' : 'text-slate-100'}`}
                              />
                            </div>

                            <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Security Deposit</label>
                              <input
                                type="text"
                                value={card.depositVal === 'Unspecified' ? '' : card.depositVal}
                                placeholder="₹60,000 or 2 months"
                                onChange={(e) => handleUpdateField(card.id, 'depositVal', e.target.value || 'Unspecified')}
                                className="w-full bg-transparent font-bold text-slate-100 focus:outline-none"
                              />
                            </div>
                          </div>

                          {/* Photos Dropzone & Clipboard Paste Receiver */}
                          <div className="mt-2.5">
                            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                              <span>📸 Photos ({totalPhotos}) • Drop or Paste (Cmd+V)</span>
                              <label className="cursor-pointer text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1">
                                <Plus className="w-3 h-3" /> Add Photos
                                <input
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  onChange={(e) => e.target.files && attachPhotosToCard(card.id, e.target.files)}
                                  className="hidden"
                                />
                              </label>
                            </div>

                            {/* Thumbnail Strip */}
                            {totalPhotos > 0 ? (
                              <div className="flex items-center gap-2 overflow-x-auto py-1">
                                {card.localPhotoPreviews.map((src, pIdx) => (
                                  <div key={pIdx} className="relative group w-14 h-14 rounded-xl overflow-hidden border border-slate-700 flex-shrink-0">
                                    <img src={src} alt="Photo" className="w-full h-full object-cover" />
                                    <button
                                      type="button"
                                      onClick={() => handleRemovePhoto(card.id, pIdx)}
                                      className="absolute inset-0 bg-slate-950/70 text-rose-400 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}

                                {card.mediaUrls.map((url, uIdx) => (
                                  <div key={`url-${uIdx}`} className="relative w-14 h-14 rounded-xl overflow-hidden border border-indigo-500/40 flex-shrink-0">
                                    <img src={url} alt="In-Prompt URL" className="w-full h-full object-cover" />
                                    <span className="absolute bottom-0 inset-x-0 bg-indigo-950/90 text-[8px] font-bold text-center text-indigo-300 truncate px-1">
                                      URL
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  if (e.dataTransfer.files) attachPhotosToCard(card.id, e.dataTransfer.files);
                                }}
                                className="border border-dashed border-slate-800 rounded-xl py-3 px-4 text-center hover:border-slate-700 transition-colors cursor-pointer bg-slate-900/40"
                              >
                                <p className="text-[11px] text-slate-400">
                                  Drag photos here or copy on WhatsApp Web and press <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px]">Cmd+V</kbd>
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/80">
            <div className="text-xs text-slate-400">
              {stagedCards.length > 0 && (
                <span>
                  🟢 <strong className="text-white">{stagedCards.filter((c) => c.isValid).length}</strong> of{' '}
                  <strong className="text-white">{stagedCards.length}</strong> units ready to publish.
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handlePublishAll}
                disabled={isPublishing || stagedCards.filter((c) => c.isValid).length === 0}
                className="px-6 py-2.5 rounded-xl font-black text-xs bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-lg shadow-emerald-500/20 hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isPublishing ? (
                  <span>Publishing to PostgreSQL...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Publish All Valid Units ({stagedCards.filter((c) => c.isValid).length})</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
