/**
 * Íconos pixel art dibujados a mano en un grid de 8x8 (bloques <rect>), nunca
 * emoji ni pictogramas Unicode — regla explícita de DISENO.md ("Nunca emoji
 * ni pictogramas Unicode como ícono"). Mismas formas que docs/mockups.html.
 */
type IconName = "photo" | "sound" | "check" | "cross" | "refresh"

const PATHS: Record<IconName, string> = {
  photo:
    "M0,0h8v1H0zM0,7h8v1H0zM0,1h1v6H0zM7,1h1v6H7zM5,2h1v1H5zM1,6h6v1H1zM3,5h1v1H3z",
  sound:
    "M1,3h1v2H1zM2,2h1v4H2zM3,3h1v2H3zM5,2h1v1H5zM5,5h1v1H5zM6,1h1v1H6zM6,6h1v1H6z",
  check:
    "M1,4h1v1H1zM2,5h1v1H2zM3,6h1v1H3zM4,5h1v1H4zM5,4h1v1H5zM6,3h1v1H6zM7,2h1v1H7z",
  cross:
    "M0,0h1v1H0zM1,1h1v1H1zM2,2h1v1H2zM3,3h1v1H3zM4,4h1v1H4zM5,5h1v1H5zM6,6h1v1H6zM7,7h1v1H7zM7,0h1v1H7zM6,1h1v1H6zM5,2h1v1H5zM4,3h1v1H4zM3,4h1v1H3zM2,5h1v1H2zM1,6h1v1H1zM0,7h1v1H0z",
  refresh:
    "M2,0h1v1H2zM3,0h1v1H3zM4,0h1v1H4zM5,0h1v1H5zM1,1h1v1H1zM6,1h1v1H6zM7,1h1v1H7zM0,2h1v1H0zM6,2h1v1H6zM0,3h1v1H0zM0,4h1v1H0zM7,4h1v1H7zM1,5h1v1H1zM6,5h1v1H6zM2,6h1v1H2zM3,6h1v1H3zM4,6h1v1H4zM5,6h1v1H5z",
}

export function PixelIcon({
  name,
  className,
  size = 16,
}: {
  name: IconName
  className?: string
  size?: number
}) {
  return (
    <svg
      viewBox="0 0 8 8"
      width={size}
      height={size}
      className={`pixicon ${className ?? ""}`}
      aria-hidden="true"
      shapeRendering="crispEdges"
    >
      <path d={PATHS[name]} />
    </svg>
  )
}
