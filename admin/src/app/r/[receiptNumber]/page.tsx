// src/app/r/[receiptNumber]/page.tsx
import "server-only";

async function getData(receiptNumber: string) {
  const res = await fetch(`${process.env.APP_BASE_URL}/r/${encodeURIComponent(receiptNumber)}`, { cache: "no-store" });
  return res.json();
}

export default async function ReceiptVerifyPage({ params }: { params: { receiptNumber: string } }) {
  const data = await getData(params.receiptNumber);
  if (!data.valid) return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Receipt Verification</h1>
      <p className="mt-3 text-rose-600">Invalid or not found.</p>
    </main>
  );
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Receipt Verification</h1>
      <div className="mt-4 rounded-lg border p-4">
        <p><b>NGO:</b> {data.ngo}</p>
        <p><b>Donor:</b> {data.donor}</p>
        <p><b>Amount:</b> {data.amount.toLocaleString("en-IN", { style: "currency", currency: data.currency })}</p>
        <p><b>Date:</b> {new Date(data.donatedAt).toLocaleDateString()}</p>
        <a className="mt-3 inline-block rounded bg-sky-600 px-3 py-2 text-white" href={data.receiptDownload}>Download receipt</a>
      </div>
    </main>
  );
}
