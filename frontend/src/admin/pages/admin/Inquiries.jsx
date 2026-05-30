import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../../../client/utils/api';
import { io } from 'socket.io-client';
import { FileText, Map, CheckCircle, XCircle, Search, Clock, UploadCloud, Loader2, Calculator } from 'lucide-react';
import Estimate from '../../../client/estimate/Estimate';

export default function Inquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showEstimator, setShowEstimator] = useState(false);
  
  // Modal states
  const [designers, setDesigners] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInquiries();
    fetchDesigners();

    const token = localStorage.getItem('admin-token');
    if (token) {
      const socket = io('http://localhost:5000', { auth: { token } });
      socket.on('inquiry_created', () => {
        fetchInquiries();
      });
      return () => socket.disconnect();
    }
  }, []);

  const fetchInquiries = async () => {
    try {
      const res = await apiRequest('/inquiries');
      setInquiries(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDesigners = async () => {
    try {
      const res = await apiRequest('/admin/users');
      // Filter users who are either admins or designers
      const availableDesigners = (res.data?.users || []).filter(u => u.role === 'admin' || u.role === 'designer' || u.role === 'super_admin');
      setDesigners(availableDesigners);
    } catch (err) {
      console.error('Failed to fetch designers', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inquiry?')) return;
    try {
      await apiRequest(`/inquiries/${id}`, { method: 'DELETE' });
      setInquiries(prev => prev.filter(inq => inq._id !== id));
    } catch (error) {
      // If it's already deleted on the backend (404), remove it from the UI anyway
      if (error?.response?.status === 404) {
        setInquiries(prev => prev.filter(inq => inq._id !== id));
      } else {
        console.error('Failed to delete inquiry:', error);
      }
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1c1c1c]">Inquiries & Quotations</h1>
          <p className="text-[#8b8175] mt-1">Review client floor plans, map 3D models, and send final quotations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {inquiries.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-[#e5e5e0]">
            <p className="text-[#8b8175]">No inquiries found.</p>
          </div>
        ) : (
          inquiries.map((inq) => (
            <div key={inq._id} className="p-6 bg-white rounded-2xl border border-[#e5e5e0] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h3 className="text-lg font-bold text-[#1c1c1c]">{inq.client?.fullName || 'Unknown Client'}</h3>
                <p className="text-sm text-[#8b8175]">{inq.client?.email} | {inq.client?.mobile}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-2 py-1 text-xs font-semibold bg-[#f5f5f0] rounded-lg">
                    {inq.estimationDetails?.squareFeet || inq.estimationDetails?.homeSize} SQ.FT
                  </span>
                  <span className="px-2 py-1 text-xs font-semibold bg-[#f5f5f0] rounded-lg">
                    {inq.estimationDetails?.bhkType}
                  </span>
                  <span className="px-2 py-1 text-xs font-semibold bg-[#f5f5f0] rounded-lg">
                    Est: ₹{inq.estimationDetails?.totalEstimatedCost?.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full ${
                  inq.status === 'Pending Admin Review' ? 'bg-orange-100 text-orange-600' :
                  inq.status === 'Proposal Sent' ? 'bg-blue-100 text-blue-600' :
                  inq.status === 'Client Accepted' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {inq.status}
                </span>

                <a href={inq.floorPlanUrl} target="_blank" rel="noreferrer" className="p-2 border border-[#e5e5e0] rounded-lg hover:bg-[#f5f5f0] text-sm font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4" /> View Floor Plan
                </a>

                <button 
                  onClick={() => { setSelectedInquiry(inq); setShowEstimator(true); }}
                  className="p-2 border border-[#e5e5e0] rounded-lg hover:bg-[#f5f5f0] text-sm font-semibold flex items-center gap-2"
                >
                  <Calculator className="w-4 h-4" /> Edit Estimate
                </button>

                <button 
                  onClick={() => handleDelete(inq._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-semibold flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Admin Estimator Modal */}
      {showEstimator && selectedInquiry && (
        <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
          <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10 shadow-sm">
            <h2 className="text-lg font-bold text-[#1c1c1c]">Adjust Quotation & Send Proposal</h2>
            <button 
              onClick={() => { setShowEstimator(false); setSelectedInquiry(null); }}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 max-w-7xl mx-auto">
            <Estimate 
              initialConfig={selectedInquiry.estimationDetails} 
              adminMode={{
                designers,
                onSendProposal: async (file, designerId, totalAmount, pdfBlob, manualRoomCosts, totals) => {
                  setSubmitting(true);
                  const formData = new FormData();
                  if (file) formData.append('model3D', file);
                  formData.append('finalQuotation', totalAmount.toString());
                  if (designerId) formData.append('assignedDesigner', designerId);
                  if (pdfBlob) formData.append('pdfQuotation', pdfBlob, 'Quotation.pdf');
                  
                  const updatedDetails = {
                     ...selectedInquiry.estimationDetails,
                     totalEstimatedCost: totalAmount,
                     manualRoomCosts,
                     subtotal: totals?.subtotal,
                     gst: totals?.gst
                  };
                  formData.append('estimationDetails', JSON.stringify(updatedDetails));

                  try {
                    await apiRequest(`/inquiries/${selectedInquiry._id}/proposal`, {
                      method: 'PATCH',
                      body: formData
                    });
                    setSelectedInquiry(null);
                    setShowEstimator(false);
                    fetchInquiries();
                  } catch (error) {
                    console.error('Failed to send proposal:', error);
                  } finally {
                    setSubmitting(false);
                  }
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
