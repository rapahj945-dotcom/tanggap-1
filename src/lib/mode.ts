/** Mode tampilan ditentukan sekali saat dimuat: layar sempit memakai Framework7, layar lebar memakai tampilan desktop. */
export const BATAS = 860;
export const mobile = typeof window !== 'undefined' && matchMedia(`(max-width: ${BATAS}px)`).matches;
