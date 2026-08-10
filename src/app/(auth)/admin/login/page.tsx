import { redirect } from 'next/navigation';

import { getOAuthAuthorizeUrl } from '@/shared/config';

export default function Page() {
  redirect(getOAuthAuthorizeUrl('GOOGLE'));
}
