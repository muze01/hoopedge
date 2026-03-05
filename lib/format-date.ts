export const formatDate = (dateStr: string): string => {
  // console.log(`${dateStr}`);
  const d = new Date(dateStr);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  // console.log(`${day}/${month}/${year}`);
  return `${day}/${month}/${year}`;
}
