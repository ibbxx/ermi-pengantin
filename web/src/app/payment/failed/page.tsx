import { redirect } from 'next/navigation';

export default function PaymentFailedRedirect() {
  redirect('/booking/status');
}
