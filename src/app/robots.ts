import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/pricing'],
      disallow: ['/usuario', '/revisor', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
