const express = require('express');
const router = express.Router();
const genresApiController = require('../../controllers/genresController');

router.get('/genres');
router.get('/genres/detail/:id');


module.exports = router;