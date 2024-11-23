import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  article?: boolean;
}

const SEO: React.FC<SEOProps> = ({
  title = 'InTonus - Массажный салон',
  description = 'Профессиональные услуги массажа в Хасавюрте и Астрахани. Спортивный, лечебный и классический массаж от опытных специалистов.',
  image = 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=1000',
  article = false,
}) => {
  const { pathname } = useLocation();
  const siteUrl = 'https://intonus.ru'; // Replace with your actual domain

  const seo = {
    title: title,
    description: description,
    image: image,
    url: `${siteUrl}${pathname}`,
  };

  const schema = {
    '@context': 'https://schema.org',
    '@type': article ? 'Article' : 'Organization',
    name: 'InTonus',
    description: seo.description,
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    image: seo.image,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'ул. Гагарина, 61',
      addressLocality: 'Хасавюрт',
      addressRegion: 'Дагестан',
      postalCode: '368000',
      addressCountry: 'RU',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+79882018877',
      contactType: 'customer service',
    },
  };

  return (
    <Helmet>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="image" content={seo.image} />

      {/* Facebook Meta Tags */}
      <meta property="og:url" content={seo.url} />
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />

      {/* Twitter Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />

      {/* Schema.org */}
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>

      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#b45309" />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="Russian" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="InTonus" />

      {/* Canonical URL */}
      <link rel="canonical" href={seo.url} />
    </Helmet>
  );
};

export default SEO;