let b = require("./bot.js");
const Discord = require('discord.js');
const ytdl = require("ytdl-core");
const request = require("request");
const fs = require("fs");
const getYoutubeID = require("get-youtube-id");
const fetch1 = require("youtube-info");
const yt_api_key = "AIzaSyB9BxA6nAUJE4sXydOwLfhRZO1xF5H4DgE";
const embed = new Discord.RichEmbed();
const fs1 = require("fs");
const botcfg = require("./botconfig.json");
let cmd1 = [];

var servers = {};

var serverData = {};

async function disable(data, command) {

  if (cmd1.includes(`${command}`) == false) {
      if (data["channel"] != null) {
      data["channel"].send(`Could not set command ${command} to disabled!`).then( message => {

         setTimeout(() => {message.delete()}, 5000);

      });
    }

  } else {

    if (!botcfg.disabled[data["guild"]]) {

      botcfg.disabled[data["guild"]] = [];
      botcfg.disabled[data["guild"]].push(command);

    } else {

      botcfg.disabled[data["guild"]].push(command);
      
    }

  }


  fs1.writeFile("./botconfig.json", JSON.stringify(botcfg), (err) => console.error);

}

async function enable(data, command) {

  if (!botcfg.disabled[data["guild"]]) {

    if (data["channel"] != null) {
      data["channel"].send(`Command ${command} wasn't disabled!`).then( message => {

         setTimeout(() => {message.delete()}, 5000);

      });
    }

  } else {

    delete botcfg.disabled[data["guild"]][botcfg.disabled[data["guild"]].indexOf(command)];

  }


  fs1.writeFile("./botconfig.json", JSON.stringify(botcfg), (err) => console.error);

}

async function disablecommands(data, cmd, args) {

  if (b.hasperm(data["guild"], data["user"])) {

    disable(data, args[0]);

  } else {

    data["channel"].send("You must be owner to use this command!").then( message => {

      setTimeout(() => {message.delete()}, 10000);

    });

  }

}

async function enablecommands(data, cmd, args) {

  if (b.hasperm(data["guild"], data["user"])) {

    enable(data, args[0]);

  } else {

    data["channel"].send("You must be owner to use this command!").then( message => {

      setTimeout(() => {message.delete()}, 10000);

    });

  }

}

async function purge(data, cmd, args) {
  if (data["channel"].permissionsFor(data["member"]).hasPermission("MANAGE_MESSAGES")) {

    if (!args[0]) {
      try {
        const fetched = await data["channel"].fetchMessages({limit: 100});
        for (let i=0;i<fetched.array().length;i++) {

          fetched.array()[i].delete();

        }
      }
      catch (error) {

        data["channel"].send(error);

      }
    } else {
      try {
        const fetched = await data["channel"].fetchMessages({limit: tonumber(args[0])});
        for (let i=0;i<fetched.array().length;i++) {

          fetched[i].array().delete();

        }
      }
      catch (error) {

        data["channel"].send(error);

      }
    }
  }

}

async function setCommandSign(data, cmd, args) {
  serverData[data["guild"]] = {};
  serverData[data["guild"]].prefix = args[0];
  botcfg.data = serverData;
  fs1.writeFile("./botconfig.json", JSON.stringify(botcfg), (err) => console.error);

}

async function queued(data, cmd, args) {
  let msg = "";
  const embed1 = new Discord.RichEmbed();
    embed1.setTitle('Queued');
    embed1.setColor('#C0C0C0');                                        // A Hex color
    embed1.setDescription(msg);
  if (!servers[data["guild"]]) return data["channel"].sendEmbed(embed1);

  for (let i=0;i<servers[data["guild"]].names.length;i++) {

    msg = `${msg}${(i + 1)}:${servers[data["guild"]].names[i]}\n`;

  }
      msg = msg.substring(0,msg.length-2);
    const embed = new Discord.RichEmbed();
    embed.setTitle('Queued');
    embed.setColor('#C0C0C0');                                        // A Hex color
    embed.setDescription(msg);
                      // A URL to include
    return data["channel"].sendEmbed(embed);
}

async function skip_song(data) {
  if (servers[data["guild"]].dispatcher != null) {
    servers[data["guild"]].dispatcher.end();
  }

}

async function skip(data, cmd, args) {

  if (!servers[data["guild"]]) {

    servers[data["guild"]] = [];
    servers[data["guild"]].playing = false;
    servers[data["guild"]].que = [];
    servers[data["guild"]].chan = null;
    servers[data["guild"]].dispatcher = null;
    servers[data["guild"]].skip = 0;
    servers[data["guild"]].names = [];
    servers[data["guild"]].skippers = [];
    servers[data["guild"]].connection = null;

  }

  skip_song(data);

}

async function disconnect(data, cmd, args) {
  if (!servers[data["guild"]]) {

    servers[data["guild"]] = [];
    servers[data["guild"]].playing = false;
    servers[data["guild"]].que = [];
    servers[data["guild"]].chan = null;
    servers[data["guild"]].dispatcher = null;
    servers[data["guild"]].names = [];
    servers[data["guild"]].skip = 0;
    servers[data["guild"]].skippers = [];
    servers[data["guild"]].connection = null;
   

  }
  servers[data["guild"]].repeat = false;
  servers[data["guild"]].chan.leave();
  delete servers[data["guild"]].connection;
  delete servers[data["guild"]].chan;
  servers[data["guild"]].names = [];
  servers[data["guild"]].que = [];
  b.bot.user.setGame('Nothing');

}

async function playMusic(guild, id, data) {

  if (!data["member"].voiceChannel) {

    data["channel"].send("You must be in a voice channel");
    return;

  }
  
    if (servers[guild].reapeat === true) {
      servers[guild].id1 = servers[guild].que[0];
    } else {

      servers[guild].id1 = null;

    }
	

  servers[guild].chan = data["member"].voiceChannel;

  servers[guild].chan.join().then(function(connection) {
    servers[guild].connection = connection;
    stream = ytdl("https://www.youtube.com/watch?v=" + id, {

      filter: "audioonly"

    });
    servers[guild].skip = 0;
    servers[guild].skippers = [];

    servers[guild].dispatcher = connection.playStream(stream);
    servers[guild].dispatcher.on("end", function() {

      servers[guild].skip = 0;
      servers[guild].skippers = [];
      
        if (servers[guild].reapeat === true) {
          servers[guild].id1 = servers[guild].que[0];
        } else {

          servers[guild].id1 = null;

        }

      if (servers[guild].repeat === false) {
        servers[guild].que.shift();
        servers[guild].names.shift();
        if (servers[guild].que.length == 0) {
         disconnect(data, "disconnect", []);
		  b.bot.user.setGame('Nothing');
        } else {
          data["channel"].send(" now playing **" + servers[data[guild]].names[0] + "**");
		  b.bot.user.setGame(servers[data[guild]].names[0]);
          playMusic(guild, servers[guild].que[0], data);

        }
      } else {

        data["channel"].send(" now playing **" + servers[guild].names[0] + "**");
		b.bot.user.setGame(servers[data[guild]].names[0]);
        playMusic(guild, servers[guild].que[0], data);

      }

    });

  });

}

async function play(data, cmd, args) {
	if (!data["member"].voiceChannel) {

    data["channel"].send("You must be in a voice channel").then( message => {

      setTimeout(() => {message.delete()}, 10000);

    });
    return;

  }
  if (!servers[data["guild"]]) {

    servers[data["guild"]] = [];
    servers[data["guild"]].playing = false;
    servers[data["guild"]].que = [];
    servers[data["guild"]].chan = null;
    servers[data["guild"]].dispatcher = null;
    servers[data["guild"]].skip = 0;
    servers[data["guild"]].skippers = [];
    servers[data["guild"]].connection = null;
    servers[data["guild"]].names = [];

  }
  let ms = "";
  for (let i=0;i<args.length;i++) {

    ms = `${ms} ${args[i]}`;

  }
  
  if (!ms) {

    await data["channel"].send("You must have a link/search args!").then( message => {

      setTimeout(() => {message.delete()}, 10000);

    });

  } else {
    var gu = data["guild"];
    if (servers[gu].que.length > 0 || servers[gu].playing) {

      getID(ms, function(id) {

      add_to_que(gu, id);
      fetch1(id, function(error, videoinf) {

        if (error) return;
        servers[data["guild"]].names.push(videoinf.title);
          data["channel"].send(" added **" + videoinf.title + "** to queue!");

        });

      });

    } else {
      var gu = data["guild"];
      servers[gu].playing = true;
      getID(ms, function(id) {

        servers[gu].que.push(id);
        playMusic(gu, id, data);
        fetch1(id, function(error, videoinf) {

          if (error) return;
           servers[data["guild"]].names.push(videoinf.title);
            data["channel"].send(" now playing **" + videoinf.title + "**");
			b.bot.user.setGame(videoinf.title);
        });
      });
    }

  }

}

async function add_to_que(guild, strid) {

  if (await isYoutube(strid)) {

    servers[guild].que.push(getYoutubeID(strid));

  } else {

    servers[guild].que.push(strid);

  }

}

async function getID(str, cal) {

  if (await isYoutube(str)) {

    cal(await getYoutubeID(str));

  } else {

    await search_video(str, function(id) {

      cal(id);

    });

  }

}

async function search_video(querry, call) {

  request("https://www.googleapis.com/youtube/v3/search?part=id&type=video&q=" + encodeURIComponent(querry) + "&key=" + yt_api_key, function(error, responce, body){

    var json = JSON.parse(body);
    if (!json.items[0]) call("3_-a9nYZYjk");
    else {
      call(json.items[0].id.videoId);
   }
  });

}

async function isYoutube(str) {

  return str.toLowerCase().indexOf("youtube.com") > -1;

}

async function roll(data, cmd, args) {

  if (args.length === 1) {
    let r = Math.floor(Math.random() * Number(args[0]));

    return await data["channel"].send(`${data["user"]} Rolled a d${args[0]} and got a ${r}!`);

  } else if (args.length === 2) {
    let r = Math.floor(Math.random() * Number(args[0]));

    return await data["channel"].send(`${data["user"]} Rolled a d${args[0]} and got a ${r}! Pass = ${Number(args[1])-r < 0}`);

  } else {

    let r = Math.floor(Math.random() * 6);

    return await data["channel"].send(`${data["user"]} Rolled a d6 and got a ${r}!`);

  }

}

async function help(data, cmd, args) {

  let cm = b.getCommands();
  let m = `Commands(${cm.length}): `;
  for (let i=0;i<cm.length;i++) {

    m = `${m}!${cm[i]["usage"]}, `;

  }
  m = m.substring(0,m.length-2);
  return await data["channel"].send(m).then( message => {

    setTimeout(() => {message.delete()}, 20000);

  });

}

function repeat(data, cmd, args) {
  if (!servers[data["guild"]]) {

    servers[data["guild"]] = [];
    servers[data["guild"]].playing = false;
    servers[data["guild"]].que = [];
    servers[data["guild"]].chan = null;
    servers[data["guild"]].dispatcher = null;
    servers[data["guild"]].skip = 0;
    servers[data["guild"]].skippers = [];
    servers[data["guild"]].connection = null;
    servers[data["guild"]].names = [];

  }
  if (args.length > 1) {
    if (args[0] === "on") {

      servers[data["guild"]].repeat = true;
      console.log("true");
    } else if (args[0] === "off") {

      servers[data["guild"]].repeat = false;

    } else if (args[0] === "true") {

      servers[data["guild"]].repeat = true;

    } else if (args[0] === "false") {

      servers[data["guild"]].repeat = false;

    } else {

      data["channel"].send("Parameter must be true|false|on|off").then(message => {

         setTimeout(() => {message.delete()}, 5000);

      });

    }
  } else {

    servers[data["guild"]].repeat = true;

  }
  
}

function same(ar, ar2) {
	for (let i=0;i<ar.length;i++) {
			if (ar[i][0] == ar2[0] && ar[i][1] == ar2[1]) {
				
				return true;
				
			}
			
		}
	
	return false;
	
}

function sameindex(ar, ar2) {
	
	for (let i=0;i<ar.length;i++) {
			if (ar[i][0] == ar2[0] && ar[i][1] == ar2[1]) {
				
				return i;
				
			}
			
		}
	
	return -1;
	
}

function lists(data, cmd, args) {
	
	if (args[0] === "create") {
		if (args[1]  == null || args[1]  === "") {
			
			data["channel"].send("Invalid Arguments use command help for help!").then( message => { setTimeout(() => {message.delete()}, 10000); });
			return;
		}
		if (botcfg.listnames == null) {
			
			botcfg.listnames = {};
			botcfg.listnames[data["guild"]] = [];
			botcfg.list = {};
			botcfg.list[data["guild"]] = {};
			
		} else if (botcfg.listnames.length === 0) {
			
			botcfg.listnames[data["guild"]] = [];
			botcfg.list[data["guild"]] ={};
			
		} else if (botcfg.listnames[data["guild"]] == null) {
			
			botcfg.listnames[data["guild"]] = [];
			botcfg.list[data["guild"]] ={};
			
		} else if (botcfg.listnames[data["guild"]].length === 0) {
			
			botcfg.listnames[data["guild"]] =[];
			botcfg.list[data["guild"]] ={};
			
		} else {
			
			if (botcfg.listnames[data["guild"]].includes(args[1])) {
				
				data["channel"].send("List " + args[1] + " Already exists!").then( message => { setTimeout(() => {message.delete()}, 10000); });
				return;
				
			}
			
		}
		
		botcfg.listnames[data["guild"]].push(args[1]);
		botcfg.list[data["guild"]][args[1]] = [];
		data["channel"].send("List " + args[1] + " Created!").then( message => { setTimeout(() => {message.delete()}, 10000); });
		
	}  else if (args[0] === "delete") {
		
		if (args[1]  == null || args[1]  === "") {
			
			data["channel"].send("Invalid Arguments use command help for help!").then( message => { setTimeout(() => {message.delete()}, 10000); });
			return;
		}
		if (botcfg.listnames == null) {
			
			data["channel"].send("List " + args[1] + " does not exists!").then( message => { setTimeout(() => {message.delete()}, 10000); });
			return;
			
		} else if (botcfg.listnames.length === 0) {
			
			data["channel"].send("List " + args[1] + " does not exists!").then( message => { setTimeout(() => {message.delete()}, 10000); });
			return;
			
		} else if (botcfg.listnames[data["guild"]] == null) {
			
			data["channel"].send("List " + args[1] + " does not exists!").then( message => { setTimeout(() => {message.delete()}, 10000); });
			return;
			
		} else if (botcfg.listnames[data["guild"]].length === 0) {
			
			data["channel"].send("List " + args[1] + " does not exists!").then( message => { setTimeout(() => {message.delete()}, 10000); });
			return;
			
		} else {
			if (botcfg.listnames[data["guild"]].includes(args[1]) === false) {
				
				data["channel"].send("List " + args[1] + " does not exists!").then( message => { setTimeout(() => {message.delete()}, 10000); });
				return;
				
			}
		}
		
		let index = botcfg.listnames[data["guild"]].indexOf(args[1]);
		botcfg.listnames[data["guild"]].splice(index, 1);
		delete botcfg.list[data["guild"]][args[1]];
		 fs1.writeFile("./botconfig.json", JSON.stringify(botcfg), (err) => console.error);
		data["channel"].send("List " + args[1] + " Deleted!").then( message => { setTimeout(() => {message.delete()}, 10000); });
		
	} else if (args[0] === "section") {
		
			if (args[1]  == null || args[1]  === "") {
			
			data["channel"].send("Invalid Arguments use command help for help!").then( message => { setTimeout(() => {message.delete()}, 10000); });
			return;
		}
		if (botcfg.listnames == null) {
			
			data["channel"].send("List " + args[1] + " does not exists!").then( message => { setTimeout(() => {message.delete()}, 10000); });
			return;
			
		} else if (botcfg.listnames.length === 0) {
			
			data["channel"].send("List " + args[1] + " does not exists!").then( message => { setTimeout(() => {message.delete()}, 10000); });
			return;
			
		} else if (botcfg.listnames[data["guild"]] == null) {
			
			data["channel"].send("List " + args[1] + " does not exists!").then( message => { setTimeout(() => {message.delete()}, 10000); });
			return;
			
		} else if (botcfg.listnames[data["guild"]].length === 0) {
			
			data["channel"].send("List " + args[1] + " does not exists!").then( message => { setTimeout(() => {message.delete()}, 10000); });
			return;
			
		} else {
			if (botcfg.listnames[data["guild"]].includes(args[1]) === false) {
				
				data["channel"].send("List " + args[1] + " does not exists!").then( message => { setTimeout(() => {message.delete()}, 10000); });
				return;
				
			}
		}
		
		if (args[2] === "add") {
			
			let c = botcfg.list[data["guild"]][args[1]];
			if (args[3] === null) {
				
					data["channel"].send("Invalid arguments use command help for help").then( message => { setTimeout(() => {message.delete()}, 10000); });
				
			} else {
				
				let d = args[3];
				for (let i=4;i<args.length;i++) {
					
					d = d + " " + args[i];
					
				}
				let dd = {};
				dd[0] = d;
				dd[1] = 1;
				let dd2 = {};
				dd2[0] = d;
				dd2[1] = 0;
				if (same(c, dd) || same(c, dd2)) {
					
					data["channel"].send("List " + args[1] + " Already contains section " + d + "!").then( message => { setTimeout(() => {message.delete()}, 10000); });
					
				} else {
					
					c.push(dd2);
					data["channel"].send("List " + args[1] + " section " + d + " added!").then( message => { setTimeout(() => {message.delete()}, 10000); });
					botcfg.list[data["guild"]][args[1]] = c;
					
				}
				
			}
			
		} else if (args[2] === "remove") {
			
			let c = botcfg.list[data["guild"]][args[1]];
			if (args[3] === null) {
				
					data["channel"].send("Invalid arguments use command help for help").then( message => { setTimeout(() => {message.delete()}, 10000); });
				
			} else {
				
				let d = args[3];
				for (let i=4;i<args.length;i++) {
					
					d = d + " " + args[i];
					
				}
				let dd = {};
				dd[0] = d;
				dd[1] = 1;
				let dd2 = {};
				dd2[0] = d;
				dd2[1] = 0;
				if (same(c, dd) || same(c, dd2)) {
					if (same(c,dd)) {
						let index = sameindex(c, dd);
						c.splice(index,1);
					} else {
						
						let index = sameindex(c, dd2);
						c.splice(index,1);
						
					}
					botcfg.list[data["guild"]][args[1]] = c;
				} else {
					data["channel"].send("List " + args[1] + " Does not contain section " + d + "!").then( message => { setTimeout(() => {message.delete()}, 10000); });
					
					
				}
				
			}
			
		} else if (args[2] === "check") {
			
			let c = botcfg.list[data["guild"]][args[1]];
			if (args[3] === null) {
				
					data["channel"].send("Invalid arguments use command help for help").then( message => { setTimeout(() => {message.delete()}, 10000); });
				
			} else {
				
				let d = args[3];
				for (let i=4;i<args.length;i++) {
					
					d = d + " " + args[i];
					
				}
				let dd = {};
				dd[0] = d;
				dd[1] = 1;
				let dd2 = {};
				dd2[0] = d;
				dd2[1] = 0;
				if (same(c, dd) || same(c, dd2)) {
					if (same(c,dd)) {
						let index = sameindex(c, dd);
						data["channel"].send("Index " + index).then( message => { setTimeout(() => {message.delete()}, 10000); });
						c[index] = dd;
					} else {
						
						let index = sameindex(c, dd2);
						data["channel"].send("Index " + index).then( message => { setTimeout(() => {message.delete()}, 10000); });
						c[index] = dd;
						
					}
					botcfg.list[data["guild"]][args[1]] = c;
					data["channel"].send("List " + args[1] + " section " + d + " checked!").then( message => { setTimeout(() => {message.delete()}, 10000); });
				} else {
					data["channel"].send("List " + args[1] + " Does not contain section " + d + "!").then( message => { setTimeout(() => {message.delete()}, 10000); });
					
					
				}
				
			}
			
		} else if (args[2] === "uncheck") {
			
				let c = botcfg.list[data["guild"]][args[1]];
			if (args[3] === null) {
				
					data["channel"].send("Invalid arguments use command help for help").then( message => { setTimeout(() => {message.delete()}, 10000); });
				
			} else {
				
				let d = args[3];
				for (let i=4;i<args.length;i++) {
					
					d = d + " " + args[i];
					
				}
				let dd = {};
				dd[0] = d;
				dd[1] = 1;
				let dd2 = {};
				dd2[0] = d;
				dd2[1] = 0;
				if (same(c, dd) || same(c, dd2)) {
					if (same(c,dd)) {
						let index = sameindex(c, dd);
						c[index] = dd2;
					} else {
						
						let index = sameindex(c, dd2);
						c[index] = dd2;
						
					}
					botcfg.list[data["guild"]][args[1]] = c;
					data["channel"].send("List " + args[1] + " section " + d + " unchecked!").then( message => { setTimeout(() => {message.delete()}, 10000); });
				} else {
					data["channel"].send("List " + args[1] + " Does not contain section " + d + "!").then( message => { setTimeout(() => {message.delete()}, 10000); });
					
					
				}
				
			}
			
		} else {
			
			data["channel"].send("Invalid argument use command help for help!").then( message => { setTimeout(() => {message.delete()}, 10000); });
			
		}
		
	} else if (args[0] === "list") {
		
		if (botcfg.listnames == null) {
			
			data["channel"].send("No lists exists!").then( message => { setTimeout(() => {message.delete()}, 10000); });
			
		} else if (botcfg.listnames.length === 0) {
			
			data["channel"].send("No lists exists!").then( message => { setTimeout(() => {message.delete()}, 10000); });
			
		} else if (botcfg.listnames[data["guild"]] == null) {
			
			data["channel"].send("No lists exists!").then( message => { setTimeout(() => {message.delete()}, 10000); });
			
		} else if (botcfg.listnames[data["guild"]].length === 0) {
			
			data["channel"].send("No lists exists!").then( message => { setTimeout(() => {message.delete()}, 10000); });
			
		} else {
			
			let msg = "Lists (" + botcfg.listnames[data["guild"]].length + "): ";
			for (let i=0;i<botcfg.listnames[data["guild"]].length;i++) {
				
				msg = msg + botcfg.listnames[data["guild"]][i] + ", ";
				
			}
			msg = msg.substring(0,msg.length-2);
			data["channel"].send(`${msg}`).then( message => { setTimeout(() => {message.delete()}, 10000); });
			
		}
		
	} else if (args[0] === "" || args[0] == null) {
		
		data["channel"].send("Invalid Arguments use command help for help2").then( message => { setTimeout(() => {message.delete()}, 10000); });
		
	} else {
		
		if (botcfg.listnames == null) {
			
			data["channel"].send("List " + args[0] + " Does not exists!").then( message => { setTimeout(() => {message.delete()}, 10000); });
			
		} else if (botcfg.listnames.length === 0) {
			
				data["channel"].send("List " + args[0] + " Does not exists!").then( message => { setTimeout(() => {message.delete()}, 10000); });
			
		} else if (botcfg.listnames[data["guild"]] == null) {
			
			data["channel"].send("List " + args[0] + " Does not exists!").then( message => { setTimeout(() => {message.delete()}, 10000); });
			
		} else if (botcfg.listnames[data["guild"]].length === 0) {
			
				data["channel"].send("List " + args[0] + " Does not exists!").then( message => { setTimeout(() => {message.delete()}, 10000); });
			
		} else {
			
			if (!(botcfg.listnames[data["guild"]].includes(args[0]))) {
				
				data["channel"].send("List " + args[0] + " Does not exists!").then( message => { setTimeout(() => {message.delete()}, 10000); });
				
			} else {
				
				let ss = botcfg.list[data["guild"]][args[0]];
				let msg = "#--------------------" + args[0] + "--------------------#\n";
				for (let i=0;i<ss.length;i++) {
					
					msg = msg + (i + 1) + ") " + ss[i][0] + " -- ";
					if (ss[i][1] == 1) {
						
						msg = msg + "Completed!\n";
						
					} else {
						
						msg = msg + "Uncompleted\n";
						
					}
					
				}
				let n = "";
				for (let i=0;i<args[0].lenth;i++) {
					
					n = n + "--------";
					
				}
				msg = msg + "#--------------------" +n + "--------------------#\n";
				data["channel"].send(`${msg}`).then( message => { setTimeout(() => {message.delete()}, 50000); });
				
			}
			
		}
		
	}
	
	 fs1.writeFile("./botconfig.json", JSON.stringify(botcfg), (err) => console.error);
	
}
exports.init = function(guild, cmd, chan) {
  cmd1 = [];
  //cmd(guild, "test", "test <", "test", test);
  let dis = botcfg.disabled;
  if (dis == null) {

    dis = [];

  }
  let dis2 = dis[guild];
  if (dis2 == null || !dis2) {

    dis2 = [];

  }
  cmd(guild, "help", "help", [0], "*", help);
  if (dis2.includes("list") == false) {
  	
	  cmd1.push("list");
	  cmd(guild, "list", "list <listname/create/delete/list/section> [<listname>]  [<add/remove/check/uncheck>] [<section>]", ["INF"],"*",lists);
	  
  }
  if (dis2.includes("roll") == false) {
    cmd1.push("roll");
    cmd(guild, "roll", "roll [<number>] [<check>]", [0, 1, 2], "*", roll);
  }
  if (dis2.includes("play") == false) {
    cmd1.push("play");
    cmd(guild, "play", "play <video/search>", ["INF"], "*", play)
  }
  if (dis2.includes("disconnect") == false) {
    cmd1.push("disconnect");
    cmd(guild, "disconnect", "disconnect", [0], "*", disconnect);
  }
  if (dis2.includes("skip") == false) {
    cmd1.push("skip");
    cmd(guild, "skip", "skip", [0],  "*", skip);
  }
  if (dis2.includes("repeat") == false) {

    cmd1.push("repeat");
    cmd(guild, "repeat", "repeat [<on/off/true/false>]", [0,1], "*", repeat)

  }
  if (dis2.includes("queue") == false) {
    cmd1.push("queue");
    cmd(guild, "queue", "queue", [0], "*", queued);
  }
  cmd(guild, "setcommandprefix", "setcommandprefix <prefix>", [1], "*", setCommandSign);
  if (dis2.includes("purge") == false) {
    cmd1.push("purge");
    cmd(guild, "purge", "purge [<ammount>]", [0, 1], "*", purge);
  }
  if (dis2.includes("clearchat") == false) {
   cmd1.push("clearchat");
   cmd(guild, "clearchat", "clearchat [<ammount>]", [0, 1], "*", purge);
  }
  cmd(guild, "addcommandtochannel", "addcommandtochannel", ["INF"], "*", actc);
  cmd(guild, "disablecommand", "disablecommand <command>", [1], "*", disablecommands);
  cmd(guild, "enablecommand", "enablecommand <command>", [1], "*", enablecommands);

}

function actc(data, cmd, args) {
	if (args.length >  0) {
		if (data["channel"].permissionsFor(data["member"]).hasPermission("MANAGE_MESSAGES")) { 
			if (!botcfg.cmd) {
				botcfg.cmd = {};
				botcfg.cmd[data["guild"]] = {};
			} 
			if (!botcfg.cmd[data["guild"]]) {
				
				botcfg.cmd[data["guild"]] = {};
				
			}
			let chan = args[1];
			for (let i=2;i<args.length;i++) {
				
				chan = chan + " " + args[i];
				
			}
			console.log(chan + ": " + args[0]);
			if (!botcfg.cmd[data["guild"]][args[0]]) {
				
				botcfg.cmd[data["guild"]][args[0]] = [];
			}
			botcfg.cmd[data["guild"]][args[0]].push(chan);
			 fs1.writeFile("./botconfig.json", JSON.stringify(botcfg), (err) => console.error);
			data["channel"].send("Command " + args[0] + " added to channel " + chan).then( message => { setTimeout(() => {message.delete()}, 10000); });
		} else {
			
			data["channel"].send("You do not have permission for this command!").then( message => { setTimeout(() => {message.delete()}, 10000); });
			
		}
	} else {
		
		data["channel"].send("Invalid amount of arguments!").then( message => { setTimeout(() => {message.delete()}, 10000); });
		
	}
	
}

