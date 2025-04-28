// Check if user is logged in
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // If on login/register page and already logged in, redirect to profile
    if (window.location.pathname.includes('index.html') && currentUser) {
        window.location.href = 'profile.html';
    }
    
    // If on profile/dashboard and not logged in, redirect to login
    if ((window.location.pathname.includes('profile.html') || 
         window.location.pathname.includes('dashboard.html')) && !currentUser) {
        window.location.href = 'index.html';
    }
    
    // Load user data on profile page
    if (window.location.pathname.includes('profile.html') && currentUser) {
        document.getElementById('profile-name').textContent = currentUser.name;
        document.getElementById('profile-email').textContent = currentUser.email;
        document.getElementById('join-date').textContent = new Date(currentUser.joinDate).toLocaleDateString();
    }
    
    // Load username on dashboard
    if (window.location.pathname.includes('dashboard.html') && currentUser) {
        document.getElementById('dashboard-username').textContent = currentUser.name;
    }
});

// Login functionality
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            window.location.href = 'profile.html';
        } else {
            alert('Invalid email or password');
        }
    });
}

// Registration functionality
if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const confirm = document.getElementById('reg-confirm').value;
        
        if (password !== confirm) {
            alert('Passwords do not match');
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        if (users.some(u => u.email === email)) {
            alert('Email already registered');
            return;
        }
        
        const newUser = {
            name,
            email,
            password,
            joinDate: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        
        window.location.href = 'profile.html';
    });
}

// Tab switching
function openTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    event.currentTarget.classList.add('active');
}

// Logout functionality
const logoutButtons = document.querySelectorAll('#logout-btn, #dashboard-logout');
logoutButtons.forEach(button => {
    if (button) {
        button.addEventListener('click', function() {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }
});