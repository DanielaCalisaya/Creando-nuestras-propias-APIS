const db = require('../../database/models');
const getUrl = (req) => `${req.protocol}://${req.get('host')}${req.original}`


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
        
    },
    add: (req, res) => {
        
    },
    update: (req, res) => {
        
    },
    delete: (req, res) => {
        
    }
}