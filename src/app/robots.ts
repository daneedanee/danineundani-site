import type { MetadataRoute } from "next";

import { allowIndexing, robotsFor } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return robotsFor(allowIndexing);
}
