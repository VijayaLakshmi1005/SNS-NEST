import Vendor from './vendor.model.js';
import Procurement from './procurement.model.js';
import { getIO } from '../../config/socket.js';

// Auto-seed basic luxury vendors if none exist
const seedVendors = async () => {
  try {
    const count = await Vendor.countDocuments();
    if (count === 0) {
      await Vendor.create([
        {
          companyName: 'Luxe Marble & Granite',
          category: 'Marble & Granite',
          contactPerson: 'Rahul Sharma',
          phone: '+91 9876543210',
          email: 'rahul@luxemarble.in',
          materialsSupplied: ['Italian Marble', 'Onyx', 'Granite Slabs'],
          rating: 4.8
        },
        {
          companyName: 'Scandinavian Woodworks',
          category: 'Furniture',
          contactPerson: 'Amit Patel',
          phone: '+91 9876543211',
          email: 'amit@scandiwood.in',
          materialsSupplied: ['Bespoke Sofa Sets', 'Dining Tables', 'Chairs'],
          rating: 4.9
        },
        {
          companyName: 'Aura Premium Lighting',
          category: 'Lighting',
          contactPerson: 'Priya Singh',
          phone: '+91 9876543212',
          email: 'priya@auralighting.in',
          materialsSupplied: ['Chandeliers', 'Ambient LEDs', 'Pendant Lights'],
          rating: 4.7
        }
      ]);
      console.log('Seeded luxury vendors.');
    }
  } catch (err) {
    console.error('Error seeding vendors:', err);
  }
};
seedVendors();

export const getVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({ createdAt: -1 });
    res.json({ success: true, data: vendors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProcurement = async (req, res) => {
  try {
    const { vendorId, projectName, items, expectedDeliveryDate } = req.body;
    
    let totalAmount = 0;
    if (items && items.length > 0) {
      totalAmount = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    }

    const procurement = await Procurement.create({
      vendor: vendorId,
      projectName,
      items,
      totalAmount,
      expectedDeliveryDate
    });

    const populated = await Procurement.findById(procurement._id).populate('vendor', 'companyName category');

    try {
      getIO().emit('procurementCreated', populated);
    } catch(err) { /* ignore socket error if not connected */ }

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProcurements = async (req, res) => {
  try {
    const procurements = await Procurement.find()
      .populate('vendor', 'companyName category contactPerson')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: procurements });
  } catch (error) {
    console.error('Procurements Error:', error);
    res.status(500).json({ success: false, message: error.message, stack: error.stack });
  }
};

export const updateProcurementStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;
    
    const updateData = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const procurement = await Procurement.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('vendor', 'companyName category contactPerson');

    if (status === 'Delivered') {
      await Vendor.findByIdAndUpdate(procurement.vendor._id, { $inc: { completedDeliveries: 1 } });
    }

    try {
      getIO().emit('procurementUpdated', procurement);
    } catch(err) {}

    res.json({ success: true, data: procurement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
