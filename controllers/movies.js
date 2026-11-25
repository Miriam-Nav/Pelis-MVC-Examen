const Movie = require('../models/movie')

// Llista blanca compartida per les accions de l'API i de la web.
const allowedFields = ['title', 'year', 'director', 'duration', 'genre', 'rate']

function isObject(value) {
  // null i els arrays no són cossos vàlids per a una pel·lícula.
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function movieData(body) {
  if (!isObject(body)) {
    return null
  }

  // Creem dades noves per a no propagar camps controlats pel client.
  const data = {}

  for (const field of allowedFields) {
    if (Object.hasOwn(body, field)) {
      data[field] = body[field]
    }
  }

  // Convertim el camp de text del formulari a l'array que guarda el model.
  if (Object.hasOwn(data, 'genre') && typeof data.genre === 'string') {
    data.genre = data.genre
      .split(',')
      .map((genre) => genre.trim())
      .filter((genre) => genre !== '')
  }

  return data
}

function validationErrors(error) {
  // Només els errors de validació es poden mostrar per camps en el formulari.
  if (error.name !== 'ValidationError') {
    return null
  }

  // Reduïm els detalls de Mongoose a { camp: missatge } per a la vista.
  return Object.fromEntries(
    Object.entries(error.errors).map(([field, detail]) => [field, detail.message])
  )
}

async function listMovies(genre) {
  // El filtre es construeix amb un únic valor admés de la consulta.
  const filter = {}

  if (typeof genre === 'string' && genre.trim() !== '') {
    filter.genre = genre.trim()
  }

  // Aquesta promesa de Mongoose es resol abans de renderitzar o enviar JSON.
  return Movie.find(filter).sort({ title: 1 })
}

exports.listApi = async (req, res, next) => {
  try {
    // Flux API: paràmetre de consulta → model → representació JSON.
    const movies = await listMovies(req.query.genre)
    return res.json(movies)
  } catch (error) {
    return next(error)
  }
}

exports.showApi = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id)

    if (!movie) {
      // La consulta ha acabat, però no hi ha cap recurs amb aquest _id.
      return res.status(404).json({ error: 'Pel·lícula no trobada' })
    }

    return res.json(movie)
  } catch (error) {
    return next(error)
  }
}

exports.createApi = async (req, res, next) => {
  try {
    // La llista blanca precedix la inserció en MongoDB.
    const data = movieData(req.body)

    if (!data) {
      return res.status(400).json({ error: 'El cos ha de ser un objecte JSON' })
    }

    // Mongoose valida i persistix; si falla, el catch delega l'error.
    const movie = await Movie.create(data)
    return res
      .status(201)
      .location(`/api/movies/${movie._id}`)
      .json(movie)
  } catch (error) {
    return next(error)
  }
}

exports.updateApi = async (req, res, next) => {
  try {
    const data = movieData(req.body)

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'No hi ha cap camp permés per actualitzar' })
    }

    // Actualització parcial amb validació i retorn del document ja modificat.
    const movie = await Movie.findByIdAndUpdate(req.params.id, data, {
      returnDocument: 'after',
      runValidators: true
    })

    if (!movie) {
      return res.status(404).json({ error: 'Pel·lícula no trobada' })
    }

    return res.json(movie)
  } catch (error) {
    return next(error)
  }
}

exports.removeApi = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id)

    if (!movie) {
      return res.status(404).json({ error: 'Pel·lícula no trobada' })
    }

    // DELETE ha tingut èxit: 204 no ha d'incloure cap cos.
    return res.status(204).end()
  } catch (error) {
    return next(error)
  }
}

exports.listWeb = async (req, res, next) => {
  try {
    const movies = await listMovies(req.query.genre)
    // La web reutilitza la consulta, però la resposta és una vista HTML.
    return res.render('movies/list', { movies, genre: req.query.genre || '' })
  } catch (error) {
    return next(error)
  }
}

exports.showWeb = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id)

    if (!movie) {
      // La interfície web representa el 404 amb una plantilla controlada.
      return res.status(404).render('error', {
        title: 'Pel·lícula no trobada',
        message: 'No existix cap pel·lícula amb aquest identificador.'
      })
    }

    // La vista rep dades, no accedix directament a MongoDB.
    return res.render('movies/show', { movie })
  } catch (error) {
    return next(error)
  }
}

exports.newWeb = (req, res) => {
  // Un objecte buit permet reutilitzar el mateix formulari per a crear.
  return res.render('movies/form', { movie: {}, errors: {}, action: '/movies' })
}

exports.createWeb = async (req, res, next) => {
  // Conservem només els camps previstos abans d'intentar crear el document.
  const movie = movieData(req.body)

  if (!movie) {
    return res.status(400).render('movies/form', {
      movie: {},
      errors: { form: 'Les dades del formulari no són vàlides.' },
      action: '/movies'
    })
  }

  try {
    const createdMovie = await Movie.create(movie)
    // Patró POST-Redirect-GET: evita reenviar el formulari en recarregar.
    return res.redirect(`/movies/${createdMovie._id}`)
  } catch (error) {
    const errors = validationErrors(error)

    if (errors) {
      // Tornem a la vista amb les dades i els missatges que pot mostrar.
      return res.status(400).render('movies/form', {
        movie,
        errors,
        action: '/movies'
      })
    }

    return next(error)
  }
}

exports.editWeb = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id)

    if (!movie) {
      return res.status(404).render('error', {
        title: 'Pel·lícula no trobada',
        message: 'No existix cap pel·lícula amb aquest identificador.'
      })
    }

    // El mateix formulari rep ara les dades existents i la ruta d'actualització.
    return res.render('movies/form', {
      movie,
      errors: {},
      action: `/movies/${movie._id}`
    })
  } catch (error) {
    return next(error)
  }
}

exports.updateWeb = async (req, res, next) => {
  // El formulari envia text; movieData() el filtra i normalitza.
  const data = movieData(req.body)

  if (!data || Object.keys(data).length === 0) {
    return res.status(400).render('movies/form', {
      movie: { ...(data || {}), _id: req.params.id },
      errors: { form: 'Les dades del formulari no són vàlides.' },
      action: `/movies/${req.params.id}`
    })
  }

  try {
    // L'actualització conserva els validadors del model.
    const movie = await Movie.findByIdAndUpdate(req.params.id, data, {
      returnDocument: 'after',
      runValidators: true
    })

    if (!movie) {
      return res.status(404).render('error', {
        title: 'Pel·lícula no trobada',
        message: 'No existix cap pel·lícula amb aquest identificador.'
      })
    }

    // Després de modificar, mostrem la representació actualitzada amb un GET.
    return res.redirect(`/movies/${movie._id}`)
  } catch (error) {
    const errors = validationErrors(error)

    if (errors) {
      return res.status(400).render('movies/form', {
        movie: { ...data, _id: req.params.id },
        errors,
        action: `/movies/${req.params.id}`
      })
    }

    return next(error)
  }
}

exports.removeWeb = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id)

    if (!movie) {
      return res.status(404).render('error', {
        title: 'Pel·lícula no trobada',
        message: 'No existix cap pel·lícula amb aquest identificador.'
      })
    }

    // Després d'esborrar, ja no hi ha detall que mostrar: tornem al llistat.
    return res.redirect('/movies')
  } catch (error) {
    return next(error)
  }
}