/* eslint-disable react/prop-types */
// @ts-nocheck
// src/screens/samples/SamplesScreen.jsx
import React, { useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
    Plus, Minus, ChevronDown, X, Search, ChevronRight, Trash2, Check, ShoppingCart, Package, User
} from 'lucide-react';
import { SAMPLE_PRODUCTS, SAMPLE_CATEGORIES, FINISH_CATEGORIES, FINISH_SAMPLES, TEXTILE_SAMPLES } from './data.js';
import { MOCK_CUSTOMERS } from '../../data/mockCustomers.js';
import { getSampleProduct } from './sampleIndex.js';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FilterChips, 
    Button, 
    DESIGN_TOKENS, 
    getCardShadow, 
    getDrawerShadow,
    STATUS_STYLES
} from '../../design-system/index.js';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { useIsDesktop } from '../../hooks/useResponsive.js';

// Max content width for consistency with Dashboard ("wide" = 896px)
const MAX_CONTENT_WIDTH = 896;

const idOf = (x) => String(x);

/* ====================== Directory Modal (no extra blur - overlays existing modal) ====================== */
const DirectoryModal = ({ show, onClose, onSelect, theme, customers = [] }) => {
    const [q, setQ] = useState('');
    
    // Use MOCK_CUSTOMERS data with proper address formatting
    const items = useMemo(() => {
        const customerList = customers.length > 0 ? customers : MOCK_CUSTOMERS;
        const normalized = customerList.map((c, idx) => ({
            key: c.id || `customer-${idx}`,
            name: c.name,
            address: c.location ? `${c.location.city}, ${c.location.state}` : '',
            vertical: c.vertical
        }));
        const k = q.trim().toLowerCase();
        return k ? normalized.filter((i) => i.name.toLowerCase().includes(k)) : normalized;
    }, [q, customers]);

    if (!show) return null;

    // No backdrop blur here - just an overlay modal on top of existing cart modal
    return (
        <div 
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ zIndex: DESIGN_TOKENS.zIndex.modal + 100 }}
            onClick={onClose}
        >
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: 'spring', duration: 0.3 }}
                className="w-full max-w-[420px] bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-200" 
                style={{ maxHeight: '60vh' }}
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-base text-[#353535]">Select Customer</h3>
                        <button onClick={onClose} className="p-1.5 cursor-pointer bg-gray-100 rounded-full hover:bg-gray-200 transition"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="relative">
                        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customers..." className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none border focus:ring-2 focus:ring-[#353535]/10 bg-gray-50 text-[#353535] border-gray-200" />
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40 text-[#353535]" />
                    </div>
                    <div className="overflow-y-auto -mx-1 px-1" style={{ maxHeight: '35vh' }}>
                        {items.length === 0 ? (
                            <p className="text-center text-sm text-gray-400 py-4">No customers found</p>
                        ) : items.map((it) => (
                            <button key={it.key} onClick={() => { onSelect({ name: it.name, address1: it.address || '' }); onClose(); }} className="w-full text-left px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-3 group">
                                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 transition">
                                    <span className="text-xs font-bold text-gray-500">{it.name.substring(0, 2).toUpperCase()}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-sm text-[#353535] truncate">{it.name}</div>
                                    {it.address && <div className="text-xs text-gray-400">{it.address}</div>}
                                </div>
                                {it.vertical && <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{it.vertical}</span>}
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

/* ====================== Success Modal ====================== */
const SuccessModal = ({ isOpen }) => {
    if (!isOpen) return null;
    return (
        <div className="absolute inset-0 z-[6000] flex items-center justify-center pointer-events-none">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl flex flex-col items-center justify-center gap-4 border border-black/5"
            >
                <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    <Check className="w-8 h-8" strokeWidth={3} />
                </div>
                <div className="text-center">
                    <h3 className="text-xl font-bold text-[#353535]">Request Sent!</h3>
                    <p className="text-gray-500 text-sm">Your samples are on the way.</p>
                </div>
            </motion.div>
        </div>
    );
};

/* ====================== Cart Logic & Components ====================== */

const CartDrawer = ({ cart, onUpdateCart, theme, userSettings, customers = [], isOpen, onClose, onNavigate, isDesktop = false }) => {
    const [showDir, setShowDir] = useState(false);
    // Default to user's name and address from settings
    const [shipToName, setShipToName] = useState(userSettings?.firstName && userSettings?.lastName ? `${userSettings.firstName} ${userSettings.lastName}` : '');
    const [address1, setAddress1] = useState(userSettings?.homeAddress || '');
    const [isSuccess, setIsSuccess] = useState(false);

    const cartItems = useMemo(() => Object.entries(cart).map(([rawId, quantity]) => {
        const id = idOf(rawId);
        if (id === 'full-jsi-set') return { id, name: 'Full JSI Sample Set', quantity, isSet: true };
        if (id.startsWith('set-')) { 
            const categoryId = id.replace('set-', ''); 
            const categoryName = FINISH_CATEGORIES.find((c) => c.id === categoryId)?.name || SAMPLE_CATEGORIES.find((c) => c.id === categoryId)?.name || categoryId; 
            return { id, name: `Complete ${categoryName} Set`, quantity, isSet: true }; 
        }
        const product = getSampleProduct(id); 
        return product ? { ...product, id, quantity, isSet: false } : null;
    }).filter(Boolean), [cart]);

    const totalCartItems = useMemo(() => Object.values(cart).reduce((s, q) => s + q, 0), [cart]);
    const canSubmit = totalCartItems > 0 && shipToName.trim() && address1.trim();

    const handleSubmit = () => {
        setIsSuccess(true);
        setTimeout(() => {
            setIsSuccess(false);
            onClose();
            Object.keys(cart).forEach(k => onUpdateCart({ id: idOf(k) }, -999));
            if (onNavigate) onNavigate('home');
        }, 2000);
    };

    // Don't render anything if modal is closed
    if (!isOpen) return null;

    return (
        <>
            {createPortal(
                <>
                    <motion.div 
                        key="cart-backdrop"
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        className="fixed inset-0 transition-opacity duration-300"
                        style={{ 
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                            zIndex: DESIGN_TOKENS.zIndex.overlay
                        }}
                        onClick={onClose} 
                    />
                    <motion.div
                        key="cart-modal"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                        animate={{ opacity: 1, scale: 1, y: 0 }} 
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', duration: 0.4 }}
                        className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none"
                        style={{ zIndex: DESIGN_TOKENS.zIndex.modal }}
                    >
                        <div 
                            className="bg-white rounded-3xl overflow-hidden flex flex-col shadow-2xl w-full max-w-[500px] max-h-[85vh] pointer-events-auto"
                            onClick={e => e.stopPropagation()}
                        >
                                    <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${theme.colors.accent}10` }}>
                                                <ShoppingCart className="w-6 h-6" style={{ color: theme.colors.accent }} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg tracking-tight text-[#353535]">Sample Cart</h3>
                                                <p className="text-xs text-gray-500 font-medium">{totalCartItems} items selected</p>
                                            </div>
                                        </div>
                                        <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center active:scale-90 transition hover:bg-gray-200">
                                            <X className="w-5 h-5 text-gray-600" />
                                        </button>
                                    </div>

                                    {isSuccess ? (
                                        <div className="h-80 flex items-center justify-center relative">
                                            <SuccessModal isOpen={true} />
                                        </div>
                                    ) : (
                                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white scrollbar-hide">
                                            <div className="space-y-4">
                                                {cartItems.map((item) => (
                                                    <div key={item.id} className="flex items-center gap-4 group">
                                                        <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0 border border-black/5 shadow-sm">
                                                            {item.isSet ? (
                                                                <Package className="w-8 h-8 opacity-20" />
                                                            ) : item.image ? (
                                                                <img src={item.image} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full" style={{ background: item.color }} />
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="font-bold text-[15px] text-[#353535] leading-tight">{item.name}</div>
                                                            {item.code && <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-1">{item.code}</div>}
                                                        </div>
                                                        <div className="flex items-center bg-gray-50 rounded-full p-1.5 gap-3 border border-gray-100 shadow-inner">
                                                            <button onClick={() => onUpdateCart(item, -1)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm text-[#353535] transition-all hover:scale-105 active:scale-90 border border-gray-100">
                                                                {item.quantity === 1 ? <Trash2 className="w-4 h-4 text-[#B85C5C]" /> : <Minus className="w-4 h-4" />}
                                                            </button>
                                                            <span className="font-bold text-sm w-5 text-center text-[#353535]">{item.quantity}</span>
                                                            <button onClick={() => onUpdateCart(item, 1)} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#353535] text-white shadow-sm transition-all hover:scale-105 active:scale-90 border border-[#353535]/5"><Plus className="w-4 h-4" /></button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="space-y-4 bg-[#F8F9FA] p-5 rounded-[24px] border border-gray-100">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-[11px] font-black uppercase tracking-[0.08em] text-gray-400">Ship To</h4>
                                                </div>
                                                
                                                {/* Prominent address selection buttons */}
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button 
                                                        onClick={() => { 
                                                            setShipToName(userSettings?.firstName && userSettings?.lastName ? `${userSettings.firstName} ${userSettings.lastName}` : 'Luke Wagner'); 
                                                            setAddress1(userSettings?.homeAddress || '5445 N Deerwood Lake Rd, Jasper, IN 47546'); 
                                                        }} 
                                                        className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all active:scale-95 hover:shadow-md"
                                                        style={{ 
                                                            backgroundColor: theme.colors.surface,
                                                            border: `1.5px solid ${theme.colors.border}`,
                                                            color: theme.colors.textPrimary
                                                        }}
                                                    >
                                                        <User className="w-4 h-4" style={{ color: theme.colors.accent }} />
                                                        My Address
                                                    </button>
                                                    <button 
                                                        onClick={() => setShowDir(true)} 
                                                        className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all active:scale-95 hover:shadow-md"
                                                        style={{ 
                                                            backgroundColor: theme.colors.surface,
                                                            border: `1.5px solid ${theme.colors.border}`,
                                                            color: theme.colors.textPrimary
                                                        }}
                                                    >
                                                        <Search className="w-4 h-4" style={{ color: theme.colors.accent }} />
                                                        Customer
                                                    </button>
                                                </div>
                                                
                                                <div className="space-y-3">
                                                    <input value={shipToName} onChange={e => setShipToName(e.target.value)} placeholder="Full Name / Company" className="w-full bg-white rounded-xl px-4 py-3 text-sm font-semibold outline-none transition-all focus:ring-2 ring-[#353535]/5 text-[#353535] border border-gray-200 shadow-sm placeholder:text-gray-300" />
                                                    <input value={address1} onChange={e => setAddress1(e.target.value)} placeholder="Street Address" className="w-full bg-white rounded-xl px-4 py-3 text-sm font-semibold outline-none transition-all focus:ring-2 ring-[#353535]/5 text-[#353535] border border-gray-200 shadow-sm placeholder:text-gray-300" />
                                                </div>
                                            </div>

                                            {/* Only show submit button when form is complete */}
                                            {canSubmit && (
                                                <button
                                                    onClick={handleSubmit}
                                                    className="w-full py-4 rounded-full font-bold text-white shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-[15px]"
                                                    style={{ 
                                                        backgroundColor: theme.colors.accent,
                                                        boxShadow: `0 8px 32px ${theme.colors.accent}40`
                                                    }}
                                                >
                                                    <span>Submit Sample Request</span>
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                    </div>
                                </motion.div>
                            </>,
                            document.body
                        )}
            <DirectoryModal show={showDir} onClose={() => setShowDir(false)} onSelect={({ name, address1: addr }) => { setShipToName(name); setAddress1(addr); }} theme={theme} customers={customers} />
        </>
    );
};

export const SamplesScreen = ({ theme, onNavigate, cart: cartProp, onUpdateCart: onUpdateCartProp, userSettings, initialCartOpen = false }) => {
    const isDesktop = useIsDesktop();
    const [cartInternal, setCartInternal] = useState({});
    const [isCartOpen, setIsCartOpen] = useState(initialCartOpen);
    const cart = cartProp ?? cartInternal;
    const onUpdateCart = onUpdateCartProp ?? useCallback((item, delta) => { setCartInternal((prev) => { const id = idOf(item.id); const current = prev[id] || 0; if (delta === -999) { const n = { ...prev }; delete n[id]; return n; } const quantity = Math.max(0, current + delta); const next = { ...prev }; if (quantity === 0) delete next[id]; else next[id] = quantity; return next; }); }, []);

    const [selectedCategory, setSelectedCategory] = useState('tfl');
    const categories = useMemo(() => {
        return [...FINISH_CATEGORIES, ...SAMPLE_CATEGORIES.filter(c => c.id !== 'finishes' && c.id !== 'textiles')].map(c => ({ 
            key: c.id, 
            label: c.name 
        }));
    }, []);

    // Calculate total cart items for inline display
    const totalCartItems = useMemo(() => Object.values(cart).reduce((s, q) => s + q, 0), [cart]);

    // Check if full set or category set is in cart
    const fullSetInCart = cart['full-jsi-set'] > 0;
    const categorySetInCart = cart[`set-${selectedCategory}`] > 0;

    const filteredProducts = useMemo(() => {
        const isFinish = FINISH_CATEGORIES.some(c => c.id === selectedCategory);
        
        // Handle textiles category specially
        if (selectedCategory === 'textiles') {
            return TEXTILE_SAMPLES;
        }
        
        let list = isFinish ? FINISH_SAMPLES.filter(s => s.category === selectedCategory) : SAMPLE_PRODUCTS.filter(p => p.category === selectedCategory && !p.subcategory);
        if (selectedCategory === 'tfl') {
            const order = ['woodgrain', 'stone', 'metallic', 'solid'];
            list = [...list].sort((a, b) => (order.indexOf(a.finishType || 'solid') - order.indexOf(b.finishType || 'solid')) || a.name.localeCompare(b.name));
        }
        return list;
    }, [selectedCategory]);

    const SampleCard = ({ product }) => {
        const id = idOf(product.id);
        const qty = cart[id] || 0;
        const add = (e) => { e?.stopPropagation(); onUpdateCart({ ...product, id }, 1); };
        const remove = (e) => { e?.stopPropagation(); onUpdateCart({ ...product, id }, -1); };

        return (
            <div className="w-full group">
                <div 
                    onClick={add} 
                    className="relative w-full aspect-square rounded-[24px] overflow-hidden cursor-pointer transition-all duration-300 border-[1.5px]"
                    style={{
                        backgroundColor: theme.colors.surface,
                        borderColor: qty > 0 ? theme.colors.accent : 'transparent',
                        boxShadow: qty > 0 ? `0 8px 24px ${theme.colors.accent}20` : getCardShadow('elevated', theme),
                        transform: qty > 0 ? 'scale(0.96)' : 'scale(1)'
                    }}
                >
                    {product.image ? (
                        <img 
                            src={product.image} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                            alt={product.name}
                        />
                    ) : (
                        <div className="w-full h-full" style={{ backgroundColor: product.color || theme.colors.subtle }} />
                    )}

                    <AnimatePresence>
                        {qty > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                exit={{ opacity: 0, y: 10 }}
                                onClick={(e) => e.stopPropagation()}
                                className="absolute bottom-3 left-3 right-3 z-10"
                            >
                                <div className="flex items-center justify-between bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-white/20 p-1 h-10">
                                    <button
                                        onClick={remove}
                                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all active:scale-90"
                                    >
                                        {qty === 1 ? <Trash2 className="w-4 h-4 text-[#B85C5C]" /> : <Minus className="w-4 h-4 text-[#353535]" />}
                                    </button>

                                    <span className="font-bold text-sm text-[#353535]">{qty}</span>

                                    <button
                                        onClick={add}
                                        className="w-8 h-8 rounded-full bg-[#353535] text-white flex items-center justify-center hover:bg-[#353535]/80 transition-all active:scale-90"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                        {qty === 0 && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                whileHover={{ opacity: 1 }}
                                className="absolute inset-0 bg-[#353535]/5 flex items-center justify-center pointer-events-none"
                            >
                                <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center">
                                    <Plus className="w-5 h-5 text-[#353535]" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <div className="mt-3 text-center">
                    <div className="text-[12px] font-bold text-[#353535] line-clamp-1 px-1">{product.name}</div>
                    {product.code && <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{product.code}</div>}
                    {product.collection && <div className="text-[9px] font-medium text-gray-400 mt-0.5">{product.collection}</div>}
                    {product.grade && <div className="text-[9px] font-semibold text-gray-500 mt-0.5">Grade {product.grade}</div>}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full relative" style={{ backgroundColor: theme.colors.background }}>
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                {/* Sticky header with consistent max-width */}
                <div className="sticky top-0 z-40 pb-4 pt-2 transition-all bg-opacity-95 backdrop-blur-sm"
                    style={{ backgroundColor: theme.colors.background }}>
                    
                    {/* Material category tabs - constrained width */}
                    <div className="mx-auto" style={{ maxWidth: MAX_CONTENT_WIDTH, paddingLeft: isDesktop ? 24 : 16, paddingRight: isDesktop ? 24 : 16 }}>
                        <FilterChips 
                            options={categories} 
                            value={selectedCategory} 
                            onChange={setSelectedCategory} 
                            theme={theme}
                        />
                    </div>

                    {/* Set buttons - constrained width */}
                    <div className="mt-4 flex items-center justify-center gap-3 mx-auto" style={{ maxWidth: MAX_CONTENT_WIDTH, paddingLeft: isDesktop ? 24 : 16, paddingRight: isDesktop ? 24 : 16 }}>
                        {/* Full Set Button/Stepper */}
                        {fullSetInCart ? (
                            <div 
                                className="relative flex-1 max-w-[180px] h-11 rounded-full flex items-center justify-between px-1"
                                style={{ 
                                    backgroundColor: theme.colors.surface,
                                    border: `1.5px solid ${theme.colors.accent}`,
                                }}
                            >
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onUpdateCart({ id: 'full-jsi-set' }, -1); }}
                                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-gray-100 active:scale-90"
                                >
                                    {cart['full-jsi-set'] === 1 ? <Trash2 className="w-4 h-4 text-[#B85C5C]" /> : <Minus className="w-4 h-4 text-[#353535]" />}
                                </button>
                                <span className="text-[11px] font-black tracking-widest uppercase" style={{ color: theme.colors.accent }}>
                                    Full Set · {cart['full-jsi-set']}
                                </span>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onUpdateCart({ id: 'full-jsi-set', name: 'Full JSI Set' }, 1); }}
                                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-gray-100 active:scale-90"
                                >
                                    <Plus className="w-4 h-4 text-[#353535]" />
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={() => onUpdateCart({ id: 'full-jsi-set', name: 'Full JSI Set' }, 1)}
                                className="relative flex-1 max-w-[180px] h-11 rounded-full text-[11px] font-black tracking-widest uppercase transition-all active:scale-95 flex items-center justify-center gap-2"
                                style={{ 
                                    backgroundColor: theme.colors.surface,
                                    color: '#353535',
                                    border: `1.5px solid ${theme.colors.border}`,
                                }}
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Full Set
                            </button>
                        )}
                        
                        {/* Category Set Button/Stepper */}
                        {categorySetInCart ? (
                            <div 
                                className="relative flex-1 max-w-[180px] h-11 rounded-full flex items-center justify-between px-1"
                                style={{ 
                                    backgroundColor: theme.colors.surface,
                                    border: `1.5px solid ${theme.colors.accent}`,
                                }}
                            >
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onUpdateCart({ id: `set-${selectedCategory}` }, -1); }}
                                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-gray-100 active:scale-90"
                                >
                                    {cart[`set-${selectedCategory}`] === 1 ? <Trash2 className="w-4 h-4 text-[#B85C5C]" /> : <Minus className="w-4 h-4 text-[#353535]" />}
                                </button>
                                <span className="text-[11px] font-black tracking-widest uppercase" style={{ color: theme.colors.accent }}>
                                    All {categories.find(c => c.key === selectedCategory)?.label} · {cart[`set-${selectedCategory}`]}
                                </span>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onUpdateCart({ id: `set-${selectedCategory}`, name: `Complete ${selectedCategory} Set` }, 1); }}
                                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-gray-100 active:scale-90"
                                >
                                    <Plus className="w-4 h-4 text-[#353535]" />
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={() => onUpdateCart({ id: `set-${selectedCategory}`, name: `Complete ${selectedCategory} Set` }, 1)}
                                className="relative flex-1 max-w-[180px] h-11 rounded-full text-[11px] font-black tracking-widest uppercase transition-all active:scale-95 flex items-center justify-center gap-2"
                                style={{ 
                                    backgroundColor: theme.colors.surface,
                                    color: '#353535',
                                    border: `1.5px solid ${theme.colors.border}`,
                                }}
                            >
                                <Plus className="w-3.5 h-3.5" />
                                All {categories.find(c => c.key === selectedCategory)?.label}
                            </button>
                        )}
                        
                        {/* Cart Button - always visible */}
                        <button 
                            onClick={() => setIsCartOpen(true)}
                            className="h-11 px-4 rounded-full text-[11px] font-black tracking-widest uppercase transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg"
                            style={{ 
                                backgroundColor: totalCartItems > 0 ? theme.colors.accent : theme.colors.surface,
                                color: totalCartItems > 0 ? '#fff' : '#353535',
                                border: `1.5px solid ${totalCartItems > 0 ? theme.colors.accent : theme.colors.border}`,
                            }}
                        >
                            <ShoppingCart className="w-4 h-4" />
                            {totalCartItems > 0 ? (
                                <span>Cart ({totalCartItems})</span>
                            ) : (
                                <span>Cart</span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Product grid - constrained width */}
                <div 
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-6 pb-24 mx-auto"
                    style={{ maxWidth: MAX_CONTENT_WIDTH, paddingLeft: isDesktop ? 24 : 16, paddingRight: isDesktop ? 24 : 16, paddingTop: 16 }}
                >
                    {filteredProducts.map(p => <SampleCard key={p.id} product={p} />)}
                </div>
            </div>
            <CartDrawer cart={cart} onUpdateCart={onUpdateCart} theme={theme} userSettings={userSettings} customers={MOCK_CUSTOMERS} isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} onNavigate={onNavigate} isDesktop={isDesktop} />
        </div>
    );
};
