require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const nunjucks = require('nunjucks')
const path = require('node:path')

const moviesApiRouter = require('./routes/movies-api')
const moviesWebRouter = require('./routes/movies-web')

// L'aplicació coordina middleware i routers; no conté el CRUD de Movies.
const app = express()
const PORT = process.env.PORT || 3000
const uri = process.env.MONGODB_URI

// No iniciem el servidor sense la configuració sensible necessària.
if (!uri) {
  console.error("Falta la variable d'entorn MONGODB_URI")
  process.exit(1)
}

// Connectem Nunjucks amb Express i mantenim l'escapament HTML actiu.
nunjucks.configure(path.join(__dirname, 'views'), {
  autoescape: true,
  express: app
})
app.set('view engine', 'njk')

// Els analitzadors preparen req.body abans que cap ruta el necessite.
app.use(express.json({ limit: '100kb' }))
app.use(express.urlencoded({ extended: false, limit: '100kb' }))
// Només els recursos de public/ es poden descarregar directament.
app.use(express.static(path.join(__dirname, 'public')))

// Cada prefix delega la petició en el router de la seua interfície.
app.use('/api/movies', moviesApiRouter)
app.use('/movies', moviesWebRouter)

// Esta funció només s'executa si cap ruta anterior ha enviat una resposta.
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Ruta no trobada' })
  }

  return res.status(404).render('error', {
    title: 'Pàgina no trobada',
    message: 'La pàgina sol·licitada no existix.'
  })
})

// Quatre paràmetres identifiquen aquest middleware com a gestor d'errors.
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error)
  }

  // Traduïm errors coneguts a respostes segures per al client.
  let status = 500
  let message = 'S’ha produït un error intern.'

  if (error.type === 'entity.parse.failed') {
    status = 400
    message = 'El cos de la petició no és vàlid.'
  } else if (error.type === 'entity.too.large') {
    status = 413
    message = 'El cos supera el límit permés.'
  } else if (error.name === 'ValidationError') {
    status = 400
    message = 'Les dades no són vàlides.'
  } else if (error.name === 'CastError') {
    status = 400
    message = 'L’identificador o una dada no té un format vàlid.'
  }

  console.error(error)

  // La mateixa incidència es representa en JSON o HTML segons la interfície.
  if (req.path.startsWith('/api/')) return res.status(status).json({ error: message })
  return res.status(status).render('error', {
    title: 'Error',
    message
  })
})

async function start() {
  try {
    // Evitem acceptar peticions fins que MongoDB estiga disponible.
    await mongoose.connect(uri)
    app.listen(PORT, () => {
      console.log(`Servidor en http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('No s’ha pogut connectar a MongoDB:', error.message)
    process.exit(1)
  }
}

start()