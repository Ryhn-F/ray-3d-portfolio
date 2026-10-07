/**
 * Static, zero-JS backdrop. It is the LCP-safe background and the fallback for
 * reduced-motion / no-WebGL / low-power devices. Replace with a real render
 * (AVIF/WebP) of the city once the scene is final.
 */
export default function Poster() {
  return <div aria-hidden="true" className="poster pointer-events-none fixed inset-0 -z-10" />;
}
