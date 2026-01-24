import { getOffers } from './actions';
import OfferManager from './OfferManager';

export const dynamic = 'force-dynamic';

export default async function OfferManagementPage() {
    const offers = await getOffers();

    return (
        <div className="space-y-6">
            <OfferManager offers={offers} />
        </div>
    );
}
