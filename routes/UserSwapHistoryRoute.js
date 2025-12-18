const express = require('express');
const router = express.Router();

const {
    getAllUserSwapHistory,
    getUserSwapHistoryByUserId,
    addUserSwapHistory,
    deleteUserSwapHistory,
    updateUserSwapHistory

}  = require('../controllers/UserSwapHistoryController');

router.get('/all', getAllUserSwapHistory);
router.get("/:userId", getUserSwapHistoryByUserId);
router.post('/add', addUserSwapHistory);
router.delete('/delete/:id', deleteUserSwapHistory);
router.put('/update/:id', updateUserSwapHistory);
module.exports = router;