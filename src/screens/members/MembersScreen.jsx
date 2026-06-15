import React, { useState, useCallback, useEffect } from 'react';
import {
    Users,
    UserPlus,
} from 'lucide-react';

import {
    INITIAL_MEMBERS,
    DEALER_ROLES,
    isAdminRole,
    PERMISSION_LABELS,
} from './data.js';
import { TabContent } from '../../components/common/TabContent.jsx';
import { PageTitle } from '../../components/common/PageTitle.jsx';

import { MembersErrorBoundary } from './components/members/MembersErrorBoundary.jsx';
import { ConfirmModal } from './components/members/SharedComponents.jsx';
import { InviteModal } from './components/members/InviteModal.jsx';
import { MemberCard } from './components/members/MemberCard.jsx';

const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(() =>
        typeof window !== 'undefined' ? window.matchMedia(query).matches : false
    );
    useEffect(() => {
        const mql = window.matchMedia(query);
        const handler = (e) => setMatches(e.matches);
        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
    }, [query]);
    return matches;
};

const MembersScreenContent = ({ theme }) => {
    const [original, setOriginal] = useState(INITIAL_MEMBERS);
    const [members, setMembers] = useState(INITIAL_MEMBERS);
    const [expandedId, setExpandedId] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [showInvite, setShowInvite] = useState(false);
    const isDesktop = useMediaQuery('(min-width: 1024px)');

    const toggle = useCallback((id) => setExpandedId(prev => prev === id ? null : id), []);

    const isUserDirty = useCallback((user) => {
        const orig = original.find(o => o.id === user.id);
        if (!orig) return true; // newly invited user
        return user.role !== orig.role || JSON.stringify(user.permissions) !== JSON.stringify(orig.permissions);
    }, [original]);

    const saveUser = useCallback((id) => {
        const user = members.find(m => m.id === id);
        if (!user) return;
        setOriginal(prev => {
            const exists = prev.find(o => o.id === id);
            return exists ? prev.map(o => o.id === id ? { ...user } : o) : [...prev, { ...user }];
        });
    }, [members]);

    const updateUser = useCallback((id, updater) => {
        setMembers(prev => prev.map(m => m.id === id ? (typeof updater === 'function' ? updater(m) : { ...m, ...updater }) : m));
    }, []);

    const onChangeRole = useCallback((id, role) => {
        updateUser(id, (m) => {
            if (isAdminRole(role)) {
                const allTrue = {};
                Object.keys(PERMISSION_LABELS).forEach(k => allTrue[k] = true);
                return { ...m, role, permissions: allTrue };
            }
            return { ...m, role };
        });
    }, [updateUser]);

    const onTogglePerm = useCallback((id, key) => {
        updateUser(id, (m) => {
            const next = { ...m.permissions, [key]: !m.permissions[key] };
            return { ...m, permissions: next };
        });
    }, [updateUser]);

    const requestDelete = useCallback((user) => {
        setConfirmDelete({ id: user.id, name: `${user.firstName} ${user.lastName}` });
    }, []);

    const executeDelete = useCallback(() => {
        if (!confirmDelete) return;
        setMembers(prev => prev.filter(m => m.id !== confirmDelete.id));
        setOriginal(prev => prev.filter(o => o.id !== confirmDelete.id));
        setExpandedId(prev => prev === confirmDelete.id ? null : prev);
        setConfirmDelete(null);
    }, [confirmDelete]);

    const handleInvite = useCallback((invitee) => {
        const newUser = {
            id: `user-${Date.now()}`,
            firstName: invitee.firstName,
            lastName: invitee.lastName,
            email: invitee.email,
            phone: invitee.phone || '',
            role: invitee.role,
            permissions: isAdminRole(invitee.role)
                ? Object.fromEntries(Object.keys(PERMISSION_LABELS).map(k => [k, true]))
                : Object.fromEntries(Object.keys(PERMISSION_LABELS).map(k => [k, false])),
        };
        setMembers(prev => [...prev, newUser]);
        setOriginal(prev => [...prev, { ...newUser }]);
    }, []);

    return (
        <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: theme.colors.background, color: theme.colors.textPrimary }}>
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="px-4 sm:px-6 lg:px-8 pb-24 lg:pb-12 max-w-content mx-auto w-full">

                    {/* Header */}
                    <PageTitle
                        title="Members"
                        subtitle={`${members.length} team members`}
                        theme={theme}
                        className="px-0 pt-4 pb-3"
                        titleClassName="text-[1.375rem]"
                        subtitleClassName="mt-0.5"
                    >
                        <button
                            onClick={() => setShowInvite(true)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[0.8125rem] font-semibold transition-all active:scale-95 shrink-0 mt-0.5"
                            style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText }}
                        >
                            <UserPlus className="w-3.5 h-3.5" />
                            Invite
                        </button>
                    </PageTitle>

                    {/* Team list */}
                    <TabContent activeKey="team" tabIndex={0}>
                        {members.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
                                {members.map(u => (
                                    <MemberCard
                                        key={u.id}
                                        theme={theme}
                                        user={u}
                                        expanded={expandedId === u.id}
                                        onToggle={() => toggle(u.id)}
                                        onChangeRole={(role) => onChangeRole(u.id, role)}
                                        onTogglePerm={(key) => onTogglePerm(u.id, key)}
                                        onRequestDelete={() => requestDelete(u)}
                                        isDesktop={isDesktop}
                                        isDirty={isUserDirty(u)}
                                        onSave={() => saveUser(u.id)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center" style={{ color: theme.colors.textSecondary }}>
                                <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                <p className="text-sm">No team members yet</p>
                            </div>
                        )}
                    </TabContent>

                </div>
            </div>

            <ConfirmModal
                open={!!confirmDelete}
                title="Remove team member"
                message={confirmDelete ? `${confirmDelete.name} will lose access to this app. This can't be undone.` : ''}
                confirmLabel="Remove"
                onConfirm={executeDelete}
                onCancel={() => setConfirmDelete(null)}
                theme={theme}
            />

            <InviteModal
                open={showInvite}
                onClose={() => setShowInvite(false)}
                onInvite={handleInvite}
                theme={theme}
                roles={DEALER_ROLES}
            />
        </div>
    );
};

export const MembersScreen = (props) => (
    <MembersErrorBoundary>
        <MembersScreenContent {...props} />
    </MembersErrorBoundary>
);
