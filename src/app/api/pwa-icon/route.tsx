import { ImageResponse } from "next/og";

const DEFAULT_SIZE = 512;
const MIN_SIZE = 96;
const MAX_SIZE = 1024;
const PRIMARY_COLOR = "#2563eb";
const PRIMARY_DARK = "#1d4ed8";
const FOREGROUND_COLOR = "#f8fafc";

function parseSizeParam(value: string | null): number {
  if (!value) {
    return DEFAULT_SIZE;
  }

  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed)) {
    return DEFAULT_SIZE;
  }

  return Math.min(Math.max(parsed, MIN_SIZE), MAX_SIZE);
}

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dimension = parseSizeParam(searchParams.get("size"));
  const maskable = searchParams.get("maskable") === "1";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: `linear-gradient(135deg, ${PRIMARY_COLOR}, ${PRIMARY_DARK})`,
          borderRadius: maskable ? 0 : Math.floor(dimension * 0.25),
        }}
      >
        <span
          style={{
            color: FOREGROUND_COLOR,
            fontSize: Math.round(dimension * 0.48),
            fontWeight: 700,
            fontFamily: '"Inter", "SF Pro Display", "Segoe UI", sans-serif',
            letterSpacing: "-0.04em",
          }}
        >
          L
        </span>
      </div>
    ),
    {
      width: dimension,
      height: dimension,
    },
  );
}
