const aws = require('aws-sdk');
aws.config.update({
  accessKeyId: process.env.accessKeyId,
  secretAccessKey: process.env.secretAccessKey,
  region: process.env.region
});
const s3 = new aws.S3();
const zlib = require('zlib');
const gzip = zlib.createGzip();

exports.handler = (event, context, callback) => {
    var keyName = event.Records[0].s3.object.key;

    s3.getObject({ Bucket: process.env.sourceBucket, Key: keyName }, function (err, data) {
         if (!err) {
          let fileContent = data.Body.toString();

            zlib.gzip(fileContent, (err, buffer) => {
                if (!err) {
                    let contentType = '';
                    let extension = keyName.split('.').pop();
                    extension = extension.toString().trim().toLowerCase();
                    
                    switch(extension){
                        case 'js':
                        case 'map':
                            contentType = 'application/json';
                            break;
                        case 'json':
                            contentType = 'text/html';
                            break;
                        case 'html':
                            contentType = 'text/html';
                            break;
                        case 'svg':
                            contentType = 'image/svg+xml';
                            break;
                        case 'png':
                            contentType = 'image/png';
                            break;
                        case 'jpg':
                        case 'jpeg':
                            contentType = 'image/jpeg';  
                            break;
                        case 'gif':
                            contentType = 'image/gif';  
                            break;
                        default:
                            contentType = 'binary/octet-stream';
                            break;
                    }
                    
                    const params = { Bucket: process.env.bucket, Key: keyName, Body: buffer, ContentType: contentType, ContentEncoding: 'gzip' };
                    s3.putObject(params, function (err, data) {
                        if (err) console.log(err, err.stack); // an error occurred
                        else console.log(data);           // successful response
                    });

                }
            });
         }
    });
};