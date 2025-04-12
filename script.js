// Inisialisasi Data
let harvestData = JSON.parse(localStorage.getItem('harvestData')) || [];
let harvesterData = JSON.parse(localStorage.getItem('harvesterData')) || [
    { id: 'P001', name: 'Ahmad Santoso', phone: '081234567890', joinDate: '2023-01-15' },
    { id: 'P002', name: 'Budi Setiawan', phone: '082345678901', joinDate: '2023-02-20' },
    { id: 'P003', name: 'Citra Dewi', phone: '083456789012', joinDate: '2023-03-10' }
];

// Simpan data awal jika belum ada
if (!localStorage.getItem('harvesterData')) {
    localStorage.setItem('harvesterData', JSON.stringify(harvesterData));
}

// DOM Elements
const loadingScreen = document.getElementById('loadingScreen');
const contentSections = document.querySelectorAll('.content-section');
const navLinks = document.querySelectorAll('.sidebar a');
const currentDateElement = document.getElementById('currentDate');
const todayHarvestElement = document.getElementById('todayHarvest');
const weekHarvestElement = document.getElementById('weekHarvest');
const totalHarvestersElement = document.getElementById('totalHarvesters');
const harvestForm = document.getElementById('harvestForm');
const harvesterIdSelect = document.getElementById('harvesterId');
const harvestDateInput = document.getElementById('harvestDate');
const blockNumberSelect = document.getElementById('blockNumber');
const harvestWeightInput = document.getElementById('harvestWeight');
const fruitQualitySelect = document.getElementById('fruitQuality');
const notesTextarea = document.getElementById('notes');
const previewElements = {
    harvester: document.getElementById('previewHarvester'),
    date: document.getElementById('previewDate'),
    block: document.getElementById('previewBlock'),
    weight: document.getElementById('previewWeight'),
    quality: document.getElementById('previewQuality'),
    notes: document.getElementById('previewNotes')
};
const harvestDataTable = document.getElementById('harvestDataTable').getElementsByTagName('tbody')[0];
const searchDataInput = document.getElementById('searchData');
const filterMonthSelect = document.getElementById('filterMonth');
const filterHarvesterSelect = document.getElementById('filterHarvester');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageInfoElement = document.getElementById('pageInfo');
const addHarvesterBtn = document.getElementById('addHarvesterBtn');
const harvesterModal = document.getElementById('harvesterModal');
const closeModalBtn = document.querySelector('.close-modal');
const harvesterForm = document.getElementById('harvesterForm');
const harvesterTable = document.getElementById('harvesterTable').getElementsByTagName('tbody')[0];
const searchHarvesterInput = document.getElementById('searchHarvester');
const notificationContainer = document.getElementById('notificationContainer');

// Inisialisasi Aplikasi
function initApp() {
    // Set tanggal hari ini
    const today = new Date();
    harvestDateInput.valueAsDate = today;
    
    // Set tanggal di header
    updateCurrentDate();
    
    // Isi dropdown pemanen
    populateHarvesterDropdowns();
    
    // Hitung statistik
    calculateStatistics();
    
    // Tampilkan data awal
    displayHarvestData();
    displayHarvesterData();
    
    // Setup chart
    setupCharts();
    
    // Sembunyikan loading screen setelah 1.5 detik
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 1500);
}

// Update tanggal di header
function updateCurrentDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateElement.textContent = new Date().toLocaleDateString('id-ID', options);
}

// Isi dropdown pemanen
function populateHarvesterDropdowns() {
    harvesterIdSelect.innerHTML = '<option value="">Pilih Pemanen</option>';
    filterHarvesterSelect.innerHTML = '<option value="">Semua Pemanen</option>';
    
    harvesterData.forEach(harvester => {
        const option1 = document.createElement('option');
        option1.value = harvester.id;
        option1.textContent = `${harvester.id} - ${harvester.name}`;
        harvesterIdSelect.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = harvester.id;
        option2.textContent = `${harvester.id} - ${harvester.name}`;
        filterHarvesterSelect.appendChild(option2);
    });
}

// Hitung statistik
function calculateStatistics() {
    const today = new Date().toISOString().split('T')[0];
    const todayData = harvestData.filter(item => item.date === today);
    const todayTotal = todayData.reduce((sum, item) => sum + parseFloat(item.weight), 0);
    
    // Hitung total minggu ini
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weekData = harvestData.filter(item => new Date(item.date) >= oneWeekAgo);
    const weekTotal = weekData.reduce((sum, item) => sum + parseFloat(item.weight), 0);
    
    todayHarvestElement.textContent = `${todayTotal.toFixed(1)} Kg`;
    weekHarvestElement.textContent = `${weekTotal.toFixed(1)} Kg`;
    totalHarvestersElement.textContent = harvesterData.length;
}

// Setup chart
function setupCharts() {
    // Chart panen 7 hari terakhir
    const last7Days = [];
    const harvestByDay = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        last7Days.push(new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }));
        
        const dayData = harvestData.filter(item => item.date === dateStr);
        const dayTotal = dayData.reduce((sum, item) => sum + parseFloat(item.weight), 0);
        harvestByDay.push(dayTotal);
    }
    
    const harvestChartCtx = document.getElementById('harvestChart').getContext('2d');
    new Chart(harvestChartCtx, {
        type: 'bar',
        data: {
            labels: last7Days,
            datasets: [{
                label: 'Panen Harian (Kg)',
                data: harvestByDay,
                backgroundColor: 'rgba(76, 175, 80, 0.7)',
                borderColor: 'rgba(76, 175, 80, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    
    // Chart performa pemanen
    const harvesterPerformance = {};
    harvesterData.forEach(harvester => {
        const harvesterHarvest = harvestData.filter(item => item.harvesterId === harvester.id);
        const totalHarvest = harvesterHarvest.reduce((sum, item) => sum + parseFloat(item.weight), 0);
        harvesterPerformance[harvester.name] = totalHarvest;
    });
    
    const harvesterPerformanceCtx = document.getElementById('harvesterPerformanceChart').getContext('2d');
    new Chart(harvesterPerformanceCtx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(harvesterPerformance),
            datasets: [{
                data: Object.values(harvesterPerformance),
                backgroundColor: [
                    'rgba(76, 175, 80, 0.7)',
                    'rgba(33, 150, 243, 0.7)',
                    'rgba(255, 152, 0, 0.7)',
                    'rgba(156, 39, 176, 0.7)',
                    'rgba(244, 67, 54, 0.7)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

// Tampilkan data panen
function displayHarvestData(page = 1, searchTerm = '', monthFilter = '', harvesterFilter = '') {
    const rowsPerPage = 10;
    let filteredData = [...harvestData];
    
    // Filter berdasarkan pencarian
    if (searchTerm) {
        filteredData = filteredData.filter(item => {
            return (
                item.harvesterId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.harvesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.block.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.notes.toLowerCase().includes(searchTerm.toLowerCase())
            );
        });
    }
    
    // Filter berdasarkan bulan
    if (monthFilter) {
        filteredData = filteredData.filter(item => {
            const itemMonth = new Date(item.date).getMonth() + 1;
            return itemMonth.toString() === monthFilter;
        });
    }
    
    // Filter berdasarkan pemanen
    if (harvesterFilter) {
        filteredData = filteredData.filter(item => item.harvesterId === harvesterFilter);
    }
    
    // Hitung total halaman
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    
    // Batasi halaman
    if (page < 1) page = 1;
    if (page > totalPages && totalPages > 0) page = totalPages;
    
    // Potong data untuk halaman saat ini
    const startIndex = (page - 1) * rowsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + rowsPerPage);
    
    // Kosongkan tabel
    harvestDataTable.innerHTML = '';
    
    // Isi tabel
    paginatedData.forEach((item, index) => {
        const row = harvestDataTable.insertRow();
        const rowNumber = startIndex + index + 1;
        
        // Format tanggal
        const dateObj = new Date(item.date);
        const formattedDate = dateObj.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        row.innerHTML = `
            <td>${rowNumber}</td>
            <td>${item.harvesterId}</td>
            <td>${item.harvesterName}</td>
            <td>${formattedDate}</td>
            <td>${item.block}</td>
            <td>${parseFloat(item.weight).toFixed(1)}</td>
            <td>${item.quality}</td>
            <td>${item.notes || '-'}</td>
            <td>
                <button class="action-btn edit-btn" data-id="${item.id}"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-btn" data-id="${item.id}"><i class="fas fa-trash-alt"></i></button>
            </td>
        `;
    });
    
    // Update info halaman
    pageInfoElement.textContent = `Halaman ${page} dari ${totalPages}`;
    
    // Enable/disable tombol pagination
    prevPageBtn.disabled = page <= 1;
    nextPageBtn.disabled = page >= totalPages;
    
    // Tambahkan event listener untuk tombol edit/hapus
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => editHarvestData(e.target.closest('button').dataset.id));
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => deleteHarvestData(e.target.closest('button').dataset.id));
    });
    
    return {
        currentPage: page,
        totalPages: totalPages,
        totalData: filteredData.length
    };
}

// Tampilkan data pemanen
function displayHarvesterData(searchTerm = '') {
    let filteredData = [...harvesterData];
    
    if (searchTerm) {
        filteredData = filteredData.filter(harvester => {
            return (
                harvester.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                harvester.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (harvester.phone && harvester.phone.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        });
    }
    
    harvesterTable.innerHTML = '';
    
    filteredData.forEach((harvester, index) => {
        const row = harvesterTable.insertRow();
        
        // Format tanggal bergabung
        const joinDateObj = new Date(harvester.joinDate);
        const formattedJoinDate = joinDateObj.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        // Hitung total panen pemanen
        const totalHarvest = harvestData
            .filter(item => item.harvesterId === harvester.id)
            .reduce((sum, item) => sum + parseFloat(item.weight), 0);
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${harvester.id}</td>
            <td>${harvester.name}</td>
            <td>${harvester.phone || '-'}</td>
            <td>${formattedJoinDate}</td>
            <td>${totalHarvest.toFixed(1)} Kg</td>
            <td>
                <button class="action-btn edit-btn" data-id="${harvester.id}"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-btn" data-id="${harvester.id}"><i class="fas fa-trash-alt"></i></button>
            </td>
        `;
    });
    
    // Tambahkan event listener untuk tombol edit/hapus
    document.querySelectorAll('#harvesterTable .edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => editHarvesterData(e.target.closest('button').dataset.id));
    });
    
    document.querySelectorAll('#harvesterTable .delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => deleteHarvesterData(e.target.closest('button').dataset.id));
    });
}

// Tambah data panen
function addHarvestData(data) {
    // Generate ID unik
    const newId = 'H' + Date.now().toString().slice(-6);
    
    // Dapatkan nama pemanen
    const harvester = harvesterData.find(h => h.id === data.harvesterId);
    const harvesterName = harvester ? harvester.name : 'Unknown';
    
    const newData = {
        id: newId,
        harvesterId: data.harvesterId,
        harvesterName: harvesterName,
        date: data.date,
        block: data.block,
        weight: parseFloat(data.weight).toFixed(1),
        quality: data.quality,
        notes: data.notes
    };
    
    harvestData.unshift(newData);
    localStorage.setItem('harvestData', JSON.stringify(harvestData));
    
    showNotification('Data panen berhasil ditambahkan', 'success');
    calculateStatistics();
    displayHarvestData();
    setupCharts();
}

// Edit data panen
function editHarvestData(id) {
    const dataToEdit = harvestData.find(item => item.id === id);
    if (!dataToEdit) return;
    
    // Isi form dengan data yang akan diedit
    harvesterIdSelect.value = dataToEdit.harvesterId;
    harvestDateInput.value = dataToEdit.date;
    blockNumberSelect.value = dataToEdit.block;
    harvestWeightInput.value = dataToEdit.weight;
    fruitQualitySelect.value = dataToEdit.quality;
    notesTextarea.value = dataToEdit.notes || '';
    
    // Update preview
    updatePreview();
    
    // Scroll ke form input data
    document.querySelector('#input-data').scrollIntoView({ behavior: 'smooth' });
    
    // Ganti tab ke input data
    document.querySelector('.sidebar li:nth-child(2) a').click();
    
    // Hapus data lama saat form disubmit
    harvestForm.onsubmit = function(e) {
        e.preventDefault();
        
        // Hapus data lama
        harvestData = harvestData.filter(item => item.id !== id);
        
        // Tambahkan data baru
        addHarvestData({
            harvesterId: harvesterIdSelect.value,
            date: harvestDateInput.value,
            block: blockNumberSelect.value,
            weight: harvestWeightInput.value,
            quality: fruitQualitySelect.value,
            notes: notesTextarea.value
        });
        
        // Reset form handler
        harvestForm.onsubmit = handleHarvestFormSubmit;
        
        // Reset form
        harvestForm.reset();
        harvestDateInput.valueAsDate = new Date();
    };
}

// Hapus data panen
function deleteHarvestData(id) {
    if (confirm('Apakah Anda yakin ingin menghapus data panen ini?')) {
        harvestData = harvestData.filter(item => item.id !== id);
        localStorage.setItem('harvestData', JSON.stringify(harvestData));
        
        showNotification('Data panen berhasil dihapus', 'success');
        calculateStatistics();
        displayHarvestData();
        setupCharts();
    }
}

// Tambah data pemanen
function addHarvesterData(data) {
    // Cek apakah ID sudah ada
    if (harvesterData.some(h => h.id === data.id)) {
        showNotification('ID Pemanen sudah ada', 'error');
        return;
    }
    
    const newData = {
        id: data.id,
        name: data.name,
        phone: data.phone || '',
        joinDate: data.joinDate
    };
    
    harvesterData.push(newData);
    localStorage.setItem('harvesterData', JSON.stringify(harvesterData));
    
    showNotification('Data pemanen berhasil ditambahkan', 'success');
    populateHarvesterDropdowns();
    displayHarvesterData();
    calculateStatistics();
    setupCharts();
}

// Edit data pemanen
function editHarvesterData(id) {
    const harvesterToEdit = harvesterData.find(h => h.id === id);
    if (!harvesterToEdit) return;
    
    // Isi form modal dengan data yang akan diedit
    document.getElementById('newHarvesterId').value = harvesterToEdit.id;
    document.getElementById('newHarvesterName').value = harvesterToEdit.name;
    document.getElementById('newHarvesterPhone').value = harvesterToEdit.phone;
    document.getElementById('newHarvesterJoinDate').value = harvesterToEdit.joinDate;
    
    // Tampilkan modal
    harvesterModal.style.display = 'flex';
    
    // Hapus data lama saat form disubmit
    harvesterForm.onsubmit = function(e) {
        e.preventDefault();
        
        // Hapus data lama
        harvesterData = harvesterData.filter(h => h.id !== id);
        
        // Tambahkan data baru
        addHarvesterData({
            id: document.getElementById('newHarvesterId').value,
            name: document.getElementById('newHarvesterName').value,
            phone: document.getElementById('newHarvesterPhone').value,
            joinDate: document.getElementById('newHarvesterJoinDate').value
        });
        
        // Reset form handler
        harvesterForm.onsubmit = handleHarvesterFormSubmit;
        
        // Tutup modal dan reset form
        harvesterModal.style.display = 'none';
        harvesterForm.reset();
    };
}

// Hapus data pemanen
function deleteHarvesterData(id) {
    // Cek apakah pemanen memiliki data panen
    const hasHarvestData = harvestData.some(item => item.harvesterId === id);
    
    if (hasHarvestData) {
        showNotification('Tidak dapat menghapus pemanen yang sudah memiliki data panen', 'error');
        return;
    }
    
    if (confirm('Apakah Anda yakin ingin menghapus data pemanen ini?')) {
        harvesterData = harvesterData.filter(h => h.id !== id);
        localStorage.setItem('harvesterData', JSON.stringify(harvesterData));
        
        showNotification('Data pemanen berhasil dihapus', 'success');
        populateHarvesterDropdowns();
        displayHarvesterData();
        calculateStatistics();
    }
}

// Update preview form
function updatePreview() {
    const harvesterId = harvesterIdSelect.value;
    const harvester = harvesterData.find(h => h.id === harvesterId);
    
    previewElements.harvester.textContent = harvester ? `${harvester.id} - ${harvester.name}` : '-';
    previewElements.date.textContent = harvestDateInput.value ? new Date(harvestDateInput.value).toLocaleDateString('id-ID') : '-';
    previewElements.block.textContent = blockNumberSelect.value || '-';
    previewElements.weight.textContent = harvestWeightInput.value || '-';
    previewElements.quality.textContent = fruitQualitySelect.value || '-';
    previewElements.notes.textContent = notesTextarea.value || '-';
}

// Tampilkan notifikasi
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    let icon;
    switch (type) {
        case 'error':
            icon = '<i class="fas fa-exclamation-circle"></i>';
            break;
        case 'warning':
            icon = '<i class="fas fa-exclamation-triangle"></i>';
            break;
        default:
            icon = '<i class="fas fa-check-circle"></i>';
    }
    
    notification.innerHTML = `${icon} ${message}`;
    notificationContainer.appendChild(notification);
    
    // Hapus notifikasi setelah 3 detik
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Event Handlers
function handleHarvestFormSubmit(e) {
    e.preventDefault();
    
    addHarvestData({
        harvesterId: harvesterIdSelect.value,
        date: harvestDateInput.value,
        block: blockNumberSelect.value,
        weight: harvestWeightInput.value,
        quality: fruitQualitySelect.value,
        notes: notesTextarea.value
    });
    
    // Reset form
    harvestForm.reset();
    harvestDateInput.valueAsDate = new Date();
}

function handleHarvesterFormSubmit(e) {
    e.preventDefault();
    
    addHarvesterData({
        id: document.getElementById('newHarvesterId').value,
        name: document.getElementById('newHarvesterName').value,
        phone: document.getElementById('newHarvesterPhone').value,
        joinDate: document.getElementById('newHarvesterJoinDate').value
    });
    
    // Reset form dan tutup modal
    harvesterForm.reset();
    harvesterModal.style.display = 'none';
}

// Navigation
navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Hapus class active dari semua link
        navLinks.forEach(l => l.parentElement.classList.remove('active'));
        
        // Tambahkan class active ke link yang diklik
        this.parentElement.classList.add('active');
        
        // Sembunyikan semua section
        contentSections.forEach(section => section.classList.remove('active'));
        
        // Tampilkan section yang sesuai
        const targetSection = document.querySelector(this.getAttribute('href'));
        targetSection.classList.add('active');
    });
});

// Event Listeners
harvestForm.addEventListener('submit', handleHarvestFormSubmit);

// Update preview saat form berubah
harvesterIdSelect.addEventListener('change', updatePreview);
harvestDateInput.addEventListener('change', updatePreview);
blockNumberSelect.addEventListener('change', updatePreview);
harvestWeightInput.addEventListener('input', updatePreview);
fruitQualitySelect.addEventListener('change', updatePreview);
notesTextarea.addEventListener('input', updatePreview);

// Pencarian data panen
searchDataInput.addEventListener('input', function() {
    displayHarvestData(1, this.value, filterMonthSelect.value, filterHarvesterSelect.value);
});

// Filter data panen
filterMonthSelect.addEventListener('change', function() {
    displayHarvestData(1, searchDataInput.value, this.value, filterHarvesterSelect.value);
});

filterHarvesterSelect.addEventListener('change', function() {
    displayHarvestData(1, searchDataInput.value, filterMonthSelect.value, this.value);
});

// Pagination
prevPageBtn.addEventListener('click', function() {
    const pagination = displayHarvestData();
    if (pagination.currentPage > 1) {
        displayHarvestData(pagination.currentPage - 1, searchDataInput.value, filterMonthSelect.value, filterHarvesterSelect.value);
    }
});

nextPageBtn.addEventListener('click', function() {
    const pagination = displayHarvestData();
    if (pagination.currentPage < pagination.totalPages) {
        displayHarvestData(pagination.currentPage + 1, searchDataInput.value, filterMonthSelect.value, filterHarvesterSelect.value);
    }
});

// Modal pemanen
addHarvesterBtn.addEventListener('click', function() {
    // Reset form dan set handler default
    harvesterForm.reset();
    harvesterForm.onsubmit = handleHarvesterFormSubmit;
    
    // Set tanggal bergabung ke hari ini
    document.getElementById('newHarvesterJoinDate').valueAsDate = new Date();
    
    // Tampilkan modal
    harvesterModal.style.display = 'flex';
});

closeModalBtn.addEventListener('click', function() {
    harvesterModal.style.display = 'none';
});

window.addEventListener('click', function(e) {
    if (e.target === harvesterModal) {
        harvesterModal.style.display = 'none';
    }
});

harvesterForm.addEventListener('submit', handleHarvesterFormSubmit);

// Pencarian data pemanen
searchHarvesterInput.addEventListener('input', function() {
    displayHarvesterData(this.value);
});

// Inisialisasi saat DOM siap
document.addEventListener('DOMContentLoaded', initApp);

