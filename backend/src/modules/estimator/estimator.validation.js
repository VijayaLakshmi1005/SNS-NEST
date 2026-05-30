import { z } from 'zod';

export const calculateSchema = z.object({
  body: z.object({
    propertyType: z.enum(['Apartment', 'Villa', 'Office'], { required_error: 'Property type is required' }),
    bhkType: z.enum(['1 BHK', '2 BHK', '3 BHK', '4 BHK', 'Villa', 'Office'], { required_error: 'BHK type is required' }),
    squareFeet: z.number({ required_error: 'Square feet is required' }).positive(),
    city: z.string({ required_error: 'City is required' }),
    rooms: z.array(z.string()).min(1, 'At least one room must be selected'),
    packageType: z.enum(['Essential', 'Premium', 'Luxury'], { required_error: 'Package type is required' }),
    materialQuality: z.enum(['Basic', 'Standard', 'Premium', 'Luxury'], { required_error: 'Material quality is required' }),
    saveEstimate: z.boolean().optional(),
    emiDetails: z.object({
      downPayment: z.number().optional().default(0),
      tenureMonths: z.number().optional().default(12),
      interestRate: z.number().optional().default(10.5)
    }).optional()
  })
});

export const downloadPdfSchema = z.object({
  body: z.object({
    estimateId: z.string({ required_error: 'Estimate ID is required' }).optional(),
    // Allow raw payload if they want to download PDF without saving
    propertyType: z.enum(['Apartment', 'Villa', 'Office']).optional(),
    bhkType: z.enum(['1 BHK', '2 BHK', '3 BHK', '4 BHK', 'Villa', 'Office']).optional(),
    squareFeet: z.number().optional(),
    city: z.string().optional(),
    rooms: z.array(z.string()).optional(),
    packageType: z.enum(['Essential', 'Premium', 'Luxury']).optional(),
    materialQuality: z.enum(['Basic', 'Standard', 'Premium', 'Luxury']).optional(),
    subtotal: z.number().optional(),
    gst: z.number().optional(),
    totalAmount: z.number().optional(),
    manualRoomCosts: z.record(z.union([z.number(), z.string()])).optional(),
  })
});
