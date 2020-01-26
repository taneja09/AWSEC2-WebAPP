module.exports = (app) => {
    const user = require('../controllers/user-controller');
    const bill = require('../controllers/bill-controller');

    app.post('/v1/user',user.create);
    app.get('/v1/user/self',user.view);
    app.put('/v1/user/self',user.update);

    app.post('/v1/bill',bill.create);
}