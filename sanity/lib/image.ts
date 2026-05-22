import imageUrlBuilder from "@sanity/image-url";
import { sanityClient } from "./client";

const builder = imageUrlBuilder(sanityClient);

export function urlForImage(source: unknown) {
  // Tipagem flexível pra aceitar qualquer formato de image asset do Sanity
  return builder.image(source as Parameters<typeof builder.image>[0]);
}
