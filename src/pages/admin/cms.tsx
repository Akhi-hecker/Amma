import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
    Palette, FileText, Image, ShoppingBag, Settings,
    Plus, Edit2, Trash2, Upload, Download, Check, X,
    Eye, EyeOff, Copy, Search, ChevronDown, RefreshCw, Shield
} from 'lucide-react';
import { db, storage } from '@/lib/firebase';
import {
    collection, getDocs, addDoc, updateDoc, deleteDoc, doc,
    query, orderBy, setDoc, Timestamp, where
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import { useAuth } from '@/context/AuthContext';

// ============================================
// ADMIN EMAILS - DEPRECATED: Role-based access now used
// ============================================

// ============================================
// TYPES
// ============================================
interface Design {
    id: string;
    name: string;
    category: string;
    descriptor: string;
    long_description: string;
    fabric_suitability: string;
    complexity: string;
    base_price: number;
    is_active: boolean;
    image_url?: string;
    created_at?: string;
    updated_at?: string;
}

interface FAQ {
    id: string;
    question: string;
    answer: string;
    order: number;
}

interface Testimonial {
    id: string;
    name: string;
    content: string;
    rating: number;
}

interface SiteContent {
    hero: { title: string; subtitle: string; cta_text: string };
    about: { content: string };
}

interface SiteSettings {
    categories: string[];
    contact_email: string;
    contact_phone: string;
}

interface Order {
    id: string;
    customer_name: string;
    email: string;
    status: string;
    total: number;
    created_at: string;
}

interface MediaItem {
    name: string;
    url: string;
    fullPath: string;
}

// ============================================
// DEFAULT VALUES
// ============================================
const DEFAULT_CATEGORIES = ['Bridal', 'Floral', 'Traditional', 'Modern', 'Minimal', 'Heavy', 'Festive', 'Border'];

const EMPTY_DESIGN: Omit<Design, 'id'> = {
    name: '',
    category: 'Floral',
    descriptor: '',
    long_description: '',
    fabric_suitability: '',
    complexity: 'Medium',
    base_price: 0,
    is_active: true,
    image_url: ''
};

// ============================================
// MAIN CMS COMPONENT
// ============================================
export default function CMSPage() {
    const { user, isLoading, isAuthenticated, isAdmin } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'designs' | 'content' | 'media' | 'orders' | 'settings'>('designs');

    // Check if user is an admin
    // const isAdmin = true; <-- Removed hardcoded override

    const tabs = [
        { id: 'designs', label: 'Designs', icon: Palette },
        { id: 'content', label: 'Content', icon: FileText },
        { id: 'media', label: 'Media Library', icon: Image },
        { id: 'orders', label: 'Orders', icon: ShoppingBag },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    // Show loading state while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
                <div className="text-center max-w-md mx-auto p-8">
                    <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h1 className="text-2xl font-semibold text-gray-900 mb-2">Access Restricted</h1>
                    <p className="text-gray-500 mb-6">Please log in to access the admin panel.</p>
                    <button
                        onClick={() => router.push('/login')}
                        className="px-6 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
                    >
                        Go to Login
                    </button>
                    <button
                        onClick={() => router.push('/')}
                        className="block w-full mt-4 text-sm text-gray-500 hover:text-gray-900"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    // Show 404-style page if not an admin
    if (!isAdmin) {
        return (
            <>
                <Head>
                    <title>404 - Page Not Found | Amma</title>
                </Head>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
                    <div className="text-center max-w-md mx-auto p-8">
                        <h1 className="text-6xl font-bold text-gray-200 mb-4">404</h1>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Page Not Found</h2>
                        <p className="text-gray-500 mb-6">The page you're looking for doesn't exist or you don't have permission to view it.</p>
                        <button
                            onClick={() => router.push('/')}
                            className="px-6 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
                        >
                            Go to Homepage
                        </button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head>
                <title>CMS Admin | Amma</title>
            </Head>
            <div className="min-h-screen bg-white">
                {/* Fixed Sidebar - Light Notion Style */}
                <aside className="fixed left-0 top-0 h-screen w-60 bg-[#fbfbfa] border-r border-gray-200 z-40 hidden lg:flex flex-col">
                    {/* Logo */}
                    <div className="px-4 py-5">
                        <h1 className="text-sm font-semibold text-gray-900 tracking-tight">AMMA</h1>
                        <p className="text-xs text-gray-500 mt-0.5">Content Management</p>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-2 py-2 space-y-0.5">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${activeTab === tab.id
                                    ? 'bg-gray-100 text-gray-900 font-medium'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <tab.icon size={16} className={activeTab === tab.id ? 'text-gray-700' : 'text-gray-400'} />
                                {tab.label}
                            </button>
                        ))}
                    </nav>

                    {/* Admin Info */}
                    <div className="px-3 py-3 border-t border-gray-100">
                        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-gray-50 cursor-pointer">
                            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                                {user?.name?.charAt(0) || 'A'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-700 truncate">{user?.name || 'Admin'}</p>
                                <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Mobile Header - Light */}
                <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-40 flex items-center justify-between px-4">
                    <h1 className="text-sm font-semibold text-gray-900">AMMA CMS</h1>
                    <div className="flex gap-0.5">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                className={`p-2 rounded-md transition-colors ${activeTab === tab.id
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                    }`}
                                title={tab.label}
                            >
                                <tab.icon size={18} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <main className="lg:ml-60 min-h-screen bg-white">
                    {/* Page Header - Simple */}
                    <header className="sticky top-0 bg-white border-b border-gray-100 z-30 pt-14 lg:pt-0">
                        <div className="px-6 lg:px-8 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-400 mb-1">{tabs.find(t => t.id === activeTab)?.label}</p>
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        {tabs.find(t => t.id === activeTab)?.label}
                                    </h2>
                                </div>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                                    title="Refresh"
                                >
                                    <RefreshCw size={16} />
                                </button>
                            </div>
                        </div>
                    </header>

                    {/* Tab Content */}
                    <div className="p-6 lg:p-8">
                        {activeTab === 'designs' && <DesignsModule />}
                        {activeTab === 'content' && <ContentModule />}
                        {activeTab === 'media' && <MediaModule />}
                        {activeTab === 'orders' && <OrdersModule />}
                        {activeTab === 'settings' && <SettingsModule />}
                    </div>
                </main>
            </div>
        </>
    );
}

// ============================================
// DESIGNS MODULE
// ============================================
function DesignsModule() {
    const [designs, setDesigns] = useState<Design[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingDesign, setEditingDesign] = useState<Design | null>(null);
    const [formData, setFormData] = useState<Omit<Design, 'id'>>(EMPTY_DESIGN);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const csvInputRef = useRef<HTMLInputElement>(null);

    // Fetch designs
    useEffect(() => {
        fetchDesigns();
        fetchCategories();
    }, []);

    const fetchDesigns = async () => {
        try {
            const designsRef = collection(db, 'designs');
            const q = query(designsRef, orderBy('created_at', 'desc'));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Design));
            setDesigns(data);
        } catch (err) {
            console.error('Error fetching designs:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const settingsDoc = await getDocs(collection(db, 'site_settings'));
            settingsDoc.forEach(doc => {
                const data = doc.data();
                if (data.categories) setCategories(data.categories);
            });
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const now = new Date().toISOString();
            if (editingDesign) {
                await updateDoc(doc(db, 'designs', editingDesign.id), {
                    ...formData,
                    updated_at: now
                });
            } else {
                await addDoc(collection(db, 'designs'), {
                    ...formData,
                    created_at: now,
                    updated_at: now
                });
            }
            setShowForm(false);
            setEditingDesign(null);
            setFormData(EMPTY_DESIGN);
            fetchDesigns();
        } catch (err) {
            console.error('Error saving design:', err);
            alert('Failed to save design');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this design?')) return;
        try {
            await deleteDoc(doc(db, 'designs', id));
            fetchDesigns();
        } catch (err) {
            console.error('Error deleting design:', err);
        }
    };

    const handleToggleActive = async (design: Design) => {
        try {
            await updateDoc(doc(db, 'designs', design.id), {
                is_active: !design.is_active,
                updated_at: new Date().toISOString()
            });
            fetchDesigns();
        } catch (err) {
            console.error('Error toggling design:', err);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const storageRef = ref(storage, `designs/${Date.now()}_${file.name}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            setFormData(prev => ({ ...prev, image_url: url }));
        } catch (err) {
            console.error('Error uploading image:', err);
            alert('Failed to upload image');
        }
    };

    // CSV Import
    const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const text = event.target?.result as string;
                const lines = text.split('\n');
                const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

                const designsToImport: Omit<Design, 'id'>[] = [];

                for (let i = 1; i < lines.length; i++) {
                    if (!lines[i].trim()) continue;
                    const values = lines[i].split(',');
                    const design: any = {};

                    headers.forEach((header, idx) => {
                        const val = values[idx]?.trim() || '';
                        if (header === 'base_price') {
                            design[header] = parseFloat(val) || 0;
                        } else if (header === 'is_active') {
                            design[header] = val.toLowerCase() === 'true';
                        } else {
                            design[header] = val;
                        }
                    });

                    design.created_at = new Date().toISOString();
                    design.updated_at = new Date().toISOString();
                    if (design.is_active === undefined) design.is_active = true;

                    designsToImport.push(design);
                }

                // Batch import
                for (const design of designsToImport) {
                    await addDoc(collection(db, 'designs'), design);
                }

                alert(`Successfully imported ${designsToImport.length} designs`);
                fetchDesigns();
            } catch (err) {
                console.error('CSV Import Error:', err);
                alert('Failed to import CSV');
            }
        };
        reader.readAsText(file);
    };

    // CSV Export
    const handleCSVExport = () => {
        const headers = ['name', 'category', 'descriptor', 'long_description', 'fabric_suitability', 'complexity', 'base_price', 'is_active'];
        const csvContent = [
            headers.join(','),
            ...designs.map(d => headers.map(h => `"${(d as any)[h] || ''}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `designs_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    // Filter designs
    const filteredDesigns = designs.filter(d => {
        const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.descriptor.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || d.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-5">
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-[#fbfbfa] rounded-lg border border-gray-200 p-4">
                    <p className="text-xs text-gray-500">Total Designs</p>
                    <p className="text-xl font-semibold text-gray-900 mt-1">{designs.length}</p>
                </div>
                <div className="bg-[#fbfbfa] rounded-lg border border-gray-200 p-4">
                    <p className="text-xs text-gray-500">Active</p>
                    <p className="text-xl font-semibold text-gray-900 mt-1">{designs.filter(d => d.is_active).length}</p>
                </div>
                <div className="bg-[#fbfbfa] rounded-lg border border-gray-200 p-4">
                    <p className="text-xs text-gray-500">Hidden</p>
                    <p className="text-xl font-semibold text-gray-400 mt-1">{designs.filter(d => !d.is_active).length}</p>
                </div>
                <div className="bg-[#fbfbfa] rounded-lg border border-gray-200 p-4">
                    <p className="text-xs text-gray-500">Categories</p>
                    <p className="text-xl font-semibold text-gray-900 mt-1">{categories.length}</p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
                <div className="flex flex-wrap gap-2 items-center">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input
                            type="text"
                            placeholder="Search designs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-md text-sm w-56 focus:border-gray-300 focus:ring-0 focus:outline-none"
                        />
                    </div>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="bg-white border border-gray-200 rounded-md px-3 py-2 text-sm focus:border-gray-300 focus:ring-0 focus:outline-none cursor-pointer"
                    >
                        <option value="All">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <input
                        ref={csvInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleCSVImport}
                        className="hidden"
                    />
                    <button
                        onClick={() => csvInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-2 text-gray-600 bg-white border border-gray-200 rounded-md text-sm hover:bg-gray-50 transition-colors"
                    >
                        <Upload size={14} />
                        Import
                    </button>
                    <button
                        onClick={handleCSVExport}
                        className="flex items-center gap-1.5 px-3 py-2 text-gray-600 bg-white border border-gray-200 rounded-md text-sm hover:bg-gray-50 transition-colors"
                    >
                        <Download size={14} />
                        Export
                    </button>
                    <button
                        onClick={() => { setShowForm(true); setEditingDesign(null); setFormData(EMPTY_DESIGN); }}
                        className="flex items-center gap-1.5 px-3 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                        <Plus size={14} />
                        Add Design
                    </button>
                </div>
            </div>

            {/* Design Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/60  flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-lg">
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {editingDesign ? 'Edit Design' : 'Add New Design'}
                                </h2>
                                <p className="text-xs text-gray-500 mt-0.5">Fill in the details below</p>
                            </div>
                            <button
                                onClick={() => setShowForm(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-gray-50 border-0 rounded-lg px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all"
                                        placeholder="Design name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Category *</label>
                                    <select
                                        required
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-gray-50 border-0 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all cursor-pointer"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Short Description</label>
                                <input
                                    type="text"
                                    value={formData.descriptor}
                                    onChange={(e) => setFormData({ ...formData, descriptor: e.target.value })}
                                    className="w-full bg-gray-50 border-0 rounded-lg px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all"
                                    placeholder="Brief description for listing"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Long Description</label>
                                <textarea
                                    rows={3}
                                    value={formData.long_description}
                                    onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                                    className="w-full bg-gray-50 border-0 rounded-lg px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all resize-none"
                                    placeholder="Detailed description for product page"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Fabric Suitability</label>
                                    <input
                                        type="text"
                                        value={formData.fabric_suitability}
                                        onChange={(e) => setFormData({ ...formData, fabric_suitability: e.target.value })}
                                        className="w-full bg-gray-50 border-0 rounded-lg px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all"
                                        placeholder="e.g., Silk, Cotton"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Complexity</label>
                                    <select
                                        value={formData.complexity}
                                        onChange={(e) => setFormData({ ...formData, complexity: e.target.value })}
                                        className="w-full bg-gray-50 border-0 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all cursor-pointer"
                                    >
                                        <option value="Simple">Simple</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Complex">Complex</option>
                                        <option value="Heavy">Heavy</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Base Price (₹)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.base_price}
                                        onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) || 0 })}
                                        className="w-full bg-gray-50 border-0 rounded-lg px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Image</label>
                                <div className="flex gap-3 items-center">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-4 py-2.5 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
                                    >
                                        <Upload size={15} />
                                        Upload Image
                                    </button>
                                    {formData.image_url && (
                                        <img src={formData.image_url} alt="Preview" className="h-12 w-12 object-cover rounded-lg " />
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3 py-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-4 h-4 rounded border-gray-300 text-gray-600 focus:ring-gray-200"
                                />
                                <label htmlFor="is_active" className="text-sm text-gray-600">Active (visible on website)</label>
                            </div>
                        </form>
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="flex-1 px-4 py-3 text-gray-600 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                onClick={handleSubmit}
                                className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                            >
                                {editingDesign ? 'Save Changes' : 'Add Design'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Designs Table */}
            <div className="bg-white rounded-lg border border-gray-100 overflow-hidden ">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50/50">
                            <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Design</th>
                            <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Category</th>
                            <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Price</th>
                            <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="text-right px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="text-center py-16">
                                    <div className="w-6 h-6 border-2 border-[rgb(107 114 128)] border-t-transparent rounded-full animate-spin mx-auto"></div>
                                    <p className="text-gray-400 text-sm mt-3">Loading designs...</p>
                                </td>
                            </tr>
                        ) : filteredDesigns.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-16">
                                    <Palette size={32} className="text-gray-200 mx-auto mb-3" />
                                    <p className="text-gray-400 text-sm">No designs found</p>
                                </td>
                            </tr>
                        ) : (
                            filteredDesigns.map(design => (
                                <tr key={design.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-4">
                                            {design.image_url ? (
                                                <img src={design.image_url} alt="" className="w-12 h-12 object-cover rounded-lg " />
                                            ) : (
                                                <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg flex items-center justify-center">
                                                    <Palette size={18} className="text-gray-300" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium text-gray-900">{design.name}</p>
                                                <p className="text-gray-400 text-xs truncate max-w-[200px] mt-0.5">{design.descriptor}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 hidden md:table-cell">
                                        <span className="inline-flex px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
                                            {design.category}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 hidden sm:table-cell">
                                        <span className="font-semibold text-gray-700">₹{design.base_price || 0}</span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <button
                                            onClick={() => handleToggleActive(design)}
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${design.is_active
                                                ? 'bg-green-50 text-green-600 hover:bg-green-100'
                                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                }`}
                                        >
                                            {design.is_active ? <Eye size={12} /> : <EyeOff size={12} />}
                                            {design.is_active ? 'Active' : 'Hidden'}
                                        </button>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex justify-end gap-1">
                                            <button
                                                onClick={() => { setEditingDesign(design); setFormData(design); setShowForm(true); }}
                                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 size={15} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(design.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ============================================
// CONTENT MODULE
// ============================================
function ContentModule() {
    const [section, setSection] = useState<'hero' | 'about' | 'faqs' | 'testimonials'>('hero');
    const [heroData, setHeroData] = useState({ title: '', subtitle: '', cta_text: '' });
    const [aboutData, setAboutData] = useState({ content: '' });
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
    const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            // Fetch Hero
            const heroSnap = await getDocs(collection(db, 'site_content'));
            heroSnap.forEach(doc => {
                if (doc.id === 'hero') setHeroData(doc.data() as typeof heroData);
                if (doc.id === 'about') setAboutData(doc.data() as typeof aboutData);
            });

            // Fetch FAQs
            const faqsSnap = await getDocs(query(collection(db, 'faqs'), orderBy('order')));
            setFaqs(faqsSnap.docs.map(d => ({ id: d.id, ...d.data() } as FAQ)));

            // Fetch Testimonials
            const testSnap = await getDocs(collection(db, 'testimonials'));
            setTestimonials(testSnap.docs.map(d => ({ id: d.id, ...d.data() } as Testimonial)));
        } catch (err) {
            console.error('Error fetching content:', err);
        } finally {
            setLoading(false);
        }
    };

    const saveHero = async () => {
        try {
            await setDoc(doc(db, 'site_content', 'hero'), heroData);
            alert('Hero saved!');
        } catch (err) {
            console.error(err);
            alert('Failed to save');
        }
    };

    const saveAbout = async () => {
        try {
            await setDoc(doc(db, 'site_content', 'about'), aboutData);
            alert('About saved!');
        } catch (err) {
            console.error(err);
            alert('Failed to save');
        }
    };

    const saveFaq = async (faq: FAQ) => {
        try {
            if (faq.id) {
                await updateDoc(doc(db, 'faqs', faq.id), { question: faq.question, answer: faq.answer, order: faq.order });
            } else {
                await addDoc(collection(db, 'faqs'), { question: faq.question, answer: faq.answer, order: faqs.length });
            }
            setEditingFaq(null);
            fetchContent();
        } catch (err) {
            console.error(err);
        }
    };

    const deleteFaq = async (id: string) => {
        if (!confirm('Delete this FAQ?')) return;
        await deleteDoc(doc(db, 'faqs', id));
        fetchContent();
    };

    const saveTestimonial = async (t: Testimonial) => {
        try {
            if (t.id) {
                await updateDoc(doc(db, 'testimonials', t.id), { name: t.name, content: t.content, rating: t.rating });
            } else {
                await addDoc(collection(db, 'testimonials'), { name: t.name, content: t.content, rating: t.rating });
            }
            setEditingTestimonial(null);
            fetchContent();
        } catch (err) {
            console.error(err);
        }
    };

    const deleteTestimonial = async (id: string) => {
        if (!confirm('Delete this testimonial?')) return;
        await deleteDoc(doc(db, 'testimonials', id));
        fetchContent();
    };

    const sections = [
        { id: 'hero', label: 'Hero Section' },
        { id: 'about', label: 'About Page' },
        { id: 'faqs', label: 'FAQs' },
        { id: 'testimonials', label: 'Testimonials' },
    ];

    if (loading) return <div className="text-center py-8">Loading...</div>;

    return (
        <div className="space-y-6">
            {/* Section Tabs */}
            <div className="bg-white rounded-lg border border-gray-100 p-1.5 inline-flex gap-1 ">
                {sections.map(s => (
                    <button
                        key={s.id}
                        onClick={() => setSection(s.id as typeof section)}
                        className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${section === s.id
                            ? 'bg-gray-900 text-white '
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        {s.label}
                    </button>
                ))}
            </div>

            {/* Hero Section */}
            {section === 'hero' && (
                <div className="bg-white rounded-lg border border-gray-100  overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30">
                        <h3 className="font-semibold text-gray-900">Hero Section Configuration</h3>
                        <p className="text-xs text-gray-500 mt-1">Customize the main landing banner content</p>
                    </div>
                    <div className="p-6 space-y-5 max-w-2xl">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Title</label>
                            <input
                                type="text"
                                value={heroData.title}
                                onChange={e => setHeroData({ ...heroData, title: e.target.value })}
                                className="w-full bg-gray-50 border-0 rounded-lg px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all"
                                placeholder="Main headline"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Subtitle</label>
                            <textarea
                                rows={3}
                                value={heroData.subtitle}
                                onChange={e => setHeroData({ ...heroData, subtitle: e.target.value })}
                                className="w-full bg-gray-50 border-0 rounded-lg px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all resize-none"
                                placeholder="Supporting text"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">CTA Button Text</label>
                            <input
                                type="text"
                                value={heroData.cta_text}
                                onChange={e => setHeroData({ ...heroData, cta_text: e.target.value })}
                                className="w-full bg-gray-50 border-0 rounded-lg px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all"
                                placeholder="e.g. Shop Now"
                            />
                        </div>
                        <div className="pt-2">
                            <button
                                onClick={saveHero}
                                className="px-6 py-2.5 bg-[rgb(107 114 128)] text-white rounded-lg text-sm font-medium hover:bg-[#b08d3d] transition-colors "
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* About Section */}
            {section === 'about' && (
                <div className="bg-white rounded-lg border border-gray-100  overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30">
                        <h3 className="font-semibold text-gray-900">About Page Content</h3>
                        <p className="text-xs text-gray-500 mt-1">Tell your brand story</p>
                    </div>
                    <div className="p-6 max-w-3xl">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Main Content</label>
                            <textarea
                                rows={10}
                                value={aboutData.content}
                                onChange={e => setAboutData({ ...aboutData, content: e.target.value })}
                                className="w-full bg-gray-50 border-0 rounded-lg px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all resize-none"
                                placeholder="Write your story here..."
                            />
                        </div>
                        <div className="pt-4">
                            <button
                                onClick={saveAbout}
                                className="px-6 py-2.5 bg-[rgb(107 114 128)] text-white rounded-lg text-sm font-medium hover:bg-[#b08d3d] transition-colors "
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* FAQs Section */}
            {section === 'faqs' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-100 ">
                        <div>
                            <h3 className="font-semibold text-gray-900">Frequently Asked Questions</h3>
                            <p className="text-xs text-gray-500">Manage customer queries</p>
                        </div>
                        <button
                            onClick={() => setEditingFaq({ id: '', question: '', answer: '', order: faqs.length })}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors "
                        >
                            <Plus size={16} /> Add FAQ
                        </button>
                    </div>

                    {editingFaq && (
                        <div className="bg-white rounded-lg border border-[rgb(107 114 128)]/30 p-6 shadow-md ring-4 ring-[rgb(107 114 128)]/5 space-y-4">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium text-gray-900">
                                    {editingFaq.id ? 'Edit Question' : 'New Question'}
                                </h4>
                                <button onClick={() => setEditingFaq(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                            </div>
                            <input
                                type="text"
                                placeholder="Question"
                                value={editingFaq.question}
                                onChange={e => setEditingFaq({ ...editingFaq, question: e.target.value })}
                                className="w-full bg-gray-50 border-0 rounded-lg px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all"
                            />
                            <textarea
                                rows={3}
                                placeholder="Answer"
                                value={editingFaq.answer}
                                onChange={e => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                                className="w-full bg-gray-50 border-0 rounded-lg px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all resize-none"
                            />
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setEditingFaq(null)}
                                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => saveFaq(editingFaq)}
                                    className="px-6 py-2 bg-[rgb(107 114 128)] text-white rounded-lg text-sm font-medium hover:bg-[#b08d3d]"
                                >
                                    Save FAQ
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="grid gap-3">
                        {faqs.map((faq, idx) => (
                            <div key={faq.id} className="bg-white rounded-lg border border-gray-100 p-5  hover:shadow-md transition-shadow group">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex gap-3">
                                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500 shrink-0 mt-0.5">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{faq.question}</p>
                                            <p className="text-sm text-gray-500 mt-1 leading-relaxed">{faq.answer}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => setEditingFaq(faq)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-amber-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                                        <button onClick={() => deleteFaq(faq.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Testimonials Section */}
            {section === 'testimonials' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-100 ">
                        <div>
                            <h3 className="font-semibold text-gray-900">Client Testimonials</h3>
                            <p className="text-xs text-gray-500">What people say about Amma</p>
                        </div>
                        <button
                            onClick={() => setEditingTestimonial({ id: '', name: '', content: '', rating: 5 })}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors "
                        >
                            <Plus size={16} /> Add Testimonial
                        </button>
                    </div>

                    {editingTestimonial && (
                        <div className="bg-white rounded-lg border border-[rgb(107 114 128)]/30 p-6 shadow-md ring-4 ring-[rgb(107 114 128)]/5 space-y-4">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium text-gray-900">
                                    {editingTestimonial.id ? 'Edit Testimonial' : 'New Testimonial'}
                                </h4>
                                <button onClick={() => setEditingTestimonial(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Customer Name"
                                    value={editingTestimonial.name}
                                    onChange={e => setEditingTestimonial({ ...editingTestimonial, name: e.target.value })}
                                    className="w-full bg-gray-50 border-0 rounded-lg px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all"
                                />
                                <div className="flex items-center gap-3 bg-gray-50 px-4 rounded-lg">
                                    <span className="text-sm text-gray-500">Rating:</span>
                                    <input
                                        type="range"
                                        min="1"
                                        max="5"
                                        value={editingTestimonial.rating}
                                        onChange={e => setEditingTestimonial({ ...editingTestimonial, rating: parseInt(e.target.value) })}
                                        className="flex-1 accent-[rgb(107 114 128)]"
                                    />
                                    <span className="font-medium text-gray-600 min-w-[20px]">{editingTestimonial.rating}</span>
                                </div>
                            </div>
                            <textarea
                                rows={3}
                                placeholder="Testimonial content"
                                value={editingTestimonial.content}
                                onChange={e => setEditingTestimonial({ ...editingTestimonial, content: e.target.value })}
                                className="w-full bg-gray-50 border-0 rounded-lg px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all resize-none"
                            />
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setEditingTestimonial(null)}
                                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => saveTestimonial(editingTestimonial)}
                                    className="px-6 py-2 bg-[rgb(107 114 128)] text-white rounded-lg text-sm font-medium hover:bg-[#b08d3d]"
                                >
                                    Save Testimonial
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {testimonials.map(t => (
                            <div key={t.id} className="bg-white rounded-lg border border-gray-100 p-5  hover:shadow-md transition-shadow group relative">
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white/90 p-1 rounded-lg ">
                                    <button onClick={() => setEditingTestimonial(t)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md"><Edit2 size={14} /></button>
                                    <button onClick={() => deleteTestimonial(t.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-md"><Trash2 size={14} /></button>
                                </div>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-serif text-lg">
                                        {t.name.charAt(0)}
                                    </div>
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className={`text-sm ${i < t.rating ? 'text-gray-600' : 'text-gray-200'}`}>★</span>
                                        ))}
                                    </div>
                                </div>
                                <h4 className="font-semibold text-gray-900">{t.name}</h4>
                                <p className="text-sm text-gray-500 mt-2 line-clamp-3 italic">"{t.content}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ============================================
// MEDIA MODULE
// ============================================
function MediaModule() {
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInput = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchMedia();
    }, []);

    const fetchMedia = async () => {
        try {
            const listRef = ref(storage, 'cms-uploads');
            const result = await listAll(listRef);
            const items: MediaItem[] = [];
            for (const item of result.items) {
                const url = await getDownloadURL(item);
                items.push({ name: item.name, url, fullPath: item.fullPath });
            }
            setMedia(items);
        } catch (err) {
            console.error('Error fetching media:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        setUploading(true);
        try {
            for (const file of Array.from(files)) {
                const storageRef = ref(storage, `cms-uploads/${Date.now()}_${file.name}`);
                await uploadBytes(storageRef, file);
            }
            fetchMedia();
        } catch (err) {
            console.error('Upload error:', err);
            alert('Failed to upload');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (item: MediaItem) => {
        if (!confirm('Delete this image?')) return;
        try {
            await deleteObject(ref(storage, item.fullPath));
            fetchMedia();
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    const copyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        alert('URL copied!');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg border border-gray-100 ">
                <div>
                    <h3 className="font-semibold text-gray-900">Media Library</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Manage your uploaded assets</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <input
                        ref={fileInput}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleUpload}
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInput.current?.click()}
                        disabled={uploading}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors  disabled:opacity-70"
                    >
                        <Upload size={16} />
                        {uploading ? 'Uploading...' : 'Upload Images'}
                    </button>
                    <button onClick={fetchMedia} className="p-2.5 bg-gray-50 text-gray-600 rounded-lg border border-gray-200 hover:bg-white hover:border-gray-300 transition-all ">
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-8 h-8 border-4 border-[rgb(107 114 128)] border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-500 font-medium">Loading assets...</p>
                </div>
            ) : media.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                    <div className="bg-white p-4 rounded-full  mb-4">
                        <Image size={32} className="text-gray-300" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No images found</h3>
                    <p className="text-gray-500 mt-1 max-w-xs text-center">Upload images to use them in your designs and content.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {media.map(item => (
                        <div key={item.fullPath} className="group relative bg-white rounded-lg border border-gray-100  overflow-hidden hover:shadow-md transition-all">
                            <div className="aspect-square w-full overflow-hidden bg-gray-100 relative">
                                <img
                                    src={item.url}
                                    alt={item.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[1px]">
                                    <button
                                        onClick={() => copyUrl(item.url)}
                                        className="p-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transform hover:scale-110 transition-all "
                                        title="Copy URL"
                                    >
                                        <Copy size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item)}
                                        className="p-2 bg-white text-red-500 rounded-lg hover:bg-red-50 transform hover:scale-110 transition-all "
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="px-3 py-2 border-t border-gray-50 bg-white">
                                <p className="text-xs font-medium text-gray-600 truncate" title={item.name}>{item.name}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ============================================
// ORDERS MODULE
// ============================================
function OrdersModule() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const ordersRef = collection(db, 'orders');
            const q = query(ordersRef, orderBy('created_at', 'desc'));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
            setOrders(data);
        } catch (err) {
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = statusFilter === 'all'
        ? orders
        : orders.filter(o => o.status === statusFilter);

    const statuses = ['all', 'pending', 'processing', 'completed', 'cancelled'];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg border border-gray-100 ">
                <div>
                    <h3 className="font-semibold text-gray-900">Orders Overview</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Track and manage customer orders</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="flex-1 sm:flex-none bg-gray-50 border-0 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 focus:ring-2 focus:ring-gray-200 focus:outline-none cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                        {statuses.map(s => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                    </select>
                    <button onClick={fetchOrders} className="p-2.5 bg-gray-50 text-gray-600 rounded-lg border border-gray-200 hover:bg-white hover:border-gray-300 transition-all ">
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-100  overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                        <tr>
                            <th className="text-left px-6 py-4 font-semibold text-gray-600 uppercase tracking-wider text-xs">Order ID</th>
                            <th className="text-left px-6 py-4 font-semibold text-gray-600 uppercase tracking-wider text-xs">Customer</th>
                            <th className="text-left px-6 py-4 font-semibold text-gray-600 uppercase tracking-wider text-xs">Date</th>
                            <th className="text-left px-6 py-4 font-semibold text-gray-600 uppercase tracking-wider text-xs">Status</th>
                            <th className="text-right px-6 py-4 font-semibold text-gray-600 uppercase tracking-wider text-xs">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan={5} className="text-center py-12 text-gray-500">
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-[rgb(107 114 128)] border-t-transparent rounded-full animate-spin"></div>
                                    Loading...
                                </div>
                            </td></tr>
                        ) : filteredOrders.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-12 text-gray-500">
                                <p>No orders found matching your criteria</p>
                            </td></tr>
                        ) : (
                            filteredOrders.map(order => (
                                <tr key={order.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs text-gray-500 group-hover:text-gray-600 transition-colors cursor-pointer">
                                        #{order.id.slice(0, 8)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-gray-900">{order.customer_name || 'Guest User'}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{order.email}</p>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {order.created_at ? new Date(order.created_at).toLocaleDateString(undefined, {
                                            year: 'numeric', month: 'short', day: 'numeric'
                                        }) : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${order.status === 'completed' ? 'bg-green-50 text-green-700 border-green-100' :
                                            order.status === 'processing' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                order.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-100' :
                                                    'bg-amber-50 text-amber-700 border-amber-100'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${order.status === 'completed' ? 'bg-green-500' :
                                                order.status === 'processing' ? 'bg-blue-500' :
                                                    order.status === 'cancelled' ? 'bg-red-500' :
                                                        'bg-amber-500'
                                                }`}></span>
                                            {order.status ? (order.status.charAt(0).toUpperCase() + order.status.slice(1)) : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-gray-900">₹{order.total || 0}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ============================================
// SETTINGS MODULE
// ============================================
function SettingsModule() {
    const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
    const [newCategory, setNewCategory] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const settingsSnap = await getDocs(collection(db, 'site_settings'));
            settingsSnap.forEach(docSnap => {
                if (docSnap.id === 'config') {
                    const data = docSnap.data();
                    if (data.categories) setCategories(data.categories);
                    if (data.contact_email) setContactEmail(data.contact_email);
                    if (data.contact_phone) setContactPhone(data.contact_phone);
                }
            });
        } catch (err) {
            console.error('Error fetching settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async () => {
        try {
            await setDoc(doc(db, 'site_settings', 'config'), {
                categories,
                contact_email: contactEmail,
                contact_phone: contactPhone
            }, { merge: true });
            alert('Settings saved!');
        } catch (err) {
            console.error(err);
            alert('Failed to save');
        }
    };

    const addCategory = () => {
        if (!newCategory.trim() || categories.includes(newCategory.trim())) return;
        setCategories([...categories, newCategory.trim()]);
        setNewCategory('');
    };

    const removeCategory = (cat: string) => {
        setCategories(categories.filter(c => c !== cat));
    };

    if (loading) return <div className="text-center py-8">Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-100  overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30">
                    <h3 className="font-semibold text-gray-900">General Settings</h3>
                    <p className="text-xs text-gray-500 mt-1">Configure global application preferences</p>
                </div>

                <div className="p-6 space-y-8">
                    {/* Categories Section */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">Design Categories</label>
                            <span className="text-xs text-gray-400">{categories.length} Active Categories</span>
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newCategory}
                                onChange={e => setNewCategory(e.target.value)}
                                placeholder="Add new category"
                                className="flex-1 bg-gray-50 border-0 rounded-lg px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all"
                            />
                            <button
                                onClick={addCategory}
                                className="px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors  whitespace-nowrap"
                            >
                                <Plus size={16} className="inline mr-2" /> Add
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2">
                            {categories.map(cat => (
                                <div key={cat} className="group flex items-center gap-2 pl-3 pr-2 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-sm text-gray-700 hover:bg-white hover:border-gray-200 hover: transition-all">
                                    <span>{cat}</span>
                                    <button
                                        onClick={() => removeCategory(cat)}
                                        className="p-1 text-gray-400 hover:text-white hover:bg-red-500 rounded-full transition-colors"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-gray-100"></div>

                    {/* Contact Info Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Contact Email</label>
                            <input
                                type="email"
                                value={contactEmail}
                                onChange={e => setContactEmail(e.target.value)}
                                className="w-full bg-gray-50 border-0 rounded-lg px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all"
                                placeholder="support@amma.com"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Contact Phone</label>
                            <input
                                type="tel"
                                value={contactPhone}
                                onChange={e => setContactPhone(e.target.value)}
                                className="w-full bg-gray-50 border-0 rounded-lg px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all"
                                placeholder="+91 98765 43210"
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            onClick={saveSettings}
                            className="w-full sm:w-auto px-8 py-3 bg-[rgb(107 114 128)] text-white rounded-lg text-sm font-medium hover:bg-[#b08d3d] transition-colors  flex items-center justify-center gap-2"
                        >
                            <Check size={16} /> Save Application Settings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
