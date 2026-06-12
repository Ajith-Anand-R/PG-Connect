import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const EXTRACTION_PROMPT = `You are an expert Indian document reader. Analyze this Aadhaar card image and extract ALL fields accurately.

CRITICAL RULES:
1. Extract the EXACT text as printed on the card — do NOT guess or hallucinate
2. For the name: read the English name printed on the card (not Hindi/regional language)
3. For Aadhaar number: it is always 12 digits printed as XXXX XXXX XXXX
4. For DOB: convert to YYYY-MM-DD format regardless of how it appears on the card
5. For gender: output exactly "Male", "Female", or "Transgender"
6. For address: read the full address including pincode from the card (usually on back side)
7. If a field is not visible or not present in the image, return an empty string ""
8. Do NOT make up any data

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks, no explanation):
{"name":"","dob":"","gender":"","aadhaar":"","address":"","phone":""}

Where:
- name: Full name in English as printed (Title Case)
- dob: Date of birth as YYYY-MM-DD
- gender: "Male", "Female", or "Transgender"
- aadhaar: 12 digits only, no spaces or dashes
- address: Full address with pincode if visible
- phone: Phone number if visible, otherwise ""`;

export async function POST(request: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mimeType = file.type || 'image/jpeg';

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Send image to Gemini for analysis
    const result = await model.generateContent([
      EXTRACTION_PROMPT,
      {
        inlineData: {
          data: base64,
          mimeType,
        },
      },
    ]);

    const responseText = result.response.text().trim();
    
    // Parse the JSON response — handle potential markdown wrapping
    let jsonStr = responseText;
    // Strip markdown code blocks if present
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error('Gemini returned non-JSON:', responseText);
      return NextResponse.json(
        { error: 'Failed to parse AI response', rawResponse: responseText },
        { status: 500 }
      );
    }

    // Validate and clean the parsed fields
    const cleaned = {
      name: typeof parsed.name === 'string' ? parsed.name.trim() : '',
      dob: typeof parsed.dob === 'string' ? parsed.dob.trim() : '',
      gender: typeof parsed.gender === 'string' ? parsed.gender.trim() : '',
      aadhaar: typeof parsed.aadhaar === 'string' ? parsed.aadhaar.replace(/[\s\-]/g, '').trim() : '',
      address: typeof parsed.address === 'string' ? parsed.address.trim() : '',
      phone: typeof parsed.phone === 'string' ? parsed.phone.replace(/[\s\-]/g, '').trim() : '',
    };

    // Validate Aadhaar number format
    if (cleaned.aadhaar && (!/^\d{12}$/.test(cleaned.aadhaar) || /^[01]/.test(cleaned.aadhaar))) {
      // Try to extract 12 digits from what we got
      const digits = cleaned.aadhaar.replace(/\D/g, '');
      if (digits.length === 12 && /^[2-9]/.test(digits)) {
        cleaned.aadhaar = digits;
      } else {
        cleaned.aadhaar = '';
      }
    }

    return NextResponse.json({
      success: true,
      data: cleaned,
      rawResponse: responseText,
    });
  } catch (err) {
    console.error('Aadhaar OCR API error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: `OCR processing failed: ${message}` },
      { status: 500 }
    );
  }
}
