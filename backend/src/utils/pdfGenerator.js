import PDFDocument from 'pdfkit';

export const generateEstimatePDF = (estimateData, user) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', (err) => reject(err));

    // Colors
    const primaryColor = '#1A1210';
    const secondaryColor = '#E3D5CA';
    const accentColor = '#817773';

    // Header
    doc
      .fillColor(primaryColor)
      .fontSize(24)
      .text('SNS NEST', 50, 50)
      .fontSize(10)
      .text('Find & Design Premium Solutions', 50, 75)
      .text('www.sns-nest.com', 50, 90)
      .fillColor(accentColor)
      .text(`Invoice ID: EST-${estimateData._id.toString().substring(0, 8).toUpperCase()}`, 400, 50)
      .text(`Date: ${new Date(estimateData.createdAt).toLocaleDateString('en-IN')}`, 400, 65)
      .moveDown();

    // Divider Line
    doc.strokeColor(secondaryColor).lineWidth(1).moveTo(50, 115).lineTo(550, 115).stroke();

    // Bill To
    doc
      .fillColor(primaryColor)
      .fontSize(12)
      .text('BILL TO:', 50, 135)
      .fontSize(10)
      .fillColor('#000000')
      .text(`Client Name: ${user.fullName}`, 50, 155)
      .text(`Email: ${user.email}`, 50, 170)
      .text(`Mobile: ${user.mobile}`, 50, 185)
      .moveDown();

    // Estimate Details
    doc
      .fillColor(primaryColor)
      .fontSize(12)
      .text('ESTIMATE DESCRIPTION:', 300, 135)
      .fontSize(10)
      .fillColor('#000000')
      .text(`Home Size: ${estimateData.homeSize} sq ft`, 300, 155)
      .text(`BHK Type: ${estimateData.bhkType}`, 300, 170)
      .text(`Material Quality: ${estimateData.quality.toUpperCase()}`, 300, 185)
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
      .text('Category', 60, tableTop + 10)
      .text('Description', 180, tableTop + 10)
      .text('Share (%)', 350, tableTop + 10)
      .text('Amount (INR)', 450, tableTop + 10);

    doc
      .strokeColor(secondaryColor)
      .lineWidth(1)
      .moveTo(50, tableTop + 30)
      .lineTo(550, tableTop + 30)
      .stroke();

    // Table Body
    let currentY = tableTop + 40;
    const categories = [
      { name: 'Woodwork & Cabinetry', desc: 'Custom luxury modular kitchen and wardrobes', pct: '40%' },
      { name: 'Civil & Painting', desc: 'Premium false ceiling, wall leveling & painting', pct: '30%' },
      { name: 'Decor & Fittings', desc: 'Premium luxury lights, switches & soft furnishings', pct: '30%' }
    ];

    categories.forEach((cat, idx) => {
      const share = idx === 0 ? 0.4 : 0.3;
      const amt = estimateData.totalCost * share;

      doc
        .fillColor('#333333')
        .text(cat.name, 60, currentY)
        .text(cat.desc, 180, currentY, { width: 160 })
        .text(cat.pct, 350, currentY)
        .text(`Rs. ${amt.toLocaleString('en-IN')}`, 450, currentY);

      currentY += 40;
    });

    // Summary block
    doc.strokeColor(secondaryColor).lineWidth(1).moveTo(50, currentY).lineTo(550, currentY).stroke();

    currentY += 20;

    const baseAmount = estimateData.totalCost;
    const taxAmount = baseAmount * 0.18;
    const totalAmount = baseAmount + taxAmount;

    doc
      .fillColor(primaryColor)
      .fontSize(10)
      .text('Subtotal:', 350, currentY)
      .text(`Rs. ${baseAmount.toLocaleString('en-IN')}`, 450, currentY);

    currentY += 20;
    doc
      .text('GST (18%):', 350, currentY)
      .text(`Rs. ${taxAmount.toLocaleString('en-IN')}`, 450, currentY);

    currentY += 20;
    doc
      .fontSize(12)
      .text('Total Amount (INR):', 350, currentY)
      .text(`Rs. ${totalAmount.toLocaleString('en-IN')}`, 450, currentY);

    // Footer
    doc
      .fillColor(accentColor)
      .fontSize(8)
      .text('Thank you for choosing SNS NEST. This is a computer generated quote and requires no signature.', 50, 700, { align: 'center', width: 500 });

    doc.end();
  });
};
