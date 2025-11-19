import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { PageTitle } from '../../../components/common/PageTitle.jsx';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { Modal } from '../../../components/common/Modal.jsx';
import StandardSearchBar from '../../../components/common/StandardSearchBar.jsx';
import { FormInput, PortalNativeSelect } from '../../../components/common/FormComponents.jsx';
import { Filter, MoreVertical, UserPlus, CheckCircle, Trash2 } from 'lucide-react';
import { CUSTOMER_DIRECTORY_DATA, ROLE_OPTIONS, DAILY_DISCOUNT_OPTIONS } from './data.js';

export const CustomerDirectoryScreen = ({ theme, showAlert, setSuccessMessage, customerDirectory, onNavigate }) => {
    const customers = customerDirectory || CUSTOMER_DIRECTORY_DATA || [];
    const [localCustomers, setLocalCustomers] = useState(customers);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'name' });
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const filterMenuRef = useRef(null);
    const [pendingDiscountChange, setPendingDiscountChange] = useState(null);
    const [showAddPersonModal, setShowAddPersonModal] = useState(false);
    const [newPerson, setNewPerson] = useState({ firstName: '', lastName: '', email: '', role: 'Sales' });
    const [menuState, setMenuState] = useState({ open: false, person: null, top: 0, left: 0 });
    const modalContentRef = useRef(null);

    useEffect(() => { setLocalCustomers(customers); }, [customers]);
    useEffect(() => { const handleClickOutside = (e) => { if (filterMenuRef.current && !filterMenuRef.current.contains(e.target)) setShowFilterMenu(false); }; document.addEventListener('mousedown', handleClickOutside); return () => document.removeEventListener('mousedown', handleClickOutside); }, []);

    const sortedAndFilteredCustomers = useMemo(() => localCustomers
        .filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()) || (d.address && d.address.toLowerCase().includes(searchTerm.toLowerCase())))
        .sort((a, b) => sortConfig.key === 'name' ? a.name.localeCompare(b.name) : (b[sortConfig.key] || 0) - (a[sortConfig.key] || 0)), [localCustomers, searchTerm, sortConfig]);

    const confirmDiscountChange = () => { if (!pendingDiscountChange) return; const { customerId, newDiscount } = pendingDiscountChange; setLocalCustomers(curr => curr.map(d => d.id === customerId ? { ...d, dailyDiscount: newDiscount } : d)); setSelectedCustomer(prev => prev && prev.id === customerId ? { ...prev, dailyDiscount: newDiscount } : prev); setPendingDiscountChange(null); if (setSuccessMessage) { setSuccessMessage('Saved!'); setTimeout(() => setSuccessMessage(''), 1000); } };
    const handleSort = (key) => { setSortConfig({ key }); setShowFilterMenu(false); };

    const handleAddPerson = (e) => { e.preventDefault(); if (!selectedCustomer) return; const { firstName, lastName, email, role } = newPerson; if (!firstName || !lastName || !email) return; const roleKeyMap = { 'Administrator': 'administration', 'Admin/Sales Support': 'administration', 'Sales': 'salespeople', 'Designer': 'designers', 'Sales/Designer': 'salespeople', 'Installer': 'installers' }; const targetRoleKey = roleKeyMap[role] || 'salespeople'; const person = { name: `${firstName} ${lastName}`, email: email, status: 'pending', roleLabel: role }; const updatedCustomer = { ...selectedCustomer, [targetRoleKey]: [...(selectedCustomer[targetRoleKey] || []), person] }; setLocalCustomers(curr => curr.map(d => d.id === selectedCustomer.id ? updatedCustomer : d)); setSelectedCustomer(updatedCustomer); setShowAddPersonModal(false); setNewPerson({ firstName: '', lastName: '', email: '', role: 'Sales' }); if (setSuccessMessage) { setSuccessMessage(`Invitation sent to ${email}`); setTimeout(() => setSuccessMessage(''), 2000); } };

    const handleUpdatePersonRole = useCallback((personToUpdate, newRoleLabel) => { if (!selectedCustomer) return; const roleKeyMap = { 'Administrator': 'administration', 'Admin/Sales Support': 'administration', 'Sales': 'salespeople', 'Designer': 'designers', 'Sales/Designer': 'salespeople', 'Installer': 'installers' }; const newCategoryKey = roleKeyMap[newRoleLabel]; let personFound = false; const tempCustomer = JSON.parse(JSON.stringify(selectedCustomer)); for (const category of ['salespeople', 'designers', 'administration', 'installers']) { const personIndex = (tempCustomer[category] || []).findIndex(p => p.name === personToUpdate.name); if (personIndex > -1) { const person = tempCustomer[category][personIndex]; person.roleLabel = newRoleLabel; if (category !== newCategoryKey) { tempCustomer[category].splice(personIndex, 1); if (!tempCustomer[newCategoryKey]) tempCustomer[newCategoryKey] = []; tempCustomer[newCategoryKey].push(person); } personFound = true; break; } } if (personFound) { setLocalCustomers(prev => prev.map(d => d.id === tempCustomer.id ? tempCustomer : d)); setSelectedCustomer(tempCustomer); if (setSuccessMessage) { setSuccessMessage('Role Updated!'); setTimeout(() => setSuccessMessage(''), 1000); } } setMenuState({ open: false, person: null, top: 0, left: 0 }); }, [selectedCustomer, setLocalCustomers, setSuccessMessage]);

    const handleRemovePerson = useCallback((personName) => { if (!selectedCustomer) return; const updatedCustomer = { ...selectedCustomer }; ['salespeople', 'designers', 'administration', 'installers'].forEach(category => { if (updatedCustomer[category]) { updatedCustomer[category] = updatedCustomer[category].filter(p => p.name !== personName); } }); setLocalCustomers(prev => prev.map(d => d.id === updatedCustomer.id ? updatedCustomer : d)); setSelectedCustomer(updatedCustomer); setMenuState({ open: false, person: null, top: 0, left: 0 }); if (setSuccessMessage) { setSuccessMessage('Person Removed!'); setTimeout(() => setSuccessMessage(''), 1000); } }, [selectedCustomer, setLocalCustomers, setSuccessMessage]);

    const handleMenuOpen = (event, person) => { event.stopPropagation(); const button = event.currentTarget; const container = modalContentRef.current; if (!container) return; const buttonRect = button.getBoundingClientRect(); const containerRect = container.getBoundingClientRect(); const top = buttonRect.top - containerRect.top + button.offsetHeight; const left = buttonRect.left - containerRect.left + button.offsetWidth - 224; setMenuState({ open: true, person: person, top, left }); };
    const handleMenuClose = () => setMenuState({ open: false, person: null, top: 0, left: 0 });

    const roleOptions = useMemo(() => ROLE_OPTIONS, []);
    const primarySoft = theme.colors.textPrimary || '#1F1F1F';
    const primaryDisplay = 'hsla(0,0%,12%,0.92)';

    const StaffSection = ({ title, members }) => (
        <div>
            <p className="font-bold text-lg pt-4 pb-2" style={{ color: primarySoft }}>{title}</p>
            {members && members.length > 0 ? (
                <div className="border-t" style={{ borderColor: theme.colors.subtle }}>
                    {members.map(m => (
                        <div key={m.name} className="flex justify-between items-center py-2 px-2 border-b" style={{ borderColor: theme.colors.subtle }}>
                            <div>
                                <p className="font-semibold" style={{ color: primarySoft }}>{m.name}</p>
                                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                    {m.status === 'pending' ? <span className="font-semibold text-amber-500">Pending Invitation</span> : m.email}
                                </p>
                            </div>
                            <button onClick={(e) => handleMenuOpen(e, m)} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                                <MoreVertical className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                            </button>
                        </div>
                    ))}
                </div>
            ) : <p className="text-sm px-2 py-1" style={{ color: theme.colors.textSecondary }}>None listed.</p>}
        </div>
    );

    return (
        <div className="flex flex-col h-full">
            <div className="sticky top-0 z-10" style={{ backgroundColor: `${theme.colors.background}e6`, backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
                <PageTitle title="Customer Directory" theme={theme} />
                <div className="px-4 pb-4 flex items-center space-x-2">
                    <StandardSearchBar className="flex-grow" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by name or city..." theme={theme} />
                    <div className="relative">
                        <button onClick={() => setShowFilterMenu(f => !f)} className="p-3.5 rounded-full shadow" style={{ backgroundColor: '#ffffff', border:'1px solid rgba(0,0,0,0.08)' }}>
                            <Filter className="w-5 h-5" style={{ color: primarySoft }} />
                        </button>
                        {showFilterMenu && (
                            <GlassCard ref={filterMenuRef} theme={theme} className="absolute top-14 right-0 z-20 w-40 p-2">
                                <button onClick={() => handleSort('name')} className={`w-full text-left px-2 py-1.5 text-sm rounded-md ${sortConfig.key === 'name' ? 'font-bold' : ''}`} style={{ color: primarySoft, backgroundColor: sortConfig.key === 'name' ? theme.colors.subtle : 'transparent' }}> A-Z </button>
                                <button onClick={() => handleSort('sales')} className={`w-full text-left px-2 py-1.5 text-sm rounded-md ${sortConfig.key === 'sales' ? 'font-bold' : ''}`} style={{ color: primarySoft, backgroundColor: sortConfig.key === 'sales' ? theme.colors.subtle : 'transparent' }}> By Sales </button>
                                <button onClick={() => handleSort('bookings')} className={`w-full text-left px-2 py-1.5 text-sm rounded-md ${sortConfig.key === 'bookings' ? 'font-bold' : ''}`} style={{ color: primarySoft, backgroundColor: sortConfig.key === 'bookings' ? theme.colors.subtle : 'transparent' }}> By Bookings </button>
                            </GlassCard>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pt-4 space-y-3 pb-4">
                {sortedAndFilteredCustomers.map(customer => (
                    <GlassCard key={customer.id} theme={theme} className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setSelectedCustomer(customer); }}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold text-base mb-1 tracking-tight" style={{ color: primaryDisplay }}>{customer.name}</h3>
                                <p className="text-xs leading-snug" style={{ color: theme.colors.textSecondary }}>{customer.address}</p>
                            </div>
                            <div className="text-right flex-shrink-0 ml-2">
                                <p className="text-[10px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: theme.colors.textSecondary }}>{sortConfig.key}</p>
                                <p className="font-bold text-sm" style={{ color: primaryDisplay }}>${(customer[sortConfig.key === 'name' ? 'bookings' : sortConfig.key] || 0).toLocaleString()}</p>
                            </div>
                        </div>
                    </GlassCard>
                ))}
                {sortedAndFilteredCustomers.length === 0 && (
                    <GlassCard theme={theme} className="p-8 flex flex-col items-center justify-center text-center gap-2">
                        <p className="text-sm font-medium" style={{ color: primaryDisplay }}>No customers found.</p>
                        <p className="text-xs" style={{ color: theme.colors.textSecondary }}>Adjust search to find customers.</p>
                    </GlassCard>
                )}
            </div>

            <Modal show={!!selectedCustomer} onClose={() => setSelectedCustomer(null)} title={selectedCustomer?.name || ''} theme={theme}>
                {selectedCustomer && (
                    <div ref={modalContentRef} className="relative">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>{selectedCustomer.address}</p>
                            <button onClick={() => setShowAddPersonModal(true)} className="p-2 -mr-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10"><UserPlus className="w-5 h-5" style={{ color: theme.colors.accent }} /></button>
                        </div>
                        <div className="space-y-2">
                            <p className="font-bold text-lg pt-4 pb-2" style={{ color: primarySoft }}>Daily Discount</p>
                            <PortalNativeSelect label="" theme={theme} value={selectedCustomer.dailyDiscount} onChange={e => setPendingDiscountChange({ customerId: selectedCustomer.id, newDiscount: e.target.value })} options={DAILY_DISCOUNT_OPTIONS.map(opt => ({ label: opt, value: opt }))} />
                        </div>
                        <div className="space-y-4">
                            <StaffSection title="Salespeople" members={selectedCustomer.salespeople} />
                            <StaffSection title="Designers" members={selectedCustomer.designers} />
                            <StaffSection title="Administration" members={selectedCustomer.administration} />
                            <StaffSection title="Installers" members={selectedCustomer.installers} />
                        </div>
                        {menuState.open && (<><div className="absolute inset-0 z-10 -m-6" onClick={handleMenuClose} /><div className="absolute z-20 animate-fade-in" style={{ top: menuState.top, left: menuState.left }}><GlassCard theme={theme} className="p-1 w-56"><div className="px-2 py-1 text-xs font-bold uppercase" style={{ color: theme.colors.textSecondary }}>Change Role</div>{roleOptions.map(opt => (<button key={opt.value} onClick={() => handleUpdatePersonRole(menuState.person, opt.value)} className="w-full flex justify-between items-center text-left py-2 px-2 text-sm font-semibold rounded-lg hover:bg-black/5 dark:hover:bg-white/5"><span style={{ color: menuState.person.roleLabel === opt.value ? theme.colors.accent : primarySoft }}>{opt.label}</span>{menuState.person.roleLabel === opt.value && <CheckCircle className="w-4 h-4" style={{ color: theme.colors.accent }} />}</button>))}<div className="border-t my-1 mx-2" style={{ borderColor: theme.colors.subtle }} /><button onClick={() => handleRemovePerson(menuState.person.name)} className="w-full flex items-center text-left py-2 px-2 text-sm font-semibold rounded-lg text-red-600 hover:bg-red-500/10"><Trash2 className="w-4 h-4 mr-2" />Remove Person</button></GlassCard></div></>)}
                    </div>
                )}
            </Modal>
            <Modal show={!!pendingDiscountChange} onClose={() => setPendingDiscountChange(null)} title="Confirm Change" theme={theme}>
                <p style={{ color: primarySoft }}>Change daily discount to <span className="font-bold">{pendingDiscountChange?.newDiscount}</span>?</p>
                <div className="flex justify-end space-x-3 pt-4"><button onClick={() => setPendingDiscountChange(null)} className="font-bold py-2 px-5 rounded-lg" style={{ backgroundColor: theme.colors.subtle, color: primarySoft }}>Cancel</button><button onClick={confirmDiscountChange} className="font-bold py-2 px-5 rounded-lg text-white" style={{ backgroundColor: theme.colors.accent }}>Save</button></div>
            </Modal>
            <Modal show={showAddPersonModal} onClose={() => setShowAddPersonModal(false)} title="Add New Person" theme={theme}>
                <form onSubmit={handleAddPerson} className="space-y-4">
                    <FormInput label="First Name" value={newPerson.firstName} onChange={e => setNewPerson(p => ({ ...p, firstName: e.target.value }))} theme={theme} required />
                    <FormInput label="Last Name" value={newPerson.lastName} onChange={e => setNewPerson(p => ({ ...p, lastName: e.target.value }))} theme={theme} required />
                    <FormInput label="Email" type="email" value={newPerson.email} onChange={e => setNewPerson(p => ({ ...p, email: e.target.value }))} theme={theme} required />
                    <PortalNativeSelect label="Role" value={newPerson.role} onChange={e => setNewPerson(p => ({ ...p, role: e.target.value }))} theme={theme} options={roleOptions} />
                    <div className="pt-2 text-center"><p className="text-xs mb-2" style={{ color: theme.colors.textSecondary }}>Invitation email will be sent.</p><button type="submit" className="w-full font-bold py-3 px-6 rounded-full text-white" style={{ backgroundColor: theme.colors.accent }}>Send Invite</button></div>
                </form>
            </Modal>
        </div>
    );
};