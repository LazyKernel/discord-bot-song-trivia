const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const trivia = require("./trivia.js");

//on startup
client.on("ready", () => {
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} Servers.`);
  client.user.setActivity(`on ${client.guilds.size} servers`);
});

client.on("guildCreate", guild => {
  // This event triggers when the bot joins a Server.
  console.log(`New Server joined: ${guild.name} (id: ${guild.id}). This Server has ${guild.memberCount} members!`);
  client.user.setActivity(`on ${client.guilds.size} servers`);
});

client.on("guildDelete", guild => {
  // this event triggers when the bot is removed from a Server.
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  client.user.setActivity(`on ${client.guilds.size} servers`);
});


// This event will run on every single message received, from any channel or DM.
client.on("message", async message => {

  //Message does not work in servers so 
  if (!message.guild) return;
  //Ignores itself to prevent spam loop
  if (message.author.bot) return;
  // ignore any message that does not start with our prefix
  if (message.content.indexOf(config.prefix) !== 0) return;
  //ignore any message not in the #anime-son-trivia or bot-test text channel
  if (message.channel.id != "426862381025591317") return;

  // Seperate commands into args
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  //kicks the bot out of the voice channel and reset it (mods only) also has some issues with rejoining room
  if (command === "close"  && message.member.roles.some(r => ["Mod"].includes(r.name))) {
    message.channel.send('Resetting bot: You might want to restart the server')
      .then(message => client.destroy())
      .then(() => {client.login(config.token)});
  }

  //ping for mods only
  if (command === "ping"  && message.member.roles.some(r => ["Mod"].includes(r.name))) {
    // Latency check
    //Round trip latency, average oneway websocket server latency
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
  }

  if (command === "cmd") {
    let sayMessage = "Your command was: " + args.join(" ");
    // deletes the command message and handles exception
    message.delete().catch(O_o => { });
    // Repeats the command
    message.channel.send(sayMessage);
  }

  if (command == "help"){
    message.channel.send("Commands start with ~\n\n~play                 : starts the trivia\n~a [guess]       : guess the anime name\n~voteskip         : Vote to skip to next song");
  }

  //Adds the bot to the voice channel of whoever called it (Needs to have role mod)
  if (command === "init" && message.member.roles.some(r => ["Mod"].includes(r.name))) {
    //join the channel of whoever called this command
    trivia.join(message);
  }

  if (command == "play") {
    if(args[0] == undefined){
      trivia.play(message, 10);
    }else{
      trivia.play(message, args[0]);
    }

  }
});

client.login(config.token);