import { redirect } from 'next/navigation';

export default function PaymentPendingRedirect() {
  redirect('/booking/status');
}
