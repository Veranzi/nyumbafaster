import { AdminListingForm } from "./admin-listing-form";

export const metadata = { title: "Admin — Add listing" };

export default function AdminNewListingPage() {
    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-semibold">Add listing</h1>
                <p className="mt-1 text-sm text-zinc-500">
                    Paste raw text and let AI fill the form, or enter details manually.
                </p>
            </div>
            <AdminListingForm />
        </div>
    );
}
