/**
 * Power BI Dashboard Hub - Main Application
 * Single Page Application for seamless dashboard navigation
 */

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

        // Initialize
        this.init();
    }

    init() {
        this.renderCategories();
        this.renderSidebar();
        this.bindEvents();
        this.restoreState();
    }

    // ============================================
    // Rendering
    // ============================================

    renderCategories() {
        this.categoriesContainer.innerHTML = DASHBOARD_CONFIG.categories.map(category => `
      <div class="category-tile" data-category="${category.id}">
        <div class="category-header" data-category-id="${category.id}">
          <div class="category-icon">${category.icon}</div>
          <div class="category-info">
            <div class="category-name">${category.name}</div>
            <div class="category-description">${category.description}</div>
          </div>
          <div class="category-count">${category.dashboards.length} report${category.dashboards.length !== 1 ? 's' : ''}</div>
          <div class="category-expand-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
        <div class="dashboard-list">
          <div class="dashboard-list__inner">
            ${category.dashboards.map(dashboard => `
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
            `).join('')}
          </div>
        </div>
      </div>
    `).join('');
    }

    renderSidebar() {
        this.sidebarContent.innerHTML = DASHBOARD_CONFIG.categories.map(category => `
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
        // Category headers (accordion toggle)
        this.categoriesContainer.addEventListener('click', (e) => {
            const header = e.target.closest('.category-header');
            const card = e.target.closest('.dashboard-card');

            if (card) {
                this.openDashboard(card.dataset.dashboardId, card.dataset.categoryId);
            } else if (header) {
                this.toggleCategory(header.dataset.categoryId);
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
    // Category Accordion
    // ============================================

    toggleCategory(categoryId) {
        const tile = document.querySelector(`.category-tile[data-category="${categoryId}"]`);
        if (!tile) return;

        const isExpanded = tile.classList.contains('expanded');

        if (isExpanded) {
            tile.classList.remove('expanded');
            this.expandedCategories.delete(categoryId);
        } else {
            tile.classList.add('expanded');
            this.expandedCategories.add(categoryId);
            this.currentCategory = categoryId;
            this.saveState();
        }
    }

    expandCategory(categoryId) {
        const tile = document.querySelector(`.category-tile[data-category="${categoryId}"]`);
        if (tile && !tile.classList.contains('expanded')) {
            tile.classList.add('expanded');
            this.expandedCategories.add(categoryId);
        }
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
    }

    loadDashboard(dashboard) {
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

            // Construct URL with parameters to hide bottom/side bars
            let url = dashboard.embedUrl;
            const params = ['navContentPaneEnabled=false', 'filterPaneEnabled=false'];

            if (dashboard.pageName) {
                params.push(`pageName=${dashboard.pageName}`);
            }

            const separator = url.includes('?') ? '&' : '?';
            url += `${separator}${params.join('&')}`;

            iframe.src = url;
            iframe.allowFullscreen = true;
            iframe.className = 'dashboard-iframe active';

            this.dashboardContainer.appendChild(iframe);
            this.loadedDashboards.set(dashboard.id, iframe);
        }
    }



    goHome() {
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

            // Restore expanded categories
            if (state.expandedCategories && Array.isArray(state.expandedCategories)) {
                state.expandedCategories.forEach(categoryId => {
                    this.expandCategory(categoryId);
                });
            }

            // Restore current category
            if (state.currentCategory) {
                this.currentCategory = state.currentCategory;
                this.expandCategory(state.currentCategory);
            }

            // Note: We don't auto-open the last dashboard on page load
            // to give user control, but we could add that feature here

        } catch (e) {
            console.warn('Failed to restore state:', e);
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardHub = new DashboardHub();
});
