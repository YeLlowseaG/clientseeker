"use client";

interface StructuredDataProps {
  data: object;
}

export default function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}

// 组织结构化数据
export function OrganizationStructuredData() {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ClientSeeker",
    url: "https://clientseeker.pro",
    logo: "https://clientseeker.pro/favicon.ico",
    description: "专业的客户开发工具，帮助销售团队快速找到目标客户联系信息",
    foundingDate: "2024",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "clientseeker@mail.xilou.life",
      availableLanguage: ["Chinese", "English"],
    },
    sameAs: [],
  };

  return <StructuredData data={organizationData} />;
}

// 产品结构化数据
export function ProductStructuredData() {
  const productData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "ClientSeeker",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: "专业的客户开发工具，帮助销售团队快速找到目标客户联系信息",
    url: "https://clientseeker.pro",
    author: {
      "@type": "Organization",
      name: "ClientSeeker",
    },
    offers: [
      {
        "@type": "Offer",
        name: "单月套餐",
        price: "0.01",
        priceCurrency: "CNY",
        description: "每月500次搜索，完整企业信息",
      },
      {
        "@type": "Offer",
        name: "年套餐",
        price: "0.01",
        priceCurrency: "CNY",
        description: "每月3000次搜索，多地图源整合",
      },
      {
        "@type": "Offer",
        name: "企业套餐",
        price: "0.01",
        priceCurrency: "CNY",
        description: "无限搜索，团队协作功能",
      },
    ],
  };

  return <StructuredData data={productData} />;
}

// 网站搜索结构化数据
export function WebSiteSearchStructuredData() {
  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ClientSeeker",
    url: "https://clientseeker.pro",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://clientseeker.pro/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return <StructuredData data={websiteData} />;
}

// 面包屑结构化数据
export function BreadcrumbStructuredData({ breadcrumbs }: { breadcrumbs: { name: string; url: string }[] }) {
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return <StructuredData data={breadcrumbData} />;
}