/**
 * Aadhaar Card OCR Utility — Gemini Vision Powered
 * 
 * Sends the Aadhaar card image to a server-side API route that uses
 * Google Gemini Vision for accurate document understanding.
 * 
 * ~2-4 seconds per scan with high accuracy on names, DOB, and all fields.
 */

export interface AadhaarOCRResult {
  name: string;
  dob: string;           // YYYY-MM-DD format
  age: string;
  gender: string;
  aadhaar: string;       // 12-digit raw number
  formattedAadhaar: string; // XXXX-XXXX-XXXX
  address: string;
  phone: string;         // Phone number if found on card/envelope
  rawText: string;       // Raw AI response for debugging
  confidence: number;    // Confidence score (0-100)
}

/**
 * Calculate age from DOB string (YYYY-MM-DD)
 */
function calculateAge(dob: string): string {
  if (!dob) return '';
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return '';
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  if (age < 0 || age > 120) return '';
  return String(age);
}

/**
 * Calculate confidence score based on how many fields were extracted.
 */
function calculateConfidence(data: { name: string; dob: string; gender: string; aadhaar: string; address: string; phone: string }): number {
  let score = 0;
  const maxScore = 100;

  // Aadhaar number is the most critical field
  if (data.aadhaar && /^\d{12}$/.test(data.aadhaar)) score += 30;
  if (data.name && data.name.length >= 2) score += 25;
  if (data.dob && /^\d{4}-\d{2}-\d{2}$/.test(data.dob)) score += 20;
  if (data.gender && ['Male', 'Female', 'Transgender'].includes(data.gender)) score += 10;
  if (data.address && data.address.length >= 10) score += 10;
  if (data.phone && /^\d{10}$/.test(data.phone)) score += 5;

  return Math.min(score, maxScore);
}

/**
 * Scan a single Aadhaar card image using Gemini Vision API.
 * 
 * @param file - The image file (JPEG/PNG) of the Aadhaar card
 * @param onProgress - Optional callback for progress updates
 * @returns Parsed Aadhaar data with confidence score
 */
export async function scanAadhaarCard(
  file: File,
  onProgress?: (status: string, progress: number) => void
): Promise<AadhaarOCRResult> {
  onProgress?.('Preparing image for AI analysis...', 10);

  // Create FormData to send the image
  const formData = new FormData();
  formData.append('image', file);

  onProgress?.('Analyzing card with AI vision...', 30);

  // Call the server-side API route
  const response = await fetch('/api/ocr/aadhaar', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `OCR API returned status ${response.status}`);
  }

  onProgress?.('Processing AI results...', 80);

  const result = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'AI analysis returned no data');
  }

  const data = result.data;

  // Calculate derived fields
  const age = calculateAge(data.dob);
  const formattedAadhaar = data.aadhaar
    ? data.aadhaar.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3')
    : '';
  const confidence = calculateConfidence(data);

  onProgress?.('Scan complete!', 100);

  return {
    name: data.name || '',
    dob: data.dob || '',
    age,
    gender: data.gender || '',
    aadhaar: data.aadhaar || '',
    formattedAadhaar,
    address: data.address || '',
    phone: data.phone || '',
    rawText: result.rawResponse || '',
    confidence,
  };
}
