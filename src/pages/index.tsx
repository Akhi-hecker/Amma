import Head from 'next/head'
import Hero from '@/components/Hero'
import TopDesigns from '@/components/TopDesigns'
import Features from '@/components/Features'
import HowItWorks from '@/components/HowItWorks'
import Testimonials from '@/components/Testimonials'

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
                <TopDesigns />
                <Features />
                <HowItWorks />

                <Testimonials />
                <FAQ />
            </main>
            <Footer />
        </>
    )
}
