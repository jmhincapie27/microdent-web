import { Studio } from "./studio";

// Panel de administración: sin indexar en buscadores.
export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  return <Studio />;
}
