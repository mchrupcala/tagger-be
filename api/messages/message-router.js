
/*******ORIGINAL ROUTER **********/
const router = require("express").Router();
const axios = require("axios");
// const auth = require('../auth/auth-router')


// TEST GMAIL API CALL 2 *************

const {google} = require('googleapis');
const {OAuth2Client} = require('google-auth-library');
const http = require('http');
const url = require('url');
const open = require('open');
const destroyer = require('server-destroy');

router.get('/authCodeTest', (req, res) => {

  const oauth2Client = new OAuth2Client(
    "394607797501-9g0r8lala9ubsh2l6krcp1ini3vkvi2v.apps.googleusercontent.com",
    "Z1WFuJ9ezhmm8F8iV6ZgCCn3",
    "http://localhost:3000/oauth2callback",
    "authoization_code"
  );
  let code = '4/twFekyhbFcFe7sHItMmGN0Z6nYdyXBxDuN1LhyeToHap-BIVitV9LCRRh_ZcfTm-lYJb-djHXPE6RxaeY4Q7C3A'
  
  const {tokens} = oauth2Client.getToken(code)
  console.log(tokens);
  oauth2Client.setCredentials(tokens);
})

router.post('/authCodeTest2', (req, res) => {
  
  let code = req.body.code;
  console.log("code", code);

  axios.post('https://www.googleapis.com/oauth2/v4/token', {
      code: code,
      client_id: "498525641423-gv4h1poto9mdbdlj7qibo9sf0t4f2231.apps.googleusercontent.com",
      client_secret: "AGBziX-GP5CKEc9vckgr28I8",
      redirect_uri: "http://localhost:3000",
      grant_type: "authorization_code"
    })
    .then((res) => {
      console.log(`statusCode: ${res.statusCode}`)
      console.log(res)
    })
    .catch((error) => {
      console.error(error)
    })
})

router.get('/testAuth2', (req, res) => {
  /**
   * Start by acquiring a pre-authenticated oAuth2 client.
   */
  async function main() {
    const oAuth2Client = await getAuthenticatedClient();
    // Make a simple request to the People API using our pre-authenticated client. The `request()` method
    // takes an GaxiosOptions object.  Visit https://github.com/JustinBeckwith/gaxios.
    const url = 'https://people.googleapis.com/v1/people/me?personFields=names';
    const res = await oAuth2Client.request({url});
    console.log(res.data);

    // After acquiring an access_token, you may want to check on the audience, expiration,
    // or original scopes requested.  You can do that with the `getTokenInfo` method.
    const tokenInfo = await oAuth2Client.getTokenInfo(
      oAuth2Client.credentials.access_token
    );
    console.log(tokenInfo);
  }

  /**
   * Create a new OAuth2Client, and go through the OAuth2 content
   * workflow.  Return the full client to the callback.
   */
  function getAuthenticatedClient() {
    return new Promise((resolve, reject) => {
      // create an oAuth client to authorize the API call.  Secrets are kept in a `keys.json` file,
      // which should be downloaded from the Google Developers Console.
      const oAuth2Client = new OAuth2Client(
        "394607797501-9g0r8lala9ubsh2l6krcp1ini3vkvi2v.apps.googleusercontent.com",
        "Z1WFuJ9ezhmm8F8iV6ZgCCn3",
        "http://localhost:3000/oauth2callback"
      );

      // Generate the url that will be used for the consent dialog.
      const authorizeUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: 'https://www.googleapis.com/auth/userinfo.profile',
      });

      // Open an http server to accept the oauth callback. In this simple example, the
      // only request to our webserver is to /oauth2callback?code=<code>
      const server = http
        .createServer(async (req, res) => {
          try {
            if (req.url.indexOf('/oauth2callback') > -1) {
              // acquire the code from the querystring, and close the web server.
              const qs = new url.URL(req.url, 'http://localhost:3000')
                .searchParams;
              const code = qs.get('code');
              console.log(`Code is ${code}`);
              res.end('Authentication successful! Please return to the console.');
              server.destroy();

              // Now that we have the code, use that to acquire tokens.
              const r = await oAuth2Client.getToken(code);
              console.log(r.tokens);
              // Make sure to set the credentials on the OAuth2 client.
              oAuth2Client.setCredentials(r.tokens);
              // console.info('Tokens acquired.');
              resolve(oAuth2Client);
            }
          } catch (e) {
            reject(e);
          }
        })
        .listen(3000, () => {
          // open the browser to the authorize url to start the workflow
          open(authorizeUrl, {wait: false}).then(cp => cp.unref());
        });
      destroyer(server);
    });
  }

  main().catch(console.error);
})




// END TEST GMAIL API CALL 2 ****************














// TEST GMAIL API CALL ***********

// global array variable that will hold all the messages as strings
let messageArray = [];

require('dotenv').config();
const fs = require('fs');
const readline = require('readline');
// const {google} = require('googleapis');

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.settings.basic'
]; 

const TOKEN_PATH = 'token.json';

router.post('/testAuth', (req, res) => {

  console.log(req.body);
  let id_token = req.body.token;
  let CLIENT_ID = req.body.clientId;

  const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);
async function verify() {
  const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  const userid = payload['sub'];
  // If request specified a G Suite domain:
  //const domain = payload['hd'];
  console.log(ticket);
}
verify().catch(console.error);
})

router.post('/postTags', (req, res) => {

  console.log(req.body);
  let token = req.body;

  fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Gmail API.
    authorize(JSON.parse(content), listMessages);
  });
  
  /**
   * Create an OAuth2 client with the given credentials, and then execute the
   * given callback function.
   * @param {Object} credentials The authorization client credentials.
   * @param {function} callback The callback to call with the authorized client.
  */
  
  function authorize(credentials, callback) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[3], {"grant-type" : "authorization_code"});
  
    // Check if we have previously stored a token.
    // fs.readFile(TOKEN_PATH, (err, token) => {
    //   if (err) return getNewToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(token);
      callback(oAuth2Client);
    // });
  }
  
  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
   * @param {getEventsCallback} callback The callback for the authorized client.
   */
  // function getNewToken(oAuth2Client, callback) {
  //   const authUrl = oAuth2Client.generateAuthUrl({
  //     access_type: 'offline',
  //     scope: SCOPES,
  //   });
  //   console.log('Authorize this app by visiting this url:', authUrl);
  //   const rl = readline.createInterface({
  //     input: process.stdin,
  //     output: process.stdout,
  //   });
  //   rl.question('Enter the code from that page here: ', (code) => {
  //     rl.close();
  //     oAuth2Client.getToken(code, (err, token) => {
  //       if (err) return console.error('Error retrieving access token', err);
  //       oAuth2Client.setCredentials(token);
  //       // Store the token to disk for later program executions
  //       fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
  //         if (err) return console.error(err);
  //         console.log('Token stored to', TOKEN_PATH);
  //         console.log(token);
  //       });
  //       callback(oAuth2Client);
  //     });
  //   });
  // }
  
  function listMessages(auth) {
    const gmail = google.gmail({version: 'v1', auth});
    gmail.users.messages.list({
      userId: 'me',
    }, (err, res) => {
      if (err) return console.log('The API returned an error: ' + err);
      const messages = res.data.messages;
      if (messages.length) {
        console.log('Message ID\'s:');
        messages.forEach((message) => {
          gmail.users.messages.get({
            userId: 'me',
            id: message.id,
          }, (err, res) => {
            // searches for messages with the specifc IDs that we found on the previous lines
            // this if else statement prevents errors from the parts array returning undefined
            if(res.data.payload.parts !== undefined) {
              messageArray.push(Buffer.from(res.data.payload.parts[0].body.data, 'base64').toString());
            } else {
              return null;
            }
          })
        });
      } else {
        console.log('No messages found.');
      }
    })
  }
})

router.get('/getTags', (req, res) => {
  fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Gmail API.
    authorize(JSON.parse(content), listMessages);
  });
  
  /**
   * Create an OAuth2 client with the given credentials, and then execute the
   * given callback function.
   * @param {Object} credentials The authorization client credentials.
   * @param {function} callback The callback to call with the authorized client.
  */
  
  function authorize(credentials, callback) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);
  
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) return getNewToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client);
    });
  }
  
  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
   * @param {getEventsCallback} callback The callback for the authorized client.
   */
  function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error('Error retrieving access token', err);
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) return console.error(err);
          console.log('Token stored to', TOKEN_PATH);
        });
        callback(oAuth2Client);
      });
    });
  }
  
  function listMessages(auth) {
    const gmail = google.gmail({version: 'v1', auth});
    gmail.users.messages.list({
      userId: 'me',
    }, (err, res) => {
      if (err) return console.log('The API returned an error: ' + err);
      const messages = res.data.messages;
      if (messages.length) {
        console.log('Message ID\'s:');
        messages.forEach((message) => {
          gmail.users.messages.get({
            userId: 'me',
            id: message.id,
          }, (err, res) => {
            console.log(`\n ******************* \n ${res.data.id} \n ******************* \n`);
            console.log(Buffer.from(res.data.payload.parts[0].body.data, 'base64').toString());
            // searches for messages with the specifc IDs that we found on the previous lines
            // this if else statement prevents errors from the parts array returning undefined
            if(res.data.payload.parts !== undefined) {
              messageArray.push(Buffer.from(res.data.payload.parts[0].body.data, 'base64').toString());
            } else {
              return null;
            }
          })
        });
      } else {
        console.log('No messages found.');
      }
    })
  }
})

// test endpoint to see if messageArray data persists
router.get('/testGet', (req, res) => {
  console.log(messageArray);
})

// END TEST GMAIL API CALL *********

router.post("/", (req, res) => {
  

//   /******POST REQUEST OPTION 1 *******/

 const {sender, id, subject, message} = req.body

  // let postBody = {
  //     sender, id, subject, message
  // }

   let postBody = {
       sender:  'sender',
       id:  Math.random()*100,
       subject:  'subject',
       message:  messageArray[5]
   }

   let testBody = {
     from: "Small Tall",
     id: '12',
     subject: "See Small Think Big",
     message: "Focus on what is directly ahead of you"
   }
  
  // An object of options to indicate where to post to

  console.log("hello");
  var options = {
    hostname: "http://tagger-email.us-east-2.elasticbeanstalk.com/",
    path: "api/tags",
    headers: {
      "Content-Type": "application/json"
    },
    method: "POST"
  };


  // axios call made 
  axios
    .post(options.hostname + options.path, postBody)
    .then(result => {
      console.log(result.data);
      res.send(result.data);
    })
    .catch(err => {
      console.log(err);
      res.send(err);
    });


/******OLDER EXAMPLES BELOW HTTP/RESFUL API*******/

/******POST REQUEST OPTION 1 *******/

// function makeBody(sender, id, subject, message) {
//   let str = [
//     "sender: ",
//     sender,
//     "\n",
//     "message-id",
//     id,
//     "\n",
//     "subject: ",
//     subject,
//     "\n\n",
//     "message",
//     message
//   ].join("");
//   return str;
// }


// /******TEST API using needle/axios*******/
// const needle = require('needle');

// needle.get('http://tagger-email.us-east-2.elasticbeanstalk.com/api/tags', {json: true})
// .then(res => {
//   let message = res.body;
//   console.log(message.id);
// }).catch(err => {
//   console.log(err);
// });


// axios.post('http://tagger-email.us-east-2.elasticbeanstalk.com/api/tags')
//   .then(res => {
//     console.log(res.data.id);
//   })
//   .catch(err => {
//     console.log(err);
//   });


  
/****** END ******/

// ****** GOOGLE API POST  *******/
// module.exports = function sendMail(oauth2token, raw) {
//   var options = {
//     method: "POST",
//     url: "https://www.googleapis.com/gmail/v1/users/me/messages/send",
//     headers: {
//       "HTTP-Version": "HTTP/1.1",
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       raw: raw
//     })
//   };

//   request(options, function(error, response, body) {
//     if (!error && response.statusCode == 200) {
//       context.log(body);
//     }
//     if (error) {
//       context.log(error);
//     } else {
//       context.log(response);
//     }
//   });
// };

// /***** POST REQUEST OPTION 2 ******/

// function sendMail(oauth2token, raw) {
//   var options = {
//     method: "POST",
//     url: "https://www.googleapis.com/gmail/v1/users/me/messages/send",
//     headers: {
//       "HTTP-Version": "HTTP/1.1",
//       "Content-Type": "application/json",
//       Authorization: "Bearer " + oauth2token
//     },
//     body: JSON.stringify({
//       raw: raw
//     })
//   };
//   request(options, function(error, response, body) {
//     if (!error && response.statusCode == 200) {
//       context.log(body);
//     }
//     if (error) {
//       context.log(error);
//     } else {
//       context.log(response);
//     }
//   });
// }

// /*********END*********/

// // /*********POST REQUEST OPTION 3********/
// var email =
//   'Content-Type: text/plain; charset="UTF-8"\n' +
//   "Content-length: 5000\n" +
//   "MIME-Version: 1.0\n" +
//   "Content-Transfer-Encoding: message/rfc2822\n" +
//   "to: something@something.com\n" +
//   'from: "Some Name" <something@gmail.com>\n' +
//   "subject: Hello world\n\n" +
//   "The actual message text goes here";

// async function sendMail(token, resp) {
//   return new Promise((resolve, reject) => {
//     var base64EncodedEmail = Buffer.from(email).toString("base64");
//     var base64urlEncodedEmail = base64EncodedEmail
//       .replace(/\+/g, "-")
//       .replace(/\//g, "_");

//     var params = {
//       userId: "me",
//       resource: {
//         raw: base64urlEncodedEmail
//       }
//     };

//     var body2 = {
//       raw: base64urlEncodedEmail
//     };

//     var options = {
//       hostname: "www.googleapis.com",
//       path: "/upload/gmail/v1/users/me/messages/send",
//       headers: {
//         Authorization: "Bearer " + token,
//         "Content-Type": "message/rfc822"
//       },
//       body: {
//         raw: base64urlEncodedEmail,
//         resource: {
//           raw: base64urlEncodedEmail
//         }
//       },
//       data: JSON.stringify({
//         raw: base64urlEncodedEmail,
//         resource: {
//           raw: base64urlEncodedEmail
//         }
//       }),
//       message: {
//         raw: base64urlEncodedEmail
//       },
//       payload: {
//         raw: base64urlEncodedEmail //this is me trying everything I can think of
//       },
//       // body: raw,
//       // }
//       userId: "me",
//       resource: {
//         raw: base64urlEncodedEmail
//       },
//       method: "POST"
//     };

//     var id = "";
//     console.log(base64urlEncodedEmail);
//     const req = https.request(options, res => {
//       var body = "";

//       res.on("data", d => {
//         body += d;
//       });
//       res.on("end", () => {
//         var parsed = body;
//         console.log(parsed);
//       });
//     });

//     req.on("error", e => {
//       console.error(e);
//     });
//     req.write(JSON.stringify(body2));
//     req.end();
//   });
// }

});

module.exports = router;