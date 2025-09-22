let currentUser = null;

function showLogin() {
    document.getElementById('authContainer').style.display = 'flex';
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('addProductForm').style.display = 'none';
    document.body.style.overflow = 'hidden';
}

function showRegister() {
    document.getElementById('authContainer').style.display = 'flex';
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.getElementById('addProductForm').style.display = 'none';
    document.body.style.overflow = 'hidden';
}

function showAddProductForm() {
    document.getElementById('authContainer').style.display = 'flex';
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('addProductForm').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function hideAuth() {
    document.getElementById('authContainer').style.display = 'none';
    document.body.style.overflow = '';
}

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const userType = document.querySelector('input[name="userType"]:checked').value;

    try {
        const response = await fetch('backend/api/customers.php?action=login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, userType })
        });
        const result = await response.json();

        if (result.success) {
            currentUser = result.user;
            hideAuth();
            updateNavigation();
            if (userType === 'admin') {
                showAdminDashboard();
            } else {
                showCustomerDashboard();
            }
        } else {
            alert(result.message || 'Login gagal!');
        }
    } catch (error) {
        console.error('Error login:', error);
        alert('Terjadi kesalahan saat login!');
    }
    return false;
}

async function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('regName').value;
    const phone = document.getElementById('regPhone').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;

    if (password !== confirmPassword) {
        alert('Password dan konfirmasi password tidak sama!');
        return false;
    }

    try {
        const response = await fetch('backend/api/customers.php?action=register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone, email, password })
        });
        const result = await response.json();

        if (result.success) {
            alert('Pendaftaran berhasil! Silakan login.');
            showLogin();
        } else {
            alert(result.message || 'Gagal mendaftar!');
        }
    } catch (error) {
        console.error('Error registrasi:', error);
        alert('Terjadi kesalahan saat registrasi!');
    }
    return false;
}

function logout() {
    currentUser = null;
    cart = [];
    updateCartUI();
    updateNavigation();
    showMainContent();
}

function updateNavigation() {
    const navButtons = document.getElementById('navButtons');
    const userNav = document.getElementById('userNav');
    const userName = document.getElementById('userName');

    if (currentUser) {
        navButtons.style.display = 'none';
        userNav.style.display = 'flex';
        userName.textContent = `👋 ${currentUser.name}`;
    } else {
        navButtons.style.display = 'flex';
        userNav.style.display = 'none';
    }
}