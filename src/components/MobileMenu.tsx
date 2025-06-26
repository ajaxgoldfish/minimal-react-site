"use client";

import Link from "next/link";
import { Menu, Package2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SignedOut, useUser } from "@clerk/nextjs";
import { useUserRole } from "@/hooks/useUserRole";

export function MobileMenu() {
  const { user, isLoaded } = useUser();
  const { userWithRole, loading, isAdmin } = useUserRole();

  // 基础菜单项
  const baseMenuItems = [
    { name: "首页", href: "/" },
    { name: "商品展示", href: "/products" },
    { name: "联系我们", href: "/contact" },
  ];

  // 角色相关的菜单项
  const roleMenuItems = [];
  
  if (isLoaded && user && userWithRole && !loading) {
    if (isAdmin) {
      roleMenuItems.push(
        { name: "管理后台", href: "/admin" },
      );
    } else {
      roleMenuItems.push(
        { name: "订单中心", href: "/user" },
      );
    }
  }

  const menuItems = [...baseMenuItems, ...roleMenuItems];

  return (
    <div className="md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle className="sr-only">菜单</SheetTitle>
            <SheetDescription className="sr-only">
              在这里选择要跳转的页面
            </SheetDescription>
          </SheetHeader>
          <nav className="grid gap-6 text-lg font-medium pt-6">
            <Link
              href="#"
              className="flex items-center justify-center gap-2 text-lg font-semibold"
            >
              <Package2 className="h-6 w-6" />
              <span>外贸网站</span>
            </Link>
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-muted-foreground hover:text-foreground text-center"
              >
                {item.name}
              </Link>
            ))}
            <SignedOut>
              <Link href="/sign-in" className="text-muted-foreground hover:text-foreground text-center">
                登录
              </Link>
              <Link href="/sign-up" className="text-muted-foreground hover:text-foreground text-center">
                注册
              </Link>
            </SignedOut>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
} 