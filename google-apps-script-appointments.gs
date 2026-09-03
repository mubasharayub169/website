const APPOINTMENT_SHEET_NAME = 'Appointments';
const PAYMENT_WHATSAPP_NUMBER = '923338438730';
const PAYMENT_ACCOUNTS = {
  JazzCash: { number: '03338438730', title: 'Syed Tayyab Abbas Kazmi' },
  Easypaisa: { number: '03338438730', title: 'Syed Tayyab Abbas Kazmi' },
  Raast: { number: '03338438730', title: 'Syed Tayyab Abbas Kazmi' }
};
const DOCTOR_ADVANCE_FEES = {
  'Dr. Muhammad Ikram': 3000,
  'Dr. M. Shoaib Ikram': 3000,
  'Dr. Tahir Ayub': 3000,
  'Dr. Barjees Mahmood Qureshi': 3000,
  'Dr. Suleman Bashir': 3000,
  'Dr. Sara Zain': 3000,
  'Dr. Soban Sarwar Gondal': 3000,
  'Dr. Kanwal Shehzad': 3000,
  'Dr. Syed Mohsin Raza': 3000,
  'Dr. Hassan Mahmud': 3000,
  'Dr. M. Zain-Ul-Abideen': 3000,
  'Dr. Qazi Aadil Inaam': 3000,
  'Dr. Mujahid Israr': 3000,
  'Dr. Asad Ali Sandhu': 3000,
  'Dr. Umar Draz Tariq': 3000,
  'Dr. Aqsa Liaqat': 3000,
  'Dr. Muhammad Owais Sharif': 3000,
  'Dr. M. Waheedullah Khan': 3000,
  'Dr. Touseef Ansar': 3000,
  'Dr. Mohsin Ali Nadir': 3000,
  'Dr. Talal Khurshid Bhatti': 3000,
  'Dr. Zain Safdar': 3000,
  'Dr. Muhammad Alam': 3000,
  'Dr. M. Bilal Abid': 3000,
  'Dr. Farrukh Akhtar': 3000,
  'Prof. Dr. Ch. Zafar Iqbal Gill': 3000,
  'Dr. Sadaf Omair': 3000,
  'Dr. Subhan Gondal': 3000,
  'Dr. Hamid Mukhtar Butt': 3000,
  'Dr. M. Usman Ashraf': 3000
};
const APPOINTMENT_HEADERS = [
  'Booking ID',
  'Submitted At',
  'Status',
  'Patient Name',
  'Phone',
  'Email',
  'Gender',
  'Age',
  'Doctor',
  'Specialty',
  'Preferred Date',
  'Preferred Time',
  'OPD Hours',
  'Reason / Notes',
  'Payment Method',
  'Advance Fee (PKR)',
  'Transaction ID',
  'Screenshot Sent on WhatsApp',
  'Payment Submitted At'
];

function doGet(event) {
  const data = event && event.parameter ? event.parameter : {};
  if (data.action === 'paymentConfig') {
    const doctor = clean(data.doctor, 120);
    const advanceFee = Number(DOCTOR_ADVANCE_FEES[doctor]);
    const accounts = Object.keys(PAYMENT_ACCOUNTS).reduce(function (result, method) {
      const account = PAYMENT_ACCOUNTS[method];
      if (account.number && account.title) {
        result.push({ method: method, number: account.number, title: account.title });
      }
      return result;
    }, []);

    return jsonResponse({
      ok: true,
      configured: Number.isInteger(advanceFee) && advanceFee > 0 && accounts.length > 0 && Boolean(PAYMENT_WHATSAPP_NUMBER),
      advanceFee: Number.isInteger(advanceFee) && advanceFee > 0 ? advanceFee : null,
      accounts: accounts,
      whatsappNumber: PAYMENT_WHATSAPP_NUMBER
    });
  }

  if (data.action === 'availability') {
    const doctor = clean(data.doctor, 120);
    const preferredDate = clean(data.preferredDate, 10);
    if (!doctor || !/^\d{4}-\d{2}-\d{2}$/.test(preferredDate)) {
      return jsonResponse({ ok: false, message: 'Doctor and date are required.' });
    }
    return jsonResponse({
      ok: true,
      bookedSlots: getBookedSlots(getAppointmentSheet(), doctor, preferredDate)
    });
  }

  return jsonResponse({
    ok: true,
    service: 'Ikram Hospital appointment booking'
  });
}

function doPost(event) {
  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(10000);

    const data = event && event.parameter ? event.parameter : {};
    if (String(data.website || '').trim()) {
      throw new Error('Invalid submission.');
    }

    const appointment = validateAppointment(data);
    const sheet = getAppointmentSheet();

    if (isSlotUnavailable(sheet, appointment)) {
      return jsonResponse({
        ok: false,
        code: 'SLOT_UNAVAILABLE',
        message: 'This appointment slot was just booked. Please select another available time.'
      });
    }

    if (isTransactionIdUsed(sheet, appointment.transactionId)) {
      return jsonResponse({
        ok: false,
        code: 'TRANSACTION_ID_USED',
        message: 'This payment transaction ID has already been submitted. Please contact the appointment desk.'
      });
    }

    const bookingId = createBookingId();
    sheet.appendRow([
      bookingId,
      new Date(),
      'Payment Verification Pending',
      safeCell(appointment.patientName),
      safeCell(appointment.phone),
      safeCell(appointment.email),
      safeCell(appointment.gender),
      safeCell(appointment.age),
      safeCell(appointment.doctor),
      safeCell(appointment.specialty),
      safeCell(appointment.preferredDate),
      safeCell(appointment.preferredTime),
      safeCell(appointment.opdHours),
      safeCell(appointment.notes),
      safeCell(appointment.paymentMethod),
      appointment.advanceFee,
      safeCell(appointment.transactionId),
      'Yes',
      new Date()
    ]);

    return jsonResponse({
      ok: true,
      bookingId: bookingId,
      message: 'Your appointment request has been received.'
    });
  } catch (error) {
    return jsonResponse({
      ok: false,
      message: error && error.message ? error.message : 'Unable to save the appointment request.'
    });
  } finally {
    if (lock.hasLock()) {
      lock.releaseLock();
    }
  }
}

function validateAppointment(data) {
  const appointment = {
    patientName: clean(data.patientName, 100),
    phone: clean(data.phone, 30),
    email: clean(data.email, 120),
    gender: clean(data.gender, 20),
    age: clean(data.age, 3),
    doctor: clean(data.doctor, 120),
    specialty: clean(data.specialty, 120),
    preferredDate: clean(data.preferredDate, 10),
    preferredTime: clean(data.preferredTime, 30),
    opdHours: clean(data.opdHours, 180),
    notes: clean(data.notes, 500),
    paymentMethod: clean(data.paymentMethod, 20),
    advanceFee: Number(clean(data.advanceFee, 10)),
    transactionId: clean(data.transactionId, 80),
    screenshotSent: clean(data.screenshotSent, 5)
  };

  if (!appointment.patientName || !appointment.phone || !appointment.doctor ||
      !appointment.preferredDate || !appointment.preferredTime) {
    throw new Error('Please complete all required appointment fields.');
  }

  if (!/^[+\d][\d\s()-]{7,24}$/.test(appointment.phone)) {
    throw new Error('Please enter a valid phone number.');
  }

  if (appointment.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(appointment.email)) {
    throw new Error('Please enter a valid email address.');
  }

  if (appointment.age && (!/^\d{1,3}$/.test(appointment.age) || Number(appointment.age) > 120)) {
    throw new Error('Please enter a valid age.');
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(appointment.preferredDate)) {
    throw new Error('Please select a valid appointment date.');
  }

  if (!/^\d{1,2}:\d{2} (AM|PM) - \d{1,2}:\d{2} (AM|PM)$/.test(appointment.preferredTime)) {
    throw new Error('Please select a valid 30-minute appointment slot.');
  }

  const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  if (appointment.preferredDate < today) {
    throw new Error('Appointment date cannot be in the past.');
  }

  const expectedFee = Number(DOCTOR_ADVANCE_FEES[appointment.doctor]);
  if (!Number.isInteger(expectedFee) || expectedFee <= 0) {
    throw new Error('Online advance payment is not configured for this consultant. Please call the appointment desk.');
  }

  if (['JazzCash', 'Easypaisa', 'Raast'].indexOf(appointment.paymentMethod) === -1) {
    throw new Error('Please select JazzCash, Easypaisa, or Raast as the payment method.');
  }

  const paymentAccount = PAYMENT_ACCOUNTS[appointment.paymentMethod];
  if (!paymentAccount || !paymentAccount.number || !paymentAccount.title) {
    throw new Error('The selected payment account is not configured. Please call the appointment desk.');
  }

  if (appointment.advanceFee !== expectedFee) {
    throw new Error('The submitted advance fee does not match this consultant fee. Please refresh and try again.');
  }

  if (!/^[A-Za-z0-9._-]{6,80}$/.test(appointment.transactionId)) {
    throw new Error('Please enter a valid payment transaction ID.');
  }

  if (!PAYMENT_WHATSAPP_NUMBER || appointment.screenshotSent !== 'Yes') {
    throw new Error('Please send the payment screenshot on WhatsApp and confirm it before submitting.');
  }

  return appointment;
}

function getAppointmentSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) {
    throw new Error('The Apps Script must be connected to a Google Sheet.');
  }

  let sheet = spreadsheet.getSheetByName(APPOINTMENT_SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(APPOINTMENT_SHEET_NAME);
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, APPOINTMENT_HEADERS.length);
  }

  sheet.getRange(1, 1, 1, APPOINTMENT_HEADERS.length)
    .setValues([APPOINTMENT_HEADERS])
    .setFontWeight('bold');

  return sheet;
}

function getBookedSlots(sheet, doctor, preferredDate) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  const firstRow = Math.max(2, lastRow - 999);
  const rows = sheet.getRange(firstRow, 1, lastRow - firstRow + 1, APPOINTMENT_HEADERS.length).getDisplayValues();

  return rows
    .filter(function (row) {
      return String(row[2]).toLowerCase() !== 'cancelled' &&
        row[8] === doctor &&
        row[10] === preferredDate;
    })
    .map(function (row) { return row[11]; })
    .filter(Boolean);
}

function isSlotUnavailable(sheet, appointment) {
  return getBookedSlots(sheet, appointment.doctor, appointment.preferredDate)
    .indexOf(appointment.preferredTime) !== -1;
}

function createBookingId() {
  const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyMMdd');
  const suffix = Utilities.getUuid().replace(/-/g, '').slice(0, 6).toUpperCase();
  return 'IKH-' + stamp + '-' + suffix;
}

function clean(value, maxLength) {
  return String(value || '').trim().replace(/[\u0000-\u001F\u007F]/g, ' ').slice(0, maxLength);
}

function safeCell(value) {
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function isTransactionIdUsed(sheet, transactionId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;

  return sheet.getRange(2, 17, lastRow - 1, 1)
    .createTextFinder(transactionId)
    .matchEntireCell(true)
    .matchCase(false)
    .findNext() !== null;
}

// Payment screenshots are sent directly to the configured WhatsApp number.