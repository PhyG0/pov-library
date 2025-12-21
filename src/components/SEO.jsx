import React from 'react';
import { Helmet } from 'react-helmet-async';

export function SEO({ title, description, image, url }) {
    const siteTitle = 'Eclipse';
    const siteUrl = window.location.origin;
    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    const metaDescription = description || 'Team POV Management - Upload and organize YouTube gameplay recordings';
    const metaImage = image || `${siteUrl}/og-default.png`; // Fallback image if we had one
    const metaUrl = url || window.location.href;

    return (
        <Helmet>
            {/* Standard metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={metaDescription} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={metaUrl} />
            <meta property="og:title" content={title || siteTitle} />
            <meta property="og:description" content={metaDescription} />
            {image && <meta property="og:image" content={metaImage} />}

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={metaUrl} />
            <meta property="twitter:title" content={title || siteTitle} />
            <meta property="twitter:description" content={metaDescription} />
            {image && <meta property="twitter:image" content={metaImage} />}
        </Helmet>
    );
}
