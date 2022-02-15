const db = require('../../database/models');
/* Cuando queramos pasar el endpoint pasamos esta funcion getUrl y le psamos el objeto req */
const getUrl = (req) => `${req.protocol}://${req.get('host')}${req.originalUrl}`
/* En vez de usar el navegador usaremos postman para testear */

module.exports = {
   
    getAll: (req, res) => {
        db.Movie.findAll({
            include: [
                {association: 'genre'},
                {association: 'actors'}
            ]
        })
        .then((movies) => {
            return res.status(200).json({
                meta: {  /* propiedad meta, ahi guardaremos el endpoint */
                    endpoint: getUrl(req),
                    status: 200, /* En el caso de que venga todo bien un 200 */
                    total: movies.length
                },
                data: movies
            })
        })
        .catch((error) => {
            if(error.name === 'SequelizeConnectionRefusedError'){ /* si ese es el error, envia ese mensaje, en donde podemos poner una vista */
                res.status(500).json({ msg: "Tenemos un error, disculpe"}) /* o .send('Tenemos un error, disculpe') */
            }
        })     
        /* .catch((error) => res.status(400).send(error)) */
    },
    getOne: (req, res) => {
        if(req.params.id % 1 !== 0 || req.params.id < 0){
            return res.status(400).json({ /* 400 esta haciendo mal la peticiom */
                meta: {
                    status: 400,
                    msg: 'Wrong ID'
                }
            })
        }else{
            db.Movie.findOne({
                where: {
                    id: req.params.id
                },
                include: [
                    {association: 'genres'},
                    {association: 'actors'}
                ]
            })
            .then((movie) => {
                if(movie){
                    return res.status(200).json({
                        meta: {
                            endpoint:getUrl(req),
                            status: 200,
                        },
                        data: movie
                    })
                }else{
                    return res.status(400).json({
                        meta: {
                            status: 400,
                            msg: 'ID not found'
                        }
                    })
                }
            }) /* la ruta en postman seria por get http://localhost:3001/apis/movies/10 (ej) */
            .catch((error) => res.status(500).send(error))
        }
    },
    add: (req, res) => {
        const { title, rating, awards, release_date, length, genre_id } = req.body
        db.Movie.create({
            title,
            rating,
            awards,
            release_date,
            length,
            genre_id
        })
        .then((movie) => { /* captura los errores que pueden haber ahora con la creacion con sequelize */
            res.status(201).json({
                meta: {
                    endpoint: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
                    msg: 'Movie added successfully',
                },
                data: movie
            })
        })
        .catch((error) => {
            switch(error.name) {
                case 'SequelizeValidationError': /* ordenamos los errores para que se vean de una manera más amigable */
                    let errorsMsg = []; /* con las tres variables guardamos los errores */
                    let notNullErrors = [];
                    let validationsErrors = [];
                    error.errors.forEach((error) => {
                        errorsMsg.push(error.message); /* del error que recorro guardare la propiedad mensaje */
                        if(error.type == 'Validation error'){ /* si el error que recorro en este momento es de tipo validation error */
                            validationsErrors.push(error.message);
                        }
                        if(error.type == 'notNull Violation'){ /* si sale este otro error */
                            notNullErrors.push(error.message)
                        }
                    });
                    let response = {
                        status: 400,
                        message: 'missing or wrong data',
                        errors: {
                            quantity: errorsMsg.length,
                            msg: errorsMsg,
                            notNull: notNullErrors,
                            validations: validationsErrors,
                        }
                    }
                    return res.status(400).json(response);
                default:
                    return res.status(500).json(error)
            }
        })
    },
    update: (req, res) => {
        const { title, rating, awards, release_date, length, genre_id } = req.body

        db.Movie.update({
            title,
            rating,
            awards,
            release_date,
            length,
            genre_id
        },{
            where: {
                id: req.params.id
            }
        })
        .then((result) => {
            if(result){
                return res.status(201).json({
                    msg: 'Movie updated seccessfully'
                });
            }else{
                return res.status(200).json({
                    msg: 'no changes'
                })
            }
        })
        .catch((error) => res.status(500).send(error))
    },
    delete: (req, res) => {
        let actorUpdate = db.Actor.update({
            favorite_movie_id: null,
        },
        {
            where: {
                favorite_movie_id: req.params.id
            }
        });
        let actorMovieUpdate = db.ActorMovie.destroy({ /* trabaja con la tabla pivot */
            where: {
                movie_id: req.params.id
            },
        });
        Promise.all([actorUpdate, actorMovieUpdate]).then(  /* se lanzan dos promesas */
            db.Movie.destroy({
               where: {
                   id: req.params.id
               },
            })
            .then(result => {
                if(result){
                    return res.status(200).json({
                        msg: 'Movie deleted successfully'
                    })
                }else{
                    return res.status(200).json({
                        msg: 'no changes'
                    })
                }
            })
            .catch((error) => res.status(500).send(error))
        )
    }
}

/* en el caso de la foreignKey de actors de movies_db en los datos de la misma 
al On Delete y al On Update le cambiamos el valor de restrict a set null, 
entonces ahi no trae errores al borrar */

/* para el POST en Postman cambiamos el método POST del http y seleccionamos body
debajo escribiriamos las caracteristicas en formato json */