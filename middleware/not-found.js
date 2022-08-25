/*
    This middleware is used for routes that does not exist

    IT SHOULD ALWAYS COME BEFORE error-handler middleware AND AFTER our api routes

    Also notice we do not have any next() call here,
    Its because once we hit an non-existant route we just want to send the response of this middleware
*/

const notFound = (req, res) => res.status(404).send('Route does not exist');

module.exports = notFound;
