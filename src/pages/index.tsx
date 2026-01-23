
import Head from 'next/head'
import Hero from '@/components/Hero'
import TrustLogos from '@/components/TrustLogos'
import Features from '@/components/Features'
import HowItWorks from '@/components/HowItWorks'
import Testimonials from '@/components/Testimonials'
import Pricing from '@/components/Pricing'
import FAQ from '@/components/FAQ'
import Footer from '@/components/Footer'

export default function Home() {
    return (
        <>
            <Head>
                <title>Amma | Premium Custom Embroidery</title>
                <meta name="description" content="Custom Computer Embroidery on Premium Fashion" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <main>
                <Hero />
                <TrustLogos />
                <Features />
                <HowItWorks />
                <Pricing />
                <Testimonials />
                <FAQ />
            </main>
            <Footer />
        </>
    )
}
