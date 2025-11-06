// Type declarations for CSS imports
declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "tailwindcss/tailwind.css";
declare module "@fontsource/orbitron/400.css";
declare module "@fontsource/orbitron/700.css";
declare module "@fontsource/poppins/400.css";
declare module "@fontsource/poppins/700.css";
