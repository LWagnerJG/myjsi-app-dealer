import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { Camera, Image, AlertCircle, CheckCircle, Clock, XCircle, Plus, MapPin, ChevronDown } from 'lucide-react';
import { REPLACEMENT_REQUESTS_DATA } from './data.js';
import { useIsDesktop } from '../../hooks/useResponsive.js';
import jsQR from 'jsqr';

function RequestCard({ r, theme, getStatusColor, getStatusText, getIcon, onClick, isDesktop }) {
    const dateText = new Date(r.date).toLocaleDateString();
    const dealerText = r.dealer || 'Unknown Dealer';
    return (
        <button onClick={onClick} className="w-full text-left">
            <GlassCard
                theme={theme}
                variant="elevated"
                interactive
                className={`p-4 ${isDesktop ? 'p-5' : 'p-4'} flex items-center justify-between gap-3 hover:shadow-lg transition-all duration-200`}
            >
                <div className="min-w-0 flex-1">
                    <div className="font-semibold truncate text-base" style={{ color: theme.colors.textPrimary }}>
                        {r.name}
                    </div>
                    <div className="text-sm mt-1 truncate" style={{ color: theme.colors.textSecondary }}>
                        {dealerText} • {dateText}
                    </div>
                </div>
                <div
                    className="px-3 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 flex-shrink-0"
                    style={{ backgroundColor: getStatusColor(r.status), color: getStatusText(r.status) }}
                >
                    {getIcon(r.status)} {r.status}
                </div>
            </GlassCard>
        </button>
    );
}

function ReplacementForm({
    theme,
    formData,
    onChange,
    onSubmit,
    fileInputRef,
    onPickPhotos,
    openPhotoPicker,
    isDesktop,
    contentMaxWidth,
}) {
    const [showFieldVisitOptions, setShowFieldVisitOptions] = useState(false);
    
    return (
        <div className={`px-4 lg:px-6 pt-6 lg:pt-8 pb-32 lg:pb-8 ${contentMaxWidth || ''}`}>
            <h2 className="text-xl lg:text-2xl font-bold mb-6" style={{ color: theme.colors.textPrimary }}>New Replacement Request</h2>
            
            <div className={`${isDesktop ? 'grid grid-cols-2 gap-6' : 'space-y-4'}`}>
                {/* Left Column - Form Fields */}
                <GlassCard theme={theme} className="p-5 lg:p-6 space-y-5" variant="elevated">
                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: theme.colors.textSecondary }}>
                            Sales Order
                        </label>
                        <input
                            value={formData.salesOrder}
                            onChange={(e) => onChange('salesOrder', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl text-sm outline-none font-medium"
                            style={{ backgroundColor: theme.colors.surface, border: `1.5px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}
                            autoComplete="off"
                            placeholder="e.g., SO-450080"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: theme.colors.textSecondary }}>
                            Line Item
                        </label>
                        <input
                            value={formData.lineItem}
                            onChange={(e) => onChange('lineItem', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl text-sm outline-none font-medium"
                            style={{ backgroundColor: theme.colors.surface, border: `1.5px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}
                            autoComplete="off"
                            placeholder="e.g., 001"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: theme.colors.textSecondary }}>
                            Dealer
                        </label>
                        <input
                            value={formData.dealer}
                            onChange={(e) => onChange('dealer', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl text-sm outline-none font-medium"
                            placeholder="e.g., Acme Office Solutions"
                            style={{ backgroundColor: theme.colors.surface, border: `1.5px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}
                            autoComplete="off"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: theme.colors.textSecondary }}>
                            Notes
                        </label>
                        <textarea
                            rows={4}
                            value={formData.notes}
                            onChange={(e) => onChange('notes', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none font-medium"
                            style={{ backgroundColor: theme.colors.surface, border: `1.5px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}
                            placeholder="Describe the issue or parts needed..."
                        />
                    </div>
                    
                    {/* Field Visit Request Section */}
                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                const newValue = !formData.requestFieldVisit;
                                onChange('requestFieldVisit', newValue);
                                if (newValue) setShowFieldVisitOptions(true);
                                else {
                                    setShowFieldVisitOptions(false);
                                    onChange('fieldVisitType', '');
                                    onChange('visitAddress', '');
                                }
                            }}
                            className="w-full flex items-center gap-3 p-4 rounded-xl transition-all"
                            style={{ 
                                backgroundColor: formData.requestFieldVisit ? `${theme.colors.accent}10` : theme.colors.surface, 
                                border: `1.5px solid ${formData.requestFieldVisit ? theme.colors.accent : theme.colors.border}` 
                            }}
                        >
                            <div 
                                className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
                                style={{ 
                                    backgroundColor: formData.requestFieldVisit ? theme.colors.accent : 'transparent',
                                    border: `2px solid ${formData.requestFieldVisit ? theme.colors.accent : theme.colors.border}`
                                }}
                            >
                                {formData.requestFieldVisit && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <div className="flex-1 text-left">
                                <div className="font-semibold text-sm" style={{ color: theme.colors.textPrimary }}>
                                    Request Field Visit
                                </div>
                                <div className="text-xs mt-0.5" style={{ color: theme.colors.textSecondary }}>
                                    Have a rep or technician visit the site
                                </div>
                            </div>
                            <MapPin className="w-5 h-5" style={{ color: formData.requestFieldVisit ? theme.colors.accent : theme.colors.textSecondary }} />
                        </button>
                        
                        {/* Field Visit Options - Animated expand */}
                        <div className={`overflow-hidden transition-all duration-300 ${formData.requestFieldVisit ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
                            <div className="space-y-3 p-4 rounded-xl" style={{ backgroundColor: theme.colors.subtle }}>
                                <div>
                                    <label className="block text-xs font-semibold mb-2" style={{ color: theme.colors.textSecondary }}>
                                        Who should visit?
                                    </label>
                                    <div className="flex gap-2">
                                        {[
                                            { value: 'rep', label: 'Sales Rep' },
                                            { value: 'technician', label: 'JSI Field Technician' }
                                        ].map(option => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => onChange('fieldVisitType', option.value)}
                                                className="flex-1 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all"
                                                style={{
                                                    backgroundColor: formData.fieldVisitType === option.value ? theme.colors.accent : theme.colors.surface,
                                                    color: formData.fieldVisitType === option.value ? '#fff' : theme.colors.textPrimary,
                                                    border: `1.5px solid ${formData.fieldVisitType === option.value ? theme.colors.accent : theme.colors.border}`
                                                }}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-semibold mb-2" style={{ color: theme.colors.textSecondary }}>
                                        Visit Address
                                    </label>
                                    <input
                                        value={formData.visitAddress || ''}
                                        onChange={(e) => onChange('visitAddress', e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-lg text-sm outline-none font-medium"
                                        style={{ backgroundColor: theme.colors.surface, border: `1.5px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}
                                        placeholder="Full address for the visit..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </GlassCard>

                {/* Right Column - Photos */}
                <GlassCard theme={theme} className="p-5 lg:p-6" variant="elevated">
                    <label className="block text-sm font-semibold mb-3" style={{ color: theme.colors.textSecondary }}>
                        Photos
                    </label>

                    {/* Previews (if any) */}
                    {Array.isArray(formData.photos) && formData.photos.length > 0 && (
                        <div className="mb-4 grid grid-cols-3 gap-3">
                            {formData.photos.map((src, idx) => (
                                <div key={idx} className="relative rounded-xl overflow-hidden" style={{ border: `1.5px solid ${theme.colors.border}` }}>
                                    <img src={src} alt={`Uploaded ${idx + 1}`} className="w-full h-28 object-cover" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        capture="environment"
                        className="hidden"
                        onChange={onPickPhotos}
                    />

                    {/* Click target to open the file picker */}
                    <button
                        type="button"
                        onClick={openPhotoPicker}
                        className={`w-full rounded-2xl p-8 text-center transition-all duration-200 hover:shadow-md ${formData.photos?.length ? 'py-6' : ''}`}
                        style={{ border: `2px dashed ${theme.colors.border}`, color: theme.colors.textSecondary, backgroundColor: theme.colors.surface }}
                    >
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: `${theme.colors.accent}15` }}>
                            <Image className="w-6 h-6" style={{ color: theme.colors.accent }} />
                        </div>
                        <div className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                            {formData.photos?.length ? 'Add More Photos' : 'Add Photos'}
                        </div>
                        <div className="text-sm mt-1">Click or tap to select</div>
                    </button>
                </GlassCard>
            </div>

            <div className={`mt-6 ${isDesktop ? 'max-w-md' : ''}`}>
                <button
                    onClick={onSubmit}
                    className="w-full py-4 rounded-full font-bold text-white active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                    style={{ backgroundColor: theme.colors.accent }}
                >
                    Submit Replacement Request
                </button>
            </div>
        </div>
    );
}

export const ReplacementsScreen = ({ theme }) => {
    const [view, setView] = useState('list');
    const [isScanning, setIsScanning] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [cameraError, setCameraError] = useState(null);
    const [formData, setFormData] = useState({ salesOrder: '', lineItem: '', dealer: '', notes: '', photos: [], requestFieldVisit: false, fieldVisitType: '', visitAddress: '' });
    const videoRef = useRef(null); const canvasRef = useRef(null); const intervalRef = useRef(null); const streamRef = useRef(null); const fileInputRef = useRef(null); const inFormRef = useRef(false);
    const [replacementRequests, setReplacementRequests] = useState((REPLACEMENT_REQUESTS_DATA || []).map(r => ({ name: r.name, dealer: r.dealer || '', date: r.date, status: r.status, photos: Array.isArray(r.photos)? r.photos: [] })));
    const isDesktop = useIsDesktop();
    
    // Desktop layout classes
    const contentMaxWidth = isDesktop ? 'max-w-5xl mx-auto w-full lg:pl-20' : '';

    useEffect(() => { const onPop = () => { if (inFormRef.current) { setView('list'); setIsScanning(false); inFormRef.current = false; } }; window.addEventListener('popstate', onPop); return () => window.removeEventListener('popstate', onPop); }, []);
    const goToForm = useCallback(() => { if (!inFormRef.current) { window.history.pushState({ jsiReplacements: 'form' }, ''); inFormRef.current = true; } setView('form'); }, []);
    const onChange = useCallback((k,v)=> setFormData(p => (p[k]===v? p : { ...p, [k]:v })), []);
    const submit = useCallback(()=> { setReplacementRequests(p => [{ name: `${formData.salesOrder} - ${formData.lineItem}`, dealer: formData.dealer?.trim() || 'Unknown Dealer', date: new Date().toISOString().split('T')[0], status: 'Pending', photos: formData.photos.slice(), requestFieldVisit: formData.requestFieldVisit, fieldVisitType: formData.fieldVisitType, visitAddress: formData.visitAddress }, ...p]); setFormData({ salesOrder: '', lineItem: '', dealer: '', notes: '', photos: [], requestFieldVisit: false, fieldVisitType: '', visitAddress: '' }); setView('list'); inFormRef.current=false; }, [formData]);

    const getStatusColor = s => ({ Pending: theme.colors.accent + '22', Approved: '#22c55e22', Rejected: '#ef444422' }[s] || theme.colors.subtle);
    const getStatusText = s => ({ Pending: theme.colors.accent, Approved: '#16a34a', Rejected: '#dc2626' }[s] || theme.colors.textSecondary);
    const getIcon = s => s==='Pending'? <Clock className="w-4 h-4" /> : s==='Approved'? <CheckCircle className="w-4 h-4" /> : s==='Rejected'? <XCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />;

    const stopScanning = useCallback(()=> { setIsScanning(false); setCameraError(null); if(streamRef.current){ streamRef.current.getTracks().forEach(t=>t.stop()); streamRef.current=null; } if(videoRef.current) videoRef.current.srcObject=null; if(intervalRef.current){ clearInterval(intervalRef.current); intervalRef.current=null; } }, []);
    const detectLoop = useCallback(()=> { intervalRef.current = setInterval(()=> { if(videoRef.current && canvasRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA){ const v=videoRef.current; const c=canvasRef.current; const ctx=c.getContext('2d'); c.width=v.videoWidth; c.height=v.videoHeight; ctx.drawImage(v,0,0,c.width,c.height); const img=ctx.getImageData(0,0,c.width,c.height); const code=jsQR(img.data,c.width,c.height); if(code){ stopScanning(); setFormData({ salesOrder:'SO-450080', lineItem:'001', dealer:'', notes:`Scanned QR Code: ${code.data}`, photos:[], requestFieldVisit: false, fieldVisitType: '', visitAddress: '' }); goToForm(); } } }, 320); }, [stopScanning, goToForm]);
    const startScanning = useCallback(async()=> { setCameraError(null); try { if(!navigator.mediaDevices?.getUserMedia) throw new Error('Camera not supported on this device'); const stream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:{ ideal:'environment' }, width:{ ideal:1280 }, height:{ ideal:720 } }, audio:false }); streamRef.current=stream; if(videoRef.current){ const v=videoRef.current; v.srcObject=stream; v.muted=true; v.playsInline=true; v.onloadedmetadata=()=>{ v.play().then(()=>{ setIsScanning(true); detectLoop(); }); }; } } catch(e){ setCameraError((e && e.message) || 'Unable to access camera.'); setIsScanning(false); } }, [detectLoop]);
    useEffect(()=> () => stopScanning(), [stopScanning]);

    const filesToDataURLs = files => Promise.all(files.map(file => new Promise(resolve => { const reader=new FileReader(); reader.onload=()=>resolve(reader.result); reader.readAsDataURL(file); }))); 
    const onPickPhotos = useCallback(async e => { const files=Array.from(e.target.files||[]); if(!files.length) return; const urls = await filesToDataURLs(files); setFormData(p=> ({ ...p, photos:[...(p.photos||[]), ...urls] })); e.target.value=''; }, []);
    const openPhotoPicker = useCallback(()=> { if(fileInputRef.current) fileInputRef.current.click(); }, []);

    /* -------------------------------- UI ---------------------------------- */
    return (
        <div className="flex flex-col h-full" style={{ backgroundColor: theme.colors.background }}>
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                {view === 'list' ? (
                    <div className={`px-4 lg:px-6 pt-4 lg:pt-6 pb-32 ${contentMaxWidth}`} style={{ paddingBottom: '140px' }}>
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-xl lg:text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>Replacements</h1>
                                <p className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>Request replacement parts</p>
                            </div>
                            <button 
                                onClick={() => { setFormData({ salesOrder: '', lineItem: '', dealer: '', notes: '', photos: [], requestFieldVisit: false, fieldVisitType: '', visitAddress: '' }); goToForm(); }}
                                className="h-10 px-5 rounded-full text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95 shadow-md flex items-center gap-2"
                                style={{ backgroundColor: theme.colors.accent, color: '#fff' }}
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">New Request</span>
                                <span className="sm:hidden">New</span>
                            </button>
                        </div>
                        
                        {/* Action Cards - Side by side on desktop */}
                        <div className={`${isDesktop ? 'grid grid-cols-2 gap-6' : 'space-y-4'} mb-8`}>
                            {/* QR Scanner Card */}
                            <GlassCard theme={theme} className="p-0 overflow-hidden" variant="elevated">
                                <div className="relative rounded-2xl overflow-hidden" style={{ border: `2px dashed ${isScanning ? theme.colors.accent : theme.colors.border}` }}>
                                    <video ref={videoRef} className={`block w-full ${isDesktop ? 'h-[280px]' : 'h-[260px]'} object-cover`} playsInline muted autoPlay />
                                    {!isScanning && (
                                        <button onClick={startScanning} className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-transparent to-black/5">
                                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: `${theme.colors.accent}15` }}>
                                                <Camera className="w-8 h-8" style={{ color: theme.colors.accent }} />
                                            </div>
                                            <div className="font-bold text-base" style={{ color: theme.colors.textPrimary }}>Scan QR Code</div>
                                            <div className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>Tap to open camera</div>
                                            {cameraError && (
                                                <div className="mt-3 text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
                                                    {cameraError}
                                                </div>
                                            )}
                                        </button>
                                    )}
                                    {isScanning && (
                                        <>
                                            <div className="absolute top-3 left-3 text-xs px-3 py-1.5 rounded-full font-semibold" style={{ backgroundColor: '#0009', color: '#fff' }}>
                                                Scanning…
                                            </div>
                                            <button onClick={stopScanning} className="absolute bottom-3 right-3 px-4 py-2 rounded-xl text-sm font-bold text-white active:scale-95" style={{ backgroundColor: '#ef4444' }}>
                                                Cancel
                                            </button>
                                            <canvas ref={canvasRef} className="hidden" />
                                        </>
                                    )}
                                </div>
                            </GlassCard>
                            
                            {/* Manual Entry Card */}
                            <GlassCard 
                                theme={theme} 
                                className={`${isDesktop ? 'h-[280px]' : 'min-h-[160px]'} flex flex-col items-center justify-center cursor-pointer hover:shadow-lg transition-all duration-200 p-6`}
                                variant="elevated"
                                onClick={() => { setFormData({ salesOrder: '', lineItem: '', dealer: '', notes: '', photos: [], requestFieldVisit: false, fieldVisitType: '', visitAddress: '' }); goToForm(); }}
                            >
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: `${theme.colors.accent}15` }}>
                                    <Image className="w-7 h-7" style={{ color: theme.colors.accent }} />
                                </div>
                                <div className="font-bold text-base" style={{ color: theme.colors.textPrimary }}>
                                    Enter Details Manually
                                </div>
                                <div className="text-sm mt-1 text-center" style={{ color: theme.colors.textSecondary }}>
                                    Fill out the form without scanning
                                </div>
                            </GlassCard>
                        </div>

                        {/* Previous Requests */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>
                                    Previous Requests
                                </h2>
                                <span className="text-sm font-medium px-3 py-1 rounded-full" style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textSecondary }}>
                                    {replacementRequests.length} total
                                </span>
                            </div>
                            <div className={`${isDesktop ? 'grid grid-cols-2 gap-4' : 'space-y-3'}`}>
                                {replacementRequests.length ? (
                                    replacementRequests.map((r, i) => (
                                        <RequestCard
                                            key={`${r.name}-${i}`}
                                            r={r}
                                            theme={theme}
                                            getStatusColor={getStatusColor}
                                            getStatusText={getStatusText}
                                            getIcon={getIcon}
                                            onClick={() => setSelectedRequest(r)}
                                            isDesktop={isDesktop}
                                        />
                                    ))
                                ) : (
                                    <GlassCard theme={theme} className={`p-8 text-center ${isDesktop ? 'col-span-2' : ''}`} variant="elevated">
                                        <div className="font-semibold mb-1 text-base" style={{ color: theme.colors.textPrimary }}>
                                            No Previous Requests
                                        </div>
                                        <div className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                            Submit your first replacement request.
                                        </div>
                                    </GlassCard>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <ReplacementForm
                        theme={theme}
                        formData={formData}
                        onChange={onChange}
                        onSubmit={submit}
                        fileInputRef={fileInputRef}
                        onPickPhotos={onPickPhotos}
                        openPhotoPicker={openPhotoPicker}
                        isDesktop={isDesktop}
                        contentMaxWidth={contentMaxWidth}
                    />
                )}
            </div>

            <Modal
                show={!!selectedRequest}
                onClose={() => setSelectedRequest(null)}
                title={selectedRequest?.name || ''}
                theme={theme}
            >
                {selectedRequest && (
                    <div className="space-y-4">
                        <div className="px-3 py-1.5 rounded-full text-sm font-bold inline-flex items-center gap-1.5" style={{ backgroundColor: getStatusColor(selectedRequest.status), color: getStatusText(selectedRequest.status) }}>
                            {getIcon(selectedRequest.status)} {selectedRequest.status}
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <div className="mb-1 font-medium" style={{ color: theme.colors.textSecondary }}>Date</div>
                                <div className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                                    {new Date(selectedRequest.date).toLocaleDateString()}
                                </div>
                            </div>
                            <div>
                                <div className="mb-1 font-medium" style={{ color: theme.colors.textSecondary }}>Dealer</div>
                                <div className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                                    {selectedRequest.dealer || 'Unknown Dealer'}
                                </div>
                            </div>
                        </div>

                        {/* Photos (if any) */}
                        {Array.isArray(selectedRequest.photos) && selectedRequest.photos.length > 0 && (
                            <div>
                                <div className="mb-2 text-sm font-bold" style={{ color: theme.colors.textPrimary }}>
                                    Submitted Photos
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {selectedRequest.photos.map((src, idx) => (
                                        <div key={idx} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${theme.colors.border}` }}>
                                            <img src={src} alt={`Request photo ${idx + 1}`} className="w-full h-24 object-cover" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};
