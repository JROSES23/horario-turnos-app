# Horario Turnos App

App Next.js 15 (App Router) para subir un Excel de turnos y visualizar horarios por persona y subcargo. Stateless, sin DB, lista para Vercel.

## Stack
- Next.js 15
- TypeScript
- Tailwind CSS
- xlsx + multer

## Scripts
```bash
npm install
npm run dev
```

## Formato esperado del Excel
- Sheet: `OPS FEB`
- Columnas: `Subcargo`, `Nombre`, `2026-02-01` (y fechas consecutivas)
- Valores: `AM`, `PM`, `LIBRE`, `VAC`, `FULL`
- Datos desde fila 3 (fila 1 headers, fila 2 opcional)

## API
`POST /api/parse-horarios` con `formData`:
- `file`: archivo `.xlsx`

Respuesta:
```json
{
  "data": [
    {
      "subcargo": "AUDITOR CALIDAD",
      "nombre": "Krishna Olea",
      "turnos": {
        "2026-02-01": "VAC",
        "2026-02-02": "VAC"
      }
    }
  ],
  "message": "Parseado OK",
  "sheetName": "OPS FEB",
  "sheets": ["OPS FEB"]
}
```

## Deploy en Vercel
1. Crear repo con este proyecto.
2. Importar en Vercel.
3. Build: `npm run build`
4. Framework: Next.js

No requiere variables de entorno.
