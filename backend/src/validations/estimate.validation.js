import { z } from 'zod';

export const calculateEstimateSchema = z.object({
  body: z.object({
    homeSize: z.number({ required_error: 'Home size in sq ft is required' }).positive(),
    bhkType: z.enum(['1 BHK', '2 BHK', '3 BHK', '4+ BHK'], { required_error: 'BHK type is required' }),
    quality: z.enum(['essential', 'premium', 'luxury'], { required_error: 'Material quality is required' }),
    rooms: z.number().int().positive().default(3),
  }),
});
