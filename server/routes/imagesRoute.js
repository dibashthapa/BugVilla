const router = require('express').Router();
const verify = require('../middleware/verify')

const upload = require('../middleware/fileUpload');
const { User } = require('../models/userModel');
const UserImageController = require('../controllers/UserImageController')

let avatarUpload = upload.single('image');

router.param('username', async (req, res, next) => {
  try {
    let user = await User.findOne({ username: req.params.username });
    if (!user) return res.notFound({ error: 'User not found!!' });

    req.foundUser = user;
    return next();
  } catch (err) {
    console.log(err);
    res.internalError({
      error: 'Something went wrong'
    })
  }
});

router.get("/me/avatar", verify, UserImageController.getCurrentUserAvatar);
router.patch("/me/avatar/upload", verify, avatarUpload, UserImageController.uploadProfileImage);
router.get('/:username/avatar', verify, UserImageController.getAvatarImageByUsername)
router.get("/:username/avatar/raw", verify, UserImageController.getRawAvatarImageByUsername);

module.exports = router