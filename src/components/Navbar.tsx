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
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Navbar() {
  const menuItems = [
    { name: "首页", href: "/" },
    { name: "商品展示", href: "/products" },
    { name: "联系我们", href: "/contact" },
    { name: "订单中心", href: "/user" },
  ];

  return (
    <header className="sticky top-0 flex h-16 items-center px-4 md:px-6 border-b bg-background">
      <nav className="flex items-center gap-6 w-full">
        {/* Mobile Menu Trigger */}
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
                    {item.name}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
            <SignedOut>
              <NavigationMenuItem>
                <Link href="/sign-in" className={navigationMenuTriggerStyle()}>
                  登录
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/sign-up" className={navigationMenuTriggerStyle()}>
                  注册
                </Link>
              </NavigationMenuItem>
            </SignedOut>
          </NavigationMenuList>
        </NavigationMenu>
        
        {/* Mobile Title - Centered */}
        <div className="flex-1 text-center md:hidden">
            <Link href="#" className="inline-flex items-center text-lg font-semibold">
                <Package2 className="h-6 w-6" />
            </Link>
        </div>

        {/* Clerk Auth Buttons */}
        <div className="flex items-center gap-2">
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
} 