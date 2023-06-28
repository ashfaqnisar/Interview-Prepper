import { ReactNode } from "react";

export const metadata = {
  title: "Create",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}
