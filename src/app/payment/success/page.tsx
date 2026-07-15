import { redirect } from 'next/navigation';

export default function PaymentSuccessRedirect() {
  redirect('/booking/status');
}
