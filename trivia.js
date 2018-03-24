const config = require('./config.json');
var animelist = require('./animelist.json');

let answers = [];
let playing = false;

//gets a list of anime names to check answers with
function getAnswers() {
  const total = animelist.length - 1;
  for (let i = 0; i < total; i++) {
    answers.push(animelist[i]["source"].toLowerCase());
  }
  //remove dupes with dedup
  answers = answers.filter((item, i, arr) => arr.indexOf(item) === i);
}

//gets a new trivia round
function getTrivia() {
  //gets new anime
  const total = animelist.length - 1;
  const randAnime = Math.floor((Math.random() * total) + 1);
  //prevent null
  while (animelist[randAnime] == undefined) {
    randAnime = Math.floor((Math.random() * total) + 1);
  }
  const newAnime = animelist[randAnime];
  const newAnimeName = newAnime["source"];

  data = {
    "animeName": newAnime["source"],
    "title": newAnime["title"],
    "filename": animelist[randAnime]["file"],
  };

  return data;
}

const commands = {
  'play': (msg) => {
    if (!msg.guild.voiceConnection) return commands.join(msg).then(() => commands.play(msg));
    if (playing) return msg.channel.send('Already Playing');
    let dispatcher;
    playing = true;
    getAnswers();

    (function play(song) {
      let trivia = getTrivia();
      console.log(trivia)
      //dispatcher = msg.guild.voiceConnection.playFile("./to_ignore/songs/" + trivia.filename + ".mp3");
      dispatcher = msg.guild.voiceConnection.playArbitraryInput("http://openings.moe/video/" + trivia.filename);
      msg.channel.send("New song! Make a guess!");
      console.log("Song is from :" + trivia.animeName);
      console.log(msg.guild.voiceConnection.status);
      //msg.channel.send('New song! Which one is it\n\n\n' + trivia.options.map((x, i)=> ` ${i+1}: [${x}] `));
      //Creates a collection of commands for the channel
      let collector = msg.channel.createCollector(m => m);
      collector.on('collect', m => {
        let isMod = m.member.roles.some(r => ["Mod"].includes(r.name));
        if (m.content.startsWith(config.prefix + 'pause') && isMod) {
          msg.channel.send('paused').then(() => { dispatcher.pause(); });
        } else if (m.content.startsWith(config.prefix + 'resume') && isMod) {
          msg.channel.send('resumed').then(() => { dispatcher.resume(); });
        } else if (m.content.startsWith(config.prefix + 'time') && isMod) {
          console.log(msg.guild.voiceConnection);
          msg.channel.send(`time: ${Math.floor(dispatcher.time / 60000)}:${Math.floor((dispatcher.time % 60000) / 1000) < 10 ? '0' + Math.floor((dispatcher.time % 60000) / 1000) : Math.floor((dispatcher.time % 60000) / 1000)}`);
        } else if (m.content.startsWith(config.prefix + 'song') && isMod) {
          msg.channel.send(`The song is from ${trivia.animeName}`);
        } else if (m.content.startsWith(config.prefix + 'file') && isMod) {
          msg.channel.send(`The song is from ${trivia.filename}`);
        } else if (m.content.startsWith(config.prefix + 'skip') && isMod) {
          msg.channel.send('skipping').then(() => { dispatcher.end(); });
        } else if (m.content.startsWith(config.prefix + 'end') && isMod) {
          playing = false;
          msg.channel.send('Ending').then(() => { dispatcher.end(); });
        } else if (m.content.startsWith(config.prefix + 'a ')) {
          msg.channel.send('Submitted answer!');
          //parse args
          const query = m.content.slice(config.prefix.length + 1).trim();
          console.log(query);
          //at least 4 chars long
          if(query.length >= 4){
            let pattern = new RegExp(query);
            let matches = answers.filter(x => x.match(pattern));
            console.log(matches);
            console.log(trivia.animeName);
            if(matches.includes(trivia.animeName.toLowerCase())){
              msg.channel.send('You got it right! The anime is called: ' + trivia.animeName );
            }
          }
        }
      });
      dispatcher.on('end', () => {
        collector.stop();
        if (playing) {
          play("");
        }
      });
      dispatcher.on('error', (err) => {
        return msg.channel.send('error: ' + err).then(() => {
          console.log(err);
          playing = false;
          collector.stop();
          dispatcher.end();
        });
      });
    })("");
  },
  'join': (msg) => {
    return new Promise((resolve, reject) => {
      const voiceChannel = msg.member.voiceChannel;
      if (!voiceChannel || voiceChannel.type !== 'voice') return msg.reply('You have to be in a voice channel!');
      voiceChannel.join().then(connection => resolve(connection)).catch(err => reject(err));
    });
  },
  'reset': () => {
    playing = false;
  }
};

module.exports = commands; 
