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

        const validTrips = trips || [];
        const validParticipants = participants || [];
        const validExpenses = expenses || [];
        const validSettlements = settlements || [];

        // 1. Summary Cards
        document.getElementById('stat-total-trips').textContent = validTrips.length;
        document.getElementById('stat-total-participants').textContent = validParticipants.length;
        
        const totalExpenses = validExpenses.reduce((sum, exp) => sum + (exp.totalBudget || 0), 0);
        document.getElementById('stat-total-expenses').textContent = `₹${totalExpenses.toFixed(2)}`;
        


        // 2. Recent Trips Table
        const recentTripsTable = document.getElementById('recent-trips-table');
        if (validTrips.length === 0) {
            recentTripsTable.innerHTML = `
                <tr><td colspan="6" class="empty-state">
                    <div class="empty-state-icon">✈️</div>
                    <div class="empty-state-title">No trips available yet</div>
                    <div class="empty-state-desc">Create your first trip to get started.</div>
                    <a href="trips.html" class="btn btn-primary mt-4">+ Create Trip</a>
                </td></tr>
            `;
        } else {
            const recentTrips = [...validTrips].reverse().slice(0, 5);
            recentTripsTable.innerHTML = recentTrips.map(t => {
                const tripParticipants = validParticipants.filter(p => p.tripId === t.id).length;
                const tripExpenses = validExpenses.filter(e => e.tripId === t.id).reduce((sum, e) => sum + (e.totalBudget || 0), 0);
                const status = t.status || 'Active'; // Provide fallback
                return `
                <tr>
                    <td><strong>${t.tripName || 'Unnamed Trip'}</strong></td>
                    <td>${t.startDate || t.date || 'TBD'}</td>
                    <td>${tripParticipants}</td>
                    <td>₹${tripExpenses.toFixed(2)}</td>
                    <td><span class="badge ${status.toLowerCase() === 'completed' ? 'badge-success' : 'badge-primary'}">${status}</span></td>
                    <td><a href="trips.html" class="btn btn-sm btn-secondary">View</a></td>
                </tr>
                `;
            }).join('');
        }







    } catch (error) {
        showToast('Failed to load dashboard data: ' + error.message, 'error');
        document.getElementById('recent-trips-table').innerHTML = `
            <tr><td colspan="6" class="text-danger text-center">Failed to load data. Please ensure the backend is running.</td></tr>
        `;
    }
}
