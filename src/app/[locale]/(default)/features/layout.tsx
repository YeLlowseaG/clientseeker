import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ClientSeeker 功能介绍 | 专业客户开发工具功能详解',
  description: '全面了解ClientSeeker的强大功能：智能搜索引擎、联系信息获取、精准地理定位、数据导出、多源数据整合等核心功能，助力您的客户开发工作更加高效精准。',
  keywords: 'ClientSeeker功能,客户开发功能,智能搜索,联系信息获取,数据导出,地理定位,多源数据整合',
  openGraph: {
    title: 'ClientSeeker 功能介绍 - 专业客户开发工具',
    description: '智能搜索、联系信息获取、数据导出等强大功能，助力高效客户开发',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ClientSeeker 功能介绍',
    description: '专业客户开发工具的核心功能详解',
  },
};

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}