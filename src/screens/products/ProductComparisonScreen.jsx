import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { ArrowRight, Package } from 'lucide-react';
import { PRODUCT_DATA } from './data.js';

// Configuration option sets
const CASEGOODS_TYPICAL_OPTIONS = ['U-Shape','L-Shape','Single Ped Desk','Adjustable Ht Desk'];
const CONFERENCE_SIZE_OPTIONS = ['30x72','42x90','48x108','54x180','60x210'];
const LOUNGE_SEATING_OPTIONS = ['Single Seater','Two Seater','Three Seater','Ottoman'];
const MATERIAL_UPCHARGE = { laminate: 1, veneer: 1.12 };
const TYPICAL_MULTIPLIERS = { 'U-Shape': 1, 'L-Shape': 0.92, 'Single Ped Desk': 0.85, 'Adjustable Ht Desk': 1.05 };

// Product selection tabs - compact, refined glass aesthetic
const ProductTabs = React.memo(({ products, activeProduct, onProductSelect, theme, categoryName }) => {
  const isCasegoods = categoryName?.toLowerCase() === 'casegoods';
  return (
    <div 
      className="rounded-2xl overflow-hidden"
      style={{ 
        backgroundColor: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
      }}
    >
      <div className="flex justify-center gap-4 overflow-x-auto scrollbar-hide px-4 py-3">
        {products.map(p => {
          const active = activeProduct.id === p.id;
          const baseScale = p?.thumbScale || (isCasegoods ? 1.3 : 1.1);
          return (
            <button 
              key={p.id}
              onClick={() => onProductSelect(p)} 
              aria-pressed={active} 
              className="flex flex-col items-center select-none transition-all duration-200"
              style={{ 
                minWidth: 70,
                opacity: active ? 1 : 0.5,
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              <div 
                className="flex items-center justify-center"
                style={{ width: 64, height: 56 }}
              >
                <img 
                  src={p.image} 
                  alt={p.name} 
                  loading="lazy" 
                  className="max-w-full max-h-full object-contain transition-transform duration-300"
                  style={{ transform: `scale(${baseScale})` }} 
                />
              </div>
              <span 
                className="mt-1.5 text-[11px] font-medium text-center leading-tight"
                style={{ color: theme.colors.textPrimary }}
              >
                {p.name}
              </span>
              {active && (
                <div 
                  className="mt-1 h-0.5 w-6 rounded-full"
                  style={{ backgroundColor: theme.colors.textPrimary }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
});
ProductTabs.displayName='ProductTabs';

// Hero component - enhanced gradient and glass button
const ProductHero = React.memo(({ product, theme, categoryId, onNavigate, categoryName }) => {
  const handleCompetitionClick = useCallback(()=> onNavigate(`products/category/${categoryId}/competition/${product.id}`),[categoryId,onNavigate,product.id]);
  const isChairCategory = /chair|guest|seating/i.test(categoryId) || /chair|guest|seating/i.test(categoryName||'');
  const isCasegoods = categoryId==='casegoods';
  const aspectClass = isChairCategory? 'aspect-[4/3]' : 'aspect-[16/10]';
  const [currentImg,setCurrentImg]=useState(product.image); const [prevImg,setPrevImg]=useState(null);
  useEffect(()=>{ if(product.image!==currentImg){ setPrevImg(currentImg); setCurrentImg(product.image); const t=setTimeout(()=>setPrevImg(null),450); return ()=>clearTimeout(t);} },[product.image,currentImg]);
  // More aggressive zoom to fill frame and eliminate borders
  let baseZoom = product.heroScale ? Math.min(1.5, Math.max(1.1, product.heroScale * 1.2)) : (isChairCategory?1.25:1.4); if(isCasegoods) baseZoom*=1.1;
  return (
    <div 
      className={`relative w-full ${aspectClass} rounded-3xl overflow-hidden group`} 
      style={{ 
        background: 'linear-gradient(165deg, #e8e6e1 0%, #d4d0c8 50%, #c5c0b6 100%)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)'
      }}
    >
      {prevImg && <img src={prevImg} alt="prev" className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500" />}
      <img 
        src={currentImg} 
        alt={product.name} 
        className="absolute inset-0 w-full h-full object-cover transition-all duration-[900ms] ease-[cubic-bezier(.22,.8,.12,.99)] opacity-0 group-hover:scale-[1.02]" 
        style={{ transform:`scale(${baseZoom})`, animation:'fadeInHero 600ms forwards' }} 
      />
      {/* Refined gradient overlay */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{ 
          background: 'linear-gradient(to top, rgba(40,38,35,0.5) 0%, rgba(40,38,35,0.2) 35%, transparent 60%)'
        }} 
      />
      {/* Product info with glass pill for price */}
      <div className="absolute left-0 right-0 bottom-0 flex items-end justify-between px-5 pb-5 pt-8">
        <div className="leading-tight select-none">
          <h2 
            className="text-[28px] font-bold text-white tracking-tight"
            style={{ textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}
          >
            {product.name}
          </h2>
          <p 
            className="mt-1 text-lg font-semibold text-white/90"
            style={{ textShadow: '0 1px 8px rgba(0,0,0,0.2)' }}
          >
            ${product.price?.toLocaleString()||'TBD'}
          </p>
        </div>
        <button 
          onClick={handleCompetitionClick} 
          className="flex items-center gap-2 px-4 py-2 rounded-2xl font-semibold text-sm transition-all duration-200 active:scale-95 hover:scale-[1.02]" 
          style={{ 
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            color: theme.colors.textPrimary, 
            border: '1px solid rgba(255,255,255,0.8)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08), inset 0 1px 1px rgba(255,255,255,0.9), inset 0 -1px 1px rgba(0,0,0,0.03)'
          }}
        >
          <span>Competition</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});
ProductHero.displayName='ProductHero';

// Pricing Table - refined with glass aesthetic
const PricingTable = React.memo(({ products, activeProduct, onSelectProduct, theme, categoryId, typicalLayout, onTypicalLayoutChange, conferenceSize, onConferenceSizeChange, loungeConfig, onLoungeConfigChange, guestLegType, onGuestLegTypeChange, materialMode, onMaterialModeChange }) => {
  const isGuest = categoryId==='guest';
  const isCasegoods = categoryId==='casegoods';
  const isConference = categoryId==='conference-tables';
  const isTraining = categoryId==='training-tables';
  const isLounge = categoryId==='lounge';

  // Material toggle only for these categories
  const showMaterialToggle = isCasegoods || isConference || isTraining;
  const materialOptions = ['Laminate','Veneer'];
  const materialActiveIndex = materialOptions.findIndex(o=>materialMode===o.toLowerCase());

  // Top pills depending on category
  let pills = [];
  if (isCasegoods) pills = CASEGOODS_TYPICAL_OPTIONS;
  else if (isConference) pills = CONFERENCE_SIZE_OPTIONS;
  else if (isLounge) pills = LOUNGE_SEATING_OPTIONS;
  else if (isGuest) pills = ['Wood','Metal'];

  const handlePillClick = (value) => {
    if (isCasegoods) onTypicalLayoutChange(value);
    else if (isConference) onConferenceSizeChange(value);
    else if (isLounge) onLoungeConfigChange(value);
    else if (isGuest) onGuestLegTypeChange(value.toLowerCase());
  };

  const sorted = useMemo(()=>[...products].sort((a,b)=>(a.price||0)-(b.price||0)),[products]);

  const computePrice = (p) => {
    if (isCasegoods) {
      const materialFactor = MATERIAL_UPCHARGE[materialMode] || 1;
      const typicalFactor = TYPICAL_MULTIPLIERS[typicalLayout] || 1;
      return Math.round((p.price||0)*materialFactor*typicalFactor/10)*10;
    }
    return p.price;
  };

  return (
    <div 
      className="rounded-3xl overflow-hidden animate-[fadeSlide_.55s_ease]"
      style={{ 
        backgroundColor: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 2px 16px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)'
      }}
    >
      {/* Configuration pills */}
      {pills.length > 0 && (
        <div className="px-5 pt-5 pb-1">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {pills.map(pill => { 
              const active = (isCasegoods && pill===typicalLayout) || (isConference && pill===conferenceSize) || (isLounge && pill===loungeConfig) || (isGuest && pill.toLowerCase()===guestLegType); 
              return (
                <button 
                  key={pill} 
                  onClick={() => handlePillClick(pill)} 
                  className="px-4 h-9 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 flex items-center"
                  style={{ 
                    backgroundColor: active ? theme.colors.textPrimary : 'rgba(0,0,0,0.04)',
                    color: active ? '#FFFFFF' : theme.colors.textSecondary,
                    fontWeight: active ? 600 : 500
                  }}
                >
                  {pill}
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Material toggle with refined styling */}
      {showMaterialToggle && (
        <div className="px-5 pt-3">
          <div 
            className="relative flex h-11 w-full rounded-full p-1 overflow-hidden"
            style={{ backgroundColor: 'rgba(0,0,0,0.04)' }}
          >
            <span 
              className="absolute top-1 bottom-1 rounded-full transition-transform duration-300 ease-out"
              style={{ 
                width: `calc((100% - 8px) / ${materialOptions.length})`,
                left: 4,
                backgroundColor: '#ffffff',
                boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                transform: `translateX(${materialActiveIndex * 100}%)`
              }} 
            />
            {materialOptions.map(opt => { 
              const key = opt.toLowerCase(); 
              const active = materialMode === key; 
              return (
                <button 
                  key={opt} 
                  onClick={() => onMaterialModeChange(key)} 
                  className="relative z-10 flex-1 rounded-full flex items-center justify-center whitespace-nowrap transition-colors text-sm"
                  style={{ 
                    color: active ? theme.colors.textPrimary : theme.colors.textSecondary,
                    fontWeight: active ? 600 : 500
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Divider */}
      <div className="mx-5 h-px mt-4" style={{ backgroundColor: 'rgba(0,0,0,0.06)' }} />
      
      {/* Series header */}
      <div className="px-5 pt-3 pb-2 flex items-center justify-between">
        <span className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: theme.colors.textSecondary }}>
          Series
        </span>
        <span className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: theme.colors.textSecondary }}>
          List $
        </span>
      </div>
      
      {/* Product list */}
      <div className="pb-2">
        {sorted.map(p => { 
          const active = p.id === activeProduct.id; 
          const price = computePrice(p); 
          return (
            <button 
              key={p.id} 
              onClick={() => onSelectProduct(p)} 
              disabled={active} 
              className="w-full group px-5 py-3.5 flex items-center justify-between text-sm transition-all duration-200 text-left rounded-none"
              style={{ 
                cursor: active ? 'default' : 'pointer',
                backgroundColor: active ? 'rgba(0,0,0,0.03)' : 'transparent'
              }}
            >
              <span className="flex items-center gap-3">
                <span 
                  className="w-1 h-5 rounded-full transition-all duration-300"
                  style={{ 
                    backgroundColor: active ? theme.colors.textPrimary : 'rgba(0,0,0,0.1)'
                  }}
                />
                <span 
                  className="font-medium"
                  style={{ color: active ? theme.colors.textPrimary : theme.colors.textSecondary }}
                >
                  {p.name}
                </span>
              </span>
              <span 
                className="font-semibold tabular-nums"
                style={{ color: active ? theme.colors.textPrimary : theme.colors.textSecondary }}
              >
                ${price?.toLocaleString?.() || 'TBD'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
});
PricingTable.displayName='PricingTable';

const ErrorState = ({ theme, message='The requested item does not exist.' }) => (
  <div className="p-4"><GlassCard theme={theme} className="p-8 text-center"><Package className="w-12 h-12 mx-auto mb-4" style={{ color: theme.colors.textSecondary }} /><p style={{ color: theme.colors.textPrimary }}>{message}</p></GlassCard></div>
);

export const ProductComparisonScreen = ({ categoryId, onNavigate, theme }) => {
  const categoryData = PRODUCT_DATA?.[categoryId];
  const [activeProduct,setActiveProduct]=useState(categoryData?.products?.[0]);
  const isGuest = categoryId==='guest';
  const isCasegoods = categoryId==='casegoods';
  const isConference = categoryId==='conference-tables';
  const isLounge = categoryId==='lounge';
  const isTraining = categoryId==='training-tables';

  // States for configurations
  const [materialMode,setMaterialMode]=useState(isGuest?'wood':'laminate'); // wood/metal only used for guest filtering; laminate default for others
  const [typicalLayout,setTypicalLayout]=useState('U-Shape');
  const [conferenceSize,setConferenceSize]=useState('30x72');
  const [loungeConfig,setLoungeConfig]=useState('Single Seater');
  const [guestLegType,setGuestLegType]=useState('wood');

  const handleProductSelect = useCallback(p=>setActiveProduct(p),[]);
  if(!categoryData) return <ErrorState theme={theme} />;

  // Visible products filtering for guest
  const visibleProducts = useMemo(()=>{
    if(isGuest){
      return categoryData.products.filter(p => p.legType === guestLegType);
    }
    return categoryData.products;
  },[categoryData,isGuest,guestLegType]);

  useEffect(()=>{ if(isGuest && activeProduct && !visibleProducts.includes(activeProduct)){ const next=visibleProducts[0]; if(next) setActiveProduct(next);} },[isGuest,activeProduct,visibleProducts]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="p-4 pb-28 space-y-5">
          <ProductTabs products={visibleProducts} activeProduct={activeProduct} onProductSelect={handleProductSelect} theme={theme} categoryName={categoryData.name} />
          <ProductHero product={activeProduct} theme={theme} categoryId={categoryId} onNavigate={onNavigate} categoryName={categoryData.name} />
          <PricingTable products={visibleProducts} activeProduct={activeProduct} onSelectProduct={handleProductSelect} theme={theme} categoryId={categoryId} typicalLayout={typicalLayout} onTypicalLayoutChange={setTypicalLayout} conferenceSize={conferenceSize} onConferenceSizeChange={setConferenceSize} loungeConfig={loungeConfig} onLoungeConfigChange={setLoungeConfig} guestLegType={guestLegType} onGuestLegTypeChange={setGuestLegType} materialMode={materialMode} onMaterialModeChange={setMaterialMode} />
        </div>
      </div>
    </div>
  );
};

// Inject keyframes if missing
if (typeof document !== 'undefined' && !document.getElementById('product-comp-anim')) {
  const style=document.createElement('style'); style.id='product-comp-anim'; style.innerHTML='@keyframes fadeInHero{0%{opacity:0;transform:scale(.92)}60%{opacity:1}100%{opacity:1}}@keyframes fadeSlide{0%{opacity:0;transform:translateY(12px)}100%{opacity:1;transform:translateY(0)}}@keyframes rowFade{0%{opacity:0;transform:translateY(4px)}100%{opacity:1;transform:translateY(0)}}'; document.head.appendChild(style);
}