import { uploadToCloudinary } from '../../services/cloudinary.service.js';

export const processAiRoomVisualizer = async (fileBuffer, options = {}) => {
  const { style = 'Scandinavian', roomType = 'Living Room', wallColor = '', flooringType = '', lightingType = '' } = options;

  // Upload original image to Cloudinary
  const uploadResult = await uploadToCloudinary(fileBuffer, 'ai-room-source');

  // Realistic AI generated output samples from high-end Unsplash architecture
  const styleSamples = {
    'scandinavian': [
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1617806118233-18e1db207f62?auto=format&fit=crop&q=80&w=1200'
    ],
    'modern luxury': [
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=1200'
    ],
    'minimal': [
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&q=80&w=1200'
    ],
    'contemporary': [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=1200'
    ],
    'japandi': [
      'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=1200'
    ],
    'industrial': [
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1582582621959-a5a27dfbb505?auto=format&fit=crop&q=80&w=1200'
    ],
    'warm neutral': [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=1200'
    ],
    'classic luxury': [
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&q=80&w=1200'
    ]
  };

  const normalizedStyle = style.toLowerCase().trim();
  const samples = styleSamples[normalizedStyle] || styleSamples['scandinavian'];
  
  // Pick index based on sum of string characters to make it pseudo-stable but dynamic
  const stringSum = (wallColor.length + flooringType.length + lightingType.length) || 0;
  const pickedIndex = stringSum % samples.length;
  const generatedUrl = samples[pickedIndex];

  return {
    originalImage: uploadResult.secure_url,
    generatedImage: generatedUrl
  };
};
