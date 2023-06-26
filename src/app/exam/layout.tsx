import { ReactNode } from "react";

export const metadata = {
  title: "Exam",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}
