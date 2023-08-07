"use client";

import * as React from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";

import { siteConfig } from "@/config/site";
import { Button, buttonVariants } from "@/shared/ui/button";
import { Icons } from "@/shared/icons";
import { MainNav } from "@/app/components/topbar/main-nav";
import { ThemeToggle } from "@/app/components/topbar/theme-toggle";

export function SiteHeader() {
  const queryClient = useQueryClient();
  const refreshQuestion = () => {
    queryClient.invalidateQueries(["questions"]);
    queryClient.invalidateQueries(["domains"]);
  };
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 px-4 sm:justify-between sm:space-x-0 sm:px-[2rem]">
        <MainNav items={siteConfig.mainNav} />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <Button variant={"ghost"} size={"icon"} onClick={refreshQuestion}>
              <Icons.refresh className={"h-4 w-4"} />
              <span className="sr-only">Refresh</span>
            </Button>{" "}
            <ThemeToggle />
            <Link href={siteConfig.links.github} target="_blank" rel="noreferrer">
              <div
                className={buttonVariants({
                  size: "icon",
                  variant: "ghost",
                })}
              >
                <Icons.github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </div>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
