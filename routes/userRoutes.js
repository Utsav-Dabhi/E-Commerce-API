const express = require('express');
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} = require('../controllers/userController');

/* we first authenticate the user and then check if the user is admin or not */
// adding arguments here would directly invoke the function so we need to return a calback fnc from authorizePermissions function
router
  .route('/')
  .get([authenticateUser, authorizePermissions('admin', 'owner')], getAllUsers);

// the getSingleUser should be placed after these routes as placing it above will cause the other routes to check for it as params
// eg - hitting /showMe route will cause the getSingleUser to search for id = showMe if it is placed before
// router.route('/:id').get(getSingleUser);

router.route('/showMe').get(authenticateUser, showCurrentUser);
router.route('/updateUser').patch(authenticateUser, updateUser);
router.route('/updateUserPassword').patch(authenticateUser, updateUserPassword);

router.route('/:id').get(
  [authenticateUser], // , authorizePermissions('admin', 'owner')
  getSingleUser
);

module.exports = router;
