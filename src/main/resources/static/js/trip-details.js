document.addEventListener('DOMContentLoaded', () => {
    injectSidebar('trips');
    loadTripDetails();
});

async function loadTripDetails() {
    const params = new URLSearchParams(window.location.search);
    const tripId = params.get("id");
    
    if (!tripId) {
        showToast('No trip ID specified', 'error');
        window.location.href = 'trips.html';
        return;
    }

    try {
        const trip = await getTrip(tripId);
        const [participants, expenses] = await Promise.all([
            getParticipantsByTrip(tripId),
            getExpensesByTrip(tripId)
        ]);

        // Render Trip Info
        document.getElementById('detail-trip-name').textContent = trip.tripName;
        document.getElementById('detail-dest').textContent = trip.destination;
        document.getElementById('detail-type').textContent = trip.tripType || 'General';
        document.getElementById('detail-budget').textContent = `₹${trip.budget}`;
        document.getElementById('detail-part-count').textContent = participants.length;

        // Render Participants
        const pTbody = document.getElementById('detail-participants');
        if (participants.length === 0) {
            pTbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No participants added yet.</td></tr>`;
        } else {
            pTbody.innerHTML = participants.map(p => `
                <tr>
                    <td><strong>${p.name}</strong></td>
                    <td>${p.age}</td>
                    <td>${p.email}</td>
                    <td>${p.phone}</td>
                </tr>
            `).join('');
        }

        // Render Expenses
        const eTbody = document.getElementById('detail-expenses');
        if (expenses.length === 0) {
            eTbody.innerHTML = `<tr><td colspan="3" class="text-center text-muted">No expenses recorded.</td></tr>`;
        } else {
            eTbody.innerHTML = expenses.map(e => {
                const part = participants.find(p => p.id === e.participantId);
                const partName = part ? part.name : `Participant ${e.participantId}`;
                return `
                    <tr>
                        <td>${partName}</td>
                        <td>₹${e.totalBudget}</td>
                        <td>₹${e.share}</td>
                    </tr>
                `;
            }).join('');
        }

        // Render Settlement Summary
        const sTbody = document.getElementById('detail-settlements');
        const balances = {};
        participants.forEach(p => {
            balances[p.id] = { name: p.name, paid: 0, share: 0, balance: 0 };
        });
        
        expenses.forEach(e => {
            if (balances[e.participantId]) {
                balances[e.participantId].paid += e.totalBudget || 0;
                balances[e.participantId].share += e.share || 0;
            }
        });

        const rows = Object.values(balances).map(b => {
            b.balance = b.share - b.paid;
            const balanceStr = b.balance > 0 ? `₹${b.balance.toFixed(2)} (Owes)` : (b.balance < 0 ? `+₹${Math.abs(b.balance).toFixed(2)} (Receives)` : `₹0 (Settled)`);
            const colorClass = b.balance > 0 ? 'text-danger' : (b.balance < 0 ? 'text-success' : '');
            
            return `
                <tr>
                    <td><strong>${b.name}</strong></td>
                    <td>₹${b.paid.toFixed(2)}</td>
                    <td>₹${b.share.toFixed(2)}</td>
                    <td class="${colorClass}">${balanceStr}</td>
                </tr>
            `;
        }).join('');
        
        sTbody.innerHTML = rows || `<tr><td colspan="4" class="text-center text-muted">No data available.</td></tr>`;

    } catch (error) {
        showToast('Error loading details: ' + error.message, 'error');
    }
}
