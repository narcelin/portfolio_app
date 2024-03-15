import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Adding font throughout the application w/ tailwind antialised */}
      <body className={`${inter.className} antialised`}>{children}</body> 
    </html>
  );
}
