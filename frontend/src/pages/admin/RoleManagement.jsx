import React, { useState, useEffect } from "react";
import {
  Shield, Plus, Search, User, Phone, Mail, Edit2,
  Loader2, AlertCircle, CheckCircle, XCircle, ChevronDown,
  UserPlus, Users, Eye, EyeOff, Key, Building, Zap, MapPin
} from "lucide-react";
import { authApi, masterApi } from "../../services/api.service";
import useAuthStore from "../../store/authStore";

const DEPARTMENTS = [
  { value: "hospital", label: "Hospital (अस्पताल)" },
  { value: "gram_panchayat", label: "Gram Panchayat (ग्राम पंचायत)" },
  { value: "agriculture", label: "Agriculture (कृषि)" },
  { value: "revenue", label: "Revenue (राजस्व)" },
  { value: "patwari", label: "Patwari (पटवारी)" },
  { value: "thana", label: "Thana (थाना)" },
  { value: "irrigation", label: "Irrigation (सिंचाई)" },
  { value: "health", label: "Health (स्वास्थ्य)" },
];

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin (Collector)", color: "purple" },
  { value: "sub-admin", label: "Officer (Hierarchical)", color: "amber" },
  { value: "department", label: "Department", color: "brand" },
];

const DESIGNATIONS = [
  { value: "tehsildar", label: "Tehsildar (तहसीलदार)" },
  { value: "sdm", label: "SDM (एसडीएम)" },
  { value: "collector", label: "Collector (कलेक्टर)" },
];

const getRoleBadge = (role) => {
  switch (role) {
    case "admin": return "bg-purple-50 text-purple-600 border-purple-100";
    case "sub-admin": return "bg-amber-50 text-amber-600 border-amber-100";
    case "department": return "bg-brand-50 text-brand-600 border-brand-100";
    case "public": return "bg-slate-50 text-slate-500 border-slate-100";
    default: return "bg-slate-50 text-slate-500 border-slate-100";
  }
};

const getDeptLabel = (val) => {
  const d = DEPARTMENTS.find(x => x.value === val);
  return d ? d.label : val || "—";
};

const RoleManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Create/Edit Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "", mobile: "", aadhaar: "", email: "",
    password: "", role: "department", departmentType: "",
    designation: "",
    assignedDistrict: "", assignedTehsil: "", assignedBlock: ""
  });
  const [districts, setDistricts] = useState([]);
  const [tehsils, setTehsils] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loadingTehsils, setLoadingTehsils] = useState(false);
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Authorization Modal states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [allDisasterTypes, setAllDisasterTypes] = useState([]);
  const [selectedDisasterIds, setSelectedDisasterIds] = useState([]);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchDisasterTypes();
    fetchDistricts();
  }, []);

  useEffect(() => {
    if (success || error) {
      const t = setTimeout(() => { setSuccess(""); setError(""); }, 4000);
      return () => clearTimeout(t);
    }
  }, [success, error]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await authApi.getAllUsers();
      setUsers(res.data.data);
    } catch (err) {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchDisasterTypes = async () => {
    try {
      const res = await masterApi.getDisasterTypes();
      setAllDisasterTypes(res.data.data);
    } catch (err) {
      console.error("Failed to fetch disaster types", err);
    }
  };

  const fetchDistricts = async () => {
    try {
      const res = await masterApi.getDistricts();
      setDistricts(res.data.data);
    } catch (err) {
      console.error("Failed to fetch districts", err);
    }
  };

  const fetchTehsils = async (districtId) => {
    try {
      setLoadingTehsils(true);
      const res = await masterApi.getTehsils(districtId);
      setTehsils(res.data.data);
    } catch (err) {
      console.error("Failed to fetch tehsils", err);
    } finally {
      setLoadingTehsils(false);
    }
  };

  const fetchBlocks = async (districtId) => {
    try {
      setLoadingBlocks(true);
      const res = await masterApi.getBlocks(districtId);
      setBlocks(res.data.data);
    } catch (err) {
      console.error("Failed to fetch blocks", err);
    } finally {
      setLoadingBlocks(false);
    }
  };

  useEffect(() => {
    if (formData.assignedDistrict) {
      fetchTehsils(formData.assignedDistrict);
      fetchBlocks(formData.assignedDistrict);
    } else {
      setTehsils([]);
      setBlocks([]);
    }
  }, [formData.assignedDistrict]);

  // ── Create / Edit User ──────────────────────
  const openAddModal = () => {
    setFormData({ 
      name: "", mobile: "", aadhaar: "", email: "", password: "", 
      role: "department", departmentType: "",
      designation: "",
      assignedDistrict: "", assignedTehsil: "", assignedBlock: ""
    });
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setModalMode("edit");
    setEditingUser(user);
    setFormData({
      name: user.name, mobile: user.mobile, aadhaar: user.aadhaar || "",
      email: user.email || "", password: "", role: user.role,
      departmentType: user.departmentType || "",
      designation: user.designation || "",
      assignedDistrict: user.assignedDistrict?._id || user.assignedDistrict || "",
      assignedTehsil: user.assignedTehsil?._id || user.assignedTehsil || "",
      assignedBlock: user.assignedBlock?._id || user.assignedBlock || ""
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (modalMode === "add") {
        const res = await authApi.createUser(formData);
        const newUser = res.data.data.user || res.data.data;
        setUsers(prev => [newUser, ...prev]);
        setSuccess("User created successfully!");
      } else {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        const res = await authApi.updateUser(editingUser._id, payload);
        const updatedUser = res.data.data.user || res.data.data;
        
        // Optimistically update the list
        setUsers(prev => prev.map(u => u._id === updatedUser._id ? updatedUser : u));

        // Sync authStore if the edited user is the current logged-in user
        if (editingUser._id === user._id) {
          useAuthStore.getState().updateUser(updatedUser);
        }

        setSuccess("User updated successfully!");
      }
      setShowModal(false);
      // Removed redundant fetchUsers() as we updated state optimistically
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (userId) => {
    try {
      const res = await authApi.toggleUserActive(userId);
      setSuccess(res.data.message);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  // ── Authorization Modal ──────────────────────
  const openAuthModal = (user) => {
    setAuthUser(user);
    // Pre-select the user's existing authorized disaster types
    const existingIds = (user.authorizedDisasterTypes || []).map(d => d._id || d);
    setSelectedDisasterIds(existingIds);
    setShowAuthModal(true);
  };

  const toggleDisasterSelection = (id) => {
    setSelectedDisasterIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleAuthSubmit = async () => {
    try {
      setAuthSubmitting(true);
      const res = await authApi.updateAuthorizedDisasters(authUser._id, selectedDisasterIds);
      setSuccess(res.data.message);
      setShowAuthModal(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update authorization");
    } finally {
      setAuthSubmitting(false);
    }
  };

  const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  // ── Filter / Stats ──────────────────────
  const filtered = users.filter(u => {
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) ||
                        u.mobile?.includes(search) || u.aadhaar?.includes(search);
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const stats = {
    total: users.length,
    admin: users.filter(u => u.role === "admin").length,
    department: users.filter(u => u.role === "department").length,
    public: users.filter(u => u.role === "public").length,
    active: users.filter(u => u.isActive).length,
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-brand-100 rounded-[1.5rem] flex items-center justify-center text-brand-600 shadow-sm border border-brand-100">
              <Shield size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">उपयोगकर्ता प्रबंधन</h1>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">User Management</p>
            </div>
          </div>
        </div>
        <button
          onClick={openAddModal}
          className="px-8 py-4 bg-brand-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-brand-600/20 hover:bg-brand-700 hover:-translate-y-1 transition-all flex items-center gap-3"
        >
          <UserPlus size={18} /> Create New User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Total Users", val: stats.total, icon: Users, bg: "bg-slate-50", color: "text-slate-600" },
          { label: "Admins", val: stats.admin, icon: Shield, bg: "bg-purple-50", color: "text-purple-600" },
          { label: "Department", val: stats.department, icon: Building, bg: "bg-brand-50", color: "text-brand-600" },
          { label: "Public", val: stats.public, icon: User, bg: "bg-blue-50", color: "text-blue-600" },
          { label: "Active", val: stats.active, icon: CheckCircle, bg: "bg-emerald-50", color: "text-emerald-600" },
        ].map(s => (
          <div key={s.label} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`w-10 h-10 rounded-2xl ${s.bg} flex items-center justify-center ${s.color}`}><s.icon size={18}/></div>
            <div>
              <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.label}</span>
              <span className="text-lg font-black text-slate-800">{s.val}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 text-sm rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-4">
          <AlertCircle size={18} /> {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-4">
          <CheckCircle size={18} /> {success}
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, mobile, or Aadhaar..."
              className="w-full pl-11 pr-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-600 outline-none transition-all"
            />
          </div>
          <div className="flex gap-2">
            {["all", "admin", "sub-admin", "department", "public"].map(r => (
              <button key={r} onClick={() => setRoleFilter(r)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                  roleFilter === r ? "bg-brand-600 text-white border-brand-600 shadow-lg shadow-brand-600/20" : "bg-white text-slate-500 border-slate-200 hover:border-brand-200"
                }`}
              >{r === "all" ? "All" : r}</button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="animate-spin text-brand-600 mx-auto mb-4" size={36} />
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Loading users...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Users size={36} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold text-sm">No users found matching your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorized Types</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="text-right px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u._id} className="border-b border-slate-50 hover:bg-brand-50/20 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-sm uppercase">
                          {u.name?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-sm">{u.name}</div>
                          <div className="text-[10px] text-slate-400 font-bold">
                            {u.role === "sub-admin" ? u.designation?.toUpperCase() : getDeptLabel(u.departmentType)}
                            {(u.role === "department" || u.role === "sub-admin") && (
                              <>
                                {u.assignedDistrict ? ` • ${u.assignedDistrict.name || u.assignedDistrict}` : " • No District"}
                                {u.assignedTehsil && ` • ${u.assignedTehsil.name || u.assignedTehsil}`}
                                {u.assignedBlock && ` • ${u.assignedBlock.name || u.assignedBlock}`}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5"><Phone size={11}/> {u.mobile}</span>
                        {u.email && <span className="text-[10px] text-slate-400 flex items-center gap-1.5"><Mail size={10}/> {u.email}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${getRoleBadge(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      {u.role === "department" ? (
                        <div className="flex flex-wrap gap-1.5">
                          {u.authorizedDisasterTypes?.length > 0 ? (
                            u.authorizedDisasterTypes.map(dt => (
                              <span key={dt._id} className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-lg text-[9px] font-black uppercase tracking-tight">
                                {dt.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-red-400 font-bold italic">No authorization</span>
                          )}
                        </div>
                      ) : u.role === "admin" ? (
                        <span className="text-[10px] text-purple-500 font-bold italic">All Types (Collector)</span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold">—</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                        u.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-500 border-red-100"
                      }`}>
                        {u.isActive ? <><CheckCircle size={10} /> Active</> : <><XCircle size={10} /> Inactive</>}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 justify-end transition-all">
                        {u.role === "department" && (
                          <button onClick={() => openAuthModal(u)}
                            className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 hover:text-amber-700 hover:bg-amber-100 flex items-center justify-center transition-all"
                            title="Manage Authorization"
                          >
                            <Zap size={14} />
                          </button>
                        )}
                        <button onClick={() => openEditModal(u)}
                          className="w-9 h-9 rounded-xl bg-slate-100 text-slate-400 hover:text-brand-600 hover:bg-brand-50 flex items-center justify-center transition-all"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleToggleActive(u._id)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                            u.isActive ? "bg-red-50 text-red-400 hover:text-red-600 hover:bg-red-100" : "bg-emerald-50 text-emerald-400 hover:text-emerald-600 hover:bg-emerald-100"
                          }`}
                          title={u.isActive ? "Deactivate" : "Activate"}
                        >
                          {u.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* CREATE / EDIT MODAL */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0 z-10">
              <div>
                <h3 className="font-black text-slate-900 text-xl uppercase tracking-tight">
                  {modalMode === "add" ? "Create User" : "Edit User"}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {modalMode === "add" ? "Add a new departmental account" : `Editing ${editingUser?.name}`}
                </p>
              </div>
              <button onClick={() => setShowModal(false)}
                className="w-10 h-10 rounded-2xl bg-white text-slate-400 hover:text-slate-600 transition-all flex items-center justify-center border border-slate-200 shadow-sm"
              >
                <Plus size={20} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name *</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" required value={formData.name} onChange={e => updateField("name", e.target.value)}
                    className="w-full pl-11 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-600 focus:bg-white outline-none transition-all text-sm font-bold"
                    placeholder="Enter full name..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Mobile *</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" required value={formData.mobile} onChange={e => updateField("mobile", e.target.value)}
                      className="w-full pl-11 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-600 focus:bg-white outline-none transition-all text-sm font-bold"
                      placeholder="10-digit" pattern="[6-9]\d{9}" maxLength={10}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Aadhaar *</label>
                  <div className="relative">
                    <Key size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" required={modalMode === "add"} value={formData.aadhaar} onChange={e => updateField("aadhaar", e.target.value)}
                      className="w-full pl-11 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-600 focus:bg-white outline-none transition-all text-sm font-bold"
                      placeholder="12-digit" pattern="\d{12}" maxLength={12}
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email (Optional)</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="email" value={formData.email} onChange={e => updateField("email", e.target.value)}
                    className="w-full pl-11 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-600 focus:bg-white outline-none transition-all text-sm font-bold"
                    placeholder="user@email.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                  Password {modalMode === "add" ? "*" : "(leave blank to keep current)"}
                </label>
                <input type="password" required={modalMode === "add"} value={formData.password} onChange={e => updateField("password", e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-600 focus:bg-white outline-none transition-all text-sm font-bold"
                  placeholder={modalMode === "add" ? "Min 6 characters" : "Leave blank to keep current"}
                  minLength={modalMode === "add" ? 6 : 0}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Role *</label>
                <div className="grid grid-cols-3 gap-3">
                  {ROLE_OPTIONS.map(r => (
                    <button type="button" key={r.value} onClick={() => updateField("role", r.value)}
                      className={`p-4 rounded-2xl text-[10px] font-bold border transition-all text-center uppercase tracking-tighter ${
                        formData.role === r.value ? "bg-brand-600 text-white border-brand-600 shadow-lg shadow-brand-600/20" : "bg-white text-slate-600 border-slate-200 hover:border-brand-200"
                      }`}
                    >{r.label}</button>
                  ))}
                </div>
              </div>
              {formData.role === "department" && (
                <div>
                  <label className="block text-[10px] font-black text-brand-600 uppercase tracking-widest mb-2 ml-1 animate-pulse">Department Type * (Required for Promotion)</label>
                  <div className="relative">
                    <Building size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500" />
                    <select required value={formData.departmentType} onChange={e => updateField("departmentType", e.target.value)}
                      className="w-full pl-11 pr-5 py-4 bg-brand-50/50 border border-brand-200 rounded-2xl focus:ring-2 focus:ring-brand-600 focus:bg-white outline-none transition-all text-sm font-bold appearance-none"
                    >
                      <option value="">Select department...</option>
                      {DEPARTMENTS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-400 pointer-events-none" />
                  </div>
                </div>
              )}

              {formData.role === "sub-admin" && (
                <div>
                  <label className="block text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2 ml-1 animate-pulse">Designation * (Required)</label>
                  <div className="relative">
                    <Shield size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" />
                    <select required value={formData.designation} onChange={e => updateField("designation", e.target.value)}
                      className="w-full pl-11 pr-5 py-4 bg-amber-50/50 border border-amber-200 rounded-2xl focus:ring-2 focus:ring-amber-600 focus:bg-white outline-none transition-all text-sm font-bold appearance-none"
                    >
                      <option value="">Select designation...</option>
                      {DESIGNATIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-400 pointer-events-none" />
                  </div>
                </div>
              )}

              {(formData.role === "department" || formData.role === "sub-admin") && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-brand-600 uppercase tracking-widest mb-2 ml-1">Assigned District *</label>
                      <div className="relative">
                        <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500" />
                        <select required value={formData.assignedDistrict} onChange={e => updateField("assignedDistrict", e.target.value)}
                          className="w-full pl-11 pr-5 py-4 bg-brand-50/50 border border-brand-200 rounded-2xl focus:ring-2 focus:ring-brand-600 focus:bg-white outline-none transition-all text-sm font-bold appearance-none"
                        >
                          <option value="">Select District...</option>
                          {districts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Assigned Tehsil</label>
                      <div className="relative">
                        <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select value={formData.assignedTehsil} onChange={e => updateField("assignedTehsil", e.target.value)}
                          disabled={!formData.assignedDistrict || loadingTehsils}
                          className="w-full pl-11 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-600 focus:bg-white outline-none transition-all text-sm font-bold appearance-none disabled:opacity-50"
                        >
                          <option value="">{loadingTehsils ? "Loading..." : "Select Tehsil..."}</option>
                          {tehsils.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Assigned Block</label>
                      <div className="relative">
                        <Building size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select value={formData.assignedBlock} onChange={e => updateField("assignedBlock", e.target.value)}
                          disabled={!formData.assignedDistrict || loadingBlocks}
                          className="w-full pl-11 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-600 focus:bg-white outline-none transition-all text-sm font-bold appearance-none disabled:opacity-50"
                        >
                          <option value="">{loadingBlocks ? "Loading..." : "Select Block..."}</option>
                          {blocks.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </>
              )}
              <button type="submit" disabled={submitting}
                className="w-full bg-brand-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-brand-600/20 hover:bg-brand-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em] mt-4"
              >
                {submitting ? <Loader2 className="animate-spin" size={20} /> : (modalMode === "add" ? "Create Account" : "Save Changes")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* AUTHORIZATION MODAL (Disaster Types) */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {showAuthModal && authUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
            <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 font-black text-xl uppercase">
                  {authUser.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg">{authUser.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {getDeptLabel(authUser.departmentType)} • {authUser.mobile}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Zap size={16} className="text-amber-600" />
                <span className="text-xs font-black text-amber-700 uppercase tracking-widest">
                  Disaster Type Authorization (आपदा प्रकार प्राधिकरण)
                </span>
              </div>
            </div>

            <div className="p-8">
              <p className="text-xs text-slate-500 font-medium mb-6">
                Select which disaster types this officer is authorized to <strong>resolve</strong>. They can handle multiple types simultaneously.
              </p>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {allDisasterTypes.map(dt => {
                  const isSelected = selectedDisasterIds.includes(dt._id);
                  return (
                    <button
                      key={dt._id}
                      type="button"
                      onClick={() => toggleDisasterSelection(dt._id)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl text-left transition-all border ${
                        isSelected
                          ? "bg-amber-50 border-amber-300 text-amber-800 shadow-sm"
                          : "bg-white border-slate-100 text-slate-600 hover:border-amber-200 hover:bg-amber-50/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                          isSelected ? "bg-amber-500 border-amber-500 text-white" : "border-slate-300 bg-white"
                        }`}>
                          {isSelected && <CheckCircle size={14} />}
                        </div>
                        <span className="text-sm font-bold">{dt.name}</span>
                      </div>
                      {isSelected && (
                        <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest px-2 py-1 bg-amber-100 rounded-lg">
                          Authorized
                        </span>
                      )}
                    </button>
                  );
                })}
                {allDisasterTypes.length === 0 && (
                  <div className="text-center py-10 text-slate-400 text-xs font-bold">
                    No disaster types found. Create them in Master → Disaster Types first.
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {selectedDisasterIds.length} of {allDisasterTypes.length} selected
                </span>
                <div className="flex gap-3">
                  <button onClick={() => setShowAuthModal(false)}
                    className="px-6 py-3 bg-white border border-slate-200 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-slate-300 transition-all"
                  >Cancel</button>
                  <button onClick={handleAuthSubmit} disabled={authSubmitting}
                    className="px-8 py-3 bg-amber-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:bg-amber-600 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                  >
                    {authSubmitting ? <Loader2 className="animate-spin" size={16} /> : "Save Authorization"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagement;
