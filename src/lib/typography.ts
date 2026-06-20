/**
 * Tamaño de fuente que respeta la preferencia global de escala de texto.
 * Devuelve un `calc()` que multiplica por `--text-scale` (CSS var), así el
 * cambio de escala es reactivo sin re-renderizar componentes.
 */
export function tpx(px: number): string {
  return `calc(var(--text-scale, 1) * ${px}px)`
}
