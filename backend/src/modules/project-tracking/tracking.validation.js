import { z } from 'zod';

export const siteUpdateSchema = z.object({
  body: z.object({
    caption: z.string({ required_error: 'Caption is required' }).min(5, 'Caption must be at least 5 characters long'),
    images: z.array(z.string()).min(1, 'At least one image URL must be provided')
  })
});

export const activitySchema = z.object({
  body: z.object({
    type: z.enum(['milestone', 'procurement', 'upload', 'delay', 'team'], {
      required_error: 'Activity type is required'
    }),
    message: z.string({ required_error: 'Message is required' }).min(5, 'Message must be at least 5 characters long')
  })
});
