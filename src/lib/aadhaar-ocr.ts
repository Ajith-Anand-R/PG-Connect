/**
 * Aadhaar Card OCR Utility
 * 
 * Uses Tesseract.js to perform real OCR on Aadhaar card images,
 * then applies Indian Aadhaar-specific regex patterns to extract
 * structured data (name, DOB, Aadhaar number, gender, address).
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
  rawText: string;       // Full OCR text for debugging
  confidence: number;    // Tesseract confidence score (0-100)
}

/**
 * Preprocess the image for better OCR accuracy:
 * - Convert to grayscale
 * - Increase contrast
 * - Sharpen edges
 * - Scale up small images
 */
function preprocessImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      
      // Scale up small images for better OCR
      const scale = Math.max(1, 1500 / Math.max(img.width, img.height));
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Draw the original image scaled up
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Get image data for pixel manipulation
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Convert to grayscale and increase contrast
      for (let i = 0; i < data.length; i += 4) {
        // Grayscale using luminance formula
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        
        // Increase contrast: stretch histogram
        const contrast = 1.5; // contrast factor
        const adjusted = ((gray / 255 - 0.5) * contrast + 0.5) * 255;
        const clamped = Math.max(0, Math.min(255, adjusted));

        // Apply adaptive thresholding for cleaner text
        const threshold = clamped > 140 ? 255 : 0;

        data[i] = threshold;     // R
        data[i + 1] = threshold; // G
        data[i + 2] = threshold; // B
        // Alpha stays the same
      }

      ctx.putImageData(imageData, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create preprocessed blob'));
      }, 'image/png');
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Extract the Aadhaar number (12 digits, often printed as XXXX XXXX XXXX)
 */
function extractAadhaarNumber(text: string): string {
  // Aadhaar numbers are 12 digits, often separated by spaces or hyphens
  // Pattern: 4 digits, separator, 4 digits, separator, 4 digits
  const patterns = [
    /\b(\d{4}\s+\d{4}\s+\d{4})\b/,           // "1234 5678 9012"
    /\b(\d{4}-\d{4}-\d{4})\b/,                 // "1234-5678-9012"
    /\b(\d{4}\s*\d{4}\s*\d{4})\b/,             // condensed with possible spaces
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].replace(/[\s-]/g, '');
    }
  }

  // Fallback: find any sequence of 12 consecutive digits
  const fallback = text.replace(/\s/g, '').match(/\d{12}/);
  if (fallback) return fallback[0];

  return '';
}

/**
 * Extract Date of Birth from Aadhaar text
 * Common formats: DD/MM/YYYY, DD-MM-YYYY, "DOB: DD/MM/YYYY", "Year of Birth: YYYY"
 */
function extractDOB(text: string): string {
  // Pattern 1: DOB: DD/MM/YYYY or DD-MM-YYYY
  const dobPatterns = [
    /(?:DOB|D\.?O\.?B\.?|Date\s*of\s*Birth|Birth)\s*[:\-]?\s*(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/i,
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
  ];

  for (const pattern of dobPatterns) {
    const match = text.match(pattern);
    if (match) {
      const day = match[1].padStart(2, '0');
      const month = match[2].padStart(2, '0');
      const year = match[3];
      // Validate year range (1920-2015 is reasonable for Aadhaar holders)
      const yearNum = parseInt(year);
      if (yearNum >= 1920 && yearNum <= 2015) {
        return `${year}-${month}-${day}`; // Return YYYY-MM-DD
      }
    }
  }

  // Pattern 2: "Year of Birth: YYYY" (older Aadhaar cards)
  const yobMatch = text.match(/(?:Year\s*of\s*Birth|YOB)\s*[:\-]?\s*(\d{4})/i);
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
  
  if (/\bMALE\b/.test(upperText) && !/\bFEMALE\b/.test(upperText)) return 'Male';
  if (/\bFEMALE\b/.test(upperText)) return 'Female';
  if (/\bTRANSGENDER\b/.test(upperText)) return 'Transgender';
  
  // Hindi text patterns
  if (/पुरुष/.test(text)) return 'Male';
  if (/महिला/.test(text)) return 'Female';
  
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

  // Skip known header/footer lines
  const skipPatterns = [
    /government\s*of\s*india/i,
    /unique\s*identification/i,
    /aadhaar/i,
    /\bUIDAI\b/i,
    /\d{4}\s*\d{4}\s*\d{4}/,        // Aadhaar number
    /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}/, // Date
    /\b(DOB|MALE|FEMALE|YEAR)\b/i,
    /\bAddress\b/i,
    /\bVID\b/i,
    /^\d+$/,                          // Pure numbers
    /helpline/i,
    /www\./i,
    /uidai/i,
    /भारत\s*सरकार/,
    /आधार/,
  ];

  for (const line of lines) {
    // Skip lines matching known patterns
    if (skipPatterns.some(p => p.test(line))) continue;
    
    // Name lines are usually 2-4 words, all alphabetic/spaces
    const cleaned = line.replace(/[^a-zA-Z\s]/g, '').trim();
    const words = cleaned.split(/\s+/).filter(w => w.length >= 2);
    
    if (words.length >= 2 && words.length <= 5 && cleaned.length >= 5) {
      // Capitalize each word
      return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }
  }

  return '';
}

/**
 * Extract address from the back of the Aadhaar card
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

  if (addressStartIndex !== -1) {
    // Collect lines from address start until we hit something that looks like 
    // it's no longer address (Aadhaar number, VID, etc.)
    const addressLines: string[] = [];
    const stopPatterns = [
      /\d{4}\s*\d{4}\s*\d{4}/, // Aadhaar number
      /\bVID\b/i,
      /helpline/i,
      /www\./i,
    ];

    for (let i = addressStartIndex; i < lines.length; i++) {
      if (i !== addressStartIndex && stopPatterns.some(p => p.test(lines[i]))) break;
      addressLines.push(lines[i]);
    }

    const fullAddress = addressLines.join(', ')
      .replace(/Address\s*[:\-]?\s*/i, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (fullAddress.length > 10) return fullAddress;
  }

  // Fallback: look for pincode patterns (6 digits) and grab surrounding context
  const pinMatch = text.match(/(\d{6})/);
  if (pinMatch) {
    const pinIndex = text.indexOf(pinMatch[0]);
    // Take text from ~150 chars before pincode to just after it
    const start = Math.max(0, pinIndex - 150);
    const end = Math.min(text.length, pinIndex + 10);
    const segment = text.substring(start, end)
      .replace(/\n/g, ', ')
      .replace(/\s+/g, ' ')
      .trim();
    if (segment.length > 15) return segment;
  }

  return '';
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
  return String(age);
}

/**
 * Main function: Run OCR on an Aadhaar card image and extract structured data.
 * 
 * @param file - The image file (JPEG/PNG) of the Aadhaar card
 * @param onProgress - Optional callback for progress updates
 * @returns Parsed Aadhaar data with confidence score
 */
export async function scanAadhaarCard(
  file: File,
  onProgress?: (status: string, progress: number) => void
): Promise<AadhaarOCRResult> {
  onProgress?.('Preprocessing image for optimal clarity...', 10);

  // Step 1: Preprocess the image
  let processedImage: Blob;
  try {
    processedImage = await preprocessImage(file);
  } catch {
    // If preprocessing fails, use original file
    processedImage = file;
  }

  onProgress?.('Loading OCR engine (English + Hindi)...', 25);

  // Step 2: Run Tesseract OCR with both English and Hindi 
  // (Aadhaar cards have bilingual text)
  const result = await Tesseract.recognize(
    processedImage,
    'eng+hin',
    {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          const pct = Math.round(25 + (m.progress || 0) * 50);
          onProgress?.('Extracting text from card...', pct);
        }
      },
    }
  );

  const rawText = result.data.text;
  const confidence = result.data.confidence;

  onProgress?.('Parsing Aadhaar card fields...', 80);

  // Step 3: Parse structured fields from the OCR text
  const aadhaarNumber = extractAadhaarNumber(rawText);
  const dob = extractDOB(rawText);
  const gender = extractGender(rawText);
  const name = extractName(rawText);
  const address = extractAddress(rawText);
  const age = calculateAge(dob);

  const formattedAadhaar = aadhaarNumber
    ? aadhaarNumber.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3')
    : '';

  onProgress?.('Scan complete!', 100);

  return {
    name,
    dob,
    age,
    gender,
    aadhaar: aadhaarNumber,
    formattedAadhaar,
    address,
    rawText,
    confidence,
  };
}
