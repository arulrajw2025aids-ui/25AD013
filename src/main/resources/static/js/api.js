// Base URL (relative since we are serving from Spring Boot)
const API_BASE = '/api';

// Core Fetch Wrapper
async function apiRequest(url, options = {}) {
    const defaultHeaders = {
        'Content-Type': 'application/json'
    };
    
    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    };
    
    // If data is passed instead of body, convert it
    if (config.data) {
        config.body = JSON.stringify(config.data);
        delete config.data;
    }

    try {
        const response = await fetch(API_BASE + url, config);
        
        if (!response.ok) {
            let errorMessage = "Request failed";
            try {
                const errorData = await response.text();
                if(errorData) {
                    try {
                        const errorJson = JSON.parse(errorData);
                        errorMessage = errorJson.message || errorMessage;
                    } catch(e) {
                        errorMessage = errorData;
                    }
                }
            } catch (e) {
                console.error("Error reading error response", e);
            }
            throw new Error(errorMessage || `HTTP Error ${response.status}`);
        }
        
        // Handle 204 No Content or empty responses
        if (response.status === 204) {
            return null;
        }
        
        const text = await response.text();
        if (!text) return null;
        
        try {
            return JSON.parse(text);
        } catch (e) {
            // Backend sometimes returns raw strings (like "Expense deleted successfully") instead of JSON
            return text;
        }
        
    } catch (error) {
        console.error(`API Error (${url}):`, error);
        throw error;
    }
}

// ==========================================
// TRIPS API
// ==========================================
async function getTrips() {
    return apiRequest('/trip/getall');
}

async function createTrip(data) {
    return apiRequest('/trip/create', {
        method: 'POST',
        data: data
    });
}

async function updateTrip(data) {
    return apiRequest('/trip/update', {
        method: 'PUT',
        data: data
    });
}

async function deleteTrip(id) {
    return apiRequest(`/trip/delete/${id}`, {
        method: 'DELETE'
    });
}

// NOTE: Backend does not have a getTrip by ID API. We will fetch all and filter.
async function getTrip(id) {
    const trips = await getTrips();
    const trip = trips.find(t => t.id == id);
    if (!trip) throw new Error("Trip not found");
    return trip;
}

// ==========================================
// PARTICIPANTS API
// ==========================================
async function getParticipants() {
    return apiRequest('/participant/getall');
}

async function createParticipant(data) {
    return apiRequest('/participant/create', {
        method: 'POST',
        data: data
    });
}

async function updateParticipant(data) {
    return apiRequest('/participant/update', {
        method: 'PUT',
        data: data
    });
}

async function deleteParticipant(id) {
    return apiRequest(`/participant/delete/${id}`, {
        method: 'DELETE'
    });
}

// Backend does not have getParticipantsByTrip. Fetch all and filter.
async function getParticipantsByTrip(tripId) {
    const participants = await getParticipants();
    return participants.filter(p => p.tripId == tripId);
}

// ==========================================
// EXPENSES API
// ==========================================
async function getExpenses() {
    return apiRequest('/expense/getall');
}

async function createExpense(data) {
    return apiRequest('/expense/create', {
        method: 'POST',
        data: data
    });
}

async function updateExpense(data) {
    return apiRequest('/expense/update', {
        method: 'PUT',
        data: data
    });
}

async function deleteExpense(id) {
    return apiRequest(`/expense/delete/${id}`, {
        method: 'DELETE'
    });
}

// Backend does not have getExpensesByTrip. Fetch all and filter.
async function getExpensesByTrip(tripId) {
    const expenses = await getExpenses();
    return expenses.filter(e => e.tripId == tripId);
}

// ==========================================
// SETTLEMENTS API
// ==========================================
async function getSettlements() {
    return apiRequest('/settlements');
}

async function getSettlementsByTrip(tripId) {
    return apiRequest(`/settlements/trip/${tripId}`);
}

async function createSettlement(data) {
    return apiRequest('/settlements', {
        method: 'POST',
        data: data
    });
}

async function updateSettlement(data) {
    return apiRequest('/settlements', {
        method: 'PUT',
        data: data
    });
}

async function markSettlementPaid(id) {
    return apiRequest(`/settlements/${id}/paid`, {
        method: 'PUT'
    });
}

async function deleteSettlement(id) {
    return apiRequest(`/settlements/${id}`, {
        method: 'DELETE'
    });
}

// The user requested calculateSettlement via POST /api/settlements/calculate/{tripId} ONLY IF it exists.
// Looking at SettlementController.java, it DOES NOT exist. There are only CRUD methods.
// We will have to calculate it on the frontend or tell the user the API is missing.
// I will write the function that throws an error, or we can just fetch and calculate client side if we have to.
// Actually, the prompt says "Do not calculate settlement independently in JavaScript if the backend already performs the calculation."
// But the backend doesn't seem to perform the calculation! The only POST is `createSettlement(Settlement data)`.
// I will check SettlementServices to see if it does anything special. (I can't see it right now, but SettlementController only maps POST to createSettlement).
// I will implement a client-side calculation ONLY as a fallback, or just create individual Settlements directly.
// Wait, the prompt says "The backend must remain the source of truth."
// Let me look at SettlementServices to be absolutely sure.
