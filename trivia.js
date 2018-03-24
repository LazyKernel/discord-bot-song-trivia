const config = require('./config.json');

let playing = false;

const commands = {
	'play': (msg) => {
		if (!msg.guild.voiceConnection) return commands.join(msg).then(() => commands.play(msg));
		if (playing) return msg.channel.sendMessage('Already Playing');
		let dispatcher;
        playing = true;
        
		(function play(song) {
			dispatcher =  msg.guild.voiceConnection.playArbitraryInput('http://openings.moe/video/Ending1-Konosuba.webm');
            //Creates a collection of commands for the channel
            let collector = msg.channel.createCollector(m => m);
            collector.on('collect', m => {
              if (m.content.startsWith(config.prefix + 'pause')) {
                msg.channel.send('paused').then(() => {dispatcher.pause();});
              } else if (m.content.startsWith(config.prefix + 'resume')){
                msg.channel.send('resumed').then(() => {dispatcher.resume();});
              }else if (m.content.startsWith(config.prefix + 'time')){
                msg.channel.send(`time: ${Math.floor(dispatcher.time / 60000)}:${Math.floor((dispatcher.time % 60000)/1000) <10 ? '0'+Math.floor((dispatcher.time % 60000)/1000) : Math.floor((dispatcher.time % 60000)/1000)}`);
              }else if(m.content.startsWith(config.prefix + 'stop')){
                msg.channel.send('stopped').then(() => {dispatcher.end();});
              }
			});
			dispatcher.on('end', () => {
				collector.stop();
				play("");
			});
			dispatcher.on('error', (err) => {
				return msg.channel.sendMessage('error: ' + err).then(() => {
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
