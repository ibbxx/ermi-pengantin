import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculateBookingEstimate,
  canSubmitPayment,
  canTransitionBooking,
  normalizeWhatsApp,
  periodsOverlap,
} from '../src/lib/booking-rules';

test('normalisasi WhatsApp menghasilkan E.164 Indonesia yang konsisten', () => {
  assert.equal(normalizeWhatsApp('0812-3456-7890'), '6281234567890');
  assert.equal(normalizeWhatsApp('+62 812 3456 7890'), '6281234567890');
  assert.equal(normalizeWhatsApp('81234567890'), '6281234567890');
  assert.throws(() => normalizeWhatsApp('123'));
});

test('harga dan DP dihitung ulang dari katalog server', () => {
  const estimate = calculateBookingEstimate({
    customerName: 'Ayu', customerWhatsApp: '081234567890', eventDate: '2030-01-01',
    eventLocation: 'Denpasar', eventType: 'akad', consent: true,
    dressPreferences: [{ dressId: 'dress-1', size: 'M', color: 'Ivory' }], makeupId: 'makeup-1',
  }, {
    dresses: [{ id: 'dress-1', slug: 'dress', name: 'Dress', category: 'Akad', price: 1_000_000, deposit: 0, sizes: ['M'], colors: ['Ivory'], images: [], description: '', material: '', rentalDurationDays: 3, rating: 5, reviewCount: 0, isPopular: false, status: 'available' }],
    makeup: [{ id: 'makeup-1', name: 'Makeup', price: 500_000, description: '', features: [], images: [] }],
    decor: [], packages: [],
  }, { minDpPercent: 30, transportBase: 100_000 });

  assert.equal(estimate.subtotal, 1_500_000);
  assert.equal(estimate.additionalFees, 100_000);
  assert.equal(estimate.totalAmount, 1_600_000);
  assert.equal(estimate.depositRequired, 450_000);
});

test('DP paket memakai nominal katalog dan tidak boleh melampaui total', () => {
  const estimate = calculateBookingEstimate({
    customerName: 'Ayu', customerWhatsApp: '081234567890', eventDate: '2030-01-01',
    eventLocation: 'Denpasar', eventType: 'resepsi', consent: true, weddingPackageId: 'package-1',
  }, {
    dresses: [], makeup: [], decor: [],
    packages: [{ id: 'package-1', name: 'Paket Lengkap', price: 2_000_000, dressesIncluded: 1, makeupIncluded: [], decorIncluded: '', features: [], depositRequired: 3_000_000, isPopular: false }],
  }, { minDpPercent: 30, transportBase: 100_000 });

  assert.equal(estimate.totalAmount, 2_100_000);
  assert.equal(estimate.depositRequired, 2_100_000);
});

test('transisi status dan pembayaran menolak lompatan yang tidak sah', () => {
  assert.equal(canTransitionBooking('submitted', 'confirmed'), true);
  assert.equal(canTransitionBooking('submitted', 'completed'), false);
  assert.equal(canTransitionBooking('completed', 'ready'), false);
  assert.equal(canSubmitPayment('submitted', 'not_due'), false);
  assert.equal(canSubmitPayment('confirmed', 'awaiting_payment'), true);
  assert.equal(canSubmitPayment('declined', 'awaiting_payment'), false);
});

test('overlap periode bersifat inklusif pada tanggal batas', () => {
  assert.equal(periodsOverlap('2030-01-01', '2030-01-03', '2030-01-03', '2030-01-05'), true);
  assert.equal(periodsOverlap('2030-01-01', '2030-01-02', '2030-01-03', '2030-01-05'), false);
});
