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

        // DOM Elements
        this.homepage = document.getElementById('homepage');
        this.dashboardView = document.getElementById('dashboard-view');
        this.dashboardContainer = document.getElementById('dashboard-container');
        this.dashboardLoading = document.getElementById('dashboard-loading');
        this.loadingText = document.querySelector('.loading-text');
        this.homeButton = document.getElementById('home-button');
        this.sidebar = document.getElementById('sidebar');
        this.categoriesContainer = document.getElementById('categories');
        this.sidebarContent = document.getElementById('sidebar-content');

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
          <div class="category-count">${category.dashboards.length} dashboard${category.dashboards.length !== 1 ? 's' : ''}</div>
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
                  <div class="dashboard-card__purpose">${dashboard.purpose}</div>
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
        ${category.dashboards.map(dashboard => `
          <div class="sidebar-dashboard" data-dashboard-id="${dashboard.id}" data-category-id="${category.id}">
            ${dashboard.title}
          </div>
        `).join('')}
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

        // Home button
        this.homeButton.addEventListener('click', () => this.goHome());

        // Sidebar interactions
        this.sidebar.addEventListener('mouseenter', () => this.expandSidebar());
        this.sidebar.addEventListener('mouseleave', () => this.scheduleSidebarClose());

        this.sidebarContent.addEventListener('click', (e) => {
            const dashboard = e.target.closest('.sidebar-dashboard');
            if (dashboard) {
                this.openDashboard(dashboard.dataset.dashboardId, dashboard.dataset.categoryId);
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentDashboard) {
                this.goHome();
            }
        });

        // Handle iframe load
        const iframe = this.dashboardContainer.querySelector('iframe');
        if (iframe) {
            iframe.addEventListener('load', () => this.onDashboardLoaded());
        }
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

        const dashboard = category.dashboards.find(d => d.id === dashboardId);
        if (!dashboard) return;

        // Update state
        this.currentCategory = categoryId;
        this.currentDashboard = dashboardId;
        this.saveState();

        // Show loading state
        this.showLoading(dashboard.title);

        // Update UI
        this.homepage.classList.add('hidden');
        this.dashboardView.classList.add('active');
        this.homeButton.classList.add('visible');

        // Load the dashboard
        this.loadDashboard(dashboard);

        // Update sidebar highlighting
        this.updateSidebarHighlight();
    }

    loadDashboard(dashboard) {
        const iframe = this.dashboardContainer.querySelector('iframe');

        // Use the embed URL directly from config (Publish to Web URL)
        const embedUrl = dashboard.embedUrl;

        // Check if we're switching dashboards (same container, different report)
        if (iframe.src && iframe.src !== 'about:blank') {
            // Fade transition for dashboard switch
            iframe.style.opacity = '0';

            setTimeout(() => {
                iframe.src = embedUrl;
            }, POWERBI_CONFIG.transitionDuration / 2);
        } else {
            iframe.src = embedUrl;
        }
    }

    onDashboardLoaded() {
        const iframe = this.dashboardContainer.querySelector('iframe');

        // Hide loading
        this.hideLoading();

        // Fade in iframe
        setTimeout(() => {
            iframe.style.opacity = '1';
        }, 50);
    }

    showLoading(dashboardTitle) {
        this.loadingText.textContent = `Loading ${dashboardTitle}...`;
        this.dashboardLoading.classList.remove('hidden');
    }

    hideLoading() {
        this.dashboardLoading.classList.add('hidden');
    }

    goHome() {
        // Fade out dashboard view
        this.dashboardView.classList.remove('active');
        this.homeButton.classList.remove('visible');

        // Clear iframe to stop any running reports
        const iframe = this.dashboardContainer.querySelector('iframe');
        iframe.src = 'about:blank';
        iframe.style.opacity = '0';

        // Show homepage
        setTimeout(() => {
            this.homepage.classList.remove('hidden');
            this.currentDashboard = null;
            this.saveState();
            this.updateSidebarHighlight();
        }, POWERBI_CONFIG.transitionDuration);
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
            this.sidebar.classList.remove('expanded');
        }, 300);
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
