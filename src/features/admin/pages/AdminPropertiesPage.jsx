import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '@/shared/lib/axios';
import Modal from '@/shared/components/Modal';
import { 
  FiHome, 
  FiMapPin, 
  FiUser, 
  FiDollarSign, 
  FiSearch, 
  FiPlus, 
  FiTrash2, 
  FiEdit2, 
  FiEye, 
  FiX, 
  FiCheckCircle, 
  FiAlertCircle,
  FiInfo
} from 'react-icons/fi';

const AdminPropertiesPage = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Search parameters support
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(queryParam);

  // Modal & Selection state
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deletePropertyId, setDeletePropertyId] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Form inputs state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    price_per_night: '',
    property_type: 'Apartment',
    bedrooms: '1',
    bathrooms: '1',
    max_guests: '2',
    image_urls: '',
    host_id: ''
  });

  // User-facing feedback alerts (Toasts)
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      const { data } = await apiClient.get('/admin/properties');
      if (data.success) {
        setProperties(data.data);
        setFilteredProperties(data.data);
      }
    } catch (error) {
      console.error('Failed to load properties', error);
      showToast('error', 'Failed to retrieve properties.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await apiClient.get('/admin/users');
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Failed to load user directory for hosts association', error);
    }
  };

  useEffect(() => {
    setSearchQuery(queryParam);
  }, [queryParam]);

  useEffect(() => {
    fetchProperties();
    fetchUsers();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    setFilteredProperties(
      properties.filter(
        (p) =>
          p.title?.toLowerCase().includes(query) ||
          p.location?.toLowerCase().includes(query) ||
          p.host_name?.toLowerCase().includes(query)
      )
    );
    setCurrentPage(1); // Reset page on query updates
  }, [searchQuery, properties]);

  // Operations
  const handleViewDetails = async (id) => {
    try {
      const { data } = await apiClient.get(`/admin/properties/${id}`);
      if (data.success) {
        setSelectedProperty(data.data);
        setIsDetailsOpen(true);
      }
    } catch (error) {
      console.error('Failed to load property details', error);
      showToast('error', 'Failed to load property details.');
    }
  };

  const handleOpenEdit = async (id) => {
    try {
      const { data } = await apiClient.get(`/admin/properties/${id}`);
      if (data.success) {
        const prop = data.data;
        setFormData({
          title: prop.title || '',
          description: prop.description || '',
          location: prop.location || '',
          price_per_night: prop.price_per_night || '',
          property_type: prop.property_type || 'Apartment',
          bedrooms: prop.bedrooms?.toString() || '1',
          bathrooms: prop.bathrooms?.toString() || '1',
          max_guests: prop.max_guests?.toString() || '2',
          image_urls: Array.isArray(prop.image_urls) ? prop.image_urls.join(', ') : '',
          host_id: prop.host_id || ''
        });
        setSelectedProperty(prop);
        setIsEditMode(true);
        setIsFormOpen(true);
      }
    } catch (error) {
      console.error('Failed to fetch property details for edit', error);
      showToast('error', 'Failed to read property data.');
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      price_per_night: '',
      property_type: 'Apartment',
      bedrooms: '1',
      bathrooms: '1',
      max_guests: '2',
      image_urls: '',
      host_id: users.filter(u => u.role === 'host' || u.role === 'admin')[0]?.id || ''
    });
    setIsEditMode(false);
    setIsFormOpen(true);
  };

  const handleDeleteOpen = (id) => {
    setDeletePropertyId(id);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletePropertyId) return;
    try {
      const { data } = await apiClient.delete(`/admin/properties/${deletePropertyId}`);
      if (data.success) {
        showToast('success', 'Property and all associated bookings deleted successfully.');
        setIsDeleteOpen(false);
        setDeletePropertyId(null);
        fetchProperties();
      }
    } catch (error) {
      console.error('Failed to delete property', error);
      showToast('error', error.response?.data?.error || 'Failed to complete deletion process.');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.location || !formData.price_per_night) {
      showToast('error', 'Please fill in all mandatory fields.');
      return;
    }

    try {
      const payload = {
        ...formData,
        price_per_night: parseFloat(formData.price_per_night),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        max_guests: parseInt(formData.max_guests),
      };

      let response;
      if (isEditMode && selectedProperty) {
        response = await apiClient.put(`/admin/properties/${selectedProperty.id}`, payload);
      } else {
        response = await apiClient.post('/admin/properties', payload);
      }

      if (response.data.success) {
        showToast('success', `Property ${isEditMode ? 'updated' : 'registered'} successfully.`);
        setIsFormOpen(false);
        fetchProperties();
      }
    } catch (error) {
      console.error('Failed to submit property details', error);
      showToast('error', error.response?.data?.error || 'Failed to submit property metadata.');
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500 font-medium animate-pulse">Loading properties...</div>;

  // Pagination calculations
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProperties = filteredProperties.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <>
      {/* Main Page Layout Wrapper */}
      <div className="space-y-6 animate-fade-in-up relative">
        
        {/* Toast Alert System */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg animate-modal-in ${
            toast.type === 'success' 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
              : 'bg-rose-50 text-rose-700 border-rose-100'
          }`}>
            {toast.type === 'success' ? <FiCheckCircle className="text-lg shrink-0" /> : <FiAlertCircle className="text-lg shrink-0" />}
            <span className="text-xs font-bold">{toast.message}</span>
          </div>
        )}

        {/* Header section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Platform Listings</h2>
            <p className="text-slate-500 text-sm mt-1">Audit, register, modify, or remove vacation properties.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <FiSearch className="text-base" />
              </span>
              <input
                type="text"
                placeholder="Search listings, locations, hosts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-800 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100/40 transition-all shadow-sm"
              />
            </div>

            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-850 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              <FiPlus className="text-base" /> Add Property
            </button>
          </div>
        </div>

        {/* Table Container with Pagination Footer */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-slate-50/70 text-left text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <th className="px-6 py-4.5 rounded-l-lg">Property Details</th>
                  <th className="px-6 py-4.5">Location</th>
                  <th className="px-6 py-4.5">Price / Night</th>
                  <th className="px-6 py-4.5">Host Name</th>
                  <th className="px-6 py-4.5">Status</th>
                  <th className="px-6 py-4.5 rounded-r-lg text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {currentProperties.map((property) => (
                  <tr key={property.id} className="hover:bg-slate-50/40 transition-colors group">
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
                          <FiHome className="text-lg" />
                        </div>
                        <div>
                          <span className="block text-slate-900 font-bold leading-normal">{property.title}</span>
                          <span className="text-[11px] text-slate-400 font-mono block mt-0.5">{property.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4.5 text-slate-600 font-medium">
                      <div className="flex items-center gap-1.5">
                        <FiMapPin className="text-slate-400 text-sm" />
                        {property.city || property.location}
                      </div>
                    </td>
                    <td className="px-6 py-4.5 font-extrabold text-indigo-600">
                      ${Number(property.price || property.price_per_night).toLocaleString()}
                    </td>
                    <td className="px-6 py-4.5 text-slate-600 font-medium">
                      <div className="flex items-center gap-1.5">
                        <FiUser className="text-slate-400 text-sm" />
                        {property.host_name || 'System User'}
                      </div>
                    </td>
                    <td className="px-6 py-4.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-extrabold ${
                        property.status === 'active' || !property.status
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          : 'bg-slate-50 text-slate-600 border border-slate-200'
                      }`}>
                        {property.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleViewDetails(property.id)}
                          className="p-1.5 bg-slate-55 bg-slate-100/50 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-slate-500 transition-all cursor-pointer"
                          title="View Details"
                        >
                          <FiEye className="text-base" />
                        </button>
                        <button 
                          onClick={() => handleOpenEdit(property.id)}
                          className="p-1.5 bg-slate-55 bg-slate-100/50 hover:bg-amber-50 hover:text-amber-600 rounded-lg text-slate-500 transition-all cursor-pointer"
                          title="Edit Details"
                        >
                          <FiEdit2 className="text-base" />
                        </button>
                        <button 
                          onClick={() => handleDeleteOpen(property.id)}
                          className="p-1.5 bg-slate-55 bg-slate-100/50 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-500 transition-all cursor-pointer"
                          title="Delete Property"
                        >
                          <FiTrash2 className="text-base" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProperties.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-medium">No matching properties found on the platform.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls Footer */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-slate-100 mt-auto">
              <div className="text-xs font-semibold text-slate-500">
                Showing <span className="text-slate-800 font-bold">{indexOfFirstItem + 1}</span> to <span className="text-slate-800 font-bold">{Math.min(indexOfLastItem, filteredProperties.length)}</span> of <span className="text-slate-800 font-bold">{filteredProperties.length}</span> properties
              </div>
              
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-655 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm cursor-pointer"
                >
                  Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      currentPage === pageNumber
                        ? 'bg-indigo-605 bg-indigo-600 text-white shadow-sm'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}
                
                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-655 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Modals are placed outside main content div to escape parent anim contain-block transform bugs */}

      {/* Property Details View Modal */}
      <Modal 
        isOpen={isDetailsOpen} 
        onClose={() => setIsDetailsOpen(false)} 
        title="Listing Inspector" 
        size="md"
      >
        {selectedProperty && (
          <div className="space-y-5 text-left">
            {/* Image Banner */}
            {selectedProperty.image_urls && selectedProperty.image_urls.length > 0 ? (
              <div className="h-52 w-full rounded-xl overflow-hidden relative shadow-inner bg-slate-100">
                <img 
                  src={selectedProperty.image_urls[0]} 
                  alt={selectedProperty.title} 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = '/placeholder.png'; }}
                />
                <div className="absolute top-3 right-3 bg-indigo-600 text-white font-extrabold text-xs px-2.5 py-1.5 rounded-lg shadow-md">
                  ${Number(selectedProperty.price_per_night).toLocaleString()} / night
                </div>
              </div>
            ) : (
              <div className="h-52 w-full rounded-xl bg-slate-50 flex items-center justify-center border border-dashed border-slate-200">
                <FiHome className="text-slate-300 text-5xl" />
              </div>
            )}

            {/* Title & Location */}
            <div>
              <h4 className="text-sm font-extrabold text-slate-900">{selectedProperty.title}</h4>
              <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-2 font-medium">
                <FiMapPin className="text-slate-400" />
                {selectedProperty.location}
              </div>
            </div>

            {/* Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/80 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Type</span>
                <span className="text-xs font-extrabold text-slate-800 capitalize mt-0.5 block">{selectedProperty.property_type || 'Apartment'}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Bedrooms</span>
                <span className="text-xs font-extrabold text-slate-800 mt-0.5 block">{selectedProperty.bedrooms || 1} Rooms</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Bathrooms</span>
                <span className="text-xs font-extrabold text-slate-800 mt-0.5 block">{selectedProperty.bathrooms || 1} Baths</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Max Guests</span>
                <span className="text-xs font-extrabold text-slate-800 mt-0.5 block">{selectedProperty.max_guests || 2} Guests</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Description</span>
              <p className="text-slate-600 text-xs leading-relaxed font-medium bg-slate-50/30 p-3 rounded-lg border border-slate-100 max-h-32 overflow-y-auto no-scrollbar">
                {selectedProperty.description || 'No description uploaded for this property listing.'}
              </p>
            </div>

            {/* Host and Registry metadata */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 font-extrabold text-sm shrink-0">
                  {selectedProperty.host_name?.[0] || 'U'}
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-800">{selectedProperty.host_name || 'System Host'}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{selectedProperty.host_email || 'host@luxestay.com'}</span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Registered On</span>
                <span className="text-xs font-bold text-slate-700 mt-0.5 block">
                  {selectedProperty.created_at ? new Date(selectedProperty.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => {
                  setIsDetailsOpen(false);
                  handleOpenEdit(selectedProperty.id);
                }}
                className="px-5 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
              >
                <FiEdit2 /> Edit Listing
              </button>
              <button 
                type="button"
                onClick={() => setIsDetailsOpen(false)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Property Create / Edit Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={isEditMode ? 'Modify Property Listing' : 'Register New Property'}
        size="md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
          {/* Form Fields */}
          <div className="space-y-1">
            <label className="text-xs font-extrabold text-slate-700 block">Property Title <span className="text-rose-500">*</span></label>
            <input 
              type="text" 
              required
              placeholder="e.g. Modern Luxury Loft" 
              value={formData.title} 
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none transition-all focus:ring-2 focus:ring-indigo-100/40"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-slate-700 block">Location (City, Country) <span className="text-rose-500">*</span></label>
              <input 
                type="text" 
                required
                placeholder="e.g. Rome, Italy" 
                value={formData.location} 
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none transition-all focus:ring-2 focus:ring-indigo-100/40"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-extrabold text-slate-700 block">Price / Night ($) <span className="text-rose-500">*</span></label>
              <input 
                type="number" 
                required
                min="1"
                placeholder="e.g. 150" 
                value={formData.price_per_night} 
                onChange={(e) => setFormData({ ...formData, price_per_night: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none transition-all focus:ring-2 focus:ring-indigo-100/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-slate-700 block">Property Type</label>
              <select 
                value={formData.property_type} 
                onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none transition-all capitalize focus:ring-2 focus:ring-indigo-100/40"
              >
                {['Apartment', 'House', 'Villa', 'Cabin', 'Studio', 'Penthouse'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-extrabold text-slate-700 block">Assign Host <span className="text-rose-500">*</span></label>
              <select 
                value={formData.host_id} 
                onChange={(e) => setFormData({ ...formData, host_id: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none transition-all focus:ring-2 focus:ring-indigo-100/40"
              >
                {users.filter(u => u.role === 'host' || u.role === 'admin').map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role}) - {u.email}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-slate-700 uppercase block">Bedrooms</label>
              <input 
                type="number" 
                min="1"
                value={formData.bedrooms} 
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-slate-700 uppercase block">Bathrooms</label>
              <input 
                type="number" 
                min="1"
                value={formData.bathrooms} 
                onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-slate-700 uppercase block">Max Guests</label>
              <input 
                type="number" 
                min="1"
                value={formData.max_guests} 
                onChange={(e) => setFormData({ ...formData, max_guests: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-extrabold text-slate-700 block">Image URLs (comma-separated)</label>
            <input 
              type="text" 
              placeholder="e.g. /images/villa.jpg, https://example.com/loft.png" 
              value={formData.image_urls} 
              onChange={(e) => setFormData({ ...formData, image_urls: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none transition-all focus:ring-2 focus:ring-indigo-100/40"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-extrabold text-slate-700 block">Property Description</label>
            <textarea 
              rows="4"
              placeholder="Outline details, amenities, view, special features..." 
              value={formData.description} 
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none transition-all resize-none focus:ring-2 focus:ring-indigo-100/40"
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button 
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-5 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
            >
              {isEditMode ? 'Save Changes' : 'Publish Property'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Property Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletePropertyId(null);
        }}
        title="Confirm Property Removal"
        size="sm"
      >
        <div className="space-y-4 text-center">
          <div className="h-12 w-12 rounded-full bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
            <FiTrash2 className="text-xl" />
          </div>
          
          <div>
            <p className="text-slate-500 text-xs leading-relaxed font-medium">
              Removing this listing will permanently delete its details from the database. 
              <span className="block font-bold text-rose-600 mt-1.5 bg-rose-50/50 p-2.5 rounded-lg border border-rose-100">
                Warning: All associated bookings and messages will also be deleted. This operation cannot be undone.
              </span>
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button 
              type="button"
              onClick={() => {
                setIsDeleteOpen(false);
                setDeletePropertyId(null);
              }}
              className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer active:scale-95"
            >
              No, Keep Listing
            </button>
            <button 
              type="button"
              onClick={handleDeleteConfirm}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
            >
              Yes, Delete Property
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AdminPropertiesPage;
