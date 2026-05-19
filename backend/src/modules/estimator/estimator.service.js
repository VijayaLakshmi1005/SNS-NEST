import PDFDocument from 'pdfkit';
import { Estimator } from './estimator.model.js';
import { EstimatorConfig } from './config.model.js';

// Default configuration parameters for first-time database seeding
const DEFAULT_CONFIG = {
  key: 'pricing_rules',
  baseRoomCosts: {
    'Living Room': 90000,
    'Bedroom': 75000,
    'Modular Kitchen': 150000,
    'Wardrobes': 65000,
    'Dining Area': 45000,
    'False Ceiling': 30000,
    'Bathroom Vanity': 20000,
    'TV Unit': 25000,
    'Study Room': 40000,
    'Office Space': 50000
  },
  cityMultipliers: {
    'Mumbai': 1.25,
    'Delhi NCR': 1.15,
    'Bangalore': 1.15,
    'Hyderabad': 1.05,
    'Chennai': 1.00,
    'Pune': 1.00,
    'Kolkata': 0.95,
    'Others': 0.90
  },
  materialMultipliers: {
    'Basic': 0.8,
    'Standard': 1.0,
    'Premium': 1.3,
    'Luxury': 1.8
  },
  packageMultipliers: {
    'Essential': 1.0,
    'Premium': 1.4,
    'Luxury': 2.0
  },
  bhkBaseSqFt: {
    '1 BHK': 600,
    '2 BHK': 1000,
    '3 BHK': 1500,
    '4 BHK': 2000,
    'Villa': 3000,
    'Office': 1200
  },
  packages: [
    {
      name: 'Essential',
      tagline: 'Elegant minimal interiors for smart living',
      multiplier: 1.0,
      warranty: '5 Years Warranty',
      materials: 'Commercial Plywood, Matte Laminate Finish, Premium Hardware (Hettich/Link)',
      furniture: 'Engineered wood furniture, comfortable fabric sofas',
      decor: 'Minimalist lighting, emulsion painting',
      installation: 'Included with basic supervisor monitoring',
      benefits: ['Cost Effective', 'Quick 45-day Delivery', 'Standard Quality Checks']
    },
    {
      name: 'Premium',
      tagline: 'Crafted with premium materials and designer finishes',
      multiplier: 1.4,
      warranty: '10 Years Warranty',
      materials: 'BWR Waterproof Plywood, Acrylic & High-Gloss Laminate, Soft-close Hardware (Blum/Hafele)',
      furniture: 'Solid wood accents, custom upholstery, premium cushioning',
      decor: 'Designer accent lights, textured wall paint, customized wallpapers',
      installation: 'Dedicated project manager and expert carpenters',
      benefits: ['High Durability', 'Customized Layouts', 'Water & Termite Resistant Plywood']
    },
    {
      name: 'Luxury',
      tagline: 'Bespoke custom-crafted absolute luxury experience',
      multiplier: 2.0,
      warranty: '15 Years Warranty',
      materials: 'Marine Grade Plywood, Veneer & PU Polish finishes, Top-tier Blum fittings, Quartz/Marble countertops',
      furniture: 'Italian leather seating, teak/oak wood structures, fully bespoke pieces',
      decor: 'Automated lighting fixtures, Italian marble highlights, bespoke ceiling details',
      installation: 'Senior turnkey designer and master craftsmen supervision',
      benefits: ['100% Bespoke Craftsmanship', 'Lifetime Support Assistance', 'Premium imported materials']
    }
  ],
  materials: [
    {
      category: 'Plywood & Boards',
      options: [
        { grade: 'Basic', description: 'Commercial MR grade plywood, suitable for dry areas' }  ,
        { grade: 'Standard', description: 'BWP (Boiling Water Proof) / BWR Plywood, termite resistant' },
        { grade: 'Premium', description: 'Heavy-duty Marine Grade plywood with core gap protection' },
        { grade: 'Luxury', description: 'Premium calibrated high-density plywood, water-impermeable' }
      ]
    },
    {
      category: 'Finishes & Laminates',
      options: [
        { grade: 'Basic', description: '0.8mm matte laminates, standard options' },
        { grade: 'Standard', description: '1.0mm high-gloss or textured laminates' },
        { grade: 'Premium', description: '1.2mm anti-scratch acrylic finishes or premium lacquered glass' },
        { grade: 'Luxury', description: 'Natural wood veneers with premium PU (Polyurethane) coating or Italian stone look' }
      ]
    },
    {
      category: 'Hardware & Fittings',
      options: [
        { grade: 'Basic', description: 'Standard hinges and sliders from Link/Godrej' },
        { grade: 'Standard', description: 'Soft-close hinges and telescopic channels from Hettich/Ebco' },
        { grade: 'Premium', description: 'Premium soft-close hinges, Tandem drawers from Blum/Hafele' },
        { grade: 'Luxury', description: 'Top-tier automated drawer systems, magic corners and smart pull-outs from Blum' }
      ]
    }
  ]
};

// Helper function to dynamically retrieve configurations directly from database (with local seeding safety)
const getDbConfig = async () => {
  let config = await EstimatorConfig.findOne({ key: 'pricing_rules' });
  if (!config) {
    config = new EstimatorConfig(DEFAULT_CONFIG);
    await config.save();
    console.log('Seeded estimator dynamic database configurations successfully!');
  }
  return config;
};

export const getPackageDetails = async () => {
  const config = await getDbConfig();
  return config.packages;
};

export const getMaterialDetails = async () => {
  const config = await getDbConfig();
  return config.materials;
};

export const calculateEstimate = async (payload, userId) => {
  const {
    propertyType,
    bhkType,
    squareFeet,
    city,
    rooms,
    packageType,
    materialQuality,
    emiDetails = {}
  } = payload;

  // Retrieve all pricing engine factors dynamically from MongoDB
  const config = await getDbConfig();

  // Convert mongoose maps to standard JS objects/maps for fast lookup
  const baseRoomCosts = Object.fromEntries(config.baseRoomCosts);
  const cityMultipliers = Object.fromEntries(config.cityMultipliers);
  const materialMultipliers = Object.fromEntries(config.materialMultipliers);
  const packageMultipliers = Object.fromEntries(config.packageMultipliers);
  const bhkBaseSqFt = Object.fromEntries(config.bhkBaseSqFt);

  let roomsBreakdown = [];
  let roomsSubtotal = 0;

  const cityMul = cityMultipliers[city] || cityMultipliers['Others'] || 1.0;
  const matMul = materialMultipliers[materialQuality] || materialMultipliers['Standard'] || 1.0;
  const pkgMul = packageMultipliers[packageType] || packageMultipliers['Essential'] || 1.0;

  // Scaling factor based on square feet relative to standard BHK size in the database
  const baseSqFt = bhkBaseSqFt[bhkType] || 1000;
  const sqftScaling = Math.min(Math.max(0.75, 1 + (squareFeet - baseSqFt) / (baseSqFt * 1.5)), 2.0);

  rooms.forEach(roomName => {
    const baseRoomCost = baseRoomCosts[roomName] || 40000;
    const finalRoomCost = Math.round(baseRoomCost * cityMul * matMul * pkgMul * sqftScaling);
    roomsBreakdown.push({
      name: roomName,
      cost: finalRoomCost
    });
    roomsSubtotal += finalRoomCost;
  });

  // Calculate detailed cost categories based on subtotal
  const materialsCost = Math.round(roomsSubtotal * 0.45);
  const furnitureCost = Math.round(roomsSubtotal * 0.25);
  const laborCost = Math.round(roomsSubtotal * 0.15);
  const designCharges = Math.round(roomsSubtotal * 0.08);
  const installationDelivery = Math.round(roomsSubtotal * 0.07);

  const subtotal = materialsCost + furnitureCost + laborCost + designCharges + installationDelivery;
  const gst = Math.round(subtotal * 0.18);
  const totalAmount = subtotal + gst;

  // Calculate EMI Details
  const downPayment = emiDetails.downPayment || 0;
  const tenureMonths = emiDetails.tenureMonths || 12;
  const interestRate = emiDetails.interestRate || 10.5;

  const principal = Math.max(0, totalAmount - downPayment);
  let monthlyEmi = 0;
  let totalPayable = downPayment;

  if (principal > 0) {
    const monthlyRate = interestRate / 12 / 100;
    monthlyEmi = Math.round(
      (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
      (Math.pow(1 + monthlyRate, tenureMonths) - 1)
    );
    totalPayable = downPayment + (monthlyEmi * tenureMonths);
  }

  // Generate Smart Recommendations
  let recommendations = [];
  if (packageType === 'Essential') {
    const premiumMul = packageMultipliers['Premium'] || 1.4;
    const premiumSubtotal = Math.round(roomsSubtotal * (premiumMul / pkgMul));
    const priceDiff = Math.round((premiumSubtotal * 1.18) - totalAmount);
    recommendations.push({
      type: 'package_upgrade',
      title: 'Upgrade to Premium Package',
      description: `Upgrade to the Premium Package for BWR Waterproof plywood, soft-close Blum hinges, and an extended 10-year warranty for an additional ₹${priceDiff.toLocaleString('en-IN')}.`
    });
  }

  if (materialQuality === 'Basic' || materialQuality === 'Standard') {
    recommendations.push({
      type: 'material_upgrade',
      title: 'Waterproof Plywood Upgrade',
      description: `For high moisture cities like ${city}, using Boiling Water Proof (BWP) plywood for kitchen cabinets will double the lifespan of your kitchen.`
    });
  }

  if (rooms.includes('Modular Kitchen') && !rooms.includes('TV Unit')) {
    recommendations.push({
      type: 'combo_offer',
      title: 'Add a TV Unit Accessory',
      description: 'Bundling a modular TV cabinet design with your Kitchen layout qualifies you for an additional 5% off custom furniture pieces.'
    });
  }

  return {
    propertyType,
    bhkType,
    squareFeet,
    city,
    rooms: roomsBreakdown,
    packageType,
    materialQuality,
    breakdown: {
      materials: materialsCost,
      furniture: furnitureCost,
      labor: laborCost,
      designCharges,
      installationDelivery,
    },
    subtotal,
    gst,
    totalAmount,
    emiDetails: {
      downPayment,
      tenureMonths,
      interestRate,
      monthlyEmi,
      totalPayable
    },
    recommendations
  };
};

export const getHistory = async (userId) => {
  return await Estimator.find({ userId }).sort({ createdAt: -1 });
};

export const getEstimateById = async (id, userId) => {
  return await Estimator.findOne({ _id: id, userId });
};

export const saveEstimate = async (payload, userId) => {
  const calculation = await calculateEstimate(payload, userId);
  
  const saved = new Estimator({
    userId,
    propertyType: calculation.propertyType,
    bhkType: calculation.bhkType,
    squareFeet: calculation.squareFeet,
    city: calculation.city,
    rooms: calculation.rooms,
    packageType: calculation.packageType,
    materialQuality: calculation.materialQuality,
    subtotal: calculation.subtotal,
    gst: calculation.gst,
    totalAmount: calculation.totalAmount,
    emiDetails: calculation.emiDetails
  });

  await saved.save();
  return saved;
};

// Generate Professional PDF using PDFKit
export const generatePdf = (estimate, user) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', (err) => reject(err));

    // Colors - Sleek Beige/Luxury Palette
    const primaryColor = '#1A1210';
    const secondaryColor = '#E3D5CA';
    const accentColor = '#817773';
    const highlightColor = '#A38F85';

    // Header Branding
    doc
      .fillColor(primaryColor)
      .fontSize(24)
      .text('SNS NEST', 50, 50)
      .fontSize(10)
      .text('Find & Design Premium Solutions', 50, 75)
      .text('www.sns-nest.com', 50, 90)
      .fillColor(accentColor)
      .text(`Quote Reference: SNS-EST-${estimate._id ? estimate._id.toString().substring(0, 8).toUpperCase() : 'TEMP'}`, 350, 50)
      .text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 350, 65)
      .moveDown();

    // Divider Line
    doc.strokeColor(secondaryColor).lineWidth(1).moveTo(50, 115).lineTo(550, 115).stroke();

    // Bill To
    doc
      .fillColor(primaryColor)
      .fontSize(12)
      .text('PREPARED FOR:', 50, 135)
      .fontSize(10)
      .fillColor('#333333')
      .text(`Client Name: ${user ? user.fullName : 'Guest Indian Homemaker'}`, 50, 155)
      .text(`Email: ${user ? user.email : 'guest@sns-nest.in'}`, 50, 170)
      .text(`Location: ${estimate.city}`, 50, 185)
      .moveDown();

    // Estimate Specs
    doc
      .fillColor(primaryColor)
      .fontSize(12)
      .text('ESTIMATE SPECIFICATIONS:', 300, 135)
      .fontSize(10)
      .fillColor('#333333')
      .text(`Property Type: ${estimate.propertyType} (${estimate.bhkType})`, 300, 155)
      .text(`Area Size: ${estimate.squareFeet} Sq. Ft.`, 300, 170)
      .text(`Package Tier: ${estimate.packageType} (${estimate.materialQuality} Quality)`, 300, 185)
      .moveDown();

    // Table Header
    const tableTop = 230;
    doc
      .strokeColor(secondaryColor)
      .lineWidth(1)
      .moveTo(50, tableTop)
      .lineTo(550, tableTop)
      .stroke();

    doc
      .fillColor(primaryColor)
      .fontSize(10)
      .text('Room Category', 60, tableTop + 10)
      .text('Details & Upgrades included', 220, tableTop + 10)
      .text('Cost (INR)', 450, tableTop + 10);

    doc
      .strokeColor(secondaryColor)
      .lineWidth(1)
      .moveTo(50, tableTop + 30)
      .lineTo(550, tableTop + 30)
      .stroke();

    // Table Body (Rooms)
    let currentY = tableTop + 40;
    estimate.rooms.forEach((room) => {
      doc
        .fillColor('#333333')
        .fontSize(9)
        .text(room.name, 60, currentY)
        .fillColor('#666666')
        .text(`Custom standard configuration for ${estimate.packageType} tier`, 220, currentY, { width: 200 })
        .fillColor(primaryColor)
        .text(`₹ ${room.cost.toLocaleString('en-IN')}`, 450, currentY);

      currentY += 30;
    });

    // Summary block
    doc.strokeColor(secondaryColor).lineWidth(1).moveTo(50, currentY).lineTo(550, currentY).stroke();

    currentY += 20;

    // Detailed Categories Breakdown
    const subtotal = estimate.subtotal || Math.round(estimate.rooms.reduce((acc, curr) => acc + curr.cost, 0));
    const gst = estimate.gst || Math.round(subtotal * 0.18);
    const totalAmount = estimate.totalAmount || (subtotal + gst);

    doc
      .fillColor(accentColor)
      .fontSize(9)
      .text('Detailed Cost Breakdown (Subtotal Components):', 50, currentY)
      .moveDown();

    currentY += 15;
    const items = [
      { name: 'Materials & Woodwork', share: '45%' },
      { name: 'Loose Furniture & Accents', share: '25%' },
      { name: 'Labor & On-Site Construction', share: '15%' },
      { name: 'Professional Designer Consultation Fee', share: '8%' },
      { name: 'Installation & Premium Delivery Logistics', share: '7%' }
    ];

    items.forEach((item) => {
      doc
        .fillColor('#555555')
        .text(item.name, 60, currentY)
        .text(item.share, 220, currentY)
        .text(`₹ ${(Math.round(subtotal * (parseFloat(item.share)/100))).toLocaleString('en-IN')}`, 450, currentY);
      currentY += 18;
    });

    currentY += 10;
    doc.strokeColor(secondaryColor).lineWidth(1).moveTo(50, currentY).lineTo(550, currentY).stroke();
    currentY += 15;

    // Totals on right side
    doc
      .fillColor(primaryColor)
      .fontSize(10)
      .text('Subtotal:', 320, currentY)
      .text(`₹ ${subtotal.toLocaleString('en-IN')}`, 450, currentY);

    currentY += 18;
    doc
      .text('GST (18%):', 320, currentY)
      .text(`₹ ${gst.toLocaleString('en-IN')}`, 450, currentY);

    currentY += 18;
    doc
      .fontSize(12)
      .fillColor(highlightColor)
      .text('Grand Total Amount:', 320, currentY)
      .text(`₹ ${totalAmount.toLocaleString('en-IN')}`, 450, currentY);

    // EMI Notice if calculated
    if (estimate.emiDetails && estimate.emiDetails.monthlyEmi > 0) {
      currentY += 35;
      doc
        .strokeColor(secondaryColor)
        .fillColor('#F9F6F0')
        .rect(50, currentY, 500, 50)
        .fillAndStroke();

      doc
        .fillColor(primaryColor)
        .fontSize(9)
        .text(`EMI Financing Option Available:`, 60, currentY + 12)
        .fillColor('#444444')
        .text(`Pay just ₹ ${estimate.emiDetails.monthlyEmi.toLocaleString('en-IN')}/month for ${estimate.emiDetails.tenureMonths} months at ${estimate.emiDetails.interestRate}% interest. (Downpayment: ₹ ${estimate.emiDetails.downPayment.toLocaleString('en-IN')})`, 60, currentY + 28);
    }

    // Footer
    doc
      .fillColor(accentColor)
      .fontSize(8)
      .text('Thank you for choosing SNS NEST. This is a computer generated quote and requires no signature.', 50, 720, { align: 'center', width: 500 });

    doc.end();
  });
};
