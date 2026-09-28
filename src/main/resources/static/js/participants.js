document.addEventListener('DOMContentLoaded', () => {
    injectSidebar('participants');
    loadData();
});

let allParticipants = [];
let allTrips = [];

async function loadData() {
    try {
        const [trips, participants] = await Promise.all([
            getTrips(),
            getParticipants()
        ]);
        allTrips = trips || [];
        allParticipants = participants || [];
        
        populateTripSelects();
        renderParticipants();
    } catch (error) {
        showToast('Failed to load data', 'error');
        document.getElementById('participants-table-body').innerHTML = `<tr><td colspan="6" class="text-danger">Failed to load data.</td></tr>`;
    }
}

function populateTripSelects() {
    const filter = document.getElementById('trip-filter');
    const formSelect = document.getElementById('part-trip-id');
    
    const options = allTrips.map(t => `<option value="${t.id}">${t.tripName}</option>`).join('');
    
    // Preserve "All Trips" for filter
    filter.innerHTML = `<option value="">All Trips</option>` + options;
    formSelect.innerHTML = `<option value="">Select a trip</option>` + options;
}

function filterParticipants() {
    renderParticipants();
}

function renderParticipants() {
    const tbody = document.getElementById('participants-table-body');
    const filterTripId = document.getElementById('trip-filter').value;
    
    let filtered = allParticipants;
    if (filterTripId) {
        filtered = filtered.filter(p => p.tripId == filterTripId);
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted" style="text-align:center; padding: 2rem;">No participants found.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(p => {
        const trip = allTrips.find(t => t.id === p.tripId);
        const tripName = trip ? trip.tripName : `Unknown Trip (ID: ${p.tripId})`;
        
        return `
            <tr>
                <td><strong>${p.name}</strong></td>
                <td>${p.age}</td>
                <td>${p.email}</td>
                <td>${p.phone}</td>
                <td><span class="badge badge-primary">${tripName}</span></td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="openEditModal(${p.id})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="handleDelete(${p.id})">Delete</button>
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
    
    document.getElementById('part-id').value = '';
    document.getElementById('participant-form').reset();
    document.getElementById('participant-modal-title').textContent = 'Add Participant';
    openModal('participant-modal');
}

function openEditModal(id) {
    const p = allParticipants.find(x => x.id === id);
    if (!p) return;

    document.getElementById('part-id').value = p.id;
    document.getElementById('part-trip-id').value = p.tripId;
    document.getElementById('part-name').value = p.name;
    document.getElementById('part-age').value = p.age;
    document.getElementById('part-email').value = p.email;
    document.getElementById('part-phone').value = p.phone;

    document.getElementById('participant-modal-title').textContent = 'Edit Participant';
    openModal('participant-modal');
}

async function saveParticipant() {
    const form = document.getElementById('participant-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const id = document.getElementById('part-id').value;
    const data = {
        tripId: parseInt(document.getElementById('part-trip-id').value),
        name: document.getElementById('part-name').value,
        age: parseInt(document.getElementById('part-age').value),
        email: document.getElementById('part-email').value,
        phone: document.getElementById('part-phone').value
    };

    const btn = document.getElementById('save-part-btn');
    btn.disabled = true;
    btn.textContent = 'Saving...';

    try {
        if (id) {
            data.id = parseInt(id);
            await updateParticipant(data);
            showToast('Participant updated');
        } else {
            await createParticipant(data);
            showToast('Participant added');
            
            // Optionally we should update the participant count in trip here, 
            // but the backend trip entity just has an int field that we'd have to update manually
            // We will let the backend handle it or just rely on calculating it dynamically.
        }
        closeModal('participant-modal');
        await loadData();
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Save';
    }
}

async function handleDelete(id) {
    if(confirm("Are you sure you want to delete this participant?")) {
        try {
            await deleteParticipant(id);
            showToast('Participant deleted');
            loadData();
        } catch (error) {
            showToast(error.message, 'error');
        }
    }
}
