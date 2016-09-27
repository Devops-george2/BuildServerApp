# Build Server App

### Team Members
* Wei Fu (wfu)
* George Mathew (george2)

For this milestone, we perform automatic builds on a simple ![java maven project](https://github.com/Devops-george2/JavaTest) located here.

### Setup Steps:
* Clone this repository on your local machine / remote server / virtual machine such that the http connection is accessible to view the results.
* Clone the Java Project (https://github.com/Devops-george2/JavaTest) as a bare repository on your server.
  
  `git clone --bare https://github.com/Devops-george2/JavaTest.git`
* Copy the `post-receive.sample` file from **this repository** and copy it into the hooks folder of the project on your **server** as `post-recieve`.
* Update the URL variable in `post-receive` with the URL where this app is deployed. For example if this app is deployed on your localhost on port 3000 the variable will be updated as `URL=http://localhost:3000/deploy`
* Copy the file scripts/config_sample.js to scripts/config.js and fill in your gmail/ncsu username, password and name.
* Perform NPM install in this directory as follows
  
  `npm install`
* Run the server as follows

  `node scripts/serverApp.js`
  
### Build:

TODO
