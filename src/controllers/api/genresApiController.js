const db = require('../../database/models');

module.exports = {
    list: (req, res) => {
        db.Genre.findAll()
        .then((genres) => {
            res.json({
                meta: {
                    status: 200,
                    total: genres.length,
                    url: '/api/genres'
                },
                data: genres
            })
        }
    }
}