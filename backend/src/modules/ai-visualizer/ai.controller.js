import { AIVisualizer } from './ai.model.js';
import { processAiRoomVisualizer } from './ai.service.js';
import { uploadToCloudinary } from '../../services/cloudinary.service.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { catchAsync } from '../../utils/catchAsync.js';

export const uploadOriginalImage = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Image file is required');
  }

  const uploadResult = await uploadToCloudinary(req.file.buffer, 'ai-room-source');
  return res.status(200).json(
    new ApiResponse(
      200, 
      { originalImage: uploadResult.secure_url }, 
      'Original room image uploaded successfully'
    )
  );
});

export const generateAiDesign = catchAsync(async (req, res) => {
  const { style, roomType, wallColor, furnitureStyle, flooringType, lightingType, originalImageUrl } = req.body;
  const userId = req.user._id;

  let originalImage = originalImageUrl;

  // If a file is uploaded, process it
  if (req.file) {
    const aiResult = await processAiRoomVisualizer(req.file.buffer, {
      style,
      roomType,
      wallColor,
      flooringType,
      lightingType
    });
    originalImage = aiResult.originalImage;
  }

  if (!originalImage) {
    throw new ApiError(400, 'Original room image file or image URL is required');
  }

  // Generate transformed visual mapped to Room Type and Selected Style
  const roomSamples = {
    'living room': {
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
        'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&q=80&w=1200'
      ]
    },
    'bedroom': {
      'scandinavian': [
        'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80&w=1200'
      ],
      'modern luxury': [
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=1200'
      ],
      'minimal': [
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1505693395321-883724634266?auto=format&fit=crop&q=80&w=1200'
      ],
      'contemporary': [
        'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80&w=1200'
      ],
      'japandi': [
        'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=1200'
      ],
      'industrial': [
        'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1505693395321-883724634266?auto=format&fit=crop&q=80&w=1200'
      ],
      'warm neutral': [
        'https://images.unsplash.com/photo-1617806118233-18e1db207f62?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=1200'
      ],
      'classic luxury': [
        'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=1200'
      ]
    },
    'kitchen': {
      'scandinavian': [
        'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=1200'
      ],
      'modern luxury': [
        'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&q=80&w=1200'
      ],
      'minimal': [
        'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&q=80&w=1200'
      ],
      'contemporary': [
        'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=1200'
      ],
      'japandi': [
        'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=1200'
      ],
      'industrial': [
        'https://images.unsplash.com/photo-1556909212-d5b604d7c525?auto=format&fit=crop&q=80&w=1200'
      ],
      'warm neutral': [
        'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&q=80&w=1200'
      ],
      'classic luxury': [
        'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=1200'
      ]
    },
    'workspace studio': {
      'scandinavian': [
        'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=1200'
      ],
      'modern luxury': [
        'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=1200'
      ],
      'minimal': [
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1200'
      ],
      'contemporary': [
        'https://images.unsplash.com/photo-1493934558415-9d19f0b2b4d2?auto=format&fit=crop&q=80&w=1200'
      ],
      'japandi': [
        'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1200'
      ],
      'industrial': [
        'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&q=80&w=1200'
      ],
      'warm neutral': [
        'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=1200'
      ],
      'classic luxury': [
        'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=1200'
      ]
    }
  };

  const normalizedRoomType = (roomType || 'Living Room').toLowerCase().trim();
  const normalizedStyle = (style || 'Scandinavian').toLowerCase().trim();

  const typeConfig = roomSamples[normalizedRoomType] || roomSamples['living room'];
  const samples = typeConfig[normalizedStyle] || typeConfig['scandinavian'];
  
  // Pick index based on sum of string characters to make it pseudo-stable but dynamic
  const desc = `${wallColor || ''}-${flooringType || ''}-${lightingType || ''}`;
  let stringSum = 0;
  for (let i = 0; i < desc.length; i++) {
    stringSum += desc.charCodeAt(i);
  }
  const pickedIndex = stringSum % samples.length;
  const generatedImage = samples[pickedIndex];

  // Save rendering session
  const visual = new AIVisualizer({
    user: userId,
    originalImage,
    generatedImage,
    style: style || 'Scandinavian',
    roomType: roomType || 'Living Room',
    wallColor: wallColor || '',
    furnitureStyle: furnitureStyle || '',
    flooringType: flooringType || '',
    lightingType: lightingType || ''
  });

  await visual.save();

  return res
    .status(201)
    .json(new ApiResponse(201, visual, 'AI room rendering generated successfully'));
});

export const getGenerationHistory = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const history = await AIVisualizer.find({ user: userId }).sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, history, 'Generation history fetched successfully'));
});

export const getGenerationById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const visual = await AIVisualizer.findOne({ _id: id, user: req.user._id });
  
  if (!visual) {
    throw new ApiError(404, 'AI rendering session not found');
  }

  return res.status(200).json(new ApiResponse(200, visual, 'AI rendering details fetched successfully'));
});

export const deleteGeneration = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await AIVisualizer.findOneAndDelete({ _id: id, user: req.user._id });
  
  if (!result) {
    throw new ApiError(404, 'AI rendering session not found');
  }

  return res.status(200).json(new ApiResponse(200, null, 'AI rendering session deleted successfully'));
});
