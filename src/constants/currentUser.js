// The signed-in dealer user. In a dealer org, rewards are earned by the
// dealer's own staff: salespeople earn 3% and designers earn 1% of the
// order's net on claimed orders.
export const REWARD_RATE_BY_ROLE = {
    'dealer-salesperson': 0.03,
    'dealer-designer': 0.01,
};

export const CURRENT_USER = {
    name: 'Luke Wagner',
    dealerNumber: 'DLR-4827',
    role: 'dealer-salesperson',
    roleLabel: 'Dealer Salesperson',
    rewardRate: REWARD_RATE_BY_ROLE['dealer-salesperson'],
};

// Whether this dealer is a "choice" dealer. Choice dealers carry annual sales
// goals (overall and by vertical); standard dealers only see where they are and
// how they are tracking, without goal targets.
export const IS_CHOICE_DEALER = false;
