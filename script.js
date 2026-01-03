// ===== Data Storage =====
let students = [];
let classes = [];
let attendance = [];
let settings = {
    teacherName: 'Guru',
    teacherNIP: '',
    darkMode: false,
    schoolName: 'SMA Negeri 1',
    schoolLogo: null, // Will store base64 image or null for emoji
    schoolLogoType: 'emoji', // 'emoji' or 'image'
    principalName: 'Dr. Ahmad Suryanto, M.Pd',
    principalNIP: '196512121990031001'
};

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    initializeApp();
    setupEventListeners();
    updateDashboard();
});

// ===== Load Data from LocalStorage =====
function loadData() {
    const savedStudents = localStorage.getItem('students');
    const savedClasses = localStorage.getItem('classes');
    const savedAttendance = localStorage.getItem('attendance');
    const savedSettings = localStorage.getItem('settings');

    if (savedStudents) students = JSON.parse(savedStudents);
    if (savedClasses) classes = JSON.parse(savedClasses);
    if (savedAttendance) attendance = JSON.parse(savedAttendance);
    if (savedSettings) settings = JSON.parse(savedSettings);

    // Initialize default classes if empty
    if (classes.length === 0) {
        classes = ['X IPA 1', 'X IPA 2', 'X IPS 1', 'XI IPA 1', 'XI IPA 2', 'XII IPA 1'];
        saveData();
    }

    // Initialize sample students if empty
    if (students.length === 0) {
        students = [
            { id: generateId(), name: 'Ahmad Fauzi', nis: '2024001', class: 'X IPA 1' },
            { id: generateId(), name: 'Siti Nurhaliza', nis: '2024002', class: 'X IPA 1' },
            { id: generateId(), name: 'Budi Santoso', nis: '2024003', class: 'X IPA 1' },
            { id: generateId(), name: 'Dewi Lestari', nis: '2024004', class: 'X IPA 2' },
            { id: generateId(), name: 'Eko Prasetyo', nis: '2024005', class: 'X IPA 2' }
        ];
        saveData();
    }
}

// ===== Save Data to LocalStorage =====
function saveData() {
    localStorage.setItem('students', JSON.stringify(students));
    localStorage.setItem('classes', JSON.stringify(classes));
    localStorage.setItem('attendance', JSON.stringify(attendance));
    localStorage.setItem('settings', JSON.stringify(settings));
}

// ===== Initialize App =====
function initializeApp() {
    // Set current date
    const dateElement = document.getElementById('currentDate');
    dateElement.textContent = formatDate(new Date());

    // Set school profile in header
    const logoElement = document.querySelector('.logo');
    if (logoElement) {
        if (settings.schoolLogoType === 'image' && settings.schoolLogo) {
            logoElement.innerHTML = `<img src="${settings.schoolLogo}" alt="Logo" style="width: 100%; height: 100%; object-fit: contain; border-radius: 12px;">`;
        } else {
            logoElement.textContent = '🎓';
        }
    }

    // Set school name in header
    const schoolNameElement = document.getElementById('schoolName');
    if (schoolNameElement) {
        schoolNameElement.textContent = settings.schoolName || 'SMA Negeri 1';
    }

    // Set teacher name
    document.getElementById('userName').textContent = settings.teacherName;
    document.getElementById('settingNamaGuru').value = settings.teacherName;
    document.getElementById('settingNIPGuru').value = settings.teacherNIP || '';

    // Set school profile in settings
    document.getElementById('settingNamaSekolah').value = settings.schoolName || '';
    document.getElementById('settingNamaKepsek').value = settings.principalName || '';
    document.getElementById('settingNIPKepsek').value = settings.principalNIP || '';
    
    // Set logo preview
    updateLogoPreview();

    // Set dark mode
    if (settings.darkMode) {
        document.body.classList.add('dark-mode');
        document.getElementById('darkModeSwitch').checked = true;
        document.getElementById('themeToggle').textContent = '☀️';
    }

    // Set today's date for absensi
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('absensiTanggal').value = today;

    // Set default date range for rekap (first day and last day of current month)
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    document.getElementById('rekapTanggalMulai').value = firstDay;
    document.getElementById('rekapTanggalAkhir').value = lastDay;

    // Populate dropdowns
    populateClassDropdowns();
    renderStudentTable();
    renderKelasList();
}

// ===== Event Listeners =====
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            navigateToPage(page);
        });
    });

    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    document.getElementById('darkModeSwitch').addEventListener('change', toggleTheme);

    // Student management
    document.getElementById('btnTambahSiswa').addEventListener('click', openAddStudentModal);
    document.getElementById('formSiswa').addEventListener('submit', saveStudent);
    document.getElementById('filterKelas').addEventListener('change', renderStudentTable);

    // Attendance
    document.getElementById('absensiKelas').addEventListener('change', loadAttendanceForm);
    document.getElementById('absensiTanggal').addEventListener('change', loadAttendanceForm);
    document.getElementById('btnSimpanAbsensi').addEventListener('click', saveAttendance);
    document.getElementById('btnCetakPDF').addEventListener('click', exportAttendancePDF);

    // Rekap
    document.getElementById('btnTampilkanRekap').addEventListener('click', displayRekap);
    document.getElementById('btnCetakRekap').addEventListener('click', printRekap);

    // Settings
    document.getElementById('settingLogoSekolah').addEventListener('change', handleLogoUpload);
    document.getElementById('btnSimpanProfilSekolah').addEventListener('click', saveSchoolProfile);
    document.getElementById('btnSimpanNamaGuru').addEventListener('click', saveTeacherName);
    document.getElementById('btnTambahKelas').addEventListener('click', addClass);
    document.getElementById('settingNamaKelas').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addClass();
        }
    });
    document.getElementById('btnResetData').addEventListener('click', resetData);
}

// ===== Navigation =====
function navigateToPage(pageName) {
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-page="${pageName}"]`).classList.add('active');

    // Show page
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageName).classList.add('active');

    // Update content based on page
    if (pageName === 'dashboard') {
        updateDashboard();
    } else if (pageName === 'data-siswa') {
        renderStudentTable();
    } else if (pageName === 'absensi') {
        populateClassDropdowns();
    } else if (pageName === 'rekap') {
        populateClassDropdowns();
    } else if (pageName === 'pengaturan') {
        renderKelasList();
    }
}

// ===== Dashboard Functions =====
function updateDashboard() {
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendance.filter(a => a.date === today);

    let hadir = 0, izin = 0, sakit = 0, alfa = 0;

    todayAttendance.forEach(record => {
        if (record.status === 'hadir') hadir++;
        else if (record.status === 'izin') izin++;
        else if (record.status === 'sakit') sakit++;
        else if (record.status === 'alfa') alfa++;
    });

    document.getElementById('statHadir').textContent = hadir;
    document.getElementById('statIzin').textContent = izin;
    document.getElementById('statSakit').textContent = sakit;
    document.getElementById('statAlfa').textContent = alfa;

    const total = hadir + izin + sakit + alfa;
    const percentage = total > 0 ? Math.round((hadir / total) * 100) : 0;
    document.getElementById('percentageToday').textContent = percentage + '%';
}

// ===== Student Management =====
function renderStudentTable() {
    const filterClass = document.getElementById('filterKelas').value;
    const tbody = document.getElementById('tableSiswa');
    
    let filteredStudents = students;
    if (filterClass) {
        filteredStudents = students.filter(s => s.class === filterClass);
    }

    tbody.innerHTML = '';
    filteredStudents.forEach((student, index) => {
        const row = `
            <tr>
                <td>${index + 1}</td>
                <td>${student.name}</td>
                <td>${student.nis}</td>
                <td>${student.class}</td>
                <td>
                    <button class="btn btn-secondary" onclick="editStudent('${student.id}')" style="padding: 0.5rem 1rem; margin-right: 0.5rem;">✏️ Edit</button>
                    <button class="btn btn-danger" onclick="deleteStudent('${student.id}')" style="padding: 0.5rem 1rem;">🗑️ Hapus</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function openAddStudentModal() {
    document.getElementById('modalSiswaTitle').textContent = 'Tambah Siswa';
    document.getElementById('formSiswa').reset();
    document.getElementById('siswaId').value = '';
    populateModalClassDropdown();
    openModal('modalSiswa');
}

function editStudent(id) {
    const student = students.find(s => s.id === id);
    if (!student) return;

    document.getElementById('modalSiswaTitle').textContent = 'Edit Siswa';
    document.getElementById('siswaId').value = student.id;
    document.getElementById('siswaNama').value = student.name;
    document.getElementById('siswaNIS').value = student.nis;
    populateModalClassDropdown();
    document.getElementById('siswaKelas').value = student.class;
    openModal('modalSiswa');
}

function saveStudent(e) {
    e.preventDefault();
    
    const id = document.getElementById('siswaId').value;
    const name = document.getElementById('siswaNama').value;
    const nis = document.getElementById('siswaNIS').value;
    const studentClass = document.getElementById('siswaKelas').value;

    if (id) {
        // Edit existing student
        const index = students.findIndex(s => s.id === id);
        students[index] = { id, name, nis, class: studentClass };
        showNotification('Data siswa berhasil diperbarui!');
    } else {
        // Add new student
        students.push({
            id: generateId(),
            name,
            nis,
            class: studentClass
        });
        showNotification('Siswa berhasil ditambahkan!');
    }

    saveData();
    renderStudentTable();
    closeModal('modalSiswa');
}

function deleteStudent(id) {
    if (confirm('Apakah Anda yakin ingin menghapus siswa ini?')) {
        students = students.filter(s => s.id !== id);
        // Also delete attendance records
        attendance = attendance.filter(a => a.studentId !== id);
        saveData();
        renderStudentTable();
        showNotification('Siswa berhasil dihapus!');
    }
}

// ===== Attendance Functions =====
function loadAttendanceForm() {
    const selectedClass = document.getElementById('absensiKelas').value;
    const selectedDate = document.getElementById('absensiTanggal').value;

    if (!selectedClass || !selectedDate) {
        document.getElementById('absensiCard').style.display = 'none';
        return;
    }

    document.getElementById('absensiCard').style.display = 'block';
    document.getElementById('kelasName').textContent = selectedClass;
    document.getElementById('tanggalAbsensi').textContent = formatDate(new Date(selectedDate));

    const classStudents = students.filter(s => s.class === selectedClass);
    const tbody = document.getElementById('tableAbsensi');
    
    tbody.innerHTML = '';
    classStudents.forEach((student, index) => {
        // Check if attendance already exists
        const existingAttendance = attendance.find(
            a => a.studentId === student.id && a.date === selectedDate
        );
        const currentStatus = existingAttendance ? existingAttendance.status : '';

        const row = `
            <tr>
                <td>${index + 1}</td>
                <td>${student.name}</td>
                <td>${student.nis}</td>
                <td>
                    <div class="status-buttons">
                        <button class="status-btn hadir ${currentStatus === 'hadir' ? 'active' : ''}" 
                                onclick="setAttendanceStatus('${student.id}', 'hadir', this)">
                            ✅ Hadir
                        </button>
                        <button class="status-btn izin ${currentStatus === 'izin' ? 'active' : ''}" 
                                onclick="setAttendanceStatus('${student.id}', 'izin', this)">
                            💤 Izin
                        </button>
                        <button class="status-btn sakit ${currentStatus === 'sakit' ? 'active' : ''}" 
                                onclick="setAttendanceStatus('${student.id}', 'sakit', this)">
                            🤒 Sakit
                        </button>
                        <button class="status-btn alfa ${currentStatus === 'alfa' ? 'active' : ''}" 
                                onclick="setAttendanceStatus('${student.id}', 'alfa', this)">
                            ❌ Alfa
                        </button>
                    </div>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function setAttendanceStatus(studentId, status, button) {
    // Remove active class from all buttons in the row
    const row = button.closest('tr');
    row.querySelectorAll('.status-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to clicked button
    button.classList.add('active');
    
    // Store temporary status
    button.closest('tr').dataset.studentId = studentId;
    button.closest('tr').dataset.status = status;
}

function saveAttendance() {
    const selectedDate = document.getElementById('absensiTanggal').value;
    const selectedClass = document.getElementById('absensiKelas').value;
    
    const rows = document.querySelectorAll('#tableAbsensi tr');
    let savedCount = 0;

    rows.forEach(row => {
        const studentId = row.dataset.studentId;
        const status = row.dataset.status;

        if (studentId && status) {
            // Remove existing attendance for this student and date
            attendance = attendance.filter(
                a => !(a.studentId === studentId && a.date === selectedDate)
            );

            // Add new attendance record
            attendance.push({
                id: generateId(),
                studentId: studentId,
                date: selectedDate,
                class: selectedClass,
                status: status,
                timestamp: new Date().toISOString()
            });
            savedCount++;
        }
    });

    if (savedCount > 0) {
        saveData();
        showNotification(`Absensi berhasil disimpan untuk ${savedCount} siswa!`);
        updateDashboard();
    } else {
        showNotification('Tidak ada data absensi yang disimpan. Pilih status untuk setiap siswa.');
    }
}

function exportAttendanceCSV() {
    const selectedClass = document.getElementById('absensiKelas').value;
    const selectedDate = document.getElementById('absensiTanggal').value;

    if (!selectedClass || !selectedDate) {
        showNotification('Pilih kelas dan tanggal terlebih dahulu!');
        return;
    }

    const classStudents = students.filter(s => s.class === selectedClass);
    let csv = 'No,Nama Siswa,NIS,Status Kehadiran\n';

    classStudents.forEach((student, index) => {
        const attendanceRecord = attendance.find(
            a => a.studentId === student.id && a.date === selectedDate
        );
        const status = attendanceRecord ? attendanceRecord.status : '-';
        csv += `${index + 1},${student.name},${student.nis},${status}\n`;
    });

    downloadCSV(csv, `Absensi_${selectedClass}_${selectedDate}.csv`);
    showNotification('Data berhasil diekspor!');
}

function exportAttendancePDF() {
    const selectedClass = document.getElementById('absensiKelas').value;
    const selectedDate = document.getElementById('absensiTanggal').value;

    if (!selectedClass || !selectedDate) {
        showNotification('Pilih kelas dan tanggal terlebih dahulu!');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Get current year
    const currentYear = new Date().getFullYear();
    const dateObj = new Date(selectedDate);
    const formattedDate = formatDate(dateObj);
    
    // Header
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('DAFTAR KEHADIRAN SISWA', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text(settings.schoolName || 'SMA NEGERI 1', 105, 28, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`TAHUN ${currentYear}`, 105, 35, { align: 'center' });
    
    // Info
    doc.setFontSize(11);
    doc.text(`Kelas: ${selectedClass}`, 14, 45);
    doc.text(`Tanggal: ${formattedDate}`, 14, 52);
    
    // Table
    const classStudents = students.filter(s => s.class === selectedClass);
    const tableData = [];
    
    classStudents.forEach((student, index) => {
        const attendanceRecord = attendance.find(
            a => a.studentId === student.id && a.date === selectedDate
        );
        let status = '-';
        if (attendanceRecord) {
            status = attendanceRecord.status.toUpperCase();
        }
        
        tableData.push([
            index + 1,
            student.name,
            student.nis,
            status
        ]);
    });
    
    doc.autoTable({
        startY: 58,
        head: [['No', 'Nama Siswa', 'NIS', 'Status']],
        body: tableData,
        theme: 'grid',
        headStyles: {
            fillColor: [74, 144, 226],
            fontSize: 10,
            fontStyle: 'bold',
            halign: 'center'
        },
        bodyStyles: {
            fontSize: 9
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: 15 },
            1: { cellWidth: 80 },
            2: { halign: 'center', cellWidth: 40 },
            3: { halign: 'center', cellWidth: 35 }
        }
    });
    
    // Footer
    const finalY = doc.lastAutoTable.finalY + 15;
    
    doc.setFontSize(10);
    doc.text('Mengetahui,', 14, finalY);
    doc.text(formattedDate, 150, finalY);
    
    doc.text('Kepala Sekolah', 14, finalY + 7);
    doc.text('Guru Mata Pelajaran', 150, finalY + 7);
    
    // Signature space (25mm)
    const signatureY = finalY + 32;
    
    doc.setFont(undefined, 'bold');
    doc.text(settings.principalName || '___________________', 14, signatureY);
    doc.text(settings.teacherName || '___________________', 150, signatureY);
    
    doc.setFont(undefined, 'normal');
    doc.text(`NIP. ${settings.principalNIP || '___________________'}`, 14, signatureY + 5);
    doc.text(`NIP. ${settings.teacherNIP || '___________________'}`, 150, signatureY + 5);
    
    // Open print dialog instead of direct download
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    // Open in new window for print preview
    const printWindow = window.open(pdfUrl, '_blank');
    if (printWindow) {
        printWindow.onload = function() {
            printWindow.print();
        };
    } else {
        // Fallback if popup blocked
        doc.save(`Absensi_${selectedClass}_${selectedDate}.pdf`);
        showNotification('Popup diblokir. PDF langsung didownload.');
    }
}

// ===== Rekap Functions =====
function displayRekap() {
    const selectedClass = document.getElementById('rekapKelas').value;
    const startDate = document.getElementById('rekapTanggalMulai').value;
    const endDate = document.getElementById('rekapTanggalAkhir').value;

    if (!startDate || !endDate) {
        showNotification('Pilih tanggal mulai dan tanggal akhir terlebih dahulu!');
        return;
    }

    if (startDate > endDate) {
        showNotification('Tanggal mulai tidak boleh lebih besar dari tanggal akhir!');
        return;
    }

    let filteredStudents = students;
    if (selectedClass) {
        filteredStudents = students.filter(s => s.class === selectedClass);
    }

    const tbody = document.getElementById('tableRekap');
    tbody.innerHTML = '';

    filteredStudents.forEach((student, index) => {
        const studentAttendance = attendance.filter(a => {
            return a.studentId === student.id && 
                   a.date >= startDate && 
                   a.date <= endDate;
        });

        let hadir = 0, izin = 0, sakit = 0, alfa = 0;
        studentAttendance.forEach(record => {
            if (record.status === 'hadir') hadir++;
            else if (record.status === 'izin') izin++;
            else if (record.status === 'sakit') sakit++;
            else if (record.status === 'alfa') alfa++;
        });

        const total = hadir + izin + sakit + alfa;
        const percentage = total > 0 ? Math.round((hadir / total) * 100) : 0;

        const row = `
            <tr>
                <td>${index + 1}</td>
                <td>${student.name}</td>
                <td>${student.class}</td>
                <td>${hadir}</td>
                <td>${izin}</td>
                <td>${sakit}</td>
                <td>${alfa}</td>
                <td><strong>${percentage}%</strong></td>
            </tr>
        `;
        tbody.innerHTML += row;
    });

    showNotification('Rekap berhasil ditampilkan!');
}

function printRekap() {
    const selectedClass = document.getElementById('rekapKelas').value;
    const startDate = document.getElementById('rekapTanggalMulai').value;
    const endDate = document.getElementById('rekapTanggalAkhir').value;

    if (!startDate || !endDate) {
        showNotification('Pilih tanggal mulai dan tanggal akhir terlebih dahulu!');
        return;
    }

    if (startDate > endDate) {
        showNotification('Tanggal mulai tidak boleh lebih besar dari tanggal akhir!');
        return;
    }

    // Check if there's data in the table
    const tableBody = document.getElementById('tableRekap');
    if (tableBody.children.length === 0) {
        showNotification('Tidak ada data untuk dicetak. Klik "Tampilkan" terlebih dahulu!');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Get current year and format date range
    const currentYear = new Date().getFullYear();
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const startDateFormatted = startDateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const endDateFormatted = endDateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const dateRange = `${startDateFormatted} - ${endDateFormatted}`;
    const todayFormatted = formatDate(new Date());
    
    // Header
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('REKAP ABSENSI SISWA', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text(settings.schoolName || 'SMA NEGERI 1', 105, 28, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`TAHUN ${currentYear}`, 105, 35, { align: 'center' });
    
    // Info
    doc.setFontSize(11);
    if (selectedClass) {
        doc.text(`Kelas: ${selectedClass}`, 14, 45);
        doc.text(`Periode: ${dateRange}`, 14, 52);
    } else {
        doc.text(`Kelas: Semua Kelas`, 14, 45);
        doc.text(`Periode: ${dateRange}`, 14, 52);
    }
    
    // Get data from table
    let filteredStudents = students;
    if (selectedClass) {
        filteredStudents = students.filter(s => s.class === selectedClass);
    }
    
    const tableData = [];
    filteredStudents.forEach((student, index) => {
        const studentAttendance = attendance.filter(a => {
            return a.studentId === student.id && 
                   a.date >= startDate && 
                   a.date <= endDate;
        });

        let hadir = 0, izin = 0, sakit = 0, alfa = 0;
        studentAttendance.forEach(record => {
            if (record.status === 'hadir') hadir++;
            else if (record.status === 'izin') izin++;
            else if (record.status === 'sakit') sakit++;
            else if (record.status === 'alfa') alfa++;
        });

        const total = hadir + izin + sakit + alfa;
        const percentage = total > 0 ? Math.round((hadir / total) * 100) : 0;

        tableData.push([
            index + 1,
            student.name,
            student.class,
            hadir,
            izin,
            sakit,
            alfa,
            percentage + '%'
        ]);
    });
    
    // Table
    doc.autoTable({
        startY: 58,
        head: [['No', 'Nama Siswa', 'Kelas', 'Hadir', 'Izin', 'Sakit', 'Alfa', '%']],
        body: tableData,
        theme: 'grid',
        headStyles: {
            fillColor: [74, 144, 226],
            fontSize: 9,
            fontStyle: 'bold',
            halign: 'center'
        },
        bodyStyles: {
            fontSize: 8
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: 10 },
            1: { cellWidth: 50 },
            2: { halign: 'center', cellWidth: 25 },
            3: { halign: 'center', cellWidth: 15 },
            4: { halign: 'center', cellWidth: 15 },
            5: { halign: 'center', cellWidth: 15 },
            6: { halign: 'center', cellWidth: 15 },
            7: { halign: 'center', cellWidth: 15 }
        }
    });
    
    // Footer
    const finalY = doc.lastAutoTable.finalY + 15;
    
    doc.setFontSize(10);
    doc.text('Mengetahui,', 14, finalY);
    doc.text(todayFormatted, 150, finalY);
    
    doc.text('Kepala Sekolah', 14, finalY + 7);
    doc.text('Guru Mata Pelajaran', 150, finalY + 7);
    
    // Signature space
    const signatureY = finalY + 32;
    
    doc.setFont(undefined, 'bold');
    doc.text(settings.principalName || '___________________', 14, signatureY);
    doc.text(settings.teacherName || '___________________', 150, signatureY);
    
    doc.setFont(undefined, 'normal');
    doc.text(`NIP. ${settings.principalNIP || '___________________'}`, 14, signatureY + 5);
    doc.text(`NIP. ${settings.teacherNIP || '___________________'}`, 150, signatureY + 5);
    
    // Open print dialog
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    const printWindow = window.open(pdfUrl, '_blank');
    if (printWindow) {
        printWindow.onload = function() {
            printWindow.print();
        };
    } else {
        // Fallback if popup blocked
        const className = selectedClass || 'Semua_Kelas';
        doc.save(`Rekap_Absensi_${className}_${startDate}_${endDate}.pdf`);
        showNotification('Popup diblokir. PDF langsung didownload.');
    }
}

// ===== Settings Functions =====
function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showNotification('Harap pilih file gambar!');
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            showNotification('Ukuran file maksimal 2MB!');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const base64Image = e.target.result;
            
            // Store temporarily (will be saved when clicking save button)
            settings.schoolLogo = base64Image;
            settings.schoolLogoType = 'image';
            
            // Update preview
            updateLogoPreview();
            
            showNotification('Logo berhasil dipilih. Klik "Simpan Profil Sekolah" untuk menyimpan.');
        };
        reader.readAsDataURL(file);
    }
}

function updateLogoPreview() {
    const previewImg = document.getElementById('logoPreviewImg');
    const previewEmoji = document.getElementById('logoPreviewEmoji');
    
    if (settings.schoolLogoType === 'image' && settings.schoolLogo) {
        previewImg.src = settings.schoolLogo;
        previewImg.style.display = 'block';
        previewEmoji.style.display = 'none';
    } else {
        previewImg.style.display = 'none';
        previewEmoji.style.display = 'block';
        previewEmoji.textContent = '🎓';
    }
}

function saveSchoolProfile() {
    const schoolName = document.getElementById('settingNamaSekolah').value.trim();
    const principalName = document.getElementById('settingNamaKepsek').value.trim();
    const principalNIP = document.getElementById('settingNIPKepsek').value.trim();

    if (schoolName || principalName || principalNIP || settings.schoolLogo) {
        settings.schoolName = schoolName || settings.schoolName;
        settings.principalName = principalName || settings.principalName;
        settings.principalNIP = principalNIP || settings.principalNIP;

        // Update logo in header
        const logoElement = document.querySelector('.logo');
        if (logoElement) {
            if (settings.schoolLogoType === 'image' && settings.schoolLogo) {
                logoElement.innerHTML = `<img src="${settings.schoolLogo}" alt="Logo" style="width: 100%; height: 100%; object-fit: contain; border-radius: 12px;">`;
            } else {
                logoElement.textContent = '🎓';
            }
        }

        // Update school name in header
        const schoolNameElement = document.getElementById('schoolName');
        if (schoolNameElement) {
            schoolNameElement.textContent = settings.schoolName;
        }

        saveData();
        showNotification('Profil sekolah berhasil disimpan!');
    } else {
        showNotification('Harap isi minimal satu field atau upload logo!');
    }
}

function saveTeacherName() {
    const name = document.getElementById('settingNamaGuru').value.trim();
    const nip = document.getElementById('settingNIPGuru').value.trim();
    
    if (name || nip) {
        settings.teacherName = name || settings.teacherName;
        settings.teacherNIP = nip || settings.teacherNIP;
        document.getElementById('userName').textContent = settings.teacherName;
        saveData();
        showNotification('Profil guru berhasil disimpan!');
    } else {
        showNotification('Harap isi minimal satu field!');
    }
}

function addClass() {
    const className = document.getElementById('settingNamaKelas').value.trim();
    
    if (!className) {
        showNotification('Harap masukkan nama kelas!');
        return;
    }
    
    if (classes.includes(className)) {
        showNotification('Kelas sudah ada!');
        return;
    }
    
    classes.push(className);
    saveData();
    populateClassDropdowns();
    renderKelasList();
    document.getElementById('settingNamaKelas').value = '';
    showNotification('Kelas berhasil ditambahkan!');
}

function deleteClass(className) {
    if (confirm(`Apakah Anda yakin ingin menghapus kelas ${className}?`)) {
        classes = classes.filter(c => c !== className);
        // Update students in this class
        students.forEach(student => {
            if (student.class === className) {
                student.class = '';
            }
        });
        saveData();
        populateClassDropdowns();
        renderKelasList();
        renderStudentTable();
        showNotification('Kelas berhasil dihapus!');
    }
}

function renderKelasList() {
    const container = document.getElementById('kelasList');
    container.innerHTML = '<h4 style="margin-top: 1.5rem; margin-bottom: 1rem;">Daftar Kelas:</h4>';
    
    classes.forEach(className => {
        const item = document.createElement('div');
        item.className = 'kelas-item';
        item.innerHTML = `
            <span><strong>${className}</strong></span>
            <button class="btn btn-danger" onclick="deleteClass('${className}')">Hapus</button>
        `;
        container.appendChild(item);
    });
}

function resetData() {
    if (confirm('PERHATIAN: Ini akan menghapus SEMUA data siswa dan absensi. Apakah Anda yakin?')) {
        if (confirm('Konfirmasi sekali lagi. Data tidak dapat dikembalikan!')) {
            localStorage.clear();
            location.reload();
        }
    }
}

// ===== Theme Toggle =====
function toggleTheme() {
    settings.darkMode = !settings.darkMode;
    document.body.classList.toggle('dark-mode');
    document.getElementById('darkModeSwitch').checked = settings.darkMode;
    
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.textContent = settings.darkMode ? '☀️' : '🌙';
    
    saveData();
}

// ===== Utility Functions =====
function populateClassDropdowns() {
    const dropdowns = [
        'filterKelas',
        'absensiKelas',
        'rekapKelas'
    ];

    dropdowns.forEach(id => {
        const select = document.getElementById(id);
        const currentValue = select.value;
        
        // Keep first option
        const firstOption = select.options[0];
        select.innerHTML = '';
        select.appendChild(firstOption);

        classes.forEach(className => {
            const option = document.createElement('option');
            option.value = className;
            option.textContent = className;
            select.appendChild(option);
        });

        select.value = currentValue;
    });
}

function populateModalClassDropdown() {
    const select = document.getElementById('siswaKelas');
    select.innerHTML = '<option value="">-- Pilih Kelas --</option>';
    
    classes.forEach(className => {
        const option = document.createElement('option');
        option.value = className;
        option.textContent = className;
        select.appendChild(option);
    });
}

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    document.getElementById('notificationText').textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function formatDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ===== Close modal when clicking outside =====
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}
