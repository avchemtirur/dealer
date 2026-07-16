/* ============================================================
   H4 ERP COMPLETE PLATFORM - JAVASCRIPT IMPLEMENTATION
   ============================================================ */

/* ============================================================
   1. DATABASE STRUCTURE & INITIALIZATION
   ============================================================ */

const DB_KEYS = {
    USERS: 'h4_users',
    ADMINS: 'h4_admins',
    WALLETS: 'h4_wallets',
    REWARDS: 'h4_rewards',
    REWARD_RULES: 'h4_reward_rules',
    COUPON_RULES: 'h4_coupon_rules',
    ORDER_RULES: 'h4_order_rules',
    GIFT_INVENTORY: 'h4_gift_inventory',
    REDEMPTIONS: 'h4_redemptions',
    NOTIFICATIONS: 'h4_notifications',
    ORDERS: 'h4_orders',
    SCAN_HISTORY: 'h4_scan_history',
    SETTINGS: 'h4_settings',
    CURRENT_USER: 'h4_current_user',
    CURRENT_ADMIN: 'h4_current_admin'
};

const appState = {
    currentUser: null,
    currentAdmin: null,
    currentScreen: 'splash',
    isMobile: window.innerWidth <= 768
};

/* ============================================================
   2. INITIALIZATION FUNCTIONS
   ============================================================ */

function initializeApp() {
    // Initialize default data
    initializeDatabase();
    
    // Check for logged-in user
    const savedUser = localStorage.getItem(DB_KEYS.CURRENT_USER);
    if (savedUser) {
        appState.currentUser = JSON.parse(savedUser);
        showDealerDashboard();
    } else {
        showSplashScreen();
    }

    // Setup event listeners
    setupEventListeners();
}

function initializeDatabase() {
    // Initialize admin if not exists
    if (!localStorage.getItem(DB_KEYS.ADMINS)) {
        const admin = {
            id: 'admin_001',
            username: 'admin@h4.com',
            password: 'admin123',
            role: 'super_admin'
        };
        localStorage.setItem(DB_KEYS.ADMINS, JSON.stringify([admin]));
    }

    // Initialize settings
    if (!localStorage.getItem(DB_KEYS.SETTINGS)) {
        const settings = {
            companyName: 'AV CHEM Chemical & Manufacturing',
            companyMobile: '+91 9895123456',
            companyWhatsApp: '+91 9895123456',
            registrationApproval: 'manual', // auto or manual
            theme: 'light'
        };
        localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(settings));
    }

    // Initialize sample rewards
    if (!localStorage.getItem(DB_KEYS.REWARDS)) {
        const rewards = [
            {
                id: 'reward_001',
                name: 'Welcome Bonus',
                type: 'points',
                value: 100,
                description: 'Welcome to H4 Network',
                status: 'active'
            },
            {
                id: 'reward_002',
                name: 'Premium T-Shirt',
                type: 'gift',
                value: 250,
                description: 'H4 Brand Premium T-Shirt',
                status: 'active'
            },
            {
                id: 'reward_003',
                name: 'Cashback Offer',
                type: 'cashback',
                value: 500,
                description: '₹500 Cashback',
                status: 'active'
            }
        ];
        localStorage.setItem(DB_KEYS.REWARDS, JSON.stringify(rewards));
    }

    // Initialize gift inventory
    if (!localStorage.getItem(DB_KEYS.GIFT_INVENTORY)) {
        const gifts = [
            {
                id: 'gift_001',
                name: 'H4 T-Shirt',
                category: 'apparel',
                stock: 100,
                image: '👕',
                description: 'Premium H4 Branded T-Shirt',
                eligibility: 'points_250',
                minPurchase: 5
            },
            {
                id: 'gift_002',
                name: 'H4 Cap',
                category: 'apparel',
                stock: 150,
                image: '🧢',
                description: 'H4 Branded Cap',
                eligibility: 'points_150',
                minPurchase: 3
            },
            {
                id: 'gift_003',
                name: 'Tool Kit',
                category: 'tools',
                stock: 50,
                image: '🔧',
                description: 'Professional Tool Kit',
                eligibility: 'points_500',
                minPurchase: 10
            }
        ];
        localStorage.setItem(DB_KEYS.GIFT_INVENTORY, JSON.stringify(gifts));
    }
}

/* ============================================================
   3. SCREEN NAVIGATION
   ============================================================ */

function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    // Show selected screen
    document.getElementById(screenId).classList.add('active');
    appState.currentScreen = screenId;

    // Scroll to top
    setTimeout(() => window.scrollTo(0, 0), 10);
}

function showSplashScreen() { showScreen('splashScreen'); }
function showDealerRegistration() { showScreen('registrationScreen'); }
function showDealerLogin() { showScreen('dealerLoginScreen'); }
function showAdminLogin() { showScreen('adminLoginScreen'); }
function showDealerDashboard() { showScreen('dealerDashboard'); populateDealerDashboard(); }
function showAdminDashboard() { showScreen('adminDashboard'); populateAdminDashboard(); }
function showPendingApproval() { showScreen('pendingApprovalScreen'); }
function showScanner() { showScreen('scannerScreen'); }
function showRedeem() { showScreen('redeemScreen'); populateGiftGallery(); }

/* ============================================================
   4. USER REGISTRATION
   ============================================================ */

function setupRegistrationForm() {
    const form = document.getElementById('dealerRegistrationForm');
    
    // Step navigation
    document.getElementById('regNextStep1').addEventListener('click', () => {
        if (validateRegistrationStep(1)) {
            saveRegistrationStep(1);
            switchRegistrationStep(2);
        }
    });

    document.getElementById('regNextStep2').addEventListener('click', () => {
        if (validateRegistrationStep(2)) {
            saveRegistrationStep(2);
            switchRegistrationStep(3);
        }
    });

    document.getElementById('regBackStep2').addEventListener('click', () => switchRegistrationStep(1));
    document.getElementById('regBackStep3').addEventListener('click', () => switchRegistrationStep(2));

    // Password strength
    document.querySelectorAll('.registration-form .password-input-wrapper input').forEach(input => {
        input.addEventListener('input', function() {
            if (this.id === 'regPassword') {
                updatePasswordStrength(this.value, this.closest('.password-input-wrapper').nextElementSibling);
            }
        });
    });

    // Password toggle
    document.querySelectorAll('.registration-form .password-toggle').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            const input = btn.previousElementSibling;
            input.type = input.type === 'password' ? 'text' : 'password';
        });
    });

    // Form submit
    form.addEventListener('submit', handleRegistrationSubmit);
}

function validateRegistrationStep(step) {
    const errors = {};

    if (step === 1) {
        const name = document.getElementById('dealerName').value.trim();
        const mobile = document.getElementById('dealerMobile').value.trim();

        if (!name) errors.dealerName = 'Name is required';
        if (!mobile) errors.dealerMobile = 'Mobile is required';
        else if (!/^[6-9]\d{9}$/.test(mobile)) errors.dealerMobile = 'Invalid mobile number';

        const email = document.getElementById('dealerEmail').value.trim();
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.dealerEmail = 'Invalid email';
    }

    if (step === 2) {
        const company = document.getElementById('companyName').value.trim();
        const business = document.getElementById('businessType').value;
        const district = document.getElementById('dealerDistrict').value;

        if (!company) errors.companyName = 'Company name is required';
        if (!business) errors.businessType = 'Business type is required';
        if (!district) errors.dealerDistrict = 'District is required';
    }

    if (step === 3) {
        const username = document.getElementById('regUsername').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirm = document.getElementById('regConfirmPassword').value;
        const terms = document.getElementById('regTerms').checked;

        if (!username) errors.regUsername = 'Username is required';
        if (!password) errors.regPassword = 'Password is required';
        else if (password.length < 6) errors.regPassword = 'Password too short';
        if (password !== confirm) errors.regConfirmPassword = 'Passwords do not match';
        if (!terms) errors.regTerms = 'Accept terms to continue';
    }

    displayErrors(errors);
    return Object.keys(errors).length === 0;
}

function saveRegistrationStep(step) {
    if (step === 1) {
        appState.registrationData = appState.registrationData || {};
        appState.registrationData.name = document.getElementById('dealerName').value;
        appState.registrationData.mobile = document.getElementById('dealerMobile').value;
        appState.registrationData.whatsapp = document.getElementById('dealerWhatsApp').value;
        appState.registrationData.email = document.getElementById('dealerEmail').value;
    } else if (step === 2) {
        appState.registrationData.company = document.getElementById('companyName').value;
        appState.registrationData.businessType = document.getElementById('businessType').value;
        appState.registrationData.gst = document.getElementById('gstNumber').value;
        appState.registrationData.district = document.getElementById('dealerDistrict').value;
    }
}

function switchRegistrationStep(step) {
    // Hide all steps
    for (let i = 1; i <= 3; i++) {
        document.getElementById(`regStep${i}`).classList.remove('active');
    }
    // Show selected step
    document.getElementById(`regStep${step}`).classList.add('active');
}

function handleRegistrationSubmit(e) {
    e.preventDefault();

    if (!validateRegistrationStep(3)) return;

    saveRegistrationStep(3);

    // Create user
    const userData = {
        id: 'dealer_' + Date.now(),
        ...appState.registrationData,
        username: document.getElementById('regUsername').value,
        password: document.getElementById('regPassword').value,
        status: 'pending',
        registeredAt: new Date().toISOString(),
        approvedAt: null
    };

    // Save user
    const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
    users.push(userData);
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));

    // Create wallet
    const wallet = {
        userId: userData.id,
        points: 0,
        cashback: 0,
        gifts: []
    };
    const wallets = JSON.parse(localStorage.getItem(DB_KEYS.WALLETS) || '[]');
    wallets.push(wallet);
    localStorage.setItem(DB_KEYS.WALLETS, JSON.stringify(wallets));

    showSnackbar('Registration successful! Awaiting approval.');
    
    setTimeout(() => {
        appState.currentUser = userData;
        localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(userData));
        showPendingApproval();
    }, 1500);
}

/* ============================================================
   5. USER LOGIN
   ============================================================ */

function setupLoginForms() {
    // Dealer login
    document.getElementById('dealerLoginForm').addEventListener('submit', e => {
        e.preventDefault();
        const username = document.getElementById('dealerLoginUsername').value;
        const password = document.getElementById('dealerLoginPassword').value;

        const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
        const user = users.find(u => u.username === username && u.password === password);

        if (!user) {
            showSnackbar('Invalid credentials', 'error');
            return;
        }

        if (user.status === 'pending') {
            appState.currentUser = user;
            localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(user));
            showPendingApproval();
            return;
        }

        if (user.status === 'rejected' || user.status === 'suspended') {
            showSnackbar('Your account is ' + user.status, 'error');
            return;
        }

        appState.currentUser = user;
        localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(user));
        showSnackbar('Welcome ' + user.name);
        showDealerDashboard();
    });

    // Admin login
    document.getElementById('adminLoginForm').addEventListener('submit', e => {
        e.preventDefault();
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;

        const admins = JSON.parse(localStorage.getItem(DB_KEYS.ADMINS) || '[]');
        const admin = admins.find(a => a.username === username && a.password === password);

        if (!admin) {
            showSnackbar('Invalid admin credentials', 'error');
            return;
        }

        appState.currentAdmin = admin;
        localStorage.setItem(DB_KEYS.CURRENT_ADMIN, JSON.stringify(admin));
        showAdminDashboard();
    });

    // Password toggle
    document.querySelectorAll('.login-form .password-toggle').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            const input = btn.previousElementSibling;
            input.type = input.type === 'password' ? 'text' : 'password';
        });
    });
}

/* ============================================================
   6. DEALER DASHBOARD
   ============================================================ */

function populateDealerDashboard() {
    if (!appState.currentUser) return;

    const user = appState.currentUser;
    
    // Header
    document.getElementById('dealerDashName').textContent = user.name;
    document.getElementById('dealerDashType').textContent = user.businessType;
    document.getElementById('dealerAvatar').textContent = user.name.charAt(0).toUpperCase();

    // Stats
    const scanHistory = JSON.parse(localStorage.getItem(DB_KEYS.SCAN_HISTORY) || '[]');
    const userScans = scanHistory.filter(s => s.userId === user.id);
    document.getElementById('statCoupons').textContent = userScans.length;

    const wallet = getWallet(user.id);
    const totalRewards = (wallet.points * 0.5) + wallet.cashback;
    document.getElementById('statRewards').textContent = '₹' + Math.floor(totalRewards);

    // Wallet
    document.getElementById('pointsBalance').textContent = wallet.points;
    document.getElementById('cashbackBalance').textContent = '₹' + wallet.cashback;

    // Transactions
    populateTransactionHistory();

    // Orders
    populateOrderHistory();

    // Rewards
    populateRewardsList();

    // Notifications
    populateNotificationsList();

    // Tab navigation
    setupTabNavigation();
}

function getWallet(userId) {
    const wallets = JSON.parse(localStorage.getItem(DB_KEYS.WALLETS) || '[]');
    const wallet = wallets.find(w => w.userId === userId);
    return wallet || { points: 0, cashback: 0, gifts: [] };
}

function populateTransactionHistory() {
    const container = document.getElementById('transactionHistory');
    const notifications = JSON.parse(localStorage.getItem(DB_KEYS.NOTIFICATIONS) || '[]');
    const userNotifications = notifications.filter(n => n.userId === appState.currentUser.id).slice(-5);

    if (userNotifications.length === 0) {
        container.innerHTML = '<p class="text-muted">No transactions yet</p>';
        return;
    }

    container.innerHTML = userNotifications.map(n => `
        <div class="transaction-item">
            <div>
                <div class="transaction-type">${n.type}</div>
                <div class="transaction-date">${new Date(n.date).toLocaleDateString()}</div>
            </div>
            <div class="transaction-amount">+${n.amount}</div>
        </div>
    `).join('');
}

function populateOrderHistory() {
    const container = document.getElementById('orderHistory');
    const orders = JSON.parse(localStorage.getItem(DB_KEYS.ORDERS) || '[]');
    const userOrders = orders.filter(o => o.userId === appState.currentUser.id);

    if (userOrders.length === 0) {
        container.innerHTML = '<p class="text-muted">No orders yet</p>';
        return;
    }

    container.innerHTML = userOrders.map(o => `
        <div class="order-item">
            <div class="order-header">
                <div>
                    <div class="order-id">Order #${o.id}</div>
                    <p style="font-size: 12px; margin: 4px 0 0; color: var(--on-surface-variant);">${new Date(o.date).toLocaleDateString()}</p>
                </div>
                <span class="order-status ${o.status}">${o.status}</span>
            </div>
            <div class="order-details">
                <div><strong>Bags:</strong> ${o.bags}</div>
                <div><strong>Amount:</strong> ₹${o.amount}</div>
                <div><strong>Product:</strong> ${o.product}</div>
                <div><strong>Location:</strong> ${o.location}</div>
            </div>
        </div>
    `).join('');
}

function populateRewardsList() {
    const container = document.getElementById('rewardsList');
    const rewards = JSON.parse(localStorage.getItem(DB_KEYS.REWARDS) || '[]');

    container.innerHTML = rewards.map(r => `
        <div class="reward-card" onclick="showRewardDetails('${r.id}')">
            <div class="reward-icon">${getRewardIcon(r.type)}</div>
            <div class="reward-name">${r.name}</div>
            <div class="reward-value">${r.type === 'points' ? r.value + ' pts' : '₹' + r.value}</div>
        </div>
    `).join('');
}

function populateNotificationsList() {
    const container = document.getElementById('notificationsList');
    const notifications = JSON.parse(localStorage.getItem(DB_KEYS.NOTIFICATIONS) || '[]');
    const userNotifications = notifications.filter(n => n.userId === appState.currentUser.id).slice(-10);

    if (userNotifications.length === 0) {
        container.innerHTML = '<p class="text-muted">No notifications</p>';
        return;
    }

    container.innerHTML = userNotifications.map(n => `
        <div class="notification-item">
            <div class="notification-title">${n.title}</div>
            <div class="notification-time">${new Date(n.date).toLocaleDateString()}</div>
        </div>
    `).join('');
}

function setupTabNavigation() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            
            // Remove active from all
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            
            // Add active to clicked
            btn.classList.add('active');
            document.getElementById(tabName + 'Tab').classList.add('active');
        });
    });
}

/* ============================================================
   7. ADMIN DASHBOARD
   ============================================================ */

function populateAdminDashboard() {
    // Pending dealers
    const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
    const pendingDealers = users.filter(u => u.status === 'pending');
    
    document.getElementById('pendingDealers').innerHTML = pendingDealers.length === 0 
        ? '<p class="text-muted">No pending approvals</p>'
        : pendingDealers.map(u => `
            <div class="dealer-item">
                <div class="dealer-info">
                    <h4>${u.name}</h4>
                    <p>${u.businessType} • ${u.district}</p>
                    <p>${u.mobile}</p>
                </div>
                <div class="dealer-actions">
                    <button class="btn btn-primary btn-small" onclick="approveDealerRegistration('${u.id}')">Approve</button>
                    <button class="btn btn-error btn-small" onclick="rejectDealerRegistration('${u.id}')">Reject</button>
                </div>
            </div>
        `).join('');

    // Active dealers
    const activeDealers = users.filter(u => u.status === 'active');
    document.getElementById('activeDealers').innerHTML = activeDealers.length === 0
        ? '<p class="text-muted">No active dealers</p>'
        : activeDealers.map(u => `
            <div class="dealer-item">
                <div class="dealer-info">
                    <h4>${u.name}</h4>
                    <p>${u.businessType} • ${u.district}</p>
                    <p>${u.mobile}</p>
                </div>
                <div class="dealer-actions">
                    <button class="btn btn-secondary btn-small" onclick="suspendDealer('${u.id}')">Suspend</button>
                </div>
            </div>
        `).join('');

    // Reports
    document.getElementById('reportTotalDealers').textContent = activeDealers.length + ' active dealers';
    const rewards = JSON.parse(localStorage.getItem(DB_KEYS.REWARDS) || '[]');
    document.getElementById('reportTotalRewards').textContent = rewards.length + ' rewards available';
    const scanHistory = JSON.parse(localStorage.getItem(DB_KEYS.SCAN_HISTORY) || '[]');
    document.getElementById('reportTotalScans').textContent = scanHistory.length + ' total scans';

    // Setup admin tabs
    setupAdminTabs();
}

function setupAdminTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById('admin' + capitalizeFirst(tabName) + 'Tab').classList.add('active');
        });
    });
}

function approveDealerRegistration(userId) {
    const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
    const user = users.find(u => u.id === userId);
    
    if (user) {
        user.status = 'active';
        user.approvedAt = new Date().toISOString();
        localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
        
        // Create notification
        addNotification(userId, 'Account Approved', 'Your dealer account has been approved. Welcome to H4 Network!');
        
        showSnackbar('Dealer approved successfully');
        populateAdminDashboard();
    }
}

function rejectDealerRegistration(userId) {
    const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
    const user = users.find(u => u.id === userId);
    
    if (user) {
        user.status = 'rejected';
        localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
        
        addNotification(userId, 'Registration Rejected', 'Your registration could not be approved. Please contact admin.');
        
        showSnackbar('Dealer registration rejected');
        populateAdminDashboard();
    }
}

function suspendDealer(userId) {
    const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
    const user = users.find(u => u.id === userId);
    
    if (user && confirm('Suspend this dealer?')) {
        user.status = 'suspended';
        localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
        
        addNotification(userId, 'Account Suspended', 'Your account has been suspended. Contact admin for details.');
        
        showSnackbar('Dealer suspended');
        populateAdminDashboard();
    }
}

/* ============================================================
   8. COUPON SCANNER & VALIDATION
   ============================================================ */

function setupScannerScreen() {
    document.getElementById('scanCouponBtn').addEventListener('click', showScanner);
    document.getElementById('closeScannerBtn').addEventListener('click', showDealerDashboard);

    document.getElementById('couponCodeInput').addEventListener('keypress', e => {
        if (e.key === 'Enter') {
            validateCoupon(e.target.value);
            e.target.value = '';
        }
    });
}

function validateCoupon(code) {
    const result = document.getElementById('scanResult');
    
    // Simulate coupon validation
    const isValid = Math.random() > 0.3; // 70% success rate
    
    if (isValid) {
        const points = Math.floor(Math.random() * 100) + 50;
        
        result.innerHTML = `
            <div style="text-align: center; color: var(--success);">
                <div style="font-size: 48px; margin-bottom: 16px;">✓</div>
                <h3>Coupon Valid!</h3>
                <p>Coupon: ${code}</p>
                <p style="font-size: 24px; font-weight: 700; color: var(--primary); margin: 12px 0;">+${points} Points Earned</p>
                <button class="btn btn-primary" onclick="claimReward(${points})">Claim Reward</button>
            </div>
        `;
        
        // Add to scan history
        addScanHistory(appState.currentUser.id, code, true, points);
        
        // Update wallet
        addPointsToWallet(appState.currentUser.id, points);
        
    } else {
        result.innerHTML = `
            <div style="text-align: center; color: var(--error);">
                <div style="font-size: 48px; margin-bottom: 16px;">✕</div>
                <h3>Invalid Coupon</h3>
                <p>Coupon: ${code}</p>
                <p>This coupon is invalid or already used.</p>
            </div>
        `;
        
        addScanHistory(appState.currentUser.id, code, false, 0);
    }
    
    result.style.display = 'block';
    
    showSnackbar(isValid ? 'Coupon scanned successfully' : 'Invalid coupon');
}

function addPointsToWallet(userId, points) {
    const wallets = JSON.parse(localStorage.getItem(DB_KEYS.WALLETS) || '[]');
    const wallet = wallets.find(w => w.userId === userId);
    
    if (wallet) {
        wallet.points += points;
        localStorage.setItem(DB_KEYS.WALLETS, JSON.stringify(wallets));
    }
}

function addScanHistory(userId, couponCode, isValid, points) {
    const history = JSON.parse(localStorage.getItem(DB_KEYS.SCAN_HISTORY) || '[]');
    history.push({
        id: 'scan_' + Date.now(),
        userId: userId,
        couponCode: couponCode,
        isValid: isValid,
        pointsEarned: points,
        scannedAt: new Date().toISOString()
    });
    localStorage.setItem(DB_KEYS.SCAN_HISTORY, JSON.stringify(history));
}

/* ============================================================
   9. REWARD REDEMPTION & GIFTS
   ============================================================ */

function populateGiftGallery() {
    const container = document.getElementById('giftGallery');
    const gifts = JSON.parse(localStorage.getItem(DB_KEYS.GIFT_INVENTORY) || '[]');

    container.innerHTML = gifts.map(g => `
        <div class="gift-card" onclick="showGiftDetails('${g.id}')">
            <div class="gift-image">${g.image}</div>
            <div class="gift-info">
                <div class="gift-name">${g.name}</div>
                <div class="gift-status">Stock: ${g.stock}</div>
            </div>
        </div>
    `).join('');
}

function showGiftDetails(giftId) {
    const gifts = JSON.parse(localStorage.getItem(DB_KEYS.GIFT_INVENTORY) || '[]');
    const gift = gifts.find(g => g.id === giftId);

    if (!gift) return;

    const detailsDiv = document.getElementById('giftDetails');
    detailsDiv.innerHTML = `
        <button class="close-btn" onclick="this.parentElement.style.display='none'">×</button>
        <div style="text-align: center;">
            <div style="font-size: 80px; margin-bottom: 16px;">${gift.image}</div>
            <h2>${gift.name}</h2>
            <p>${gift.description}</p>
            <p style="color: var(--on-surface-variant); margin-bottom: 16px;">
                Minimum Order: ${gift.minPurchase} bags
            </p>
            <button class="btn btn-primary btn-large" onclick="redeemGift('${gift.id}')">Redeem Now</button>
        </div>
    `;
    detailsDiv.style.display = 'block';
}

function redeemGift(giftId) {
    const wallet = getWallet(appState.currentUser.id);
    const gifts = JSON.parse(localStorage.getItem(DB_KEYS.GIFT_INVENTORY) || '[]');
    const gift = gifts.find(g => g.id === giftId);

    if (!gift) return;

    if (wallet.points < 100) {
        showSnackbar('Insufficient points', 'error');
        return;
    }

    if (gift.stock <= 0) {
        showSnackbar('Out of stock', 'error');
        return;
    }

    // Create redemption
    const redemptions = JSON.parse(localStorage.getItem(DB_KEYS.REDEMPTIONS) || '[]');
    redemptions.push({
        id: 'redemption_' + Date.now(),
        userId: appState.currentUser.id,
        giftId: giftId,
        status: 'approved',
        approvedAt: new Date().toISOString()
    });
    localStorage.setItem(DB_KEYS.REDEMPTIONS, JSON.stringify(redemptions));

    // Update inventory
    gift.stock -= 1;
    localStorage.setItem(DB_KEYS.GIFT_INVENTORY, JSON.stringify(gifts));

    addNotification(appState.currentUser.id, 'Gift Approved', `Your gift ${gift.name} has been approved. It will be delivered soon.`);

    showSnackbar('Gift redeemed successfully');
    document.getElementById('giftDetails').style.display = 'none';
}

/* ============================================================
   10. NOTIFICATIONS & UTILITIES
   ============================================================ */

function addNotification(userId, title, message) {
    const notifications = JSON.parse(localStorage.getItem(DB_KEYS.NOTIFICATIONS) || '[]');
    notifications.push({
        id: 'notif_' + Date.now(),
        userId: userId,
        title: title,
        message: message,
        type: 'general',
        date: new Date().toISOString(),
        read: false
    });
    localStorage.setItem(DB_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
}

function showSnackbar(message, type = 'success') {
    const snackbar = document.getElementById('snackbar');
    snackbar.textContent = message;
    snackbar.className = `snackbar show ${type}`;
    
    setTimeout(() => {
        snackbar.classList.remove('show');
    }, 3000);
}

function displayErrors(errors) {
    document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
    
    for (const [key, message] of Object.entries(errors)) {
        const element = document.querySelector(`[id="${key}"]`);
        if (element && element.nextElementSibling && element.nextElementSibling.classList.contains('form-error')) {
            element.nextElementSibling.textContent = message;
        }
    }
}

function updatePasswordStrength(password, container) {
    const strength = getPasswordStrength(password);
    const fill = container.querySelector('.strength-fill');
    const text = container.querySelector('.strength-text');
    
    const percentage = (strength / 6) * 100;
    fill.style.width = percentage + '%';
    
    const labels = ['None', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
    text.textContent = 'Strength: ' + labels[strength];
}

function getPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
}

function getRewardIcon(type) {
    const icons = {
        'points': '⭐',
        'cashback': '💵',
        'gift': '🎁',
        'discount': '🏷️'
    };
    return icons[type] || '🎯';
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function claimReward(points) {
    showSnackbar(`${points} points added to your wallet`);
    showDealerDashboard();
}

function logout() {
    localStorage.removeItem(DB_KEYS.CURRENT_USER);
    localStorage.removeItem(DB_KEYS.CURRENT_ADMIN);
    appState.currentUser = null;
    appState.currentAdmin = null;
    showSplashScreen();
    showSnackbar('Logged out successfully');
}

/* ============================================================
   11. EVENT LISTENERS & INITIALIZATION
   ========================================================== */

function setupEventListeners() {
    // Splash screen
    document.getElementById('btnDealerLogin').addEventListener('click', showDealerLogin);
    document.getElementById('btnDealerRegister').addEventListener('click', showDealerRegistration);
    document.getElementById('btnAdminLogin').addEventListener('click', showAdminLogin);

    // Navigation
    document.getElementById('goToRegFromLogin').addEventListener('click', e => {
        e.preventDefault();
        showDealerRegistration();
    });

    // Dealer actions
    document.getElementById('redeemRewardBtn').addEventListener('click', showRedeem);

    // Logout buttons
    document.querySelectorAll('#logoutBtn, #logoutFromPending').forEach(btn => {
        btn.addEventListener('click', logout);
    });

    // Setup forms
    setupRegistrationForm();
    setupLoginForms();
    setupScannerScreen();

    // Sidebar
    document.getElementById('navMenuBtn').addEventListener('click', () => {
        document.getElementById('sidebar').classList.add('active');
        document.getElementById('sidebarOverlay').classList.add('active');
    });

    document.getElementById('closeSidebarBtn').addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('active');
    });

    document.getElementById('sidebarOverlay').addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('active');
        document.getElementById('sidebarOverlay').classList.remove('active');
    });
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);