/**
 * CAMS app mark: a shield (protection) wrapped around a small figure
 * (the child/family at the center of the work). Built as inline SVG rather
 * than an image file — no extra asset to bundle, scales cleanly at any
 * size, and easy to recolor via currentColor.
 *
 * Deliberately not a photo of a child: this system handles sensitive
 * information about minors, so real or stock imagery of children has no
 * place in the branding. Avatars elsewhere in the app (workers, children)
 * use initials for the same reason — see components/avatar-initials.jsx.
 */
export function Logo({ className = 'h-6 w-6', title = 'CAMS' }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={title}>
      <path
        d="M24 4L8 10V22C8 32.5 14.6 41 24 44C33.4 41 40 32.5 40 22V10L24 4Z"
        fill="currentColor" fillOpacity="0.14"
      />
      <path
        d="M24 4L8 10V22C8 32.5 14.6 41 24 44C33.4 41 40 32.5 40 22V10L24 4Z"
        stroke="currentColor" strokeWidth="2.25" strokeLinejoin="round"
      />
      <circle cx="24" cy="20" r="5.25" fill="currentColor" />
      <path
        d="M14.5 33C15.8 27.8 19.5 25 24 25C28.5 25 32.2 27.8 33.5 33"
        stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
    </svg>
  );
}
