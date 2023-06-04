import { ReactNode } from "react";

export const metadata = {
  title: "Interview Prepper - Create"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}
