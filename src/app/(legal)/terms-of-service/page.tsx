import { cookies } from 'next/headers';
import TermsOfServiceEN from './page.mdx';
import TermsOfServiceZH from './page.zh.mdx';

export default async function TermsOfServicePage() {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en';
  
  // 也可以从URL参数获取语言
  const isZh = locale === 'zh' || locale.startsWith('zh');
  
  return (
    <div>
      {isZh ? <TermsOfServiceZH /> : <TermsOfServiceEN />}
    </div>
  );
}