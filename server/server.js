const express = require('express')
const cors = require('cors')
const axios = require('axios')
const cheerio = require('cheerio')
const path = require('path')

const app = express()
app.use(cors())
app.use(express.json())

app.post('/api/scrape-recipe', async (req, res) => {
  const { url } = req.body
  if (!url) return res.status(400).json({ error: 'URL requise' })

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
      },
      timeout: 12000,
    })

    const $ = cheerio.load(response.data)
    let recipeData = null

    // Try JSON-LD schema.org/Recipe (most reliable)
    $('script[type="application/ld+json"]').each((_, el) => {
      if (recipeData) return
      try {
        const json = JSON.parse($(el).html())
        recipeData = findRecipeInJsonLd(json)
      } catch (_) {}
    })

    if (recipeData) {
      return res.json({ success: true, recipe: parseJsonLdRecipe(recipeData, url) })
    }

    // Fallback: extract title and OG image only
    const title = $('h1').first().text().trim() || $('title').text().trim().split('|')[0].trim()
    const image = $('meta[property="og:image"]').attr('content') || null

    return res.json({
      success: true,
      partial: true,
      recipe: {
        name: title,
        description: '',
        prepTime: 0,
        cookTime: 0,
        servings: 4,
        ingredients: [],
        instructions: [],
        image,
        source: url,
      },
    })
  } catch (err) {
    console.error('Scrape error:', err.message)
    return res.status(500).json({
      error: "Impossible de récupérer la recette. Vérifiez l'URL ou ajoutez la recette manuellement.",
    })
  }
})

function findRecipeInJsonLd(obj) {
  if (!obj) return null
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = findRecipeInJsonLd(item)
      if (found) return found
    }
    return null
  }
  const type = obj['@type']
  if (type === 'Recipe' || (Array.isArray(type) && type.includes('Recipe'))) return obj
  if (obj['@graph']) return findRecipeInJsonLd(obj['@graph'])
  return null
}

function parseJsonLdRecipe(r, url) {
  return {
    name: r.name || '',
    description: r.description || '',
    prepTime: parseIsoDuration(r.prepTime),
    cookTime: parseIsoDuration(r.cookTime),
    servings: parseServings(r.recipeYield),
    ingredients: (r.recipeIngredient || []).map(raw => ({ raw, name: raw, quantity: '', unit: '' })),
    instructions: parseInstructions(r.recipeInstructions),
    image: parseImage(r.image),
    source: url,
  }
}

function parseIsoDuration(str) {
  if (!str) return 0
  const m = str.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
  if (!m) return 0
  return (parseInt(m[1] || 0) * 60) + parseInt(m[2] || 0)
}

function parseServings(val) {
  if (!val) return 4
  if (typeof val === 'number') return val
  const str = Array.isArray(val) ? val[0] : val
  const m = String(str).match(/\d+/)
  return m ? parseInt(m[0]) : 4
}

function parseInstructions(val) {
  if (!val) return []
  if (typeof val === 'string') return [val]
  if (Array.isArray(val)) {
    return val.map(step => {
      if (typeof step === 'string') return step
      if (step.text) return step.text
      if (step.name) return step.name
      return ''
    }).filter(Boolean)
  }
  return []
}

function parseImage(val) {
  if (!val) return null
  if (typeof val === 'string') return val
  if (Array.isArray(val)) return val[0]?.url || val[0] || null
  if (val.url) return val.url
  return null
}

// En production, sert le frontend React
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../client/dist')
  app.use(express.static(clientDist))
  app.get('*', (req, res) => res.sendFile(path.join(clientDist, 'index.html')))
}

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Serveur démarré sur http://localhost:${PORT}`))
