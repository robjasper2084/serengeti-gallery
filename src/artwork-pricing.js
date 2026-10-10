export function editionPrices(work) {
 return Number.isFinite(work.digital) && Number.isFinite(work.physical)
  ? `Digital $${work.digital} · Print $${work.physical}` : '';
}

export function restoreSubmittedPrices(works) {
 for (const work of works) {
  if (!Number.isFinite(work.digital)) work.digital = 28;
  if (!Number.isFinite(work.physical)) work.physical = 280;
 }
}
