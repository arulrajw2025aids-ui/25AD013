document.addEventListener('DOMContentLoaded', () => {
    injectSidebar('dashboard');
    loadDashboardData();
});

async function loadDashboardData() {
    try {
        const [trips, participants, expenses, settlements] = await Promise.all([
            getTrips(),
            getParticipants(),
            getExpenses(),
            getSettlements()
        ]);

        // Update Stats
        document.getElementById('stat-total-trips').textContent = trips ? trips.length : 0;
        document.getElementById('stat-total-participants').textContent = participants ? participants.length : 0;
        
        const totalExpenses = (expenses || []).reduce((sum, exp) => sum + exp.totalBudget, 0);
        document.getElementById('stat-total-expenses').textContent = `₹${totalExpenses.toFixed(2)}`;
        
        document.getElementById('stat-total-settlements').textContent = settlements ? settlements.length : 0;

        // Render Recent Trips (last 5)
        const recentTripsTable = document.getElementById('recent-trips-table');
        if (!trips || trips.length === 0) {
            recentTripsTable.innerHTML = `
                <tr><td colspan="4" class="empty-state">
                    <div class="empty-state-title">No trips yet</div>
                    <div class="empty-state-desc">Create your first trip to get started.</div>
                    <a href="trips.html" class="btn btn-primary">+ Create Trip</a>
                </td></tr>
            `;
            return;
        }

        const recentTrips = [...trips].reverse().slice(0, 5);
        recentTripsTable.innerHTML = recentTrips.map(t => `
            <tr>
                <td><strong>${t.tripName}</strong></td>
                <td>${t.destination}</td>
                <td><span class="badge badge-primary">${t.tripType || 'General'}</span></td>
                <td>₹${t.budget}</td>
            </tr>
        `).join('');

    } catch (error) {
        showToast('Failed to load dashboard data: ' + error.message, 'error');
        document.getElementById('recent-trips-table').innerHTML = `
            <tr><td colspan="4" class="text-danger">Failed to load data.</td></tr>
        `;
    }
}
