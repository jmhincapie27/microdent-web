import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { PreviewExitLink } from "./preview-exit-link";

/**
 * Aviso de vista previa de borradores. Solo aparece cuando un administrador la activa
 * desde el panel. Incluye la actualización en vivo mientras se edita en el panel.
 */
export async function PreviewBanner() {
  const { isEnabled } = await draftMode();
  if (!isEnabled) return null;
  return (
    <>
      <aside aria-label="Vista previa de borradores" className="on-dark bg-black text-white">
        <div className="container-page flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
          <p>
            <strong className="font-semibold">Vista previa:</strong> está viendo borradores sin publicar. Los
            visitantes no ven estos cambios.
          </p>
          <PreviewExitLink />
        </div>
      </aside>
      <VisualEditing />
    </>
  );
}
