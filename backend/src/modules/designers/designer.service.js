import { Designer } from './designer.model.js';
import { DesignerProfile } from './designer.profile.js';
import { DesignerPortfolio } from './designer.portfolio.js';
import { User } from '../../models/User.js';

export const createDesigner = async (data) => {
  // Logic to create a User, then a Designer, then Profile & Portfolio
  const user = await User.create({
    fullName: data.fullName,
    email: data.email,
    mobile: data.phoneNumber,
    password: data.password,
    role: 'Designer'
  });

  const designer = await Designer.create({
    user: user._id,
    status: data.status || 'Available'
  });

  const profile = await DesignerProfile.create({
    designer: designer._id,
    bio: data.bio,
    expertise: data.expertise || [],
    yearsOfExperience: data.experience || 0
  });

  const portfolio = await DesignerPortfolio.create({
    designer: designer._id,
    items: []
  });

  return { user, designer, profile, portfolio };
};

export const getAllDesigners = async () => {
  return await Designer.find().populate('user', 'fullName email mobile profileImage').lean();
};

export const updateDesignerStatus = async (id, status) => {
  const designer = await Designer.findByIdAndUpdate(id, { status }, { new: true });
  return designer;
};

export const getDesignerAnalytics = async () => {
  const total = await Designer.countDocuments();
  const active = await Designer.countDocuments({ status: { $in: ['Available', 'Busy', 'In Consultation'] } });
  const busy = await Designer.countDocuments({ status: 'Busy' });
  const available = await Designer.countDocuments({ status: 'Available' });

  return { total, active, busy, available };
};

export const updateDesigner = async (id, data) => {
  // Update core Designer schema fields
  const updatedDesigner = await Designer.findByIdAndUpdate(
    id,
    { 
      name: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      specialization: data.expertise,
      experience: data.experience,
      bio: data.bio,
      profileImage: data.profileImage,
      status: data.status
    },
    { new: true, runValidators: true }
  );

  // If there's an associated User, update that too
  if (updatedDesigner.user) {
    await User.findByIdAndUpdate(
      updatedDesigner.user,
      {
        fullName: data.fullName,
        email: data.email,
        mobile: data.phoneNumber
      }
    );
  }

  // Also update the DesignerProfile if we're migrating completely
  await DesignerProfile.findOneAndUpdate(
    { designer: id },
    {
      bio: data.bio,
      yearsOfExperience: data.experience,
      expertise: data.expertise ? [data.expertise] : []
    },
    { upsert: true }
  );

  return updatedDesigner;
};
