import { Activity, AlertItem, AppNotification, CitizenComplaint, LetterRequest, LetterType, Unit } from '../types';

export const mockLetterTypes: LetterType[] = [
  { id: 1, name: 'Surat Pengantar KTP / KK', description: 'Untuk permohonan atau pembaharuan KTP dan KK ke Kelurahan', is_active: true },
  { id: 2, name: 'Surat Keterangan Domisili', description: 'Bukti tempat tinggal sementara atau tetap di lingkungan RW', is_active: true },
  { id: 3, name: 'Surat Keterangan Usaha (SKU)', description: 'Untuk pengajuan izin usaha warga atau kredit UMKM', is_active: true },
  { id: 4, name: 'Surat Keterangan Tidak Mampu (SKTM)', description: 'Untuk keperluan beasiswa, keringanan rumah sakit, dan bansos', is_active: true },
  { id: 5, name: 'Surat Pengantar Nikah', description: 'Pengantar berkas pernikahan ke KUA / Catatan Sipil', is_active: true },
];

export const mockUnits: Unit[] = [
  {
    id: 1,
    name: 'Kolam Lele Bioflok A',
    type: 'lele',
    location: 'Lahan Karang Taruna Blok C',
    status: 1,
    active_cycle: {
      id: 1,
      name: 'Siklus Pembesaran Lele Batch 4',
      start_date: '2026-09-12',
      initial_qty: '3000 ekor',
    },
    latest_readings: [
      { code: 'ph', name: 'pH Air', value: 7.15, unit: 'pH', recorded_at: 'Baru saja' },
      { code: 'water_temp', name: 'Suhu Air', value: 28.2, unit: '°C', recorded_at: 'Baru saja' },
      { code: 'do', name: 'Oksigen Terlarut', value: 4.6, unit: 'mg/L', recorded_at: 'Baru saja' },
    ],
  },
  {
    id: 2,
    name: 'Greenhouse Hidroponik NFT',
    type: 'hidroponik',
    location: 'Pekarangan RW 05',
    status: 1,
    active_cycle: {
      id: 2,
      name: 'Siklus Selada Romaine & Pakcoy',
      start_date: '2026-09-20',
      initial_qty: '450 netpot',
    },
    latest_readings: [
      { code: 'ph', name: 'pH Larutan', value: 6.2, unit: 'pH', recorded_at: 'Baru saja' },
      { code: 'ec', name: 'EC Nutrisi', value: 1.85, unit: 'mS/cm', recorded_at: 'Baru saja' },
    ],
  },
  {
    id: 3,
    name: 'Biopond Maggot BSF Mandiri',
    type: 'maggot',
    location: 'Bank Sampah RW 05',
    status: 1,
    active_cycle: {
      id: 3,
      name: 'Pengolahan Sampah Organik Batch 2',
      start_date: '2026-09-28',
      initial_qty: '150 kg sampah/hari',
    },
    latest_readings: [
      { code: 'air_temp', name: 'Suhu Udara', value: 31.4, unit: '°C', recorded_at: 'Baru saja' },
      { code: 'humidity', name: 'Kelembapan', value: 72, unit: '%', recorded_at: 'Baru saja' },
    ],
  },
  {
    id: 4,
    name: 'Stasiun Kualitas Udara Pos 1',
    type: 'lingkungan',
    location: 'Taman Utama & Pos Ronda RW 05',
    status: 1,
    latest_readings: [
      { code: 'air_temp', name: 'Suhu Udara', value: 29.1, unit: '°C', recorded_at: 'Baru saja' },
      { code: 'humidity', name: 'Kelembapan', value: 65, unit: '%', recorded_at: 'Baru saja' },
    ],
  },
];

export const mockAlerts: AlertItem[] = [
  {
    id: 1,
    unit_id: 1,
    kind: 'threshold',
    severity: 'warning',
    value: 7.15,
    message: 'Nilai pH air kolam lele stabil normal (7.15 pH)',
    status: 'resolved',
    triggered_at: '2 jam lalu',
    resolved_at: '1 jam lalu',
    unit: { id: 1, name: 'Kolam Lele Bioflok A', type: 'lele' },
  },
];

export const mockActivities: Activity[] = [
  {
    id: 1,
    title: 'Kerja Bakti Akbar & Bersih Saluran Air RW 05',
    description: 'Seluruh warga diharapkan berpartisipasi membersihkan selokan dan perapihan taman guna antisipasi musim penghujan.',
    category: 'lingkungan',
    activity_date: '2026-10-05T07:30:00Z',
    location: 'Balai Warga RW 05 & Lapangan Voli',
    status: 'published',
    published_at: '2026-10-01T10:00:00Z',
  },
  {
    id: 2,
    title: 'Pelatihan Budidaya Maggot BSF untuk Pengelolaan Sampah',
    description: 'Karang Taruna mengadakan demo pengolahan sisa makanan organik warga menggunakan larva maggot BSF.',
    category: 'budidaya',
    activity_date: '2026-10-08T13:00:00Z',
    location: 'Rumah Kompos RW 05',
    status: 'published',
    published_at: '2026-10-02T08:00:00Z',
  },
  {
    id: 3,
    title: 'Rapat Kerja Pengurus Karang Taruna Triwulan IV',
    description: 'Evaluasi program IoT budidaya dan persiapan peringatan Hari Sumpah Pemuda.',
    category: 'rapat',
    activity_date: '2026-10-10T19:30:00Z',
    location: 'Sekretariat Karta',
    status: 'draft',
  },
];

export const mockLetterRequests: LetterRequest[] = [
  {
    id: 1,
    user_id: 2,
    letter_type_id: 1,
    status: 'siap_diambil',
    notes: 'Perpanjangan e-KTP dan perubahan status perkawinan',
    admin_note: 'Surat pengantar sudah ditandatangani RT dan RW. Silakan ambil di rumah Pak RT Bambang jam 19.30 - 21.00 WIB.',
    created_at: '2026-10-01T09:30:00Z',
    letter_type: { id: 1, name: 'Surat Pengantar KTP / KK' },
    user: { id: 2, name: 'Siti Aminah' },
  },
  {
    id: 2,
    user_id: 2,
    letter_type_id: 3,
    status: 'menunggu_review',
    notes: 'Untuk kelengkapan pengajuan bantuan modal usaha kue kering RW 05',
    created_at: '2026-10-02T11:15:00Z',
    letter_type: { id: 3, name: 'Surat Keterangan Usaha (SKU)' },
    user: { id: 2, name: 'Siti Aminah' },
  },
];

export const mockComplaints: CitizenComplaint[] = [
  {
    id: 1,
    reporter_id: 2,
    category: 'infrastruktur',
    description: 'Lampu penerangan jalan di gang 3 depan pos ronda mati sudah 2 hari.',
    location: 'Gang 3 RT 03 depan Pos Ronda',
    status: 'diproses',
    handler_note: 'Sudah dipanggil teknisi PLN/petugas lingkungan untuk ganti bohlam LED baru sore ini.',
    created_at: '2026-10-01T14:20:00Z',
    reporter: { id: 2, name: 'Siti Aminah' },
    handler: { id: 3, name: 'H. Bambang Irawan (Ketua RT)' },
  },
  {
    id: 2,
    reporter_id: 2,
    category: 'lingkungan',
    description: 'Ada penumpukan daun kering dan sisa pangkas dahan di pinggir saluran utama.',
    location: 'Dekat jembatan RW 05',
    status: 'baru',
    created_at: '2026-10-02T10:00:00Z',
    reporter: { id: 2, name: 'Siti Aminah' },
  },
];

export const mockNotifications: AppNotification[] = [
  {
    id: 1,
    user_id: 2,
    category: 'report',
    title: 'Surat Selesai & Siap Diambil',
    body: 'Surat Pengantar KTP Anda telah selesai dan siap diambil di Rumah Pak RT.',
    ref_type: 'letter_request',
    ref_id: 1,
    is_read: false,
    created_at: '30 menit lalu',
  },
  {
    id: 2,
    user_id: 2,
    category: 'activity',
    title: 'Kegiatan Baru: Kerja Bakti Akbar',
    body: 'Pengurus Karta mengundang seluruh warga dalam kerja bakti bersih saluran air.',
    ref_type: 'activity',
    ref_id: 1,
    is_read: true,
    created_at: '2 jam lalu',
  },
];
