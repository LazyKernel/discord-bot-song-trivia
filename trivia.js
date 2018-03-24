const config = require('./config.json');
var animelist = require('./animelist.json');

let playing = false;

//gets a new trivia round
function getTrivia(optionsCount) {
    //gets new anime
    const total = animelist.length -1;
    const randAnime = Math.floor((Math.random() * total) + 1);
    const newAnime = animelist[randAnime];
    const newAnimeName = newAnime["source"];
  
    //gets random options
    let randomOptions = [];
    for (let i = 0; i < optionsCount; i++) {
      let index = Math.floor((Math.random() * total) + 1);
      let animeName = animelist[index]["source"];
      //prevents duplicates
      while (newAnimeName == animeName || randomOptions.includes(animeName)) {
        index = Math.floor((Math.random() * total) + 1);
        animeName = animelist[index]["source"];
      }
      randomOptions.push(animeName);
    }
    randomOptions[Math.floor((Math.random() * optionsCount))] = newAnimeName;
  
    data = {
      "animeName": newAnime["source"],
      "title": newAnime["title"],
      "songName": newAnime["song"] ? newAnime["song"]["title"] : null,
      "songArtist": newAnime["song"] ? newAnime["song"]["artist"] : null,
      "filename": "./to_ignore/songs/" + animelist[randAnime]["file"] + ".mp3",
      "options": randomOptions,
    };
  
    return data;
  }

const commands = {
	'play': (msg) => {
		if (!msg.guild.voiceConnection) return commands.join(msg).then(() => commands.play(msg));
		if (playing) return msg.channel.sendMessage('Already Playing');
		let dispatcher;
        playing = true;
        
		(function play(song) {
            let trivia = getTrivia(4);
            dispatcher =  msg.guild.voiceConnection.playFile(trivia.filename);
            msg.channel.send('New song! Which one is it\n\n\n' + trivia.options.map((x, i)=> ` ${i+1}: [${x}] `));
            //Creates a collection of commands for the channel
            let collector = msg.channel.createCollector(m => m);
            collector.on('collect', m => {
              let isMod = m.member.roles.some(r=>["Mod"].includes(r.name));  
              if (m.content.startsWith(config.prefix + 'pause') && isMod) {
                msg.channel.send('paused').then(() => {dispatcher.pause();});
              } else if (m.content.startsWith(config.prefix + 'resume') && isMod){
                msg.channel.send('resumed').then(() => {dispatcher.resume();});
              }else if (m.content.startsWith(config.prefix + 'time') && isMod){
                msg.channel.send(`time: ${Math.floor(dispatcher.time / 60000)}:${Math.floor((dispatcher.time % 60000)/1000) <10 ? '0'+Math.floor((dispatcher.time % 60000)/1000) : Math.floor((dispatcher.time % 60000)/1000)}`);
              }else if(m.content.startsWith(config.prefix + 'stop')&& isMod){
                msg.channel.send('stopped').then(() => {dispatcher.end();});
              }else if(m.content == (config.prefix + 'answer')){
                msg.channel.send('Submitted answer!');
              }
			});
			dispatcher.on('end', () => {
				collector.stop();
				play("");
			});
			dispatcher.on('error', (err) => {
				return msg.channel.send('error: ' + err).then(() => {
					collector.stop();
					play("");
				});
			});
		})("");
	},
	'join': (msg) => {
		return new Promise((resolve, reject) => {
			const voiceChannel = msg.member.voiceChannel;
			if (!voiceChannel || voiceChannel.type !== 'voice') return msg.reply('Could not connect to voice channel');
			voiceChannel.join().then(connection => resolve(connection)).catch(err => reject(err));
		});
    }
};

module.exports = commands ; 
