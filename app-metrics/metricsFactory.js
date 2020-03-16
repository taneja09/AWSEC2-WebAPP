var SDC = require('statsd-client'),
metrics = new SDC({host: 'localhost', port:8125});

//*********  USER Metrics **************/
//API Counter
// metrics.counter("User.POST.addUser");
// metrics.counter("User.GET.viewUser");
// metrics.counter("User.PUT.updateUser");

//API Completion timer
// metrics.timing("User.POST.APIComplete");
// metrics.timing("User.GET.APIComplete");
// metrics.timing("User.PUT.APIComplete");

//Database Query Completion timer
// metrics.timing("User.POST.DBQueryComplete");
// metrics.timing("User.GET.DBQueryComplete");
// metrics.timing("User.PUT.DBQueryComplete");
//*****************************************/


//*********  Bill Metrics **************/
//API Counter
metrics.counter("Bill.POST.addBill");
metrics.counter("Bill.GET.viewBill");
metrics.counter("Bill.GET.viewAllBills");
metrics.counter("Bill.PUT.updateBill");
metrics.counter("Bill.DEL.deleteBill");

//API Completion timer
metrics.timing("Bill.POST.APIComplete");
metrics.timing("Bill.GET.APIComplete");
metrics.timing("Bill.GETALL.APIComplete");
metrics.timing("Bill.PUT.APIComplete");
metrics.timing("Bill.DEL.APIComplete");

//Database Query Completion timer
metrics.timing("Bill.POST.DBQueryComplete");
metrics.timing("Bill.GET.DBQueryComplete");
metrics.timing("Bill.GETALL.DBQueryComplete");
metrics.timing("Bill.PUT.DBQueryComplete");
metrics.timing("Bill.DEL.DBQueryComplete");
//*****************************************/

//*********  File Metrics **************/
//API Counter
metrics.counter("File.POST.addFile");
metrics.counter("File.GET.viewFile");
metrics.counter("File.DEL.deleteFile");

//API Completion timer
metrics.timing("File.POST.APIComplete");
metrics.timing("File.GET.APIComplete");
metrics.timing("File.DEL.APIComplete");

//Database Query Completion timer
metrics.timing("File.POST.DBQueryComplete");
metrics.timing("File.GET.DBQueryComplete");
metrics.timing("File.DEL.DBQueryComplete");

//Database Query Completion timer
metrics.timing("File.POST.S3");
metrics.timing("File.DEL.S3");

module.exports = metrics;

