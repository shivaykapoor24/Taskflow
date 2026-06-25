export function formatDate(d) {
  if (!d) return '';
  const dt   = new Date(d);
  const now  = new Date();
  const diff = Math.ceil((dt - now) / 86400000);
  if (diff < 0)   return 'Overdue';
  if (diff === 0)  return 'Today';
  if (diff === 1)  return 'Tomorrow';
  if (diff <= 7)   return `In ${diff}d`;
  return dt.toLocaleDateString('en', { month: 'short', day: 'numeric' });
}
export function isOverdue(d) {
  if (!d) return false;
  return new Date(d) < new Date();
}
