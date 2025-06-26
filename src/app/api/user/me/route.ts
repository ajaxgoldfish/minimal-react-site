import { NextResponse } from 'next/server';
import { getCurrentUserWithRole } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUserWithRole();
    
    if (!user) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      id: user.id,
      clerkId: user.clerkId,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    console.error('Error getting user info:', error);
    return NextResponse.json(
      { error: '获取用户信息失败' },
      { status: 500 }
    );
  }
} 