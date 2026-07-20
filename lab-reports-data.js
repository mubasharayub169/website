/**
 * LAB REPORTS DATA
 * 
 * Admin Instructions:
 * 1. Upload patient PDF to the "lab-reports/" folder
 * 2. Add a new entry below with patient details
 * 3. Save this file — report will appear on the website immediately
 * 
 * Fields:
 *   name       - Patient full name
 *   mobile     - Patient registered mobile number (last 10 digits for verification)
 *   age        - Patient age in years
 *   date       - Report date (YYYY-MM-DD)
 *   type       - Type of test
 *   doctor     - Referring doctor
 *   file       - PDF filename inside lab-reports/ folder
 *   status     - "ready" or "pending"
 */

window.labReportsData = [

    // ─── SAMPLE REPORTS (DELETE WHEN ADDING REAL ONES) ───────────────────────
    {
        name: 'Ali Hassan',
        mobile: '3001234567',
        age: 35,
        date: '2026-07-01',
        type: 'Complete Blood Count (CBC)',
        doctor: 'Dr. Suleman Bashir',
        file: 'lab-reports/ali-hassan-cbc.pdf',
        status: 'ready'
    },
    {
        name: 'Fatima Malik',
        mobile: '3012345678',
        age: 28,
        date: '2026-07-03',
        type: 'Liver Function Test (LFT)',
        doctor: 'Dr. Mujahid Israr',
        file: 'lab-reports/fatima-malik-lft.pdf',
        status: 'ready'
    },
    {
        name: 'Usman Tariq',
        mobile: '3023456789',
        age: 42,
        date: '2026-07-05',
        type: 'Blood Sugar (Fasting & Random)',
        doctor: 'Dr. Suleman Bashir',
        file: 'lab-reports/usman-tariq-sugar.pdf',
        status: 'pending'
    },
    // ─── ADD REAL REPORTS BELOW ───────────────────────────────────────────────

];
