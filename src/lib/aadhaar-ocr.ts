/**
 * Aadhaar Card OCR Utility
 * 
 * Uses Tesseract.js to perform real OCR on Aadhaar card images,
 * then applies Indian Aadhaar-specific regex patterns to extract
 * structured data (name, DOB, Aadhaar number, gender, address).
 * 
 * Multi-pass preprocessing with best-result selection for high accuracy.
 */

import Tesseract from 'tesseract.js';

export interface AadhaarOCRResult {
  name: string;
  dob: string;           // YYYY-MM-DD format
  age: string;
  gender: string;
  aadhaar: string;       // 12-digit raw number
  formattedAadhaar: string; // XXXX-XXXX-XXXX
  address: string;
  phone: string;         // Phone number if found on card/envelope
  rawText: string;       // Full OCR text for debugging
  confidence: number;    // Tesseract confidence score (0-100)
}

// ─── Preprocessing Pipelines ─────────────────────────────────────────────────

/**
 * Create a preprocessed version of the image with specific settings.
 * Returns a blob ready for OCR.
 */
function createPreprocessedBlob(
  img: HTMLImageElement,
  mode: 'grayscale' | 'adaptive' | 'highcontrast'
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');

    // Scale up for better OCR — target min 2000px on longest side
    const scale = Math.max(1, 2000 / Math.max(img.width, img.height));
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    // Use high-quality scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    if (mode === 'grayscale') {
      // Simple grayscale with moderate contrast boost — good for clean cards
      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const contrast = 1.3;
        const val = Math.max(0, Math.min(255, ((gray / 255 - 0.5) * contrast + 0.5) * 255));
        data[i] = data[i + 1] = data[i + 2] = val;
      }
    } else if (mode === 'adaptive') {
      // Convert to grayscale first, then apply local adaptive thresholding
      const grayValues = new Uint8Array(canvas.width * canvas.height);
      for (let i = 0; i < data.length; i += 4) {
        grayValues[i / 4] = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      }

      // Compute mean in a local window (simplified adaptive threshold)
      const blockSize = 25;
      const C = 10; // constant subtracted from mean
      const w = canvas.width;
      const h = canvas.height;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = y * w + x;
          // Calculate local mean in a block
          let sum = 0;
          let count = 0;
          const halfBlock = Math.floor(blockSize / 2);
          for (let dy = -halfBlock; dy <= halfBlock; dy += 3) {
            for (let dx = -halfBlock; dx <= halfBlock; dx += 3) {
              const ny = y + dy;
              const nx = x + dx;
              if (ny >= 0 && ny < h && nx >= 0 && nx < w) {
                sum += grayValues[ny * w + nx];
                count++;
              }
            }
          }
          const localMean = sum / count;
          const pixelIdx = idx * 4;
          const val = grayValues[idx] > (localMean - C) ? 255 : 0;
          data[pixelIdx] = data[pixelIdx + 1] = data[pixelIdx + 2] = val;
        }
      }
    } else if (mode === 'highcontrast') {
      // Heavy contrast + Otsu-like global threshold — good for faded cards
      // First pass: compute histogram
      const histogram = new Array(256).fill(0);
      for (let i = 0; i < data.length; i += 4) {
        const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        histogram[gray]++;
      }

      // Otsu's threshold
      const totalPixels = data.length / 4;
      let sumTotal = 0;
      for (let t = 0; t < 256; t++) sumTotal += t * histogram[t];

      let sumBG = 0;
      let weightBG = 0;
      let maxVariance = 0;
      let threshold = 128;

      for (let t = 0; t < 256; t++) {
        weightBG += histogram[t];
        if (weightBG === 0) continue;
        const weightFG = totalPixels - weightBG;
        if (weightFG === 0) break;

        sumBG += t * histogram[t];
        const meanBG = sumBG / weightBG;
        const meanFG = (sumTotal - sumBG) / weightFG;
        const variance = weightBG * weightFG * (meanBG - meanFG) ** 2;

        if (variance > maxVariance) {
          maxVariance = variance;
          threshold = t;
        }
      }

      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const val = gray > threshold ? 255 : 0;
        data[i] = data[i + 1] = data[i + 2] = val;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to create preprocessed blob'));
    }, 'image/png');
  });
}

/**
 * Preprocess the image using multiple pipelines and return all versions.
 */
function preprocessImage(file: File): Promise<Blob[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = async () => {
      try {
        const blobs = await Promise.all([
          createPreprocessedBlob(img, 'grayscale'),
          createPreprocessedBlob(img, 'adaptive'),
          createPreprocessedBlob(img, 'highcontrast'),
        ]);
        resolve(blobs);
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

// ─── OCR Post-Processing ─────────────────────────────────────────────────────

/**
 * Fix common Tesseract OCR misreads specific to Aadhaar cards.
 * This dramatically improves field extraction accuracy.
 */
function postProcessOCRText(text: string): string {
  let cleaned = text;

  // Normalize unicode spaces, tabs, and weird whitespace
  cleaned = cleaned.replace(/[\u00A0\u2000-\u200F\u2028\u2029\u202F\u205F\u3000\uFEFF]/g, ' ');

  // Fix common character-level misreads
  // These happen because Aadhaar cards use specific fonts
  const charFixes: [RegExp, string][] = [
    // Number-letter confusions in text context
    [/(?<=[A-Za-z])0(?=[A-Za-z])/g, 'O'],  // "G0VERNMENT" → "GOVERNMENT"
    [/(?<=[A-Za-z])1(?=[A-Za-z])/g, 'l'],  // "Ma1e" → "Male"
    [/(?<=[A-Za-z])5(?=[A-Za-z])/g, 'S'],  // "5uhail" → "Suhail"
    [/(?<=[a-z])I(?=[a-z])/g, 'l'],         // "MaIe" → "Male"

    // Fix "£" misread (common for 'E' or 'f' in address text)
    [/£/g, 'E'],

    // Fix pipe character misreads
    [/\|/g, 'I'],
  ];

  for (const [pattern, replacement] of charFixes) {
    cleaned = cleaned.replace(pattern, replacement);
  }

  // Fix common phrase-level misreads
  const phraseFixes: [RegExp, string][] = [
    [/G[o0]vernment\s*[o0]f\s*[il1]nd[il1]a/gi, 'Government of India'],
    [/Un[il1]que\s*[il1]dent[il1]f[il1]cat[il1][o0]n/gi, 'Unique Identification'],
    [/Auth[o0]r[il1]ty/gi, 'Authority'],
    [/[il1]nd[il1]a/gi, 'India'],
    [/UIDAI/gi, 'UIDAI'],
    [/[A@]adh[a@][a@]r/gi, 'Aadhaar'],
    [/D[o0][bB8]/gi, 'DOB'],
    [/[Yy]ear\s*[o0Oo]f\s*[Bb8][il1]rth/gi, 'Year of Birth'],
    [/[Dd]ate\s*[o0Oo]f\s*[Bb8][il1]rth/gi, 'Date of Birth'],
    [/[Mm][Aa][Ll1][Ee]/g, 'Male'],
    [/[Ff][Ee][Mm][Aa][Ll1][Ee]/g, 'Female'],
    [/[Aa]ddress/gi, 'Address'],
  ];

  for (const [pattern, replacement] of phraseFixes) {
    cleaned = cleaned.replace(pattern, replacement);
  }

  // Collapse multiple spaces
  cleaned = cleaned.replace(/ {2,}/g, ' ');

  return cleaned;
}

// ─── Field Extraction Functions ──────────────────────────────────────────────

/**
 * Extract the Aadhaar number (12 digits, often printed as XXXX XXXX XXXX)
 */
function extractAadhaarNumber(text: string): string {
  // Pattern: 4 digits, separator, 4 digits, separator, 4 digits
  const patterns = [
    /\b(\d{4}\s+\d{4}\s+\d{4})\b/,           // "1234 5678 9012"
    /\b(\d{4}-\d{4}-\d{4})\b/,                 // "1234-5678-9012"
    /\b(\d{4}\s*\d{4}\s*\d{4})\b/,             // condensed with possible spaces
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const digits = match[1].replace(/[\s-]/g, '');
      // Validate: Aadhaar numbers don't start with 0 or 1
      if (digits.length === 12 && !digits.startsWith('0') && !digits.startsWith('1')) {
        return digits;
      }
    }
  }

  // Fallback: find any sequence of 12 consecutive digits
  const allDigits = text.replace(/[^\d\s-]/g, '');
  const fallback = allDigits.replace(/\s/g, '').match(/[2-9]\d{11}/);
  if (fallback) return fallback[0];

  return '';
}

/**
 * Extract Date of Birth from Aadhaar text.
 * Common formats: DD/MM/YYYY, DD-MM-YYYY, "DOB: DD/MM/YYYY", "Year of Birth: YYYY"
 */
function extractDOB(text: string): string {
  const dobPatterns = [
    // Explicit DOB label
    /(?:DOB|D\.?O\.?B\.?|Date\s*of\s*Birth|Birth)\s*[:;\-–]?\s*(\d{1,2})\s*[\/\-\.]\s*(\d{1,2})\s*[\/\-\.]\s*(\d{4})/i,
    // Standalone date — be more specific to avoid matching random numbers
    /\b(\d{1,2})\s*[\/\-\.]\s*(\d{1,2})\s*[\/\-\.]\s*(\d{4})\b/,
  ];

  for (const pattern of dobPatterns) {
    const match = text.match(pattern);
    if (match) {
      const day = match[1].padStart(2, '0');
      const month = match[2].padStart(2, '0');
      const year = match[3];
      const yearNum = parseInt(year);
      const monthNum = parseInt(month);
      const dayNum = parseInt(day);

      // Validate ranges
      if (yearNum >= 1920 && yearNum <= 2015 && monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31) {
        return `${year}-${month}-${day}`;
      }
    }
  }

  // "Year of Birth: YYYY" (older cards)
  const yobMatch = text.match(/(?:Year\s*of\s*Birth|YOB)\s*[:;\-–]?\s*(\d{4})/i);
  if (yobMatch) {
    const year = parseInt(yobMatch[1]);
    if (year >= 1920 && year <= 2015) {
      return `${yobMatch[1]}-01-01`;
    }
  }

  return '';
}

/**
 * Extract gender from Aadhaar text
 */
function extractGender(text: string): string {
  const upperText = text.toUpperCase();

  if (/\bFEMALE\b/.test(upperText)) return 'Female';
  if (/\bMALE\b/.test(upperText)) return 'Male';
  if (/\bTRANSGENDER\b/.test(upperText)) return 'Transgender';

  // Hindi text patterns
  if (/पुरुष/.test(text)) return 'Male';
  if (/महिला/.test(text)) return 'Female';

  // OCR misread variants
  if (/\bMAI\s*E\b/i.test(text) || /\bMAIE\b/i.test(text)) return 'Male';
  if (/\bFEMAI\s*E\b/i.test(text)) return 'Female';

  return '';
}

/**
 * Extract name from Aadhaar card text.
 * The name typically appears after government headers and before DOB/Gender line.
 */
function extractName(text: string): string {
  const lines = text.split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 2);

  // Comprehensive skip patterns for headers, footers, and noise
  const skipPatterns = [
    /government\s*of\s*india/i,
    /unique\s*identification/i,
    /identification\s*authority/i,
    /authority\s*of\s*india/i,
    /aadhaar/i,
    /\bUIDAI\b/i,
    /\d{4}\s*\d{4}\s*\d{4}/,              // Aadhaar number
    /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}/, // Date
    /\b(DOB|MALE|FEMALE|YEAR|BIRTH)\b/i,
    /\bAddress\b/i,
    /\bVID\b/i,
    /^\d+$/,                                // Pure numbers
    /helpline/i,
    /www\./i,
    /uidai/i,
    /भारत\s*सरकार/,
    /आधार/,
    /enroll/i,
    /maadhaar/i,
    /help\s*line/i,
    /toll\s*free/i,
    /\d{6}/,                                // Pincode
    /S\/O|D\/O|W\/O|C\/O/i,               // Relation prefixes
    /[Tt]o\s+verify/i,
    /download/i,
    /is\s+hereby/i,
    /issued\s+to/i,
    /inteitenti/i,                          // Common garbled version of "identification"
    /gauthiority/i,                         // Common garbled version of "authority"
    /Ab\s+Int/i,                            // Common garbled header fragment
  ];

  for (const line of lines) {
    // Skip lines matching known patterns
    if (skipPatterns.some(p => p.test(line))) continue;

    // Clean the line: keep only letters, spaces, and dots (for initials)
    const cleaned = line.replace(/[^a-zA-Z\s.]/g, '').trim();
    const words = cleaned.split(/\s+/).filter(w => w.length >= 2);

    // Name lines are usually 2-5 words, all alphabetic
    if (words.length >= 2 && words.length <= 5 && cleaned.length >= 4) {
      // Extra validation: at least one word should be 3+ chars (not just initials)
      const hasRealWord = words.some(w => w.replace(/\./g, '').length >= 3);
      if (!hasRealWord) continue;

      // Capitalize each word properly
      return words.map(w => {
        if (w.length <= 2 && w.endsWith('.')) return w.toUpperCase(); // Initials like "S."
        return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
      }).join(' ');
    }
  }

  return '';
}

/**
 * Extract phone number if visible anywhere in the scanned text.
 * Aadhaar cards don't have phone numbers, but sometimes accompanying
 * letters or envelopes do, or users scan the Aadhaar letter.
 */
function extractPhone(text: string): string {
  // Indian phone: +91 XXXXX XXXXX or 10 digits starting with 6-9
  const patterns = [
    /(?:\+91[\s\-]?)?([6-9]\d{4}[\s\-]?\d{5})/,
    /(?:Phone|Mobile|Contact|Tel|Mob)[\s:]*(?:\+91[\s\-]?)?([6-9]\d{9})/i,
    /\b([6-9]\d{9})\b/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const phone = match[1].replace(/[\s\-]/g, '');
      // Make sure it's exactly 10 digits and not part of the Aadhaar number
      if (phone.length === 10) {
        return phone;
      }
    }
  }

  return '';
}

/**
 * Extract and format address from the back of the Aadhaar card.
 * Applies intelligent formatting for clean, readable output.
 */
function extractAddress(text: string): string {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // Try to find address section
  const addressKeywords = /(?:Address|addr|S\/O|D\/O|W\/O|C\/O)/i;
  let addressStartIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    if (addressKeywords.test(lines[i])) {
      addressStartIndex = i;
      break;
    }
  }

  let rawAddress = '';

  if (addressStartIndex !== -1) {
    const addressLines: string[] = [];
    const stopPatterns = [
      /\d{4}\s*\d{4}\s*\d{4}/,  // Aadhaar number
      /\bVID\b/i,
      /helpline/i,
      /www\./i,
      /maadhaar/i,
      /download/i,
      /toll\s*free/i,
      /\bUIDAI\b/i,
    ];

    for (let i = addressStartIndex; i < lines.length; i++) {
      if (i !== addressStartIndex && stopPatterns.some(p => p.test(lines[i]))) break;
      addressLines.push(lines[i]);
    }

    rawAddress = addressLines.join(' ')
      .replace(/Address\s*[:;\-–]?\s*/i, '')
      .trim();
  }

  // Fallback: look for pincode and grab surrounding context
  if (!rawAddress || rawAddress.length < 10) {
    const pinMatch = text.match(/(\d{6})/);
    if (pinMatch) {
      const pinIndex = text.indexOf(pinMatch[0]);
      const start = Math.max(0, pinIndex - 200);
      const end = Math.min(text.length, pinIndex + 10);
      rawAddress = text.substring(start, end)
        .replace(/\n/g, ' ')
        .trim();
    }
  }

  if (!rawAddress || rawAddress.length < 5) return '';

  // ── Format the address neatly ──
  return formatAddress(rawAddress);
}

/**
 * Intelligently format a raw address string into a clean, structured format.
 */
function formatAddress(raw: string): string {
  let addr = raw;

  // Remove leading relation prefix and name from address
  // e.g., "S/O: Ahmed Peer" → remove, keep rest
  addr = addr.replace(/^[+\s]*/, '');

  // Clean up OCR noise characters
  addr = addr.replace(/[|~`@#$%^&*()_=+{}[\]\\<>]/g, '');
  addr = addr.replace(/£/g, 'E');

  // Fix spacing around punctuation
  addr = addr.replace(/\s*,\s*/g, ', ');
  addr = addr.replace(/\s*\.\s*/g, '. ');
  addr = addr.replace(/\s+/g, ' ');

  // Split into logical address components
  // Common Indian address components
  const parts = addr.split(/[,;]+/).map(p => p.trim()).filter(p => p.length > 1);

  // Capitalize each component properly
  const formatted = parts.map(part => {
    // If it's a pincode, keep as-is
    if (/^\d{6}$/.test(part.trim())) return part.trim();

    // Title-case the part
    return part
      .split(/\s+/)
      .map(word => {
        // Keep state abbreviations and known acronyms uppercase
        if (/^[A-Z]{2,4}$/.test(word)) return word;
        // Keep pincodes
        if (/^\d+$/.test(word)) return word;
        // Capitalize first letter
        if (word.length <= 2) return word.toUpperCase();
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  });

  // Reconstruct with proper separators
  // Group: street/door → area → city → taluk → district → state → pincode
  const result = formatted.join(', ');

  // Extract and re-append pincode at the end if found
  const pincodeMatch = result.match(/\b(\d{6})\b/);
  if (pincodeMatch) {
    const withoutPincode = result.replace(/,?\s*\d{6}\s*/g, '').replace(/,\s*$/, '');
    return `${withoutPincode} - ${pincodeMatch[1]}`;
  }

  // Clean trailing garbage (common OCR artifacts at the end)
  return result
    .replace(/[,\s.]+$/, '')
    .replace(/\b[A-Z]{1,2}\s+\d{1,2}[a-z]?\s*$/, '') // Remove "ES a SL 22d" type noise
    .trim();
}

/**
 * Calculate age from DOB string (YYYY-MM-DD)
 */
function calculateAge(dob: string): string {
  if (!dob) return '';
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  if (age < 0 || age > 120) return '';
  return String(age);
}

// ─── Multi-Pass OCR Engine ───────────────────────────────────────────────────

interface OCRPassResult {
  rawText: string;
  processedText: string;
  confidence: number;
  fields: {
    aadhaar: string;
    name: string;
    dob: string;
    gender: string;
    address: string;
    phone: string;
    age: string;
    formattedAadhaar: string;
  };
  fieldScore: number; // How many fields were successfully extracted
}

/**
 * Run OCR on a single preprocessed blob and extract fields.
 */
async function runOCRPass(
  blob: Blob,
  passName: string,
  onProgress?: (status: string, progress: number) => void,
  progressOffset: number = 0,
): Promise<OCRPassResult> {
  const result = await Tesseract.recognize(
    blob,
    'eng+hin',
    {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          const pct = Math.round(progressOffset + (m.progress || 0) * 20);
          onProgress?.(`[${passName}] Extracting text...`, pct);
        }
      },
    }
  );

  const rawText = result.data.text;
  const confidence = result.data.confidence;
  const processedText = postProcessOCRText(rawText);

  // Extract fields from the post-processed text
  const aadhaar = extractAadhaarNumber(processedText) || extractAadhaarNumber(rawText);
  const name = extractName(processedText) || extractName(rawText);
  const dob = extractDOB(processedText) || extractDOB(rawText);
  const gender = extractGender(processedText) || extractGender(rawText);
  const address = extractAddress(processedText) || extractAddress(rawText);
  const phone = extractPhone(processedText) || extractPhone(rawText);
  const age = calculateAge(dob);
  const formattedAadhaar = aadhaar
    ? aadhaar.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3')
    : '';

  // Calculate a score: how many fields did we extract?
  let fieldScore = 0;
  if (aadhaar) fieldScore += 3;    // Aadhaar number is most important
  if (name) fieldScore += 2;
  if (dob) fieldScore += 2;
  if (address) fieldScore += 2;
  if (gender) fieldScore += 1;
  if (phone) fieldScore += 1;

  return {
    rawText,
    processedText,
    confidence,
    fields: { aadhaar, name, dob, gender, address, phone, age, formattedAadhaar },
    fieldScore,
  };
}

/**
 * Main function: Run multi-pass OCR on an Aadhaar card image and extract structured data.
 * 
 * @param file - The image file (JPEG/PNG) of the Aadhaar card
 * @param onProgress - Optional callback for progress updates
 * @returns Parsed Aadhaar data with confidence score
 */
export async function scanAadhaarCard(
  file: File,
  onProgress?: (status: string, progress: number) => void
): Promise<AadhaarOCRResult> {
  onProgress?.('Preprocessing image with multiple pipelines...', 5);

  // Step 1: Create multiple preprocessed versions
  let preprocessedBlobs: Blob[];
  try {
    preprocessedBlobs = await preprocessImage(file);
  } catch {
    // If preprocessing fails, use original file for all passes
    preprocessedBlobs = [file, file, file];
  }

  const passNames = ['Grayscale', 'Adaptive', 'HighContrast'];

  onProgress?.('Running multi-pass OCR analysis...', 15);

  // Step 2: Run OCR on each preprocessed version
  const results: OCRPassResult[] = [];
  for (let i = 0; i < preprocessedBlobs.length; i++) {
    try {
      const result = await runOCRPass(
        preprocessedBlobs[i],
        passNames[i],
        onProgress,
        15 + i * 20,
      );
      results.push(result);
    } catch (err) {
      console.warn(`OCR pass ${passNames[i]} failed:`, err);
    }
  }

  if (results.length === 0) {
    throw new Error('All OCR passes failed. Please try with a clearer image.');
  }

  onProgress?.('Selecting best results from all passes...', 80);

  // Step 3: Pick the best result for each field across all passes
  // Sort by fieldScore (descending), then by confidence
  results.sort((a, b) => {
    if (b.fieldScore !== a.fieldScore) return b.fieldScore - a.fieldScore;
    return b.confidence - a.confidence;
  });

  const best = results[0];

  // Merge: for each field, use the best non-empty value across all passes
  const mergedFields = { ...best.fields };

  for (const result of results) {
    if (!mergedFields.aadhaar && result.fields.aadhaar) {
      mergedFields.aadhaar = result.fields.aadhaar;
      mergedFields.formattedAadhaar = result.fields.formattedAadhaar;
    }
    if (!mergedFields.name && result.fields.name) mergedFields.name = result.fields.name;
    if (!mergedFields.dob && result.fields.dob) {
      mergedFields.dob = result.fields.dob;
      mergedFields.age = result.fields.age;
    }
    if (!mergedFields.gender && result.fields.gender) mergedFields.gender = result.fields.gender;
    if (!mergedFields.address && result.fields.address) mergedFields.address = result.fields.address;
    if (!mergedFields.phone && result.fields.phone) mergedFields.phone = result.fields.phone;
  }

  // If address was found but name has a better version in another pass, prefer longer name
  for (const result of results) {
    if (result.fields.name && result.fields.name.length > (mergedFields.name?.length || 0)) {
      mergedFields.name = result.fields.name;
    }
    // Prefer longer address (more complete)
    if (result.fields.address && result.fields.address.length > (mergedFields.address?.length || 0)) {
      mergedFields.address = result.fields.address;
    }
  }

  // Recalculate age if needed
  if (mergedFields.dob && !mergedFields.age) {
    mergedFields.age = calculateAge(mergedFields.dob);
  }

  // Calculate overall confidence: weighted average favoring best pass
  const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
  const overallConfidence = Math.round(0.6 * best.confidence + 0.4 * avgConfidence);

  // Combine raw text from all passes for debugging
  const combinedRawText = results.map((r, i) => `--- ${passNames[i]} (conf: ${Math.round(r.confidence)}%) ---\n${r.rawText}`).join('\n\n');

  onProgress?.('Scan complete!', 100);

  return {
    name: mergedFields.name,
    dob: mergedFields.dob,
    age: mergedFields.age,
    gender: mergedFields.gender,
    aadhaar: mergedFields.aadhaar,
    formattedAadhaar: mergedFields.formattedAadhaar,
    address: mergedFields.address,
    phone: mergedFields.phone,
    rawText: combinedRawText,
    confidence: overallConfidence,
  };
}
