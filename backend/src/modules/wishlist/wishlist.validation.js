import { z } from 'zod';

export const saveWishlistItemSchema = z.object({
  body: z.object({
    designId: z.string().optional(),
    collectionId: z.string().optional(),
    notes: z.string().optional(),
    // Allow inline creation of saved designs for AI concepts & inspirations
    roomType: z.string({ required_error: 'Room type is required' }),
    style: z.string({ required_error: 'Style is required' }),
    images: z.array(z.string()).min(1, 'At least one image is required'),
    tags: z.array(z.string()).optional()
  })
});

export const createCollectionSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Collection title is required' }).min(1),
    description: z.string().optional(),
    coverImage: z.string().optional()
  })
});

export const updateCollectionSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    coverImage: z.string().optional()
  })
});

export const addDesignToCollectionSchema = z.object({
  body: z.object({
    designId: z.string({ required_error: 'Design ID is required' })
  })
});

export const updateNotesSchema = z.object({
  body: z.object({
    notes: z.string({ required_error: 'Notes are required' })
  })
});
