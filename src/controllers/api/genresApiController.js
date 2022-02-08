const db = require('../../database/models');
const fetch = require('node-fetch');
const axios = require('axios');

module.exports = {

    list: (req, res) => {
        /* 1er endpoint */
        db.Genre.findAll()
        .then((genres) => { /* si encontró generos aqui pueden ir las validaciones */
            res.json({ /* dentro del res.json creamos el objeto */
                meta: {
                    status: 200,
                    total: genres.length,
                    url: '/api/genres'
                },
                data: genres
            })
        })
    },
    detail: (req, res) => {
        db. Genre.findByPk(req.params.id)
        .then((genre) => {
            res.json({ 
                meta: {
                    status: 200,
                    url: `/api/genres/${req.params.id}`
                },
                data: genre
            })
        }) 
    },
    fetch: (req, res) => {
        fetch('https://restcountries.com/v3.1/all')
        .then(response => response.json())
        .then(countries => {
            res.render('countries', {countries})
        })
    },
    fetch2: (req, res) => {
        axios.get('http://localhost:3001/api/genres')
        .then(result => {
            res.render('genresList', {
                genres: result.data.data
            })
        })

       /*  fetch('http://localhost:3001/api/genres')
        .then(response => response.json())
        .then(genres => {
            res.render('genresList', {
                genres : genres.data
            })
        }) */
    }
}