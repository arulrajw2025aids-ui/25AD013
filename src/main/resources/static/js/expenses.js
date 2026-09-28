document.addEventListener('DOMContentLoaded', () => {
    injectSidebar('expenses');
    loadData();
});

let allExpenses = [];
let allTrips = [];
let allParticipants = [];

async function loadData() {
    try {
        const [trips, participants, expenses] = await Promise.all([
            getTrips(),
            getParticipants(),
            getExpenses()
        ]);
        allTrips = trips || [];
        allParticipants = participants || [];
        allExpenses = expenses || [];
        
        populateTripSelects();
        renderExpenses();
    } catch (error) {
        showToast('Failed to load data', 'error');
        document.getElementById('expenses-table-body').innerHTML = `<tr><td colspan="5" class="text-danger">Failed to load data.</td></tr>`;
    }
}

function populateTripSelects() {
    const filter = document.getElementById('trip-filter');
    const formSelect = document.getElementById('exp-trip-id');
    
    const options = allTrips.map(t => `<option value="${t.id}">${t.tripName}</option>`).join('');
    
    filter.innerHTML = `<option value="">All Trips</option>` + options;
    formSelect.innerHTML = `<option value="">Select a trip</option>` + options;
}

function populateParticipantsForTrip() {
    const tripId = document.getElementById('exp-trip-id').value;
    const partSelect = document.getElementById('exp-part-id');
    const totalInput = document.getElementById('exp-total');
    const shareInput = document.getElementById('exp-share');
    
    if (!tripId) {
        partSelect.innerHTML = `<option value="">Select a trip first</option>`;
        totalInput.value = '';
        shareInput.value = '';
        return;
    }

    const tripParticipants = allParticipants.filter(p => p.tripId == tripId);
    
    const trip = allTrips.find(t => t.id == tripId);
    if (trip) {
        totalInput.value = parseFloat(trip.budget || 0).toFixed(2);
        const count = tripParticipants.length > 0 ? tripParticipants.length : 1;
        shareInput.value = (parseFloat(trip.budget || 0) / count).toFixed(2);
    }
    
    if (tripParticipants.length === 0) {
        partSelect.innerHTML = `<option value="">No participants in this trip</option>`;
        return;
    }

    partSelect.innerHTML = `<option value="">Select a participant</option>` + 
        tripParticipants.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
}

function filterExpenses() {
    renderExpenses();
}

function renderExpenses() {
    const tbody = document.getElementById('expenses-table-body');
    const filterTripId = document.getElementById('trip-filter').value;
    
    let filtered = allExpenses;
    if (filterTripId) {
        filtered = filtered.filter(e => e.tripId == filterTripId);
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted" style="text-align:center; padding: 2rem;">No expenses recorded yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(e => {
        const trip = allTrips.find(t => t.id === e.tripId);
        const part = allParticipants.find(p => p.id === e.participantId);
        
        const tripName = trip ? trip.tripName : `Trip ${e.tripId}`;
        const partName = part ? part.name : `Participant ${e.participantId}`;
        
        return `
            <tr>
                <td><span class="badge badge-primary">${tripName}</span></td>
                <td><strong>${partName}</strong></td>
                <td>₹${e.totalBudget}</td>
                <td>₹${e.share}</td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="openEditModal(${e.id})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="handleDelete(${e.id})">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

function openCreateModal() {
    if (allTrips.length === 0) {
        showToast('Please create a trip first.', 'warning');
        return;
    }
    
    document.getElementById('exp-id').value = '';
    document.getElementById('expense-form').reset();
    populateParticipantsForTrip();
    document.getElementById('expense-modal-title').textContent = 'Add Expense';
    openModal('expense-modal');
}

function openEditModal(id) {
    const e = allExpenses.find(x => x.id === id);
    if (!e) return;

    document.getElementById('exp-id').value = e.id;
    document.getElementById('exp-trip-id').value = e.tripId;
    populateParticipantsForTrip();
    
    // Set timeout to allow participants to populate before setting value
    setTimeout(() => {
        document.getElementById('exp-part-id').value = e.participantId;
    }, 50);

    document.getElementById('exp-total').value = e.totalBudget;
    document.getElementById('exp-share').value = e.share;

    document.getElementById('expense-modal-title').textContent = 'Edit Expense';
    openModal('expense-modal');
}

async function saveExpense() {
    const form = document.getElementById('expense-form');
    
    const tripIdStr = document.getElementById('exp-trip-id').value;
    const partIdStr = document.getElementById('exp-part-id').value;
    const totalBudgetStr = document.getElementById('exp-total').value;
    const shareStr = document.getElementById('exp-share').value;
    
    // Explicit Validation
    if (!tripIdStr) {
        showToast('❌ Failed to save expense: Please select a trip.', 'error');
        return;
    }
    if (!partIdStr) {
        showToast('❌ Failed to save expense: Please select a participant.', 'error');
        return;
    }
    
    const totalBudget = parseFloat(totalBudgetStr);
    if (isNaN(totalBudget) || totalBudget <= 0) {
        showToast('❌ Failed to save expense: Expense amount must be greater than zero.', 'error');
        return;
    }
    
    const share = parseFloat(shareStr);
    if (isNaN(share) || share <= 0) {
        showToast('❌ Failed to save expense: Participant share must be greater than zero.', 'error');
        return;
    }

    const id = document.getElementById('exp-id').value;
    const data = {
        tripId: parseInt(tripIdStr),
        participantId: parseInt(partIdStr),
        totalBudget: totalBudget,
        share: share
    };

    const btn = document.getElementById('save-exp-btn');
    btn.disabled = true;
    btn.textContent = 'Saving...';

    try {
        if (id) {
            data.id = parseInt(id);
            await updateExpense(data);
            showToast('Expense updated successfully');
        } else {
            await createExpense(data);
            showToast('Expense added successfully');
        }
        closeModal('expense-modal');
        await loadData(); // This refreshes the table instantly
    } catch (error) {
        console.error("Expense save failed:", error);
        showToast(`❌ Failed to save expense: ${error.message}`, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Save Expense';
    }
}

async function handleDelete(id) {
    if(confirm("Are you sure you want to delete this expense?")) {
        try {
            await deleteExpense(id);
            showToast('Expense deleted');
            loadData();
        } catch (error) {
            showToast(error.message, 'error');
        }
    }
}
