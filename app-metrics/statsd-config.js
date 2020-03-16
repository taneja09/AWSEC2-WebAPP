{
    backends: [ "aws-cloudwatch-statsd-backend"],
    cloudwatch:
        {
        iamRole:'any',
        region: 'us-east-1'
        }
    
}