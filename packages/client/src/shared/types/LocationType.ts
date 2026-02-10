import type { useLocation } from "react-router-dom";

export type LocationState = { background?: ReturnType<typeof useLocation> };
