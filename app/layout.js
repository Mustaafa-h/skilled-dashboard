import '../app/ui/globals.css';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';
import Providers from './providers';
import { Toaster } from 'react-hot-toast'; 

export default function RootLayout({ children }) {
  const cookieStore = cookies();
  const locale = cookieStore.get('locale')?.value || 'en';

  const messagesPath = path.resolve(`./messages/${locale}.json`);
  const messages = JSON.parse(fs.readFileSync(messagesPath, 'utf8'));

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <head>
        <title>Dashboard</title>
      </head>
      <body>
        <Providers locale={locale} messages={messages}>
          {children}
          <Toaster position="top-right" /> 
        </Providers>
      </body>
    </html>
  );
}
