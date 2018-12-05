const botcfg = require("./botconfig.json");
const ytdl = require("ytdl-core");
const dis = require("discord.js");
const fs1 = require("fs");
const bot =  new dis.Client({disableEveryone: true});
exports.bot = bot
const cmd11 = require("./commands.js");
//`
//bot.user.SetGame("dead")
//bot.channels.find("name","welcome")
function hasPermission(guild, user) {

  return guild.owner.displayName === user.username;

}
exports.hasperm = hasPermission;
bot.on("guildMemberAdd", async(member) => {

  let role = member.guild.roles.find("name", "Loitering");
  if (role != null) {

    member.addRole(role).catch(console.error);

  }

});
bot.on("ready", async() => {

  console.log(`${bot.user.username} is online`);

});
function isEmpty(value) {
  return typeof value == 'string' && !value.trim() || typeof value == 'undefined' || value === null;
}
exports.getServer = function() {

  return server;

}

exports.getCommands = function() {

  return commands;

}

exports.getUsers = function() {

  return users;

}

let server = [];
let commands = [];
let users = [];
function createCommand(guild, cmd, usage, args, perm, func) {

  let c = {};
  c["cmd"] = cmd;
  c["perm"] = perm;
  c["usage"] = usage;
  c["args"] = args
  c["valid"] = [];
  c["valid"].push("bot-commands");
  c["valid"].push("bot-channel");
  if (cmd.trim() == "clearchat" || cmd.trim() == "purge" || cmd.trim() == "help") {

    c["valid"].push("*");

  }
  if (botcfg.cmd != null) {
	  if (botcfg.cmd[guild] != null) {
  let chans = botcfg.cmd[guild][cmd];
  if (chans != null) {
	  for (let i=0;i<chans.length;i++) {
	  	
		  c["valid"].push(chans[i]);
		  
	  }
  }
  }
  }

  c["func"] = func;
  server[guild.id].commands.push(c);

}

bot.on("messageUpdate",(oldmsg, newmsg) => {

  if (oldmsg.author.bot || newmsg.author.bot) return;
  log = newmsg.guild.channels.find("name", "server-log")
  if (log != null) {

    log.sendMessage(`${newmsg.author.username} edited "message ${oldmsg.content}" to "${newmsg.content}" in channel ${newmsg.channel.name} on ${new Date()}` );

  }

});

bot.on("messageDelete",(msg) => {

  if (msg.author.bot) return;
  log = msg.guild.channels.find("name", "server-log")
  if (log != null) {

    log.sendMessage(`${msg.author.username} deleted message "${msg.content}" in channel ${msg.channel.name} on ${new Date()}` );

  }


});
bot.on("messageDeleteBulk",(msg) => {

  if (msg.author.bot) return;
  log = msg.guild.channels.find("name", "server-log")
  if (log != null) {

    log.sendMessage(`${msg.author.username} deleted message "${msg.content}" in channel ${msg.channel.name} on ${new Date()}` );

  }


});

bot.on("message", async msg => {
  if (msg.author.bot) return;

  log = msg.guild.channels.find("name", "server-log")
  if (log != null) {

    await log.sendMessage(`${msg.author.username} said "${msg.content}" in channel ${msg.channel.name} on ${new Date()}` );

  }

  if (!server[msg.guild.id]) {

    server[msg.guild.id] = [];
    server[msg.guild.id].commands = [];
    server[msg.guild.id].users = [];
    server[msg.guild.id].used = false;

  }
  let pre = "!";
  let dp = botcfg.data;
  if (dp == null) {

    dp = [];

  }
  if (dp[msg.guild]) {

    pre = dp[msg.guild].prefix;

  }

  if (pre == null) {

    pre = "!";

  }

  server[msg.guild.id].commands = [];
  cmd11.init(msg.guild, createCommand);
  server[msg.guild.id].used = true;

  commands = server[msg.guild.id].commands;
  users = server[msg.guild.id].users;
  let cmdsq = msg.content.split("\"");
  let args = [];
  for (let i=0;i<cmdsq.length;i++) {

    if (i % 2 == 0) {
      let as = cmdsq[i].split(" ");
      for (let ii=0;ii<as.length;ii++) {

        if (!isEmpty(as[ii].trim())) {

          args.push(as[ii]);
        }

      }
    } else {

      if (!isEmpty(cmdsq[i].trim())) {
        args.push(cmdsq[i]);
      }

    }
  }

  let cmd = args[0];

  args.splice(0, 1);
  

   if (cmd.indexOf(pre) === 0) {

     msg.delete();

    }
 
  for (let i=0;i<commands.length;i++) {

    if (commands[i]["valid"].includes(msg.channel.name) || commands[i]["valid"].includes("*")) {
      if (cmd === `${pre}${commands[i]["cmd"]}`) {
      
        if (commands[i]["args"].includes(args.length) || commands[i]["args"].includes("INF")) {
          let data = {};
          data["user"] = msg.author;
          data["guild"] = msg.guild;
          data["member"] = msg.member;
          data["channel"] = msg.channel;
          return await commands[i]["func"](data, cmd, args);
        } else {

          return await msg.channel.send(`Not Enough Arguments for command ${pre}${commands[i]["cmd"]}`).then( message => {

            setTimeout(() => {message.delete()}, 5000);

          });

        }
      }

    }

  }

  if (cmd.indexOf(pre) === 0) {

    return await msg.channel.send("Command not Found!").then( message => {

      setTimeout(() => {message.delete()}, 5000);

    });

  }

  if (!botcfg.data[msg.guild]) {

    botcfg.data[msg.guild] = {};
    botcfg.data[msg.guild][msg.author.username] = {};
    botcfg.data[msg.guild][msg.author.username]["count"] = 1;
    botcfg.data[msg.guild][msg.author.username]["tolevel"] = 5;
    fs1.writeFile("./botconfig.json", JSON.stringify(botcfg), (err) => console.error);

  } else {

    if (!botcfg.data[msg.guild][msg.author.username]) {

      botcfg.data[msg.guild][msg.author.username] = {};
      botcfg.data[msg.guild][msg.author.username]["count"] = 1;
      botcfg.data[msg.guild][msg.author.username]["tolevel"] = 5;
      fs1.writeFile("./botconfig.json", JSON.stringify(botcfg), (err) => console.error);

    } else {

      botcfg.data[msg.guild][msg.author.username]["count"] = botcfg.data[msg.guild][msg.author.username]["count"] + 1;
      fs1.writeFile("./botconfig.json", JSON.stringify(botcfg), (err) => console.error);

    }

  }

  if (botcfg.data[msg.guild][msg.author.username]["count"] >= botcfg.data[msg.guild][msg.author.username]["tolevel"]) {

    botcfg.data[msg.guild][msg.author.username]["tolevel"] = botcfg.data[msg.guild][msg.author.username]["tolevel"] + 5;
    botcfg.data[msg.guild][msg.author.username].count = 0;
    if (!botcfg.data[msg.guild][msg.author.username]["level"]) {
      botcfg.data[msg.guild][msg.author.username]["level"] = 1;
    } else {

      botcfg.data[msg.guild][msg.author.username]["level"] = botcfg.data[msg.guild][msg.author.username]["level"] + 1;

    }
     fs1.writeFile("./botconfig.json", JSON.stringify(botcfg), (err) => console.error);

    return await msg.channel.send(`Congrats ${msg.author.username} you have just became level ${botcfg.data[msg.guild][msg.author.username].level}`).then(message => {

      setTimeout(() => {message.delete()}, 10000);

    });

  }

});

bot.login(botcfg.token);
