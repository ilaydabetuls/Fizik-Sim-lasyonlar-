export default function StatusBadge({ status }: { status: string }) {
  let bg = 'bg-gray-100 text-gray-600';
  if (status === 'Ön Test Tamamlandı') bg = 'bg-blue-100 text-blue-800';
  if (status === 'Son Test Tamamlandı') bg = 'bg-green-100 text-green-800';
  return <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${bg}`}>{status}</span>;
}
