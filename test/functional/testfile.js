var request = require('superagent');
var serverUrl = "http://localhost:3000/v1/user";


describe('Creation Tests', function() {
    it("Creates a new user in Database.", function(done) {
        request.post(serverUrl).send({
            "first_name": "alia",
            "last_name": "bhatt",
            "password": "abcdefduyt",
            "email_address": "aliya4236748@gmail.com"
        }).end(function(err, res) {
            if (err) {
                console.log(err);
            } else
                done();
        })
    })
});