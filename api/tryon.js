export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { id } = req.query;
    const poll = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: { 'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}` }
    });
    const result = await poll.json();
    return res.status(200).json(result);
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { clothingImage, modelType, skinTone, style, seed } = req.body;

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
          garment_des: `${modelType} ${style} tom de pele ${skinTone}`,
          is_checked: true,
          is_checked_crop: false,
          denoise_steps: 30,
          seed: seed || Math.floor(Math.random() * 1000)
        }
      })
    });

    const prediction = await response.json();
    return res.status(200).json({ id: prediction.id, status: prediction.status });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
