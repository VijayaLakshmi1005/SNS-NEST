import { catchAsync } from '../../utils/catchAsync.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import * as estimatorService from './estimator.service.js';

export const calculate = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { saveEstimate } = req.body;

  let result;
  if (saveEstimate) {
    result = await estimatorService.saveEstimate(req.body, userId);
  } else {
    result = await estimatorService.calculateEstimate(req.body, userId);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Dynamic luxury estimation calculated successfully'));
});

export const getPackages = catchAsync(async (req, res) => {
  const packages = await estimatorService.getPackageDetails();
  return res
    .status(200)
    .json(new ApiResponse(200, packages, 'Packages list retrieved successfully'));
});

export const getMaterials = catchAsync(async (req, res) => {
  const materials = await estimatorService.getMaterialDetails();
  return res
    .status(200)
    .json(new ApiResponse(200, materials, 'Material configurations retrieved successfully'));
});

export const getHistory = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const history = await estimatorService.getHistory(userId);
  return res
    .status(200)
    .json(new ApiResponse(200, history, 'Estimation history retrieved successfully'));
});

export const getById = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;
  const estimate = await estimatorService.getEstimateById(id, userId);

  if (!estimate) {
    throw new ApiError(404, 'Quotation not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, estimate, 'Estimation detail retrieved successfully'));
});

export const downloadPdf = catchAsync(async (req, res) => {
  const { estimateId } = req.body;
  let estimatePayload;

  if (estimateId) {
    const saved = await estimatorService.getEstimateById(estimateId, req.user._id);
    if (!saved) {
      throw new ApiError(404, 'Saved estimate quotation not found');
    }
    estimatePayload = saved;
  } else {
    // Generate estimate payload dynamically
    estimatePayload = await estimatorService.calculateEstimate(req.body, req.user._id);
    
    // Override with manual inputs if provided (Admin edits)
    if (req.body.subtotal !== undefined) estimatePayload.subtotal = req.body.subtotal;
    if (req.body.gst !== undefined) estimatePayload.gst = req.body.gst;
    if (req.body.totalAmount !== undefined) estimatePayload.totalAmount = req.body.totalAmount;
    if (req.body.manualRoomCosts) {
      estimatePayload.rooms = estimatePayload.rooms.map(r => ({
        name: r.name,
        cost: req.body.manualRoomCosts[r.name] !== undefined ? Number(req.body.manualRoomCosts[r.name]) : r.cost
      }));
    }
  }

  const pdfBuffer = await estimatorService.generatePdf(estimatePayload, req.user);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=SNS_NEST_Estimate_${Date.now()}.pdf`);
  return res.status(200).send(pdfBuffer);
});
