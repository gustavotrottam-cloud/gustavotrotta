/**
 * Gera hero image via Pollinations (FLUX, gratuito, sem chave) e sobe no Sanity.
 * Retorna o asset _id pronto pra ser referenciado num campo image.
 */
export async function generateAndUploadHeroImage(opts: {
  prompt: string;
  slug: string;
  sanityProject: string;
  sanityDataset: string;
  sanityToken: string;
  seed?: number;
}): Promise<string> {
  // 1. Gera imagem via Pollinations
  const seed = opts.seed ?? Math.floor(Math.random() * 100000);
  const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
    opts.prompt
  )}?width=1600&height=900&model=flux&nologo=true&seed=${seed}&enhance=true`;

  const imgResp = await fetch(imgUrl);
  if (!imgResp.ok) {
    throw new Error(
      `Pollinations falhou (${imgResp.status}). Prompt: ${opts.prompt.slice(0, 100)}...`
    );
  }
  const imgBuffer = Buffer.from(await imgResp.arrayBuffer());

  // 2. Upload no Sanity Assets API
  const uploadResp = await fetch(
    `https://${opts.sanityProject}.api.sanity.io/v2024-01-01/assets/images/${
      opts.sanityDataset
    }?filename=${encodeURIComponent(`hero-${opts.slug}.png`)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${opts.sanityToken}`,
        "Content-Type": "image/png",
      },
      body: imgBuffer,
    }
  );
  const uploadData = await uploadResp.json();
  if (!uploadResp.ok) {
    throw new Error(
      `Upload Sanity falhou (${uploadResp.status}): ${JSON.stringify(uploadData)}`
    );
  }
  const assetId = uploadData.document?._id;
  if (!assetId) {
    throw new Error(`Sanity não retornou _id do asset`);
  }
  return assetId;
}
