import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ClientSeeker - 客户开发工具 | 快速获取潜在客户联系方式',
  description: 'ClientSeeker是专业的客户开发工具，帮助销售团队快速找到目标客户联系信息。支持全国搜索，整合高德地图、百度地图等多源数据，获取准确的企业电话、地址信息。',
  keywords: '客户开发,销售工具,客户搜索,企业联系方式,电话获取,市场拓展,销售线索,商户搜索',
  openGraph: {
    title: 'ClientSeeker - 专业客户开发工具',
    description: '快速获取潜在客户联系方式，助力业务增长',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ClientSeeker - 客户开发工具',
    description: '专业的客户联系信息获取工具，支持全国搜索',
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}