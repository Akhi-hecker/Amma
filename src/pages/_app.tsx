import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Instrument_Serif, Inter, Montserrat } from 'next/font/google';
import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/context/AuthContext';

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

export default function App({ Component, pageProps }: AppProps) {
    return (
        <AuthProvider>
            <main className={`${instrumentSerif.variable} ${inter.variable} ${montserrat.variable} font-sans`}>
                <Navbar />
                <Component {...pageProps} />
            </main>
        </AuthProvider>
    );
}
