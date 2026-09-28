document.addEventListener('DOMContentLoaded', () => {
    injectSidebar('settlements');
    initPage();
});

let allTrips = [];
let allParticipants = [];
let currentTripExpenses = [];
let currentSettlements = [];

async function initPage() {
    try {
        const [trips, participants] = await Promise.all([
            getTrips(),
            getParticipants()
        ]);
        allTrips = trips || [];
        allParticipants = participants || [];
        
        populateTripSelect();
    } catch (error) {
        showToast('Failed to load trips', 'error');
    }
}

function populateTripSelect() {
    const select = document.getElementById('trip-select');
    const options = allTrips.map(t => `<option value="${t.id}">${t.tripName}</option>`).join('');
    select.innerHTML = `<option value="">Select a trip</option>` + options;
}

async function loadSettlementData() {
    const tripId = document.getElementById('trip-select').value;
    
    document.getElementById('summary-section').classList.add('hidden');
    document.getElementById('transactions-section').classList.add('hidden');
    document.getElementById('calc-btn').disabled = true;
    
    if (!tripId) {
        document.getElementById('empty-state').classList.remove('hidden');
        return;
    }

    document.getElementById('empty-state').classList.add('hidden');
    
    try {
        const [expenses, settlements] = await Promise.all([
            getExpensesByTrip(tripId),
            getSettlementsByTrip(tripId)
        ]);
        
        currentTripExpenses = expenses || [];
        currentSettlements = settlements || [];
        
        document.getElementById('calc-btn').disabled = false;
        
        renderBalances();
        renderTransactions();
        
        document.getElementById('summary-section').classList.remove('hidden');
        document.getElementById('transactions-section').classList.remove('hidden');
        
    } catch (error) {
        showToast('Failed to load settlement data: ' + error.message, 'error');
    }
}

function renderBalances() {
    const tripId = document.getElementById('trip-select').value;
    const tripParts = allParticipants.filter(p => p.tripId == tripId);
    const trip = allTrips.find(t => t.id == tripId);
    
    // Each participant owes an equal share of the total trip budget
    const totalTripBudget = trip ? (trip.budget || 0) : 0;
    const baseShare = tripParts.length > 0 ? (totalTripBudget / tripParts.length) : 0;
    
    const balances = {};
    tripParts.forEach(p => {
        balances[p.id] = {
            name: p.name,
            paid: 0,
            share: baseShare,
            balance: 0
        };
    });
    
    currentTripExpenses.forEach(exp => {
        if (balances[exp.participantId]) {
            balances[exp.participantId].paid += exp.totalBudget || 0;
            // We use the baseShare for everyone, so we ignore exp.share to avoid double counting if multiple expenses exist
        }
    });

    const tbody = document.getElementById('balances-table-body');
    
    const rows = Object.values(balances).map(b => {
        // Balance = Share - Paid
        b.balance = b.share - b.paid;
        
        let statusBadge = '';
        if (Math.abs(b.balance) < 0.01) {
            statusBadge = '<span class="badge badge-success">SETTLED</span>';
        } else if (b.balance > 0) {
            statusBadge = '<span class="badge badge-danger">OWES</span>';
        } else {
            statusBadge = '<span class="badge badge-primary">RECEIVES</span>';
        }
        
        return `
            <tr>
                <td><strong>${b.name}</strong></td>
                <td>₹${b.paid.toFixed(2)}</td>
                <td>₹${b.share.toFixed(2)}</td>
                <td class="${b.balance > 0 ? 'text-danger' : (b.balance < 0 ? 'text-success' : '')}">
                    ${b.balance > 0 ? '' : (b.balance < 0 ? '+' : '')}₹${Math.abs(b.balance).toFixed(2)}
                </td>
                <td>${statusBadge}</td>
            </tr>
        `;
    }).join('');
    
    if (rows) {
        tbody.innerHTML = rows;
    } else {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No participants in this trip.</td></tr>`;
    }
}

function renderTransactions() {
    const container = document.getElementById('transactions-container');
    
    if (currentSettlements.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="padding: 2rem 1rem;">
                <div class="empty-state-title">No transactions generated</div>
                <div class="empty-state-desc">Click "Calculate Settlement" to generate settlement transactions based on expenses.</div>
            </div>
        `;
        return;
    }

    container.innerHTML = currentSettlements.map(settle => {
        const fromPart = allParticipants.find(p => p.id === settle.fromParticipantId);
        const toPart = allParticipants.find(p => p.id === settle.toParticipantId);
        
        const fromName = fromPart ? fromPart.name : `ID: ${settle.fromParticipantId}`;
        const toName = toPart ? toPart.name : `ID: ${settle.toParticipantId}`;
        
        const isPaid = settle.status === 'PAID';
        
        return `
            <div class="transaction-card">
                <div class="transaction-info">
                    <div class="user-avatar">${fromName.charAt(0)}</div>
                    <div>
                        <strong>${fromName}</strong>
                        <div class="text-muted" style="font-size: 0.75rem;">Pays</div>
                    </div>
                    
                    <div class="arrow">➔</div>
                    
                    <div class="user-avatar">${toName.charAt(0)}</div>
                    <div>
                        <strong>${toName}</strong>
                        <div class="text-muted" style="font-size: 0.75rem;">Receives</div>
                    </div>
                </div>
                
                <div style="text-align: right;">
                    <div class="amount">₹${settle.amount.toFixed(2)}</div>
                    <div class="mt-2">
                        ${isPaid 
                            ? `<span class="badge badge-success">PAID</span>` 
                            : `<span class="badge badge-warning">PENDING</span>
                               <button class="btn btn-sm btn-primary ml-2" onclick="markPaid(${settle.id})" style="margin-left: 0.5rem;">Mark as Paid</button>`
                        }
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

async function markPaid(id) {
    try {
        await markSettlementPaid(id);
        showToast('Settlement marked as paid');
        loadSettlementData();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function calculateSettlements() {
    const tripId = document.getElementById('trip-select').value;
    if (!tripId) return;

    const btn = document.getElementById('calc-btn');
    btn.disabled = true;
    btn.textContent = 'Calculating settlement...';

    try {
        // Backend doesn't have calculate endpoint. We do it client side based on balances.
        // Balance = Share - Paid
        // > 0 = Owes
        // < 0 = Receives
        
        const tripParts = allParticipants.filter(p => p.tripId == tripId);
        const trip = allTrips.find(t => t.id == tripId);
        
        const totalTripBudget = trip ? (trip.budget || 0) : 0;
        const baseShare = tripParts.length > 0 ? (totalTripBudget / tripParts.length) : 0;
        
        const balances = {};
        tripParts.forEach(p => balances[p.id] = { id: p.id, balance: baseShare });
        
        currentTripExpenses.forEach(exp => {
            if (balances[exp.participantId]) {
                const paid = exp.totalBudget || 0;
                balances[exp.participantId].balance -= paid;
            }
        });
        
        let debtors = [];
        let creditors = [];
        
        Object.values(balances).forEach(b => {
            if (b.balance > 0.01) debtors.push({ id: b.id, amount: b.balance });
            else if (b.balance < -0.01) creditors.push({ id: b.id, amount: Math.abs(b.balance) });
        });
        
        // Greedy algorithm for settling
        debtors.sort((a,b) => b.amount - a.amount);
        creditors.sort((a,b) => b.amount - a.amount);
        
        const newSettlements = [];
        let d = 0;
        let c = 0;
        
        while (d < debtors.length && c < creditors.length) {
            const debtor = debtors[d];
            const creditor = creditors[c];
            
            const settleAmount = Math.min(debtor.amount, creditor.amount);
            
            if (settleAmount > 0.01) {
                newSettlements.push({
                    tripId: parseInt(tripId),
                    fromParticipantId: debtor.id,
                    toParticipantId: creditor.id,
                    amount: parseFloat(settleAmount.toFixed(2))
                });
            }
            
            debtor.amount -= settleAmount;
            creditor.amount -= settleAmount;
            
            if (debtor.amount < 0.01) d++;
            if (creditor.amount < 0.01) c++;
        }
        
        // Delete old pending settlements (optional, but good for recalculating)
        for (let old of currentSettlements) {
            if (old.status === 'PENDING') {
                try {
                    await deleteSettlement(old.id);
                } catch(e) {}
            }
        }
        
        // Save new settlements
        for (let ns of newSettlements) {
            await createSettlement(ns);
        }
        
        showToast('Settlement calculated successfully');
        await loadSettlementData();
        
    } catch (error) {
        showToast('Error calculating settlement: ' + error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Calculate Settlement';
    }
}
