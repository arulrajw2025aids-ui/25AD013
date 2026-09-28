// Sidebar toggle
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('mobile-open');
    }
}

// Ensure mobile menu button works
document.addEventListener('DOMContentLoaded', () => {
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    if (mobileBtn) {
        mobileBtn.addEventListener('click', toggleSidebar);
    }
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        const sidebar = document.querySelector('.sidebar');
        const mobileBtn = document.querySelector('.mobile-menu-btn');
        if (sidebar && sidebar.classList.contains('mobile-open') && 
            !sidebar.contains(e.target) && !mobileBtn.contains(e.target)) {
            sidebar.classList.remove('mobile-open');
        }
    });
});

// Toast System
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    // Trigger reflow
    toast.offsetHeight;
    
    // Add show class
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Modal System
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Setup Modal Close Handlers
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.modal-close, [data-dismiss="modal"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal-overlay');
            if (modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
            }
        });
    });
});

// Sidebar Navigation Html Injector (to keep pages DRY)
function injectSidebar(activePage) {
    const sidebarHTML = `
        <div class="sidebar">
            <div class="sidebar-header">
                <a href="dashboard.html" class="brand">
                    TripSplit
                    <span class="tagline">Split expenses. Settle easily.</span>
                </a>
            </div>
            <ul class="nav-links">
                <li><a href="dashboard.html" class="${activePage === 'dashboard' ? 'active' : ''}">Dashboard</a></li>
                <li><a href="trips.html" class="${activePage === 'trips' ? 'active' : ''}">Trips</a></li>
                <li><a href="participants.html" class="${activePage === 'participants' ? 'active' : ''}">Participants</a></li>
                <li><a href="expenses.html" class="${activePage === 'expenses' ? 'active' : ''}">Expenses</a></li>
                <li><a href="settlements.html" class="${activePage === 'settlements' ? 'active' : ''}">Settlements</a></li>
            </ul>
        </div>
    `;
    document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
}
