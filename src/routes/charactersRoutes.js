const express = require('express');
const router = express.Router();
const characterController = require('../controllers/charactersController');
const upload = require('../middleware/multer'); 

router.post('/characters', upload.single('img'), characterController.createCharacter);
router.get('/characters', characterController.getCharacters);
router.get('/characters/:id', characterController.getCharacterById);
router.put('/characters/:id',upload.single('img'), characterController.updateCharacters);
router.delete('/characters/:id', characterController.deleteCharacters);



module.exports = router;
