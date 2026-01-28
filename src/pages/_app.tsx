import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Instrument_Serif, Inter, Montserrat } from 'next/font/google';
import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/context/AuthContext';
import { useGuestMigration } from '@/hooks/useGuestMigration';

// Font configurations
const instrumentSerif = Instrument_Serif({
    subsets: ['latin'],
    weight: '400',
    variable: '--font-instrument-serif',
});

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
});

const montserrat = Montserrat({
    subsets: ['latin'],
    variable: '--font-montserrat',
});

const AppContent = ({ Component, pageProps }: any) => {
    useGuestMigration();
    return (
        <main className={`${instrumentSerif.variable} ${inter.variable} ${montserrat.variable} font-sans`}>
            <Navbar />
            <Component {...pageProps} />
        </main>
    );
};

export default function App({ Component, pageProps }: AppProps) {
    return (
        <AuthProvider>
            <AppContent Component={Component} pageProps={pageProps} />
        </AuthProvider>
    );
}
