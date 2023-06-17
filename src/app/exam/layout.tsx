import { ReactNode } from "react";

export const metadata = {
  title: "Interview Prepper - Exam"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}
