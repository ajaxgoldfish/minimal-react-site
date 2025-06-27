import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 移除了不必要的 serverExternalPackages 配置
  // 因为项目使用的是 Drizzle ORM 而不是 TypeORM
};

export default nextConfig;
