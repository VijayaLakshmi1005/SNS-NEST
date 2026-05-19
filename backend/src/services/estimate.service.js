import { uploadToCloudinary } from './cloudinary.service.js';
import { generateEstimatePDF } from '../utils/pdfGenerator.js';
import { Estimate } from '../models/Estimate.js';

export const calculateHomeEstimate = async (homeSize, bhkType, quality, rooms, clientUser) => {
  // Localization for Indian Rupee - Base material rate calculations
  // Essential: ₹3,500/sqft, Premium: ₹6,000/sqft, Luxury: ₹12,000/sqft
  let baseRate = 3500;
  if (quality === 'premium') baseRate = 6000;
  if (quality === 'luxury') baseRate = 12000;

  const woodworkCost = homeSize * baseRate * 0.40;
  const civilCost = homeSize * baseRate * 0.30;
  const decorCost = homeSize * baseRate * 0.30;

  const baseCost = woodworkCost + civilCost + decorCost;
  const gst = baseCost * 0.18; // 18% GST
  const totalCost = baseCost; // Total cost including categories, GST added separately in PDF and final breakdowns

  // Create temporary estimate inside Database
  const newEstimate = new Estimate({
    client: clientUser._id,
    homeSize,
    bhkType,
    quality,
    rooms,
    breakdown: {
      woodwork: woodworkCost,
      civil: civilCost,
      decor: decorCost,
      gst
    },
    totalCost
  });

  await newEstimate.save();

  // Generate PDF Buffer
  const pdfBuffer = await generateEstimatePDF(newEstimate, clientUser);

  // Upload PDF Buffer directly to Cloudinary
  const uploadResult = await uploadToCloudinary(pdfBuffer, 'estimates-invoices');

  // Update Estimate model with Cloudinary URL
  newEstimate.pdfUrl = uploadResult.secure_url;
  await newEstimate.save();

  return newEstimate;
};
