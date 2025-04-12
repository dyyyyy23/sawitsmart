// Ekspor data ke Excel
document.getElementById('exportBtn').addEventListener('click', function() {
    // Ambil data yang difilter
    const searchTerm = document.getElementById('searchData').value;
    const monthFilter = document.getElementById('filterMonth').value;
    const harvesterFilter = document.getElementById('filterHarvester').value;
    
    let filteredData = [...harvestData];
    
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
    
    if (monthFilter) {
        filteredData = filteredData.filter(item => {
            const itemMonth = new Date(item.date).getMonth() + 1;
            return itemMonth.toString() === monthFilter;
        });
    }
    
    if (harvesterFilter) {
        filteredData = filteredData.filter(item => item.harvesterId === harvesterFilter);
    }
    
    // Format data untuk Excel
    const excelData = filteredData.map(item => {
        const dateObj = new Date(item.date);
        const formattedDate = dateObj.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        return {
            'ID Pemanen': item.harvesterId,
            'Nama Pemanen': item.harvesterName,
            'Tanggal Panen': formattedDate,
            'Blok Lahan': item.block,
            'Berat (Kg)': parseFloat(item.weight).toFixed(1),
            'Kualitas Buah': item.quality,
            'Catatan': item.notes || '-'
        };
    });
    
    // Buat worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Buat workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Panen');
    
    // Ekspor ke file Excel
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0];
    XLSX.writeFile(wb, `Data_Panen_Sawit_${dateStr}.xlsx`);
    
    showNotification('Data berhasil diekspor ke Excel', 'success');
});

// Ekspor laporan ke PDF (simulasi)
document.getElementById('exportReportBtn').addEventListener('click', function() {
    // Dalam implementasi nyata, ini akan menggunakan library seperti jsPDF
    // Ini hanya simulasi untuk contoh
    
    showNotification('Fitur ekspor ke PDF akan segera tersedia', 'warning');
});

// Backup data
document.getElementById('backupBtn').addEventListener('click', function() {
    const dataToBackup = {
        harvestData: harvestData,
        harvesterData: harvesterData
    };
    
    const dataStr = JSON.stringify(dataToBackup);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportName = 'backup_panen_sawit_' + new Date().toISOString().split('T')[0] + '.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportName);
    linkElement.click();
    
    showNotification('Backup data berhasil dibuat', 'success');
});

// Restore data
document.getElementById('restoreBtn').addEventListener('click', function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = event => {
            try {
                const data = JSON.parse(event.target.result);
                
                if (data.harvestData && data.harvesterData) {
                    if (confirm('Restore data akan mengganti semua data saat ini. Lanjutkan?')) {
                        harvestData = data.harvestData;
                        harvesterData = data.harvesterData;
                        
                        localStorage.setItem('harvestData', JSON.stringify(harvestData));
                        localStorage.setItem('harvesterData', JSON.stringify(harvesterData));
                        
                        showNotification('Data berhasil di-restore', 'success');
                        
                        // Refresh tampilan
                        populateHarvesterDropdowns();
                        displayHarvestData();
                        displayHarvesterData();
                        calculateStatistics();
                        setupCharts();
                    }
                } else {
                    showNotification('File backup tidak valid', 'error');
                }
            } catch (error) {
                showNotification('Gagal memproses file backup', 'error');
                console.error(error);
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
});

// Reset data
document.getElementById('resetBtn').addEventListener('click', function() {
    if (confirm('Reset data akan menghapus SEMUA data. Anda yakin?')) {
        localStorage.removeItem('harvestData');
        localStorage.removeItem('harvesterData');
        
        harvestData = [];
        harvesterData = [
            { id: 'P001', name: 'Ahmad Santoso', phone: '081234567890', joinDate: '2023-01-15' },
            { id: 'P002', name: 'Budi Setiawan', phone: '082345678901', joinDate: '2023-02-20' },
            { id: 'P003', name: 'Citra Dewi', phone: '083456789012', joinDate: '2023-03-10' }
        ];
        
        localStorage.setItem('harvesterData', JSON.stringify(harvesterData));
        
        showNotification('Data berhasil direset ke default', 'success');
        
        // Refresh tampilan
        populateHarvesterDropdowns();
        displayHarvestData();
        displayHarvesterData();
        calculateStatistics();
        setupCharts();
    }
});