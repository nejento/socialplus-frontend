/**
 * Utility funkce pro práci se soubory
 */

/**
 * Formátuje velikost souboru v bajtech na čitelný řetězec
 * @param bytes Velikost v bajtech
 * @returns Formátovaný řetězec (např. "5 MB", "1.5 GB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  const size = bytes / Math.pow(k, i);

  // Pro jednotky větší než B zobrazujeme maximálně 1 desetinné místo
  // a pouze pokud je to potřeba (např. 1.5 MB místo 1.0 MB)
  if (i === 0) {
    return `${size} ${units[i]}`;
  } else {
    const formatted = size % 1 === 0 ? size.toString() : size.toFixed(1);
    return `${formatted} ${units[i]}`;
  }
};
