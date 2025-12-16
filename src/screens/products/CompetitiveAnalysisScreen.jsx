import React, { useState } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { Package, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { PRODUCT_DATA } from './data.js';
import { COMPETITION_METRICS } from './comparison-data.js';
import { Modal } from '../../components/common/Modal.jsx';
import { useIsDesktop } from '../../hooks/useResponsive.js';

const AdvantageChip = ({ value }) => {
    const isPositive = value > 0;
    const isNegative = value < 0;
    
    return (
        <span 
            className={`inline-flex items-center justify-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full ${
                isNegative 
                    ? 'bg-green-50 text-green-700' 
                    : isPositive 
                        ? 'bg-red-50 text-red-600' 
                        : 'bg-gray-100 text-gray-600'
            }`}
        >
            {isNegative ? <TrendingDown className="w-3 h-3" /> : isPositive ? <TrendingUp className="w-3 h-3" /> : null}
            <span>{value > 0 ? `+${value}%` : value === 0 ? '0%' : `${value}%`}</span>
        </span>
    );
};

const VersusList = ({ jsiProduct, competitors = [], theme, isDesktop }) => {
    const jsiPrice = jsiProduct.price || 0;

    return (
        <GlassCard theme={theme} className="overflow-hidden" style={{ padding: 0 }}>
            {/* JSI row - highlighted */}
            <div 
                className="px-5 py-4 flex items-center justify-between"
                style={{ backgroundColor: `${theme.colors.accent}08` }}
            >
                <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: theme.colors.accent }} />
                    <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>{jsiProduct.name}</p>
                </div>
                <p className="text-lg font-bold tabular-nums" style={{ color: theme.colors.accent }}>
                    ${jsiPrice.toLocaleString()}
                </p>
            </div>
            
            <div className="h-px" style={{ background: theme.colors.border }} />
            
            {/* Competitor rows */}
            <div>
                {competitors.map((c, idx) => {
                    const val = parseInt(c.adv?.replace(/[^-\d]/g, '') || 0);
                    return (
                        <div 
                            key={c.id} 
                            className="px-5 py-3 flex items-center justify-between"
                            style={{ borderBottom: idx < competitors.length - 1 ? `1px solid ${theme.colors.border}20` : 'none' }}
                        >
                            <p className="text-sm font-medium" style={{ color: theme.colors.textPrimary }}>{c.name}</p>
                            <div className="flex items-center gap-3">
                                <p className="text-sm font-semibold tabular-nums" style={{ color: theme.colors.textSecondary }}>{c.laminate}</p>
                                <AdvantageChip value={val} />
                            </div>
                        </div>
                    );
                })}
                {!competitors.length && (
                    <div className="px-5 py-6 text-center">
                        <p className="text-sm" style={{ color: theme.colors.textSecondary }}>No competitive data yet.</p>
                    </div>
                )}
            </div>
        </GlassCard>
    );
};

export const CompetitiveAnalysisScreen = ({ categoryId, productId, theme }) => {
    const isDesktop = useIsDesktop();
    const categoryData = PRODUCT_DATA?.[categoryId];
    
    if (!categoryData) return (
        <div className="p-4">
            <GlassCard theme={theme} className="p-8 text-center">
                <Package className="w-12 h-12 mx-auto mb-4" style={{ color: theme.colors.textSecondary }} />
                <p style={{ color: theme.colors.textPrimary }}>Category Not Found</p>
            </GlassCard>
        </div>
    );

    const product = categoryData.products?.find(p => p.id === productId) || categoryData.products?.[0];
    const perProductList = categoryData.competitionByProduct?.[product?.id] || [];
    const categoryCompetitors = categoryData.competition || [];

    const [showRequest, setShowRequest] = useState(false);
    const [formState, setFormState] = useState({ manufacturer: '', series: '', notes: '' });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => setFormState(s => ({ ...s, [e.target.name]: e.target.value }));
    const canSubmit = formState.manufacturer.trim() && formState.series.trim();
    const handleSubmit = (e) => { 
        e.preventDefault(); 
        if (!canSubmit) return; 
        setSubmitted(true); 
        setTimeout(() => { 
            setShowRequest(false); 
            setSubmitted(false); 
            setFormState({ manufacturer: '', series: '', notes: '' }); 
        }, 1200); 
    };

    return (
        <div className="flex flex-col h-full" style={{ backgroundColor: theme.colors.background }}>
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className={`p-4 space-y-4 ${isDesktop ? 'max-w-3xl mx-auto pb-8' : 'pb-28'}`}>
                    
                    {/* Hero Section - smaller on desktop */}
                    <div 
                        className={`relative w-full rounded-2xl overflow-hidden shadow-sm ${isDesktop ? 'aspect-[3/1]' : 'aspect-[16/10]'}`}
                        style={{ background: theme.colors.surface }}
                    >
                        <img 
                            src={product.image} 
                            alt={product.name} 
                            className="absolute inset-0 w-full h-full object-contain"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-5">
                            <div className="flex items-end justify-between gap-4">
                                <div>
                                    <p className="text-white/70 text-xs font-medium mb-1">{categoryData.name}</p>
                                    <h1 className={`font-bold text-white tracking-tight ${isDesktop ? 'text-2xl' : 'text-xl'}`}>
                                        {product.name} Competitive Analysis
                                    </h1>
                                </div>
                                <div className="text-right">
                                    <p className="text-white/70 text-[10px] uppercase tracking-wider mb-0.5">JSI Price</p>
                                    <p className="text-white text-xl font-bold">${(product.price || 0).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Competitor list */}
                    <VersusList 
                        jsiProduct={product} 
                        competitors={perProductList.length ? perProductList : categoryCompetitors} 
                        theme={theme} 
                        isDesktop={isDesktop}
                    />
                    
                    {/* Desktop inline button */}
                    {isDesktop && (
                        <button 
                            onClick={() => setShowRequest(true)}
                            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold transition-all hover:opacity-90 active:scale-[0.99]"
                            style={{ background: theme.colors.accent, color: '#fff' }}
                        >
                            <Plus className="w-5 h-5" />
                            Request Competitor
                        </button>
                    )}
                </div>
            </div>
            
            {/* Mobile floating button - proper spacing */}
            {!isDesktop && (
                <div className="sticky bottom-0 left-0 right-0 p-4 pb-6" style={{ background: theme.colors.background }}>
                    <button 
                        onClick={() => setShowRequest(true)} 
                        className="w-full flex items-center justify-center gap-2 h-14 rounded-2xl font-semibold active:scale-95 transition-all shadow-lg"
                        style={{ background: theme.colors.accent, color: '#fff' }}
                    >
                        <Plus className="w-5 h-5" /> Request Competitor
                    </button>
                </div>
            )}
            
            <Modal show={showRequest} onClose={() => setShowRequest(false)} title="Request Competitor" theme={theme}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold" style={{ color: theme.colors.textSecondary }}>Manufacturer *</label>
                        <input 
                            name="manufacturer" 
                            value={formState.manufacturer} 
                            onChange={handleChange} 
                            placeholder="e.g. Kimball" 
                            className="w-full px-4 py-3 rounded-xl text-sm font-medium" 
                            style={{ background: theme.colors.subtle, color: theme.colors.textPrimary, border: `1px solid ${theme.colors.border}`, outline: 'none' }} 
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold" style={{ color: theme.colors.textSecondary }}>Series / Product *</label>
                        <input 
                            name="series" 
                            value={formState.series} 
                            onChange={handleChange} 
                            placeholder="e.g. Joya" 
                            className="w-full px-4 py-3 rounded-xl text-sm font-medium" 
                            style={{ background: theme.colors.subtle, color: theme.colors.textPrimary, border: `1px solid ${theme.colors.border}`, outline: 'none' }} 
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold" style={{ color: theme.colors.textSecondary }}>Notes (optional)</label>
                        <textarea 
                            name="notes" 
                            value={formState.notes} 
                            onChange={handleChange} 
                            rows={3} 
                            placeholder="Any context or price info..." 
                            className="w-full px-4 py-3 rounded-xl text-sm font-medium resize-none" 
                            style={{ background: theme.colors.subtle, color: theme.colors.textPrimary, border: `1px solid ${theme.colors.border}`, outline: 'none' }} 
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button 
                            type="button" 
                            onClick={() => setShowRequest(false)} 
                            className="px-6 py-3 rounded-full font-semibold text-sm"
                            style={{ background: theme.colors.subtle, color: theme.colors.textPrimary }}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={!canSubmit || submitted} 
                            className="px-6 py-3 rounded-full font-semibold text-sm text-white disabled:opacity-50"
                            style={{ background: theme.colors.accent }}
                        >
                            {submitted ? '? Sent!' : 'Submit'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};