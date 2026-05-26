import multer from 'multer';
import path from 'path';

// Store files in memory for processing (mocking Cloudinary/OCR for now)
// In production, use multer-storage-cloudinary or direct S3 streams
import fs from 'fs';

const uploadDir = path.join(process.cwd(), 'public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

// Accept PDFs, DOCs, and Images
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg', 'image/png', 'image/webp', 'image/heic',
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, ZIP, and images are allowed.'), false);
  }
};

export const uploadStudio = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB for enterprise catalogs
  fileFilter
});

// Mock AI/OCR Engine - Extracts styles, text, and room types from media
export const processCatalogMedia = async (files) => {
  // In a real scenario, this is where you'd call OpenAI Vision API, Google Cloud Vision, or OCR library (like pdf-parse)
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    extractedText: "Luxury open concept living space featuring minimalist furniture and ambient lighting.",
    autoTags: {
      styles: ['Minimal', 'Modern', 'Luxury'],
      roomTypes: ['Living Room', 'Open Concept'],
      materials: ['Wood', 'Glass', 'Marble']
    },
    processedImages: files.filter(f => f.mimetype.startsWith('image/')).map((f, i) => ({
      url: `${process.env.VITE_API_URL ? process.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}/uploads/${f.filename}`,
      isPrimary: i === 0,
      extractedText: "AI identified modern aesthetics"
    }))
  };
};
