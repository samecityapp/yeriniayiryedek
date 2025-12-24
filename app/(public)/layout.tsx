
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CookieBanner } from '@/components/ui/CookieBanner';

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Header />
            <main className="min-h-[100dvh]">{children}</main>
            <Footer />
            <CookieBanner />
        </>
    );
}
