document.addEventListener('DOMContentLoaded', () => {
    injectSidebar('trips');
    loadTrips();
});

let allTrips = [];

async function loadTrips() {
    const container = document.getElementById('trips-container');
    try {
        allTrips = await getTrips();
        renderTrips();
    } catch (error) {
        showToast('Failed to load trips', 'error');
        container.innerHTML = `<div class="empty-state text-danger">Failed to load trips.</div>`;
    }
}

function renderTrips() {
    const container = document.getElementById('trips-container');
    if (!allTrips || allTrips.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-state-icon">🏕️</div>
                <div class="empty-state-title">No trips yet</div>
                <div class="empty-state-desc">Create your first trip to get started.</div>
                <button class="btn btn-primary" onclick="openCreateModal()">+ Create Trip</button>
            </div>
        `;
        return;
    }

    container.innerHTML = allTrips.map(trip => `
        <div class="card">
            <div class="flex justify-between items-start mb-2">
                <h3 style="font-size:1.25rem; font-weight: 600;">${trip.tripName}</h3>
                <span class="badge badge-primary">${trip.tripType || 'General'}</span>
            </div>
            <div class="text-muted mb-4">📍 ${trip.destination}</div>
            
            <div class="flex justify-between mb-4 text-sm">
                <div>
                    <div class="card-title" style="font-size:0.7rem;">Budget</div>
                    <div style="font-weight:600;">₹${trip.budget}</div>
                </div>
                <div>
                    <div class="card-title" style="font-size:0.7rem;">Participants</div>
                    <div style="font-weight:600;">${trip.participants || 0}</div>
                </div>
            </div>

            <div class="flex gap-2 mt-4" style="border-top: 1px solid var(--border-color); padding-top: 1rem;">
                <a href="trip-details.html?id=${trip.id}" class="btn btn-primary btn-sm" style="flex: 1;">View</a>
                <button class="btn btn-secondary btn-sm" onclick="openEditModal(${trip.id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="handleDelete(${trip.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

function openCreateModal() {
    document.getElementById('trip-id').value = '';
    document.getElementById('trip-form').reset();
    document.getElementById('trip-modal-title').textContent = 'Create Trip';
    openModal('trip-modal');
}

function openEditModal(id) {
    const trip = allTrips.find(t => t.id === id);
    if (!trip) return;

    document.getElementById('trip-id').value = trip.id;
    document.getElementById('trip-name').value = trip.tripName;
    document.getElementById('trip-destination').value = trip.destination;
    document.getElementById('trip-type').value = trip.tripType || '';
    document.getElementById('trip-budget').value = trip.budget;

    document.getElementById('trip-modal-title').textContent = 'Edit Trip';
    openModal('trip-modal');
}

async function saveTrip() {
    const form = document.getElementById('trip-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const id = document.getElementById('trip-id').value;
    const data = {
        tripName: document.getElementById('trip-name').value,
        destination: document.getElementById('trip-destination').value,
        tripType: document.getElementById('trip-type').value,
        budget: parseFloat(document.getElementById('trip-budget').value)
    };

    const btn = document.getElementById('save-trip-btn');
    btn.disabled = true;
    btn.textContent = 'Saving...';

    try {
        if (id) {
            data.id = parseInt(id);
            await updateTrip(data);
            showToast('Trip updated successfully');
        } else {
            // Note: participants count starts at 0 for new trip
            data.participants = 0; 
            await createTrip(data);
            showToast('Trip created successfully');
        }
        closeModal('trip-modal');
        await loadTrips();
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Save Trip';
    }
}

async function handleDelete(id) {
    // The backend does not have a delete trip API endpoint according to controllers.
    // So we will just show an alert toast for now instead of failing silently.
    if(confirm("Are you sure you want to delete this trip?")) {
        try {
            await deleteTrip(id);
            // If the API magically works
            showToast('Trip deleted');
            loadTrips();
        } catch (error) {
            showToast(error.message, 'error');
        }
    }
}
