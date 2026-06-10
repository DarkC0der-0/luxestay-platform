import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '@/shared/lib/axios';
import Modal from '@/shared/components/Modal';
import AdminUserProfileModal from '../components/AdminUserProfileModal';
import { 
  FiUserCheck, 
  FiUserX, 
  FiSearch, 
  FiEye, 
  FiEdit, 
  FiTrash2, 
  FiMail, 
  FiCalendar, 
  FiShield, 
  FiActivity,
  FiHome,
  FiCreditCard,
  FiInfo
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(queryParam);

  // Modal & Selection state
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);

  // Role form state
  const [editRole, setEditRole] = useState('guest');

  useEffect(() => {
    setSearchQuery(queryParam);
  }, [queryParam]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data } = await apiClient.get('/admin/users');
      if (data.success) {
        setUsers(data.data);
        setFilteredUsers(data.data);
      }
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = users.filter(
      (u) =>
        u.name?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query) ||
        u.role?.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset page on query updates
  }, [searchQuery, users]);

  // Ultra-Safe Formatting Helpers
  const formatVal = (val) => {
    const n = Number(val);
    return isNaN(n) ? '0' : n.toLocaleString();
  };

  const formatDateSafe = (dateStr, options = {}) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Invalid Date';
    return d.toLocaleDateString(undefined, options);
  };

  const handleViewDetails = async (id) => {
    setSelectedUser(null); // Clear previous to prevent stale data crashes
    setIsDetailsOpen(true); // Open modal in loading state
    try {
      const { data } = await apiClient.get(`/admin/users/${id}`);
      if (data.success) {
        setSelectedUser(data.data);
      } else {
        toast.error('User data synchronization failed');
        setIsDetailsOpen(false);
      }
    } catch (error) {
      toast.error('System failed to retrieve profile intelligence');
      setIsDetailsOpen(false);
    }
  };

  const handleOpenRole = (user) => {
    setSelectedUser(user);
    setEditRole(user.role);
    setIsRoleOpen(true);
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    try {
      const { data } = await apiClient.patch(`/admin/users/${selectedUser.id}/role`, { role: editRole });
      if (data.success) {
        toast.success('User role updated');
        setIsRoleOpen(false);
        fetchUsers();
      }
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const toggleSuspension = async (id, currentStatus) => {
    try {
      const { data } = await apiClient.patch(`/admin/users/${id}/suspend`, { is_suspended: !currentStatus });
      if (data.success) {
        toast.success(data.message);
        setUsers(users.map(u => u.id === id ? { ...u, is_suspended: !currentStatus } : u));
      }
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteOpen = (id) => {
    setDeleteUserId(id);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const { data } = await apiClient.delete(`/admin/users/${deleteUserId}`);
      if (data.success) {
        toast.success('User deleted successfully');
        setIsDeleteOpen(false);
        setDeleteUserId(null);
        fetchUsers();
      }
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  if (isLoading) return <div className="p-8 text-center text-slate-500 font-medium animate-pulse">Loading users...</div>;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">User Management</h2>
          <p className="text-slate-500 text-sm mt-1">Review guest/host profiles and suspend or activate accounts.</p>
        </div>

        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <FiSearch className="text-base" />
          </span>
          <input
            type="text"
            placeholder="Search users by name, email, role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-80 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-800 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100/40 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-slate-50/70 text-left text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <th className="px-6 py-4.5 rounded-l-lg">User Profile</th>
                <th className="px-6 py-4.5">Email</th>
                <th className="px-6 py-4.5">Role</th>
                <th className="px-6 py-4.5">Account Status</th>
                <th className="px-6 py-4.5 rounded-r-lg text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {currentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="px-6 py-4.5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-slate-100 to-slate-200 text-slate-700 font-extrabold flex items-center justify-center text-sm border border-slate-200">
                        {user.name?.[0] || 'G'}
                      </div>
                      <div>
                        <span className="block text-slate-900 font-bold leading-normal">{user.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{user.id.substring(0, 8)}...</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4.5 text-slate-600 font-medium">{user.email}</td>
                  <td className="px-6 py-4.5">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-extrabold capitalize ${
                      user.role === 'admin' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                      user.role === 'host' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 
                      'bg-slate-50 text-slate-600 border border-slate-200'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4.5">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-extrabold ${
                      user.is_suspended 
                        ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}>
                      {user.is_suspended ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button type="button"
                        onClick={() => handleViewDetails(user.id)}
                        className="p-1.5 bg-slate-100/50 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-slate-500 transition-all cursor-pointer"
                        title="View Profile"
                      >
                        <FiEye className="text-base" />
                      </button>
                      <button 
                        onClick={() => handleOpenRole(user)}
                        className="p-1.5 bg-slate-100/50 hover:bg-amber-50 hover:text-amber-600 rounded-lg text-slate-500 transition-all cursor-pointer"
                        title="Edit Role"
                      >
                        <FiEdit className="text-base" />
                      </button>
                      <button 
                        onClick={() => toggleSuspension(user.id, user.is_suspended)}
                        className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                          user.is_suspended 
                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                            : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                        }`}
                        title={user.is_suspended ? 'Reactivate User' : 'Suspend User'}
                      >
                        {user.is_suspended ? <FiUserCheck className="text-base" /> : <FiUserX className="text-base" />}
                      </button>
                      <button 
                        onClick={() => handleDeleteOpen(user.id)}
                        className="p-1.5 bg-slate-100/50 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-500 transition-all cursor-pointer"
                        title="Delete User"
                      >
                        <FiTrash2 className="text-base" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-slate-400 font-medium">No matching users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-slate-100 mt-auto">
            <div className="text-xs font-semibold text-slate-500">
              Showing <span className="text-slate-800 font-bold">{indexOfFirstItem + 1}</span> to <span className="text-slate-800 font-bold">{Math.min(indexOfLastItem, filteredUsers.length)}</span> of <span className="text-slate-800 font-bold">{filteredUsers.length}</span> users
            </div>
            
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm cursor-pointer"
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
                      ? 'bg-indigo-600 text-white shadow-sm'
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
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      <AdminUserProfileModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        user={selectedUser}
        showAdminControls={true}
        onOpenRole={handleOpenRole}
        onToggleSuspension={toggleSuspension}
        onDelete={handleDeleteOpen}
      />

      {/* Role Management Modal */}
      <Modal
        isOpen={isRoleOpen}
        onClose={() => setIsRoleOpen(false)}
        title="Adjust Access Level"
        size="sm"
      >
        <form onSubmit={handleUpdateRole} className="space-y-5">
          <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center gap-3 mb-2">
            <FiShield className="text-indigo-600 text-xl flex-shrink-0" />
            <p className="text-[11px] text-indigo-700 font-medium leading-relaxed">
              Changing a user's role will grant or restrict access to administrative and hosting features immediately.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-extrabold text-slate-700 block">Select New Role</label>
            <div className="grid grid-cols-1 gap-2">
              {['guest', 'host', 'admin'].map(role => (
                <label 
                  key={role}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    editRole === role ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/10' : 'border-slate-100 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="role" 
                      value={role} 
                      checked={editRole === role}
                      onChange={(e) => setEditRole(e.target.value)}
                      className="hidden"
                    />
                    <span className="text-xs font-bold text-slate-900 capitalize">{role}</span>
                  </div>
                  {editRole === role && <FiUserCheck className="text-indigo-600" />}
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button 
              type="button"
              onClick={() => setIsRoleOpen(false)}
              className="px-4 py-2 text-slate-500 text-xs font-bold hover:text-slate-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              Update Permissions
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Irreversible Account Deletion"
        size="sm"
      >
        <div className="space-y-4 text-center">
          <div className="h-12 w-12 rounded-full bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
            <FiTrash2 className="text-xl" />
          </div>
          
          <div>
            <p className="text-slate-500 text-xs leading-relaxed font-medium">
              This will permanently remove the user, all their properties, bookings, and messages.
              <span className="block font-bold text-rose-600 mt-1.5 bg-rose-50/50 p-2.5 rounded-lg border border-rose-100">
                Warning: This action cannot be undone and is completely irreversible.
              </span>
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button 
              type="button"
              onClick={() => setIsDeleteOpen(false)}
              className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="button"
              onClick={handleDeleteConfirm}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              Confirm Deletion
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminUsersPage;
