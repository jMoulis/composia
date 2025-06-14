import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['http://localhost:3000', 'http://127.0.0.1:3000'],
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);