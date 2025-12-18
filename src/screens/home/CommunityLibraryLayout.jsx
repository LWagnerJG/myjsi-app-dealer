import React, { useRef, useState, useCallback } from 'react';
import { LibraryGrid } from '../library/LibraryGrid.jsx';
import { CommunityScreen } from '../community/CommunityScreen.jsx';
import StandardSearchBar from '../../components/common/StandardSearchBar.jsx';
import { TabToggle } from '../../design-system/SegmentedToggle.jsx';
import { ScreenLayout } from '../../design-system/ScreenLayout.jsx';

export const CommunityLibraryLayout = ({
  theme,
  posts, polls, likedPosts, pollChoices,
  onToggleLike, onPollVote, onAddComment, openCreateContentModal,
}) => {
  const [activeTab, setActiveTab] = useState('community');
  const [query, setQuery] = useState('');
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const switchTab = useCallback((tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
  }, [activeTab]);
  
  // Toggle options
  const tabOptions = [
    { key: 'community', label: 'Community' },
    { key: 'library', label: 'Library' },
  ];

  // Animation helper styles
  const paneTransition = prefersReducedMotion ? 'none' : 'opacity 240ms ease, transform 240ms ease';

  // Header content - will be passed to ScreenLayout
  const header = (
    <div className="py-3 space-y-3">
      {/* Segmented toggle + Post CTA */}
      <div className="flex gap-3 items-center">
        {/* JSI Unified Toggle */}
        <div className="flex-grow max-w-xs">
          <TabToggle
            options={tabOptions}
            value={activeTab}
            onChange={switchTab}
            theme={theme}
            size="md"
          />
        </div>
        <button 
          onClick={openCreateContentModal} 
          className="h-11 inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-sm px-5" 
          style={{ backgroundColor: theme.colors.accent, color:'#fff', boxShadow:'0 4px 14px rgba(0,0,0,0.08)' }}
        >
          + Post
        </button>
      </div>
      {/* Search bar */}
      <StandardSearchBar
        id="community-main-search"
        value={query}
        onChange={setQuery}
        placeholder={activeTab === 'community' ? 'Search posts, people, tags...' : 'Search library'}
        theme={{...theme, colors:{...theme.colors, surface:'#ffffff'}}}
      />
    </div>
  );

  return (
    <ScreenLayout
      theme={theme}
      header={header}
      maxWidth="default"
      padding={true}
      paddingBottom="8rem"
      gap="0"
    >
      {/* Active pane with animation */}
      <div style={{ position: 'relative' }}>
        {/* Community Pane */}
        <div style={ activeTab === 'community' ? {
            position: 'relative',
            opacity: 1,
            transform: 'translateX(0)',
            transition: paneTransition,
            pointerEvents: 'auto'
          } : {
            position: 'absolute', inset: 0,
            opacity: 0,
            transform: 'translateX(12px)',
            transition: paneTransition,
            pointerEvents: 'none'
          }}>
          <CommunityScreen
            theme={theme}
            posts={posts}
            polls={polls}
            likedPosts={likedPosts}
            pollChoices={pollChoices}
            onToggleLike={onToggleLike}
            onPollVote={onPollVote}
            onAddComment={onAddComment}
            openCreateContentModal={openCreateContentModal}
            embedMode
            externalQuery={query}
          />
        </div>
        {/* Library Pane */}
        <div style={ activeTab === 'library' ? {
            position: 'relative',
            opacity: 1,
            transform: 'translateX(0)',
            transition: paneTransition,
            pointerEvents: 'auto'
          } : {
            position: 'absolute', inset: 0,
            opacity: 0,
            transform: 'translateX(-12px)',
            transition: paneTransition,
            pointerEvents: 'none'
          }}>
          <LibraryGrid theme={theme} query={query} onQueryChange={setQuery} />
        </div>
      </div>
    </ScreenLayout>
  );
};

export default CommunityLibraryLayout;
