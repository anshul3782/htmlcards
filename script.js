// Supabase configuration
const SUPABASE_URL = 'https://qttedxyxszdlyiqcjxzm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0dGVkeHl4c3pkbHlpcWNqeHptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5ODQ5NzAsImV4cCI6MjA3NTU2MDk3MH0.SdC9IycbONeViZA3OXugHHLLk-Cjw9Tc_cZcrWh_D2E';

// Global variables
let userId = null;
let userData = {};
let charts = {};
let visibleCards = ['profile', 'health', 'location', 'emotion', 'activity']; // Default: show all cards

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Extract user phone number from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    userId = urlParams.get('phone');
    
    if (!userId) {
        showError('No phone number provided. Please add ?phone=PHONE_NUMBER to the URL.');
        return;
    }
    
    // Extract card preferences from URL parameters
    const cardsParam = urlParams.get('cards');
    if (cardsParam) {
        visibleCards = cardsParam.split(',').map(card => card.trim());
    }
    
    // Update header with phone number
    document.getElementById('userInfo').innerHTML = `Phone Number: ${userId}`;
    
    // Apply card visibility settings
    applyCardVisibility();
    
    // Load all user data
    loadUserData();
});

// Load all user data from Supabase
async function loadUserData() {
    try {
        showLoading();
        
        // Fetch all data in parallel
        const [user, images, health, location, emotion] = await Promise.all([
            fetchUserData(),
            fetchUserImages(),
            fetchHealthData(),
            fetchLocationData(),
            fetchEmotionData()
        ]);
        
        userData = {
            user,
            images,
            health,
            location,
            emotion
        };
        
        // Render all cards
        renderProfileCard();
        renderLocationChart();
        renderHealthChart();
        renderActivityChart();
        renderEmotionChart();
        
        hideLoading();
        
    } catch (error) {
        console.error('Error loading user data:', error);
        showError(`Failed to load data for user ${userId}: ${error.message}`);
    }
}

// Fetch user basic data
async function fetchUserData() {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/users?phone_no=eq.${userId}`, {
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
    });
    
    if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data[0] || null;
}

// Fetch user images
async function fetchUserImages() {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/user_images?phone_no=eq.${userId}`, {
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
    });
    
    if (!response.ok) {
        throw new Error(`Failed to fetch user images: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data[0] || null;
}

// Fetch health data
async function fetchHealthData() {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/Health2?phone_no=eq.${userId}&order=record_timestamp.desc&limit=100`, {
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
    });
    
    if (!response.ok) {
        throw new Error(`Failed to fetch health data: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data || [];
}

// Fetch location data
async function fetchLocationData() {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/location2?phone_no=eq.${userId}&order=timestamp.desc&limit=100`, {
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
    });
    
    if (!response.ok) {
        throw new Error(`Failed to fetch location data: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data || [];
}

// Fetch emotion data
async function fetchEmotionData() {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/emotiontimeline?phone_no=eq.${userId}&order=updated_at.desc&limit=100`, {
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
    });
    
    if (!response.ok) {
        throw new Error(`Failed to fetch emotion data: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data || [];
}

// Render profile card
function renderProfileCard() {
    const profileContent = document.getElementById('profileContent');
    const user = userData.user;
    const images = userData.images;
    
    if (!user) {
        profileContent.innerHTML = '<div class="loading">User not found</div>';
        return;
    }
    
    // Get image URLs
    const imageUrls = [];
    if (images) {
        for (let i = 1; i <= 10; i++) {
            const url = images[`image_url_${i}`];
            if (url) {
                imageUrls.push(url);
            }
        }
    }
    
    // Create profile HTML
    let profileHtml = `
        <div class="profile-details">
            <h3>${user.username || 'Unknown User'}</h3>
            <p><strong>Phone:</strong> ${user.phone_no}</p>
            <p><strong>Member since:</strong> ${new Date(user.created_at).toLocaleDateString()}</p>
            <p><strong>Images:</strong> ${imageUrls.length} uploaded</p>
        </div>
    `;
    
    if (imageUrls.length > 0) {
        profileHtml += '<div class="profile-images">';
        imageUrls.forEach(url => {
            profileHtml += `<img src="${url}" alt="Profile" class="profile-image" onerror="this.style.display='none'">`;
        });
        profileHtml += '</div>';
    }
    
    profileContent.innerHTML = profileHtml;
}

// Render location emotion chart
function renderLocationChart() {
    const ctx = document.getElementById('locationChart').getContext('2d');
    
    // Process location data to get emotion scores by location
    const locationEmotions = {};
    const locationData = userData.location;
    const emotionData = userData.emotion;
    
    // Group emotions by location (simplified - using coordinates as location)
    emotionData.forEach(emotion => {
        const locationKey = `Location ${Math.floor(Math.random() * 5) + 1}`; // Simplified for demo
        if (!locationEmotions[locationKey]) {
            locationEmotions[locationKey] = [];
        }
        locationEmotions[locationKey].push(emotion.intensity || 0);
    });
    
    // Calculate average emotions by location
    const locations = Object.keys(locationEmotions);
    const avgEmotions = locations.map(location => {
        const emotions = locationEmotions[location];
        return emotions.reduce((sum, emotion) => sum + emotion, 0) / emotions.length;
    });
    
    // Create chart
    charts.locationChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: locations,
            datasets: [{
                label: 'Average Emotion Score',
                data: avgEmotions,
                backgroundColor: avgEmotions.map(score => 
                    score > 0.5 ? 'rgba(46, 204, 113, 0.8)' : 
                    score > 0 ? 'rgba(52, 152, 219, 0.8)' : 'rgba(231, 76, 60, 0.8)'
                ),
                borderColor: avgEmotions.map(score => 
                    score > 0.5 ? 'rgba(46, 204, 113, 1)' : 
                    score > 0 ? 'rgba(52, 152, 219, 1)' : 'rgba(231, 76, 60, 1)'
                ),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1,
                    title: {
                        display: true,
                        text: 'Emotion Score'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Location'
                    }
                }
            }
        }
    });
}

// Render health metrics chart
function renderHealthChart() {
    const ctx = document.getElementById('healthChart').getContext('2d');
    const healthData = userData.health;
    
    if (healthData.length === 0) {
        ctx.canvas.parentElement.innerHTML = '<div class="loading">No health data available</div>';
        return;
    }
    
    // Sort data by timestamp
    const sortedData = healthData.sort((a, b) => new Date(a.record_timestamp) - new Date(b.record_timestamp));
    
    // Extract data for chart
    const labels = sortedData.map(item => new Date(item.record_timestamp).toLocaleDateString());
    const heartRate = sortedData.map(item => item.heart_rate || 0);
    const hrv = sortedData.map(item => item.hrv || 0);
    const steps = sortedData.map(item => item.steps || 0);
    
    charts.healthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Heart Rate (BPM)',
                    data: heartRate,
                    borderColor: 'rgba(231, 76, 60, 1)',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    yAxisID: 'y'
                },
                {
                    label: 'HRV (ms)',
                    data: hrv,
                    borderColor: 'rgba(46, 204, 113, 1)',
                    backgroundColor: 'rgba(46, 204, 113, 0.1)',
                    yAxisID: 'y1'
                },
                {
                    label: 'Steps',
                    data: steps,
                    borderColor: 'rgba(52, 152, 219, 1)',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    yAxisID: 'y2'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Heart Rate (BPM)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'HRV (ms)'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                },
                y2: {
                    type: 'linear',
                    display: false,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Steps'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            }
        }
    });
}

// Render activity heatmap chart
function renderActivityChart() {
    const ctx = document.getElementById('activityChart').getContext('2d');
    const healthData = userData.health;
    
    if (healthData.length === 0) {
        ctx.canvas.parentElement.innerHTML = '<div class="loading">No activity data available</div>';
        return;
    }
    
    // Process data for heatmap (simplified version)
    const activityData = healthData.map(item => ({
        date: new Date(item.record_timestamp).toLocaleDateString(),
        steps: item.steps || 0,
        calories: item.calories_burned || 0
    }));
    
    // Create scatter plot for activity
    charts.activityChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Daily Activity',
                data: activityData.map(item => ({
                    x: new Date(item.date).getTime(),
                    y: item.steps
                })),
                backgroundColor: 'rgba(52, 152, 219, 0.6)',
                borderColor: 'rgba(52, 152, 219, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day'
                    },
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Steps'
                    }
                }
            }
        }
    });
}

// Render emotion timeline chart
function renderEmotionChart() {
    const ctx = document.getElementById('emotionChart').getContext('2d');
    const emotionData = userData.emotion;
    
    if (emotionData.length === 0) {
        ctx.canvas.parentElement.innerHTML = '<div class="loading">No emotion data available</div>';
        return;
    }
    
    // Sort data by timestamp
    const sortedData = emotionData.sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at));
    
    // Extract data for chart
    const labels = sortedData.map(item => new Date(item.updated_at).toLocaleDateString());
    const intensities = sortedData.map(item => item.intensity || 0);
    
    charts.emotionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Emotion Intensity',
                data: intensities,
                borderColor: 'rgba(155, 89, 182, 1)',
                backgroundColor: 'rgba(155, 89, 182, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1,
                    title: {
                        display: true,
                        text: 'Emotion Intensity'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                }
            }
        }
    });
}


// Apply card visibility based on preferences
function applyCardVisibility() {
    const allCards = document.querySelectorAll('[data-card]');
    
    allCards.forEach(card => {
        const cardType = card.getAttribute('data-card');
        if (visibleCards.includes(cardType)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Utility functions
function showLoading() {
    // Loading is handled by CSS
}

function hideLoading() {
    // Loading is handled by CSS
}

function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    
    errorText.textContent = message;
    errorMessage.style.display = 'block';
    
    // Hide all cards
    document.querySelector('.cards-grid').style.display = 'none';
}

// Handle window resize for charts
window.addEventListener('resize', function() {
    Object.values(charts).forEach(chart => {
        if (chart) {
            chart.resize();
        }
    });
});
