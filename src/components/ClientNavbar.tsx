'use client';

import Link from "next/link";
import { Package2, Shield, LucideIcon } from "lucide-react";
import { useUser } from '@clerk/nextjs';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { MobileMenu } from "./MobileMenu";
import { AuthButtons } from "./AuthButtons";
import { useUserRole } from "@/hooks/useUserRole";

// 菜单项类型定义
interface MenuItem {
  name: string;
  href: string;
  icon?: LucideIcon;
}

export default function ClientNavbar() {
  const { user, isLoaded } = useUser();
  const { userWithRole, loading, isAdmin } = useUserRole();
  
  // 基础菜单项
  const baseMenuItems: MenuItem[] = [
    { name: "首页", href: "/" },
    { name: "商品展示", href: "/products" },
    { name: "联系我们", href: "/contact" },
  ];

  // 角色相关的菜单项
  const roleMenuItems: MenuItem[] = [];
  
  if (isLoaded && user && userWithRole && !loading) {
    if (isAdmin) {
      roleMenuItems.push(
        { name: "管理后台", href: "/admin", icon: Shield },
      );
    } else {
      roleMenuItems.push(
        { name: "订单中心", href: "/user" },
      );
    }
  }

  const menuItems: MenuItem[] = [...baseMenuItems, ...roleMenuItems];

  return (
    <header className="sticky top-0 flex h-16 items-center px-4 md:px-6 border-b bg-background">
      <nav className="flex items-center gap-6 w-full">
        {/* Mobile Menu Trigger */}
        <MobileMenu />

        {/* PC Logo and Navigation */}
        <Link
          href="#"
          className="items-center gap-2 font-semibold hidden md:flex"
        >
          <Package2 className="h-6 w-6" />
          <span>外贸网站</span>
        </Link>
        <NavigationMenu className="hidden md:block ml-auto">
          <NavigationMenuList>
            {menuItems.map((item) => (
              <NavigationMenuItem key={item.name}>
                <NavigationMenuLink asChild>
                  <Link href={item.href} className={navigationMenuTriggerStyle()}>
                    <div className="flex items-center gap-2">
                      {item.icon && <item.icon className="h-4 w-4" />}
                      {item.name}
                    </div>
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
        
        {/* Mobile Title - Centered */}
        <div className="flex-1 text-center md:hidden">
            <Link href="#" className="inline-flex items-center text-lg font-semibold">
                <Package2 className="h-6 w-6" />
            </Link>
        </div>

        {/* User Role Badge (optional) */}
        {isLoaded && user && userWithRole && isAdmin && (
          <div className="hidden md:flex items-center gap-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            <Shield className="h-3 w-3" />
            管理员
          </div>
        )}

        {/* Loading skeleton for user section */}
        {(!isLoaded || loading) && (
          <div className="flex items-center gap-2 animate-pulse">
            <div className="h-8 w-20 bg-gray-200 rounded"></div>
          </div>
        )}

        {/* Clerk Auth Buttons */}
        <div className="flex items-center gap-2 ml-auto md:ml-0">
          <AuthButtons />
        </div>
      </nav>
    </header>
  );
} 