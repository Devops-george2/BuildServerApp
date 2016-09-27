const express = require('express');
const app = express();
const exec = require('child_process').exec;
const fs = require('fs');
const nodemailer = require("nodemailer");
const config = require('./config.js');

const cmd = 'sh scripts/build.sh ';
const port = 3000;
const send_mail_ids = "george2@ncsu.edu, george.meg91@gmail.com";

const smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: config.email,
        pass: config.password
    }
});
var mailOptions = {
    from: `${config.user} <${config.email}>`, // sender address
    to: send_mail_ids, // list of receivers
    subject: 'Build Report : ', // Subject line
    html: 'Check the results at <a href="http://localhost:3000">here</a>.', // plaintext body
};



function build(request, response) {
    log = '';
    branch = request.params.branch;
	  var child = exec(cmd + branch, {maxBuffer: 1024 * 5000}, function(error, stdout, stderr) {
        is_success = isSuccess(log);
    		if( error ) {
    		    is_success = false;
    		    console.log(error);
    		    console.log("ERROR");
    		}
    		time_stamp = new Date().getTime();
    		directory = "scripts/files";
    		file_name = directory+"/"+time_stamp+".txt";
    		checkDirectory(directory, function(dir_err) {
    		    if(dir_err) {
                    console.error("Error while creating directory!!!", dir_err);
                    return;
                }
                fs.writeFile(file_name, log, function(err) {
                    if(err) {
                        return console.log(err);
                    }
                    console.log(`The file ${file_name} was saved!`);
                });
                fs.readFile('scripts/reports.json', 'utf8', function(err, data) {
                    if (err) {
                        data = [];
                    } else {
                        data = JSON.parse(data);
                    }
                    record = {
                        'file_name': file_name.split(/\/(.+)?/)[1],
                        'branch': branch,
                        'is_success' : is_success,
                        'time_stamp': time_stamp
                    };
                    data.unshift(record);
                    fs.writeFile('scripts/reports.json', JSON.stringify(data), function(err, data){
                        if(err) {
                            console.log(err);
                        } else {
                            console.log("The file scripts/reports.json was saved!");
                        }
                    });
                });
                if (is_success) {
                  mailOptions.subject += "SUCCESS";
                } else {
                  mailOptions.subject += "Failure";
                }
                smtpTransport.sendMail(mailOptions, function(error, response){
                    if(error){
                        console.log(error);
                    }else{
                        console.log("Message sent: " + response.message);
                    }
                });
    		});
    });

	// Stream results

	child.stdout.pipe( response );
	child.stdout.on('data', function(buf) {
	   log += buf;
	});

	child.stderr.pipe( process.stderr );
}

function checkDirectory(directory, callback) {
  fs.stat(directory, function(err, stats) {
    //Check if error defined and the error code is "not exists"
    if (err) {
      //Create the directory, call the callback.
      fs.mkdir(directory, callback);
    } else {
      //just in case there was a different error:
      callback(err)
    }
  });
}

function format_ts(time_stamp) {
    d = new Date(time_stamp);
    return d.getMonth() + "/" + d.getDate() + "/" + d.getFullYear() +
     " "+ d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds()
}

function isSuccess(log) {
  return log.includes("[INFO] BUILD SUCCESS");
}

app.use('/static', express.static(__dirname + '/files'));

app.get('/', (request, response) => {
  response.send('Hello, this is a miniature server');
});

app.get('/deploy/:branch', build)

app.get('/report', function(request, response) {
   fs.readFile('scripts/reports.json', 'utf8', function(err, data) {
       if (err) {
           data = [];
       } else {
           data = JSON.parse(data);
       }
       html = "<style>table, th, td { border: 1px solid black; border-collapse: collapse; }; th {font-weight: bolder;}</style>";
       html += "<table><tr><th>Time</th><th>Branch</th><th>Status</th><th>Report</th></tr>";
       for (var i=0; i<data.length; i++) {
           row = "<tr>";
           row += "<td>" +format_ts(data[i].time_stamp)+"</td>";
           row += "<td>" +data[i].branch+"</td>";
           if (data[i].is_success) {
                row += "<td style='background-color: green'>Success</td>";
           } else {
                row += "<td style='background-color: red'>Failed</td>";
           }
           row += "<td><a href='static/"+data[i].time_stamp+".txt'>Report</a></td>"
           html += row;

       }
       html += "</table>";
       response.send(html);
   });
});


app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err);
  }
  console.log(`server is listening on ${port}`);
})
