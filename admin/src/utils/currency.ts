export async function convertToINR(amount: number, from: string) {
  if (from === "INR") return amount;
  try {
    const res = await fetch(`https://api.exchangerate.host/convert?from=${from}&to=INR`);
    const data = await res.json();
    return amount * data.result;
  } catch {
    return amount;
  }
}
