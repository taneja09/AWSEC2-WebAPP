module.exports = (app) => {
    const user = require('../controllers/user-controller');
    const bill = require('../controllers/bill-controller');
    const file = require('../controllers/file-controller');
    const inavlidRoute = require('../controllers/invalidRoute');

    app.post('/v1/user',user.create);
    app.get('/v1/user/self',user.view);
    app.put('/v1/user/self',user.update);

    app.post('/v1/bill',bill.create);
    app.get('/v1/bills',bill.viewAllBills);
    app.get('/v1/bill/:id',bill.getBill);
    app.put('/v1/bill/:id',bill.updateBill);
    app.delete('/v1/bill/:id',bill.deleteBill);

    app.post('/v1/bill/:id/file',file.create);
    app.get('/v1/bill/:billid/file/:fileId',file.getFile);
    app.delete('/v1/bill/:billid/file/:fileId',file.deleteFile);

    app.all('*',inavlidRoute.routeError);
}
