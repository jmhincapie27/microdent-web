"use client";

import { useState } from "react";
import { definePlugin, useClient } from "sanity";
import { Box, Button, Card, Flex, Heading, Stack, Text } from "@sanity/ui";
import { PinIcon } from "@sanity/icons/Pin";
import divipola from "@/data/divipola.json";
import { apiVersion } from "../env";

const BATCH = 150;

/**
 * Herramienta del Studio para cargar o actualizar los 33 departamentos y 1.122 municipios
 * (códigos DIVIPOLA). Usa la sesión del administrador: no requiere tokens.
 * Es idempotente: los IDs son fijos (territory-05001), así que puede ejecutarse varias veces.
 */
function DivipolaTool() {
  const client = useClient({ apiVersion });
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  const docs = [
    ...divipola.departments.map((d) => ({
      _id: `territory-${d.code}`,
      _type: "territory",
      kind: "department",
      code: d.code,
      name: d.name,
    })),
    ...divipola.municipalities.map((m) => ({
      _id: `territory-${m.code}`,
      _type: "territory",
      kind: "municipality",
      code: m.code,
      name: m.name,
      ...("officialName" in m && m.officialName ? { officialName: m.officialName } : {}),
      department: { _type: "reference", _ref: `territory-${m.departmentCode}` },
    })),
  ];

  async function run() {
    setStatus("running");
    setProgress(0);
    try {
      for (let i = 0; i < docs.length; i += BATCH) {
        const tx = client.transaction();
        for (const doc of docs.slice(i, i + BATCH)) tx.createOrReplace(doc);
        await tx.commit({ visibility: "async" });
        setProgress(Math.min(docs.length, i + BATCH));
      }
      setStatus("done");
      setMessage(`Listo: ${divipola.departments.length} departamentos y ${divipola.municipalities.length} municipios.`);
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <Box padding={5} style={{ maxWidth: 720 }}>
      <Stack gap={5}>
        <Heading size={3}>Territorios DIVIPOLA</Heading>
        <Text muted>
          Carga los departamentos y municipios de Colombia con su código oficial del DANE, para poder asignarlos a
          las zonas comerciales. Solo es necesario la primera vez o cuando el DANE actualice la división política.
          Ejecutarlo de nuevo no duplica nada.
        </Text>
        <Card padding={3} radius={2} tone="caution" border>
          <Text size={1}>{divipola.source}</Text>
        </Card>
        <Flex gap={3} align="center">
          <Button
            icon={PinIcon}
            text={status === "running" ? "Cargando…" : "Cargar / actualizar territorios"}
            tone="primary"
            disabled={status === "running"}
            onClick={run}
          />
          {status === "running" && (
            <Text size={1}>
              {progress} de {docs.length}
            </Text>
          )}
        </Flex>
        {status === "done" && (
          <Card padding={3} radius={2} tone="positive" border>
            <Text>{message}</Text>
          </Card>
        )}
        {status === "error" && (
          <Card padding={3} radius={2} tone="critical" border>
            <Stack gap={3}>
              <Text>No se pudo completar la carga. Verifique que su usuario tenga permisos de edición.</Text>
              <Text size={1} muted style={{ fontFamily: "monospace", wordBreak: "break-word" }}>
                {message}
              </Text>
            </Stack>
          </Card>
        )}
      </Stack>
    </Box>
  );
}

export const divipolaTool = definePlugin({
  name: "microdent-divipola",
  tools: [{ name: "territorios", title: "Territorios", icon: PinIcon, component: DivipolaTool }],
});
