import { auth, currentUser } from '@clerk/nextjs/server';
import { cache } from 'react';
import { db } from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';

// 用户角色类型
export type UserRole = 'admin' | 'customer';

// 权限接口
export interface UserWithRole {
  id: number;
  clerkId: string;
  name: string | null;
  role: UserRole;
}

// 缓存的当前用户获取函数（避免Next.js 15的速率限制）
export const getCachedCurrentUser = cache(currentUser);

/**
 * 获取当前用户信息（包含角色）
 */
export async function getCurrentUserWithRole(): Promise<UserWithRole | null> {
  try {
    const authResult = await auth();
    if (!authResult.userId) {
      return null;
    }

    // 查找数据库中的用户
    let dbUser = await db.query.user.findFirst({
      where: eq(user.clerkId, authResult.userId),
    });

    // 如果用户不存在，创建新用户（默认为customer）
    if (!dbUser) {
      const currentUserData = await getCachedCurrentUser();
      if (!currentUserData) {
        return null;
      }

      const [newUser] = await db
        .insert(user)
        .values({
          clerkId: currentUserData.id,
          name: currentUserData.firstName || currentUserData.username || '',
          role: 'customer', // 新用户默认为客户
        })
        .returning();

      dbUser = newUser;
    }

    return {
      id: dbUser.id,
      clerkId: dbUser.clerkId,
      name: dbUser.name,
      role: dbUser.role as UserRole,
    };
  } catch (error) {
    console.error('Error getting current user with role:', error);
    return null;
  }
}

/**
 * 检查用户是否为管理员
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUserWithRole();
  return user?.role === 'admin';
}

/**
 * 检查用户是否为客户
 */
export async function isCustomer(): Promise<boolean> {
  const user = await getCurrentUserWithRole();
  return user?.role === 'customer';
}

/**
 * 要求用户为管理员，否则抛出错误
 */
export async function requireAdmin(): Promise<UserWithRole> {
  const user = await getCurrentUserWithRole();
  
  if (!user) {
    throw new Error('未登录');
  }
  
  if (user.role !== 'admin') {
    throw new Error('需要管理员权限');
  }
  
  return user;
}

/**
 * 要求用户已登录，否则抛出错误
 */
export async function requireAuth(): Promise<UserWithRole> {
  const user = await getCurrentUserWithRole();
  
  if (!user) {
    throw new Error('需要登录');
  }
  
  return user;
}

/**
 * 检查用户权限的中间件类型
 */
export type PermissionCheck = () => Promise<boolean>;

/**
 * 权限检查预设
 */
export const permissions = {
  admin: isAdmin,
  customer: isCustomer,
  authenticated: async () => {
    const user = await getCurrentUserWithRole();
    return !!user;
  },
}; 