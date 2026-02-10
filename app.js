/**
 * Power BI Dashboard Hub - Main Application
 * Single Page Application for seamless dashboard navigation
 */

// ============================================
// URL Decryption (double-Base64 with reversal)
// ============================================
function _d(e) {
    return atob(atob(e).split('').reverse().join(''));
}

// ============================================
// DevTools Detection
// ============================================
(function () {
    const threshold = 160;
    let devtoolsWarned = false;

    function showDevToolsWarning() {
        if (devtoolsWarned) return;
        devtoolsWarned = true;
        const overlay = document.createElement('div');
        overlay.id = 'devtools-warning';
        overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.92);display:flex;align-items:center;justify-content:center;flex-direction:column;color:white;font-family:Segoe UI,sans-serif;';
        overlay.innerHTML = '<div style="font-size:3rem;margin-bottom:1rem">🔒</div><div style="font-size:1.5rem;font-weight:600;margin-bottom:0.5rem">Access Restricted</div><p style="color:rgba(255,255,255,0.7);max-width:400px;text-align:center">Developer tools are not permitted on this application. Please close DevTools to continue.</p>';
        document.body.appendChild(overlay);
    }

    function hideDevToolsWarning() {
        const overlay = document.getElementById('devtools-warning');
        if (overlay) overlay.remove();
        devtoolsWarned = false;
    }

    function checkDevTools() {
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;
        if (widthThreshold || heightThreshold) {
            showDevToolsWarning();
        } else if (devtoolsWarned) {
            hideDevToolsWarning();
        }
    }

    setInterval(checkDevTools, 1000);

    // Disable right-click context menu
    document.addEventListener('contextmenu', e => e.preventDefault());

    // Disable common DevTools shortcuts
    document.addEventListener('keydown', e => {
        if (e.key === 'F12') e.preventDefault();
        if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) e.preventDefault();
        if (e.ctrlKey && e.key === 'u') e.preventDefault();
    });
})();
class DashboardHub {
    constructor() {
        // State
        this.currentCategory = null;
        this.currentDashboard = null;
        this.expandedCategories = new Set();
        this.sidebarCloseTimeout = null;
        this.loadedDashboards = new Map(); // Store iframes by dashboard ID
        this.expandedGroups = new Set(); // Track expanded group IDs

        // DOM Elements
        this.homepage = document.getElementById('homepage');
        this.dashboardView = document.getElementById('dashboard-view');
        this.dashboardContainer = document.getElementById('dashboard-container');


        this.sidebar = document.getElementById('sidebar');
        this.categoriesContainer = document.getElementById('categories');
        this.sidebarContent = document.getElementById('sidebar-content');
        this.sidebarHomeTrigger = document.getElementById('sidebar-home-trigger');
        this.fullscreenBtn = document.getElementById('fullscreen-btn');

        // Annotation elements
        this.annotationCanvas = document.getElementById('annotation-canvas');
        this.annotationCtx = this.annotationCanvas.getContext('2d');
        this.penToggle = document.getElementById('pen-toggle');
        this.eraserBtn = document.getElementById('eraser-btn');
        this.clearBtn = document.getElementById('clear-btn');
        this.colorSwatches = document.querySelectorAll('.color-swatch');

        // Annotation state
        this.isDrawing = false;
        this.isPenActive = false;
        this.isEraserMode = false;
        this.penColor = '#FF0000';
        this.penWidth = 3;
        this.eraserWidth = 20;

        // Comment panel elements
        this.commentPanel = document.getElementById('comment-panel');
        this.commentContent = document.getElementById('comment-content');
        this.commentList = document.getElementById('comment-list');
        this.commentEmpty = document.getElementById('comment-empty');
        this.commentForm = document.getElementById('comment-form');
        this.commentInput = document.getElementById('comment-input');
        this.commentBadge = document.getElementById('comment-badge');

        // Comment state
        this.comments = {}; // Store comments per dashboard
        this.isCommentPanelExpanded = false;

        // Initialize
        this.init();
    }

    init() {
        this.renderCategories();
        this.renderSidebar();
        this.bindEvents();
        this.restoreState();
        this.setupCanvas();
        this.bindAnnotationEvents();
        // this.loadAllComments(); // Removed to prevent double loading and blocking in constructor
        this.bindCommentEvents();
    }

    // ============================================
    // Role-Based Access Control
    // ============================================

    // Fetch roles from Google Sheets (cached)
    async fetchSheetRoles() {
        const now = Date.now();

        // Return cached roles if still valid
        if (SHEET_ROLES && (now - ROLES_FETCH_TIME) < ROLES_CACHE_DURATION) {
            return SHEET_ROLES;
        }

        try {
            const response = await fetch(ROLES_SHEET_URL);
            if (!response.ok) throw new Error('Failed to fetch');

            const csv = await response.text();
            const roles = this.parseCSVToRoles(csv);

            // Cache the results
            SHEET_ROLES = roles;
            ROLES_FETCH_TIME = now;

            return roles;
        } catch (error) {
            // Fallback to encoded roles
            return FALLBACK_ROLES;
        }
    }

    // ============================================
    // Dashboard URL Fetching (from Google Sheet)
    // ============================================
    async fetchDashboardUrls() {
        const now = Date.now();

        // Return cached URLs if still valid
        if (SHEET_URLS && (now - URLS_FETCH_TIME) < URLS_CACHE_DURATION) {
            return SHEET_URLS;
        }

        try {
            const response = await fetch(URLS_SHEET_URL);
            if (!response.ok) throw new Error('Failed to fetch URLs');

            const csv = await response.text();
            const urls = this.parseCSVToUrls(csv);

            // Cache the results
            SHEET_URLS = urls;
            URLS_FETCH_TIME = now;

            return urls;
        } catch (error) {
            console.warn('URL sheet unavailable, using fallback');
            return null;
        }
    }

    // Parse CSV to { dashboard_id: embed_url } map
    parseCSVToUrls(csv) {
        const urls = {};
        const lines = csv.split('\n');

        // Skip header row
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Split on first comma only (URL may contain commas in query params)
            const firstComma = line.indexOf(',');
            if (firstComma === -1) continue;

            const id = line.substring(0, firstComma).replace(/"/g, '').trim();
            const url = line.substring(firstComma + 1).replace(/"/g, '').trim();

            if (id && url) {
                urls[id] = url;
            }
        }

        return urls;
    }

    // Parse CSV to roles object
    parseCSVToRoles(csv) {
        const roles = {};
        const lines = csv.split('\n');

        // Skip header row
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Parse CSV (handle quoted values)
            const parts = line.split(',');
            if (parts.length >= 2) {
                const email = parts[0].replace(/"/g, '').trim().toLowerCase();
                const rolesStr = parts[1].replace(/"/g, '').trim();

                if (email && rolesStr) {
                    // Support comma-separated roles within the cell
                    roles[email] = rolesStr.split(/[,;]/).map(r => r.trim()).filter(r => r);
                }
            }
        }

        return roles;
    }

    getUserRoles() {
        const user = window.authManager?.getUser();
        if (!user || !user.email) {
            return DEFAULT_ROLE;
        }

        // Case-insensitive email lookup
        const userEmailLower = user.email.toLowerCase();

        // Use cached sheet roles or fallback
        const rolesSource = SHEET_ROLES || FALLBACK_ROLES;

        for (const [email, roles] of Object.entries(rolesSource)) {
            if (email.toLowerCase() === userEmailLower) {
                return roles;
            }
        }
        return DEFAULT_ROLE;
    }

    hasRole(requiredRoles) {
        const userRoles = this.getUserRoles();

        // Admin can see everything
        if (userRoles.includes('admin')) {
            return true;
        }

        // No required roles means everyone can see it
        if (!requiredRoles || requiredRoles.length === 0) return true;

        // Check if user has any of the required roles
        const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
        return roles.some(role => userRoles.includes(role));
    }

    canAccessDashboard(dashboard) {
        return this.hasRole(dashboard.requiredRoles);
    }

    filterDashboards(dashboards) {
        return dashboards.filter(dashboard => {
            if (dashboard.isGroup) {
                // For groups, filter sub-dashboards
                const accessibleSubs = dashboard.dashboards.filter(d => this.canAccessDashboard(d));
                return accessibleSubs.length > 0;
            }
            return this.canAccessDashboard(dashboard);
        });
    }

    getFilteredConfig() {
        return DASHBOARD_CONFIG.categories.map(category => {
            // Filter category-level first
            if (!this.hasRole(category.requiredRoles)) return null;

            let filteredDashboards = this.filterDashboards(category.dashboards);

            // For groups, also filter internal dashboards
            filteredDashboards = filteredDashboards.map(d => {
                if (d.isGroup) {
                    return {
                        ...d,
                        dashboards: d.dashboards.filter(sub => this.canAccessDashboard(sub))
                    };
                }
                return d;
            });

            if (filteredDashboards.length === 0) return null;

            return { ...category, dashboards: filteredDashboards };
        }).filter(c => c !== null);
    }

    // ============================================
    // Rendering
    // ============================================

    renderCategories() {
        const categories = this.getFilteredConfig();

        this.categoriesContainer.innerHTML = categories.map(category => {
            // Flatten groups: each group becomes a card, standalone items become cards
            const cards = category.dashboards.map(dashboard => {
                return `
                  <div class="dashboard-card" data-dashboard-id="${dashboard.id}" data-category-id="${category.id}">
                    <div class="dashboard-card__icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="3" y1="9" x2="21" y2="9"></line>
                        <line x1="9" y1="21" x2="9" y2="9"></line>
                      </svg>
                    </div>
                    <div class="dashboard-card__info">
                      <div class="dashboard-card__title">${dashboard.title}</div>
                      <div class="dashboard-card__purpose">${dashboard.purpose || ''}</div>
                    </div>
                    <div class="dashboard-card__arrow">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </div>
                  </div>
                `;
            }).join('');

            return `
              <div class="section-row" data-category="${category.id}">
                <div class="section-label">
                  <span class="section-label__icon">${category.icon}</span>
                  ${category.name}
                  <span class="section-label__count">${category.dashboards.length}</span>
                </div>
                <div class="section-cards">
                  ${cards}
                </div>
              </div>
            `;
        }).join('');
    }

    renderSidebar() {
        const categories = this.getFilteredConfig();

        this.sidebarContent.innerHTML = categories.map(category => `
      <div class="sidebar-category" data-category="${category.id}">
        <div class="sidebar-category__header" data-category-id="${category.id}">
          <span class="sidebar-category__icon">${category.icon}</span>
          <span>${category.name}</span>
        </div>
        ${category.dashboards.map(dashboard => {
            if (dashboard.isGroup) {
                const isExpanded = this.expandedGroups.has(dashboard.id);
                return `
              <div class="sidebar-group ${isExpanded ? 'expanded' : ''}" data-group-id="${dashboard.id}">
                <div class="sidebar-group__header">
                  <span>${dashboard.title}</span>
                  <svg class="sidebar-group__toggle" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                <div class="sidebar-group__items">
                  ${dashboard.dashboards.map(subD => `
                    <div class="sidebar-dashboard" data-dashboard-id="${subD.id}" data-category-id="${category.id}">
                      ${subD.title}
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
            }
            return `
            <div class="sidebar-dashboard" data-dashboard-id="${dashboard.id}" data-category-id="${category.id}">
              ${dashboard.title}
            </div>
          `;
        }).join('')}
      </div>
    `).join('');
    }

    // ============================================
    // Event Binding
    // ============================================

    bindEvents() {
        // Dashboard card clicks on homepage
        this.categoriesContainer.addEventListener('click', (e) => {
            const card = e.target.closest('.dashboard-card');
            if (card) {
                this.openDashboard(card.dataset.dashboardId, card.dataset.categoryId);
            }
        });


        // Sidebar interactions
        this.sidebar.addEventListener('mouseenter', () => this.expandSidebar());
        this.sidebar.addEventListener('mouseleave', () => this.scheduleSidebarClose());

        this.sidebarContent.addEventListener('click', (e) => {
            const dashboard = e.target.closest('.sidebar-dashboard');
            const groupHeader = e.target.closest('.sidebar-group__header');

            if (groupHeader) {
                const group = groupHeader.closest('.sidebar-group');
                const groupId = group.dataset.groupId;

                if (this.expandedGroups.has(groupId)) {
                    this.expandedGroups.delete(groupId);
                    group.classList.remove('expanded');
                } else {
                    this.expandedGroups.add(groupId);
                    group.classList.add('expanded');
                }
                return;
            }

            if (dashboard) {
                this.openDashboard(dashboard.dataset.dashboardId, dashboard.dataset.categoryId);
            }
        });

        // Sidebar Title click to go home
        this.sidebarHomeTrigger.addEventListener('click', () => {
            this.goHome();
            this.collapseSidebar(); // Optional: close sidebar when going home
        });

        // Keyboard navigation (use window to capture even when iframe was focused)
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentDashboard) {
                this.goHome();
            }

            // F key to toggle fullscreen (only when viewing a dashboard and not typing)
            if ((e.key === 'f' || e.key === 'F') && this.currentDashboard) {
                const activeElement = document.activeElement;
                const isTyping = activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA';
                if (!isTyping) {
                    e.preventDefault();
                    this.toggleFullscreen();
                }
            }
        });

        // Refocus document when mouse leaves iframe (allows keyboard shortcuts to work)
        this.dashboardContainer.addEventListener('mouseleave', () => {
            window.focus();
        });

        // Fullscreen toggle
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());

        // Listen for fullscreen changes (including ESC key exit)
        document.addEventListener('fullscreenchange', () => this.updateFullscreenButton());
        document.addEventListener('webkitfullscreenchange', () => this.updateFullscreenButton());
        document.addEventListener('msfullscreenchange', () => this.updateFullscreenButton());

    }

    // ============================================
    // Category (no-op, flat layout has no accordion)
    // ============================================

    toggleCategory(categoryId) {
        // No-op: flat layout, no accordion
    }

    expandCategory(categoryId) {
        // No-op: flat layout, no accordion
    }

    // ============================================
    // Dashboard Navigation
    // ============================================

    openDashboard(dashboardId, categoryId) {
        // Find dashboard config
        const category = DASHBOARD_CONFIG.categories.find(c => c.id === categoryId);
        if (!category) return;

        // Search in individual dashboards and inside groups
        let dashboard = null;
        category.dashboards.forEach(d => {
            if (d.id === dashboardId) {
                // If the user clicked a group on the homepage, open the first dashboard in that group
                if (d.isGroup) {
                    dashboard = d.dashboards[0];
                    dashboardId = dashboard.id; // Correct the ID to the specific dashboard's ID
                    this.expandedGroups.add(d.id); // Also expand it in the sidebar
                } else {
                    dashboard = d;
                }
            } else if (d.isGroup) {
                const subD = d.dashboards.find(sd => sd.id === dashboardId);
                if (subD) {
                    dashboard = subD;
                    this.expandedGroups.add(d.id); // Ensure group is expanded if sub-dashboard opened
                }
            }
        });

        if (!dashboard) return;

        // Update state
        this.currentCategory = categoryId;
        this.currentDashboard = dashboardId;
        this.saveState();

        // Update UI
        this.homepage.classList.add('hidden');
        this.dashboardView.classList.add('active');

        // Load the dashboard
        this.loadDashboard(dashboard);

        // Update sidebar highlighting
        this.updateSidebarHighlight();

        // Load comments for this dashboard
        this.renderComments();
    }

    async loadDashboard(dashboard) {
        // Hide all iframes
        this.loadedDashboards.forEach(iframe => {
            iframe.classList.remove('active');
        });

        // Check if we already have an iframe for this dashboard
        if (this.loadedDashboards.has(dashboard.id)) {
            const iframe = this.loadedDashboards.get(dashboard.id);
            iframe.classList.add('active');
        } else {
            // Create new iframe
            const iframe = document.createElement('iframe');
            iframe.title = dashboard.title;

            // Fetch URL from Google Sheet (or fallback to encoded embedUrl)
            let url;
            try {
                const urlMap = await this.fetchDashboardUrls();
                if (urlMap && urlMap[dashboard.id]) {
                    url = urlMap[dashboard.id];
                } else if (dashboard.embedUrl) {
                    url = _d(dashboard.embedUrl);
                } else {
                    console.error('No URL found for dashboard:', dashboard.id);
                    return;
                }
            } catch (e) {
                if (dashboard.embedUrl) {
                    url = _d(dashboard.embedUrl);
                } else {
                    console.error('Failed to load URL for:', dashboard.id);
                    return;
                }
            }

            const params = ['navContentPaneEnabled=false', 'filterPaneEnabled=false'];

            if (dashboard.pageName) {
                params.push(`pageName=${dashboard.pageName}`);
            }

            const separator = url.includes('?') ? '&' : '?';
            url += `${separator}${params.join('&')}`;

            iframe.src = url;
            iframe.allowFullscreen = true;
            iframe.className = 'dashboard-iframe active';

            // After iframe loads, mask the src from DevTools without navigating away
            iframe.addEventListener('load', () => {
                try {
                    Object.defineProperty(iframe, 'src', {
                        get: () => 'about:blank',
                        set: () => { },
                        configurable: true
                    });
                } catch (e) { /* ignore */ }
            });

            this.dashboardContainer.appendChild(iframe);
            this.loadedDashboards.set(dashboard.id, iframe);
        }
    }



    goHome() {
        this.currentDashboard = null; // Reset selection

        // Instant switch to home
        this.dashboardView.classList.remove('active');
        this.homepage.classList.remove('hidden');

        // Hide all iframes instead of clearing source
        this.loadedDashboards.forEach(iframe => {
            iframe.classList.remove('active');
        });

        this.currentDashboard = null;
        this.saveState();
        this.updateSidebarHighlight();
    }

    // ============================================
    // Sidebar
    // ============================================

    expandSidebar() {
        if (this.sidebarCloseTimeout) {
            clearTimeout(this.sidebarCloseTimeout);
            this.sidebarCloseTimeout = null;
        }
        this.sidebar.classList.add('expanded');
    }

    scheduleSidebarClose() {
        this.sidebarCloseTimeout = setTimeout(() => {
            this.collapseSidebar();
        }, 300);
    }

    collapseSidebar() {
        this.sidebar.classList.remove('expanded');
    }

    updateSidebarHighlight() {
        // Clear all highlights
        this.sidebarContent.querySelectorAll('.sidebar-category__header.active').forEach(el => {
            el.classList.remove('active');
        });
        this.sidebarContent.querySelectorAll('.sidebar-dashboard.active').forEach(el => {
            el.classList.remove('active');
        });

        // Highlight current category
        if (this.currentCategory) {
            const categoryHeader = this.sidebarContent.querySelector(
                `.sidebar-category__header[data-category-id="${this.currentCategory}"]`
            );
            if (categoryHeader) {
                categoryHeader.classList.add('active');
            }
        }

        // Highlight current dashboard
        if (this.currentDashboard) {
            const dashboardItem = this.sidebarContent.querySelector(
                `.sidebar-dashboard[data-dashboard-id="${this.currentDashboard}"]`
            );
            if (dashboardItem) {
                dashboardItem.classList.add('active');
            }
        }
    }

    // ============================================
    // Fullscreen
    // ============================================

    toggleFullscreen() {
        const elem = document.documentElement;

        if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
            // Enter fullscreen
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            }
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }

    updateFullscreenButton() {
        const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;

        if (isFullscreen) {
            this.fullscreenBtn.classList.add('is-fullscreen');
            this.fullscreenBtn.title = 'Exit Fullscreen';
        } else {
            this.fullscreenBtn.classList.remove('is-fullscreen');
            this.fullscreenBtn.title = 'Toggle Fullscreen';
        }
    }

    // ============================================
    // State Management
    // ============================================

    saveState() {
        const state = {
            currentCategory: this.currentCategory,
            currentDashboard: this.currentDashboard,
            expandedCategories: Array.from(this.expandedCategories)
        };
        localStorage.setItem('dashboardHubState', JSON.stringify(state));
    }

    restoreState() {
        try {
            const saved = localStorage.getItem('dashboardHubState');
            if (!saved) return;

            const state = JSON.parse(saved);

            // Restore current category
            if (state.currentCategory) {
                this.currentCategory = state.currentCategory;
            }

        } catch (e) {
            console.warn('Failed to restore state:', e);
        }
    }

    // ============================================
    // Annotation Tool
    // ============================================

    setupCanvas() {
        // Match canvas size to viewport
        const resize = () => {
            this.annotationCanvas.width = window.innerWidth;
            this.annotationCanvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);
    }

    bindAnnotationEvents() {
        // Pen toggle
        this.penToggle.addEventListener('click', () => this.togglePen());

        // Eraser
        this.eraserBtn.addEventListener('click', () => this.toggleEraser());

        // Clear
        this.clearBtn.addEventListener('click', () => this.clearCanvas());

        // Color swatches
        this.colorSwatches.forEach(swatch => {
            swatch.addEventListener('click', () => {
                this.colorSwatches.forEach(s => s.classList.remove('active'));
                swatch.classList.add('active');
                this.penColor = swatch.dataset.color;
                // Switch to pen mode when selecting a color
                if (!this.isPenActive) {
                    this.togglePen();
                } else if (this.isEraserMode) {
                    this.isEraserMode = false;
                    this.eraserBtn.classList.remove('active');
                }
            });
        });

        // Canvas drawing events
        this.annotationCanvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.annotationCanvas.addEventListener('mousemove', (e) => this.draw(e));
        this.annotationCanvas.addEventListener('mouseup', () => this.stopDrawing());
        this.annotationCanvas.addEventListener('mouseleave', () => this.stopDrawing());

        // Touch support
        this.annotationCanvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startDrawing(e.touches[0]);
        });
        this.annotationCanvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.draw(e.touches[0]);
        });
        this.annotationCanvas.addEventListener('touchend', () => this.stopDrawing());

        // Keyboard shortcuts for annotation
        window.addEventListener('keydown', (e) => {
            if (!this.currentDashboard) return;
            const activeElement = document.activeElement;
            const isTyping = activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA';
            if (isTyping) return;

            if (e.key === 'w' || e.key === 'W') {
                e.preventDefault();
                this.togglePen();
            } else if (e.key === 'e' || e.key === 'E') {
                e.preventDefault();
                this.toggleEraser();
            } else if (e.key === 'c' || e.key === 'C') {
                e.preventDefault();
                this.clearCanvas();
            }
        });
    }

    togglePen() {
        this.isPenActive = !this.isPenActive;
        this.penToggle.classList.toggle('active', this.isPenActive);
        this.annotationCanvas.classList.toggle('active', this.isPenActive);

        if (this.isPenActive) {
            this.isEraserMode = false;
            this.eraserBtn.classList.remove('active');
        }
    }

    toggleEraser() {
        if (!this.isPenActive) {
            this.isPenActive = true;
            this.penToggle.classList.add('active');
            this.annotationCanvas.classList.add('active');
        }
        this.isEraserMode = !this.isEraserMode;
        this.eraserBtn.classList.toggle('active', this.isEraserMode);
    }

    clearCanvas() {
        this.annotationCtx.clearRect(0, 0, this.annotationCanvas.width, this.annotationCanvas.height);
    }

    startDrawing(e) {
        this.isDrawing = true;
        this.annotationCtx.beginPath();
        this.annotationCtx.moveTo(e.clientX, e.clientY);
    }

    draw(e) {
        if (!this.isDrawing) return;

        const ctx = this.annotationCtx;

        if (this.isEraserMode) {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineWidth = this.eraserWidth;
        } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = this.penColor;
            ctx.lineWidth = this.penWidth;
        }

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineTo(e.clientX, e.clientY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.clientX, e.clientY);
    }

    stopDrawing() {
        this.isDrawing = false;
        this.annotationCtx.beginPath();
    }

    // ============================================
    // Comment Panel
    // ============================================

    bindCommentEvents() {
        // Submit comment
        this.commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitComment();
        });

        // Handle reply clicks and delete
        this.commentList.addEventListener('click', (e) => {
            const replyBtn = e.target.closest('.comment-item__action[data-action="reply"]');
            const deleteBtn = e.target.closest('.comment-item__action[data-action="delete"]');
            const submitReplyBtn = e.target.closest('.reply-submit-btn');
            const cancelReplyBtn = e.target.closest('.reply-cancel-btn');

            if (replyBtn) {
                const commentId = replyBtn.dataset.commentId;
                this.showReplyForm(commentId);
            }

            if (deleteBtn) {
                const commentId = deleteBtn.dataset.commentId;
                const parentId = deleteBtn.dataset.parentId || null;
                this.deleteComment(commentId, parentId);
            }

            if (submitReplyBtn) {
                const commentId = submitReplyBtn.dataset.commentId;
                const input = this.commentList.querySelector(`#reply-input-${commentId}`);
                if (input && input.value.trim()) {
                    this.submitReply(commentId, input.value.trim());
                }
            }

            if (cancelReplyBtn) {
                const replyForm = cancelReplyBtn.closest('.comment-reply-form');
                if (replyForm) {
                    replyForm.classList.remove('active');
                }
            }
        });
    }

    renderComments() {
        if (!this.commentList || !this.commentEmpty) return;

        if (!this.currentDashboard) {
            this.commentList.innerHTML = '';
            this.commentList.appendChild(this.commentEmpty);
            this.commentEmpty.classList.remove('hidden');
            this.updateCommentBadge(0);
            return;
        }

        const comments = this.comments[this.currentDashboard] || [];
        const html = comments.map(comment => this.renderCommentItem(comment)).join('');

        this.commentList.innerHTML = html;
        this.commentList.appendChild(this.commentEmpty);

        const totalCount = comments.reduce((count, comment) => {
            const repliesCount = Array.isArray(comment.replies) ? comment.replies.length : 0;
            return count + 1 + repliesCount;
        }, 0);

        this.updateCommentBadge(totalCount);
        this.commentEmpty.classList.toggle('hidden', comments.length > 0);
    }

    renderCommentItem(comment, isReply = false) {
        const safeText = this.escapeHtml(comment.text || '').replace(/\n/g, '<br>');
        const author = this.escapeHtml(comment.author || 'Anonymous');
        const timeAgo = this.getTimeAgo(comment.timestamp || Date.now());
        const initials = this.getInitials(comment.author || 'A');

        const actions = isReply
            ? ''
            : `
          <div class="comment-item__actions">
            <button class="comment-item__action" data-action="reply" data-comment-id="${comment.id}">Reply</button>
          </div>
        `;

        const replyForm = isReply ? '' : this.renderReplyForm(comment.id);

        const repliesHtml = (!isReply && Array.isArray(comment.replies) && comment.replies.length > 0)
            ? `
          <div class="comment-reply">
            ${comment.replies.map(reply => this.renderCommentItem(reply, true)).join('')}
          </div>
        `
            : '';

        return `
        <div class="comment-item" data-comment-id="${comment.id}">
          <div class="comment-item__header">
            <div class="comment-item__avatar">${initials}</div>
            <div class="comment-item__meta">
              <div class="comment-item__author">${author}</div>
              <div class="comment-item__time">${timeAgo}</div>
            </div>
          </div>
          <div class="comment-item__text">${safeText}</div>
          ${actions}
        </div>
        ${replyForm}
        ${repliesHtml}
      `;
    }

    renderReplyForm(commentId) {
        return `
        <div class="comment-reply-form" id="reply-form-${commentId}">
          <div class="comment-form__input-wrapper">
            <input type="text" class="comment-form__input" id="reply-input-${commentId}" placeholder="Write a reply..." autocomplete="off">
            <button type="button" class="comment-form__submit reply-submit-btn" data-comment-id="${commentId}" title="Send">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
            <button type="button" class="comment-item__action reply-cancel-btn" data-comment-id="${commentId}">Cancel</button>
          </div>
        </div>
      `;
    }

    showReplyForm(commentId) {
        const openForms = this.commentList.querySelectorAll('.comment-reply-form.active');
        openForms.forEach(form => form.classList.remove('active'));

        const form = this.commentList.querySelector(`#reply-form-${commentId}`);
        if (form) {
            form.classList.add('active');
            const input = form.querySelector('input');
            if (input) input.focus();
        }
    }

    updateCommentBadge(count) {
        if (!this.commentBadge) return;
        const safeCount = Number.isFinite(count) ? count : 0;
        this.commentBadge.textContent = safeCount;
        this.commentBadge.setAttribute('data-count', String(safeCount));
    }

    expandCommentPanel() {
        this.isCommentPanelExpanded = true;
        this.commentPanel.classList.add('expanded');
    }

    collapseCommentPanel() {
        this.isCommentPanelExpanded = false;
        this.commentPanel.classList.remove('expanded');
    }

    async loadAllComments() {
        try {
            const response = await fetch(COMMENTS_SHEET_URL);
            if (!response.ok) throw new Error('Failed to fetch comments');

            const csv = await response.text();
            this.comments = this.parseCommentsCSV(csv);
            if (this.currentDashboard) {
                this.renderComments();
            }
        } catch (e) {
            console.warn('Failed to load comments:', e);
            this.comments = {};
            if (this.currentDashboard) {
                this.renderComments();
            }
        }
    }

    parseCommentsCSV(csv) {
        const commentsByDashboard = {};
        const lines = csv.split('\n');

        // Skip header
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Simple CSV parse (robust enough for our usage)
            // Format: id, dashboardId, author, text, timestamp, parentId
            const parts = line.split(',');
            if (parts.length < 5) continue;

            const id = parts[0];
            const dashboardId = parts[1];
            const author = parts[2];
            // Reassemble text if it contained commas
            const parentId = parts[parts.length - 1];
            const timestamp = parseInt(parts[parts.length - 2]);
            const text = parts.slice(3, parts.length - 2).join(',').replace(/^"|"$/g, '');

            const comment = { id, author, text, timestamp, replies: [] };

            if (!commentsByDashboard[dashboardId]) {
                commentsByDashboard[dashboardId] = [];
            }

            if (parentId && parentId.trim()) {
                // It's a reply - store temporarily to link later
                // For simplicity in this append-only model, we'll scan linearly
                // This logic implies we need a second pass or structured storage
                comment.parentId = parentId.trim();
                commentsByDashboard[dashboardId].push(comment);
            } else {
                commentsByDashboard[dashboardId].push(comment);
            }
        }

        // Reconstruct hierarchy (replies)
        for (const dashId in commentsByDashboard) {
            const all = commentsByDashboard[dashId];
            const root = [];
            const map = new Map();

            // Map all for lookup
            all.forEach(c => map.set(c.id, c));

            all.forEach(c => {
                if (c.parentId && map.has(c.parentId)) {
                    const parent = map.get(c.parentId);
                    if (!parent.replies) parent.replies = [];
                    parent.replies.push(c);
                } else if (!c.parentId) {
                    root.push(c);
                }
            });

            // Sort by timestamp
            root.sort((a, b) => b.timestamp - a.timestamp);
            root.forEach(c => c.replies.sort((a, b) => a.timestamp - b.timestamp));

            commentsByDashboard[dashId] = root;
        }

        return commentsByDashboard;
    }

    async saveCommentToSheet(comment, dashboardId, parentId = '') {
        try {
            const data = {
                id: comment.id,
                dashboardId: dashboardId,
                author: comment.author,
                text: comment.text,
                timestamp: comment.timestamp,
                parentId: parentId
            };

            // Use text/plain to avoid CORS preflight, Apps Script handles it fine
            await fetch(COMMENTS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: JSON.stringify(data)
            });
        } catch (e) {
            console.error('Failed to save comment:', e);
            alert('Failed to post comment. Check console for details.');
        }
    }

    // Remove localStorage save/load
    saveAllComments() { /* No-op */ }

    async submitComment() {
        const text = this.commentInput.value.trim();
        if (!text) return;

        if (!this.currentDashboard) {
            alert('Please open a dashboard to comment.');
            return;
        }

        const comment = {
            id: this.generateId(),
            author: this.getCurrentUser(),
            text: text,
            timestamp: Date.now(),
            replies: []
        };

        // Optimistic UI update
        if (!this.comments[this.currentDashboard]) {
            this.comments[this.currentDashboard] = [];
        }
        this.comments[this.currentDashboard].unshift(comment);
        this.renderComments();
        this.commentInput.value = '';

        // Background save
        await this.saveCommentToSheet(comment, this.currentDashboard);
    }

    async submitReply(parentCommentId, text) {
        if (!text || !this.currentDashboard) return;

        const comments = this.comments[this.currentDashboard] || [];
        const parentComment = comments.find(c => c.id === parentCommentId);

        if (!parentComment) return;

        const reply = {
            id: this.generateId(),
            parentId: parentCommentId, // internal use
            author: this.getCurrentUser(),
            text: text,
            timestamp: Date.now()
        };

        if (!parentComment.replies) {
            parentComment.replies = [];
        }

        // Optimistic UI update
        parentComment.replies.push(reply);
        this.renderComments();

        // Background save
        await this.saveCommentToSheet(reply, this.currentDashboard, parentCommentId);
    }

    deleteComment(commentId, parentId = null) {
        alert("Deletion is not supported in the shared sheet yet.");
        // To support deletion we'd need a more complex backend or 'soft delete' flags
    }

    // Helper methods
    generateId() {
        return 'c_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    getCurrentUser() {
        // Use authenticated user
        const user = window.authManager?.getUser();
        return user ? (user.name || user.email) : 'Anonymous';
    }

    getInitials(name) {
        if (!name) return 'A';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }

    getTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

        return new Date(timestamp).toLocaleDateString();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ============================================
// Authentication Manager
// ============================================
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.loginPage = document.getElementById('login-page');
        this.mainApp = document.getElementById('main-app');
        this.loginError = document.getElementById('login-error');
        this.loginErrorText = document.getElementById('login-error-text');
        this.logoutBtn = document.getElementById('logout-btn');
        this.userAvatar = document.getElementById('user-avatar');
        this.userName = document.getElementById('user-name');
        this.userEmail = document.getElementById('user-email');

        this.init();
    }

    init() {
        // Check for existing session
        const existingSession = this.loadSession();
        if (existingSession && this.isSessionValid(existingSession)) {
            this.currentUser = existingSession;
            this.showApp();
            this.updateUserDisplay();
        } else {
            this.clearSession();
            this.showLogin();
            this.initGoogleSignIn();
        }

        // Bind logout button
        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('click', () => this.signOut());
        }
    }

    initGoogleSignIn() {
        // Wait for Google Identity Services to load
        const checkGoogle = setInterval(() => {
            if (typeof google !== 'undefined' && google.accounts) {
                clearInterval(checkGoogle);
                this.renderGoogleButton();
            }
        }, 100);

        // Timeout after 10 seconds
        setTimeout(() => {
            clearInterval(checkGoogle);
            if (typeof google === 'undefined') {
                this.showError('Failed to load Google Sign-In. Please refresh the page.');
            }
        }, 10000);
    }

    renderGoogleButton() {
        google.accounts.id.initialize({
            client_id: AUTH_CONFIG.GOOGLE_CLIENT_ID,
            callback: (response) => this.handleCredentialResponse(response),
            auto_select: false,
            cancel_on_tap_outside: true
        });

        google.accounts.id.renderButton(
            document.getElementById('google-signin-btn'),
            {
                theme: 'outline',
                size: 'large',
                text: 'signin_with',
                shape: 'rectangular',
                logo_alignment: 'left',
                width: 280
            }
        );
    }

    handleCredentialResponse(response) {
        try {
            // Decode the JWT token
            const payload = this.decodeJwt(response.credential);

            if (!payload) {
                this.showError('Failed to verify your account. Please try again.');
                return;
            }

            // Validate domain
            if (!this.validateDomain(payload.email)) {
                this.showError(`Access denied. Only @${AUTH_CONFIG.ALLOWED_DOMAIN} emails are allowed.`);
                return;
            }

            // Create user session
            const user = {
                email: payload.email,
                name: payload.name,
                picture: payload.picture,
                loginTime: Date.now()
            };

            // Save session and show app
            this.currentUser = user;
            this.saveSession(user);
            this.hideError();
            this.showApp();
            this.updateUserDisplay();

        } catch (error) {
            console.error('Authentication error:', error);
            this.showError('Authentication failed. Please try again.');
        }
    }

    decodeJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('JWT decode error:', error);
            return null;
        }
    }

    validateDomain(email) {
        if (!email) return false;
        const domain = email.split('@')[1];
        return domain && domain.toLowerCase() === AUTH_CONFIG.ALLOWED_DOMAIN.toLowerCase();
    }

    // Generate browser fingerprint for session binding
    generateFingerprint() {
        const data = [
            navigator.userAgent,
            navigator.language,
            screen.colorDepth,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset()
        ].join('|');

        // Simple hash function
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    }

    // Generate integrity hash for session data
    generateIntegrityHash(user) {
        const data = user.email + user.loginTime + AUTH_CONFIG.GOOGLE_CLIENT_ID;
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    }

    saveSession(user) {
        try {
            const sessionData = {
                ...user,
                fingerprint: this.generateFingerprint(),
                integrity: this.generateIntegrityHash(user)
            };
            // Encode session data
            const encoded = btoa(JSON.stringify(sessionData));
            localStorage.setItem('dashboardHubSession', encoded);
        } catch (error) {
            // Silent fail for security
        }
    }

    loadSession() {
        try {
            const encoded = localStorage.getItem('dashboardHubSession');
            if (!encoded) return null;

            // Decode session
            const sessionData = JSON.parse(atob(encoded));

            // Verify fingerprint (browser binding)
            if (sessionData.fingerprint !== this.generateFingerprint()) {
                this.clearSession();
                return null;
            }

            // Verify integrity (tampering detection)
            const expectedHash = this.generateIntegrityHash(sessionData);
            if (sessionData.integrity !== expectedHash) {
                this.clearSession();
                return null;
            }

            return sessionData;
        } catch (error) {
            // Invalid session format - clear it
            this.clearSession();
            return null;
        }
    }

    isSessionValid(session) {
        if (!session || !session.loginTime) return false;
        const elapsed = Date.now() - session.loginTime;
        return elapsed < AUTH_CONFIG.SESSION_DURATION;
    }

    clearSession() {
        localStorage.removeItem('dashboardHubSession');
        this.currentUser = null;
    }

    signOut() {
        this.clearSession();

        // Revoke Google session if available
        if (typeof google !== 'undefined' && google.accounts) {
            google.accounts.id.disableAutoSelect();
        }

        // Clear role cache so next user gets fresh roles
        SHEET_ROLES = null;
        ROLES_FETCH_TIME = 0;

        // Destroy dashboard hub so new user gets fresh view
        if (window.dashboardHub) {
            window.dashboardHub = null;
        }

        // Show login page
        this.showLogin();
        this.initGoogleSignIn();
    }

    showLogin() {
        if (this.loginPage) this.loginPage.classList.remove('hidden');
        if (this.mainApp) this.mainApp.classList.add('hidden');
    }

    async showApp() {
        if (this.loginPage) this.loginPage.classList.add('hidden');
        if (this.mainApp) this.mainApp.classList.remove('hidden');

        // Create fresh dashboard hub for new user
        window.dashboardHub = new DashboardHub();

        // Fetch roles from Google Sheets in background
        window.dashboardHub.fetchSheetRoles().then(() => {
            // Re-render once roles are truly loaded (in case they differ from fallback)
            console.log('Roles refreshed, updating view...');
            window.dashboardHub.renderCategories();
            window.dashboardHub.renderSidebar();
        });

        // Immediate render with fallback/cached roles (Optimistic UI)
        window.dashboardHub.renderCategories();
        window.dashboardHub.renderSidebar();

        // Load comments in background (non-blocking)
        window.dashboardHub.loadAllComments();
    }

    updateUserDisplay() {
        if (!this.currentUser) return;

        // Update user name
        if (this.userName) {
            this.userName.textContent = this.currentUser.name || 'User';
        }

        // Update user email
        if (this.userEmail) {
            this.userEmail.textContent = this.currentUser.email || '';
        }

        // Update avatar
        if (this.userAvatar) {
            if (this.currentUser.picture) {
                this.userAvatar.innerHTML = `<img src="${this.currentUser.picture}" alt="Avatar" referrerpolicy="no-referrer">`;
            } else {
                // Show initials
                const initials = (this.currentUser.name || 'U')
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);
                this.userAvatar.textContent = initials;
            }
        }
    }

    showError(message) {
        if (this.loginError && this.loginErrorText) {
            this.loginErrorText.textContent = message;
            this.loginError.classList.add('visible');
        }
    }

    hideError() {
        if (this.loginError) {
            this.loginError.classList.remove('visible');
        }
    }

    isAuthenticated() {
        return this.currentUser !== null && this.isSessionValid(this.currentUser);
    }

    getUser() {
        return this.currentUser;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize auth manager first
    window.authManager = new AuthManager();
});
