import { cookies } from 'next/headers';
import PrivacyPolicyEN from './page.mdx';
import PrivacyPolicyZH from './page.zh.mdx';

export default async function PrivacyPolicyPage() {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en';
  
  // 也可以从URL参数获取语言
  const isZh = locale === 'zh' || locale.startsWith('zh');
  
  return (
    <div>
      {isZh ? <PrivacyPolicyZH /> : <PrivacyPolicyEN />}
    </div>
  );
}