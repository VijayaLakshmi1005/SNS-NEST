import { uploadToCloudinary } from './cloudinary.service.js';

export const processAiRoomVisualizer = async (fileBuffer, style, roomType) => {
  // Real Replicate API / ControlNet would run here.
  // We simulate a robust AI delay and return premium generated before vs after outputs using modern high-end images
  const uploadResult = await uploadToCloudinary(fileBuffer, 'ai-room-source');

  // Realistic AI generated output samples from high-end Unsplash architecture
  const styleSamples = {
    scandinavian: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=1200',
    minimalist: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1200',
    industrial: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=1200',
  };

  const generatedUrl = styleSamples[style.toLowerCase()] || styleSamples.scandinavian;

  return {
    beforeUrl: uploadResult.secure_url,
    afterUrl: generatedUrl,
    style,
    roomType,
    processedAt: new Date(),
  };
};
