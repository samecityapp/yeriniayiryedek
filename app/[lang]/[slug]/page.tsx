import { notFound } from 'next/navigation';
import { offers } from '@/lib/offers';
import OfferPageTemplate from '@/components/OfferPageTemplate';

// This page catches all root-level slugs like /luvicavehotel-teklif
// It checks if it matches an Offer in the DB.
// If not, it triggers 404 (or allows other catch-alls if they existed, but here likely 404).

export default async function DynamicOfferPage({ params }: { params: { slug: string } }) {
    const { slug } = params;

    const offer = await offers.getBySlug(slug);

    if (!offer) {
        // Option: Check for other content types here if needed in future
        notFound();
    }

    return (
        <OfferPageTemplate
            hotelName={offer.hotel_name}
            price={offer.price}
            region={offer.region}
        />
    );
}
