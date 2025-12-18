const express = require('express');
const router = express.Router();

const {
    getAllTokens,
    addToken,
    updateToken,
    deleteToken,
    searchTokenByName
}  = require('../controllers/tokenController');

router.get('/all', getAllTokens);
router.get('/search/:tokenName', searchTokenByName);
router.post('/add', addToken);
router.delete('/delete/:id', deleteToken);
router.put('/update/:id', updateToken);
module.exports = router;