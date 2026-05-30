import { WishlistItem, Collection, SavedDesign } from './wishlist.model.js';
import { User } from '../../models/User.js';

/**
 * Seeder: Ensures some luxury inspirations exist for the user on first access
 */
export const ensureWishlistSeeded = async (userId) => {
  const count = await WishlistItem.countDocuments({ userId });
  if (count > 0) return;

  console.log(`Seeding custom premium wishlist collections and inspirations for user: ${userId}`);

  // Find or create admin to assign cover coverages
  let admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    admin = new User({
      fullName: 'John Admin',
      email: 'admin_wishlist@snsnest.com',
      mobile: '9876543211',
      password: 'admin123',
      role: 'admin',
      isVerified: true
    });
    await admin.save();
  }

  // 1. Create Curated Collections
  const collectionsData = [
    {
      title: 'Dream Kitchen Layouts',
      description: 'Elegant Scandinavian kitchen counters with minimal fluted oak cabinetry',
      coverImage: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800'
    },
    {
      title: 'Scandinavian Living Rooms',
      description: 'Bright organic textures, soft linen textiles, and luxury fireplaces',
      coverImage: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&q=80&w=800'
    },
    {
      title: 'Minimal Bedroom Havens',
      description: 'Sleek luxury bedrooms featuring custom walnut bed back installations',
      coverImage: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=80&w=800'
    }
  ];

  const collections = [];
  for (const c of collectionsData) {
    const col = new Collection({
      userId,
      title: c.title,
      description: c.description,
      coverImage: c.coverImage
    });
    await col.save();
    collections.push(col);
  }

  // 2. Create Saved Designs inspirations
  const savedDesignsData = [
    {
      roomType: 'Kitchen',
      style: 'Scandinavian',
      images: ['https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800'],
      designerId: admin._id,
      tags: ['fluted oak', 'quartz countertops', 'hidden appliances']
    },
    {
      roomType: 'Living Room',
      style: 'Minimal',
      images: ['https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&q=80&w=800'],
      designerId: admin._id,
      tags: ['organic tones', 'linen sofa', 'limewash paint']
    },
    {
      roomType: 'Bedroom',
      style: 'Luxury',
      images: ['https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=80&w=800'],
      designerId: admin._id,
      tags: ['walnut paneling', 'ambient backlighting', 'velvet bedhead']
    },
    {
      roomType: 'Office',
      style: 'Contemporary',
      images: ['https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=800'],
      designerId: admin._id,
      tags: ['oak desk', 'ergonomic setup', 'floating shelves']
    }
  ];

  const designs = [];
  for (const sd of savedDesignsData) {
    const design = new SavedDesign({
      roomType: sd.roomType,
      style: sd.style,
      images: sd.images,
      designerId: sd.designerId,
      tags: sd.tags
    });
    await design.save();
    designs.push(design);
  }

  // 3. Link them inside the WishlistItem register
  const itemsData = [
    {
      designId: designs[0]._id,
      collectionId: collections[0]._id,
      notes: 'Ensure we use high-grade quartz countertops'
    },
    {
      designId: designs[1]._id,
      collectionId: collections[1]._id,
      notes: 'Love the limewash color scheme'
    },
    {
      designId: designs[2]._id,
      collectionId: collections[2]._id,
      notes: 'Prefer velvet headboards'
    },
    {
      designId: designs[3]._id, // left in unorganized pool
      collectionId: null,
      notes: 'Perfect spacing for home study work tasks'
    }
  ];

  for (const m of itemsData) {
    const item = new WishlistItem({
      userId,
      designId: m.designId,
      collectionId: m.collectionId || undefined,
      notes: m.notes
    });
    await item.save();
  }
};

/**
 * Get all Wishlist items
 */
export const getWishlist = async (userId) => {
  await ensureWishlistSeeded(userId);

  const items = await WishlistItem.find({ userId })
    .populate({
      path: 'designId',
      populate: {
        path: 'designerId',
        select: 'fullName email profileImage'
      }
    })
    .populate('collectionId');

  return items;
};

/**
 * Save / Add room design to Wishlist
 */
export const saveWishlistItem = async (userId, data) => {
  let designId = data.designId;

  // Create design inspiration dynamically if requested (AI generated rooms)
  if (!designId) {
    const newDesign = new SavedDesign({
      roomType: data.roomType,
      style: data.style,
      images: data.images,
      designerId: data.designerId || null,
      tags: data.tags || []
    });
    await newDesign.save();
    designId = newDesign._id;
  }

  // Verify unique key to prevent redundant records
  const existing = await WishlistItem.findOne({
    userId,
    designId,
    collectionId: data.collectionId || null
  });

  if (existing) {
    return existing;
  }

  const newItem = new WishlistItem({
    userId,
    designId,
    collectionId: data.collectionId || undefined,
    notes: data.notes || ''
  });
  await newItem.save();

  return await WishlistItem.findById(newItem._id)
    .populate('designId')
    .populate('collectionId');
};

/**
 * Remove saved design item
 */
export const removeWishlistItem = async (id, userId) => {
  return await WishlistItem.findOneAndDelete({ _id: id, userId });
};

/**
 * Create Collections
 */
export const createCollection = async (userId, data) => {
  const collection = new Collection({
    userId,
    title: data.title,
    description: data.description || '',
    coverImage: data.coverImage || 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800'
  });
  await collection.save();
  return collection;
};

/**
 * Update Collection
 */
export const updateCollection = async (id, userId, data) => {
  return await Collection.findOneAndUpdate(
    { _id: id, userId },
    { $set: data },
    { new: true }
  );
};

/**
 * Delete Collection
 */
export const deleteCollection = async (id, userId) => {
  // Delete the collection reference
  const col = await Collection.findOneAndDelete({ _id: id, userId });
  if (col) {
    // Unlink items under this collection (move to general pool)
    await WishlistItem.updateMany(
      { userId, collectionId: id },
      { $unset: { collectionId: 1 } }
    );
  }
  return col;
};

/**
 * Add / Link Design to collection (duplicates / moves reference)
 */
export const addDesignToCollection = async (collectionId, userId, designId) => {
  const existing = await WishlistItem.findOne({
    userId,
    designId,
    collectionId
  });

  if (existing) return existing;

  const item = new WishlistItem({
    userId,
    designId,
    collectionId,
    notes: ''
  });
  await item.save();

  return await WishlistItem.findById(item._id)
    .populate('designId')
    .populate('collectionId');
};

/**
 * Update dynamic wishlist notes
 */
export const updateNotes = async (id, userId, notes) => {
  return await WishlistItem.findOneAndUpdate(
    { _id: id, userId },
    { $set: { notes } },
    { new: true }
  ).populate('designId').populate('collectionId');
};

/**
 * Get recently saved designs
 */
export const getRecentSaves = async (userId) => {
  return await WishlistItem.find({ userId })
    .populate({
      path: 'designId',
      populate: {
        path: 'designerId',
        select: 'fullName email profileImage'
      }
    })
    .sort({ createdAt: -1 })
    .limit(5);
};

/**
 * Curate Shared designer recommendations
 */
export const getSharedInspirations = async () => {
  // Get all designs curated by designers
  return await SavedDesign.find({ designerId: { $ne: null } })
    .populate('designerId', 'fullName email role profileImage')
    .limit(8);
};
