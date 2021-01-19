const mailgun = require('mailgun-js');


const sendJoinReq = (user, group, owner, approve_token) => {

  const user_url = 'http://' + process.env.CLIENT_URL + '/users/' + user._id;
  const approve_url = 'http://' + process.env.API_URL + '/groupmgmt/approvereq/' + approve_token;
  const mg = mailgun({apiKey: process.env.MAILGUN_KEY, domain: process.env.MG_DOMAIN})

  const data = {
    from : "Blurbr Groups <groups@blurbr.com>",
    to: 'm.siegrist92@gmail.com',
    subject: `Blurbr User ${user.username} would like to join your group ${group.name}`,
    html: `<html><body><p>Hello there ${owner.username} - ${user.username} would like to join one of your groups.</p>
      <button><a href="${user_url}">View Profile</a></button>
      <button><a href="${approve_url}">Approve Request</a></button>
      </body>
      </html> `
  };

  return mg.messages().send(data, (err, body) => {
    console.log(body);
  })
}

const sendGroupInvite = (user, owner, owned_group, approve_token) => {

  const group_url = `http://${process.env.CLIENT_URL}/groups/${owned_group._id}`;
  const approve_url = 'http://' + process.env.API_URL + '/groupmgmt/approvereq/' + approve_token;
  const mg = mailgun({apiKey: process.env.MAILGUN_KEY, domain: process.env.MG_DOMAIN});

  const data = {
    from : "Blurbr Groups <groups@blurbr.com>",
    to: 'm.siegrist92@gmail.com',
    subject: `Blurbr User ${owner.username} invites you to join their group ${owned_group.name}`,
    html: `<html><body><p>Hello there ${user.username} - ${owner.username} invites you to join their group!</p>
      <button><a href="${group_url}">View Group</a></button>
      <button><a href="${approve_url}">Join Group</a></button>
      </body>
      </html> `
  };

  return mg.messages().send(data, (err, body) => {
    console.log(body)
  })
}


module.exports = {
  sendJoinReq: sendJoinReq,
  sendGroupInvite: sendGroupInvite
}
