export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { clothingImage, modelType, skinTone, style } = req.body;

  try {

    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4",
        input: {
          human_img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=512&h=768&fit=crop&crop=top",
          garm_img: clothingImage,
          garment_des: `${modelType} ${style}`,
          is_checked: true,
          is_checked_crop: false,
          denoise_steps: 30,
          seed: Math.floor(Math.random() * 1000)
        }
      })
    });

    const prediction = await response.json();

    // Aguarda o resultado
    let result = prediction;
    while (result.status !== 'succeeded' && result.status !== 'failed') {
      await new Promise(r => setTimeout(r, 2000));
      const poll = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: { 'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}` }
      });
      result = await poll.json();
    }

    if (result.status === 'failed') {
      return res.status(500).json({ error: 'Geração falhou' });
    }

    return res.status(200).json({ images: result.output });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
