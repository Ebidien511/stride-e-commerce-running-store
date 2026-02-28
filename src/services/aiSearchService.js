export const aiSearch = async (prompt, products) => {
    const response = await fetch(
`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,{
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: `You are a running shoe expert for STRIDE, a South African running shoe store.
Given a customer's natural language request and a list of products, return ONLY a JSON array of product IDs ranked from best to worst match.
Return ONLY the JSON array, no other text. Example: ["nike-pegasus-40", "hoka-clifton-9"]

Customer request: "${prompt}"

Available products:
${JSON.stringify(products.map(p => ({
                        id: p.id,
                        brand: p.brand,
                        name: p.name,
                        category: p.category,
                        arch: p.arch,
                        terrain: p.terrain,
                        price: p.price,
                        drop: p.drop,
                        weight: p.weight,
                        description: p.description,
                    })), null, 2)}`
                }]
            }]
        })
    }
    )

    const data = await response.json()
    console.log('Gemini response:', JSON.stringify(data, null, 2))
    const text = data.candidates[0].content.parts[0].text.trim()
    const clean = text.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
}

export const analyseImage = async (file, products) => {
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  const mimeType = file.type

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inline_data: { mime_type: mimeType, data: base64 } },
            {
              text: `You are a running shoe expert for STRIDE, a South African running shoe store.
A customer has uploaded an image. First determine if the image contains a shoe.
If it does NOT contain a shoe, return exactly: {"match": false, "ids": []}
If it does contain a shoe, analyse it and match against our products, then return exactly: {"match": true, "ids": ["product-id-1", "product-id-2"]}
Return ONLY the JSON object, no other text.

Available products:
${JSON.stringify(products.map(p => ({
  id: p.id,
  brand: p.brand,
  name: p.name,
  category: p.category,
  arch: p.arch,
  terrain: p.terrain,
  price: p.price,
  description: p.description,
})), null, 2)}`
            }
          ]
        }]
      })
    }
  )

  const data = await response.json()
  const text = data.candidates[0].content.parts[0].text.trim()
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

export const getProductSummary = async (product) => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a running shoe expert for STRIDE, a South African running shoe store.
Generate a summary for this product and return ONLY a JSON object, no other text:
{
  "summary": "2-3 sentence expert summary of the shoe",
  "greatFor": ["item1", "item2", "item3", "item4"],
  "notIdealFor": ["item1", "item2", "item3", "item4"]
}

Product:
${JSON.stringify({
  brand: product.brand,
  name: product.name,
  category: product.category,
  arch: product.arch,
  terrain: product.terrain,
  drop: product.drop,
  weight: product.weight,
  price: product.price,
  description: product.description,
  features: product.features,
})}`
          }]
        }]
      })
    }
  )
  const data = await response.json()
  const text = data.candidates[0].content.parts[0].text.trim()
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}