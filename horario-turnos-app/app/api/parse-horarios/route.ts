import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import multer from "multer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const upload = multer({ storage: multer.memoryStorage() });
void upload;

function normalizeDate(value: unknown) {
  if (typeof value === "number") {
    return XLSX.SSF.format("yyyy-mm-dd", value);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length >= 10 && trimmed.includes("-")) return trimmed;
    return trimmed;
  }
  return "";
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Archivo no encontrado" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheets = workbook.SheetNames;
    const sheetName = sheets.includes("OPS FEB") ? "OPS FEB" : sheets[0];
    const sheet = workbook.Sheets[sheetName];

    if (!sheet) {
      return NextResponse.json({ error: "Sheet no encontrada" }, { status: 400 });
    }

    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" }) as Array<
      Array<string | number>
    >;

    if (rows.length < 3) {
      return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
    }

    const headerRow = rows[0];
    const dateHeaders = headerRow.slice(2).map(normalizeDate);

    const data = rows.slice(2).reduce(
      (acc, row) => {
        const subcargo = String(row[0] || "").trim();
        const nombre = String(row[1] || "").trim();
        if (!subcargo && !nombre) return acc;

        const turnos: Record<string, string> = {};
        dateHeaders.forEach((date, idx) => {
          if (!date) return;
          const value = String(row[idx + 2] || "").trim().toUpperCase();
          turnos[date] = value;
        });

        acc.push({ subcargo, nombre, turnos });
        return acc;
      },
      [] as Array<{ subcargo: string; nombre: string; turnos: Record<string, string> }>
    );

    return NextResponse.json({
      data,
      message: "Parseado OK",
      sheetName,
      sheets
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al parsear" },
      { status: 500 }
    );
  }
}
