import { AppLayout } from "@/components/shared/AppLayout";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
     <AppLayout>
        {children}
     </AppLayout>
  );
}
