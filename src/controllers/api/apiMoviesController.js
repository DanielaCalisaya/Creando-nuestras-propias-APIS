const db = require('../../database/models');
const getUrl = (req) => `${req.protocol}://${req.get('host')}${req.originalUrl}`


moduule.exports = {
   
    getAll: (req, res) => {
        db.Movie.findAll({
            include: [
                {association: 'genres'},
                {association: 'actors'}
            ]
        })
        .then((movies) => {
            return res.status(200).json({
                meta: {
                    endpoint: getUrl(req),
                    status: 200,
                    total: movies.length
                },
                data: movies
            })
        })
        .catch((error) => {
            if(error.name === 'SequelizeConnectionRefusedError'){
                res.status(500).json({ msg: "Tenemos un error, disculpe"})
            }
         })     
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
            })
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
        .then((movie) => {
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
                case 'SequelizeValidationError':
                    let errorsMsg = [];
                    let notNullErrors = [];
                    let validationsErrors = [];
                    error.errors.forEach((error) => {
                        errorsMsg.push(error.message);
                        if(error.type == 'Validation error'){
                            validationsErrorspush(error.message);
                        }
                        if(error.type == 'notNull Violation'){
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
            favourite_movie_id: null,
        },
        {
            where: {
                favourite_movie_id: req.params.id
            }
        });
        let actorMovieUpdate = db.actor_movie.destroy({
            where: {
                movie_id: req.params.id
            },
        });
        Promise.all([actorUpdate, actorMovieUpdate]).then(
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