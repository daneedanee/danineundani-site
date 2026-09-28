import { Studio } from "@/components/studio/studio";

import { bodyFont, displayFont } from "./fonts";

export default function StudioPage() {
  return (
    <Studio
      fonts={{
        display: { family: displayFont.style.fontFamily, weight: 400 },
        body: { family: bodyFont.style.fontFamily, weight: 900 },
      }}
    />
  );
}
