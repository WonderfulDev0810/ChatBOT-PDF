import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import { useContext } from 'react';
import { EmbedProvider } from '../context/EmbedContext';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <EmbedProvider>
        <main className={inter.variable}>
          <Component {...pageProps} />
        </main>
      </EmbedProvider>
    </>
  );
}

export default MyApp;
