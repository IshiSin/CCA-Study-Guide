import createMDX from '@next/mdx'
import remarkGfm from 'remark-gfm'

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
  },
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/CCA-Study-Guide',
  assetPrefix: '/CCA-Study-Guide',
  images: { unoptimized: true },
  experimental: {
    serverComponentsExternalPackages: ['shiki'],
  },
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
}

export default withMDX(nextConfig)