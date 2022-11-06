const { Client, 
		GatewayIntentBits,
		EmbedBuilder,
		ButtonBuilder,
		ActionRowBuilder, } = require('discord.js');

const { joinVoiceChannel,
		createAudioPlayer,
		createAudioResource,
		getVoiceConnection,
		VoiceConnectionStatus,
		entersState,
		AudioPlayerStatus, } = require('@discordjs/voice');

const { token } = require('./config.json');

const { spawn } = require('child_process');

const { createReadStream } = require('fs');

const fs = require('fs');


// Create a new client instance
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildVoiceStates,
	]
});



//-------global---variables----------------
var queue = [];
var queueposition = 0;
var audioPlay = createAudioPlayer();
var meta;
var currentChannel;

var songData = {
	name: "",
	id: "",
	thumbnail: "",
};

var res;

var connection;

var embedContent = new EmbedBuilder();
//-----------------------------------------





// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
});

// Login to Discord with your client's token
client.login(token);



client.on('messageCreate', async msg => {
	if(msg.author.bot){return}
	
	if(msg.content == "balls"){
		await msg.reply("<:ben2:1000838308575846460>");
	}
	// if(msg.content == "men"){
		// for(i = 0; i < 10; i++){
			// await msg.reply("🥵 🍆");
		// }
	// }
	if(msg.content == "vivamos todos"){
		await msg.reply("BAAAAAA");
	}
	//await console.log(msg);
});


client.on('interactionCreate', async inter => {
	if(!inter.isCommand){return}
	
	songData = {
		name: "",
		id: "",
		thumbnail: "",
	};
	
	if(inter.commandName == 'bromita'){
		await inter.reply('ok <:ben2:1000838308575846460>');
		var row = new ActionRowBuilder();
		row.addComponents(
			new ButtonBuilder()
				.setStyle(5)
				.setURL('https://t.ly/yE6U')
				.setLabel('hehe')
		);
		inter.channel.send({
			components: [row]
		})
	}
	
	if(inter.commandName == 'leave'){
		await connect.destroy();
		await inter.reply('leaving...')
	}
	
	if(inter.commandName == 'current' && queue.length != 0){
		
		embedContent = {
			color: 0x0099ff,
			title: 'Current song',
			description: queue[queueposition-1].name,
			thumbnail:{
				url: queue[queueposition-1].thumbnail,
			},
		}
		
		inter.channel.send({
			embeds: [embedContent],
		})
	}
	
	if(inter.commandName == 'do' && inter.member.voice.channel){
		
		const connect = joinVoiceChannel({
			channelId: inter.member.voice.channelId,
			guildId: inter.guildId,
			adapterCreator: inter.guild.voiceAdapterCreator,
		});
		
		await inter.reply('ya voy tarado !!1!');
		
		currentChannel = inter.channel;
		
		connect.subscribe(audioPlay);
		
		var Metadata = spawn('yt-dlp', ['-j', inter.options.getString('url')]);
		
		Metadata.stdout.on('data', (data) => {
			meta = JSON.parse(data.toString());
			
			songData.name = meta.title;
			songData.id = meta.id;
			songData.thumbnail = meta.thumbnail;
		});
		
		var Download = spawn('yt-dlp', ['-x', '-o "%(id)s.%(ext)s"', inter.options.getString('url')]);
		
		Download.on('close', (code) => {
			res = createAudioResource(createReadStream(' #' + songData.id + '.opus'));
			//console.log(res);
			
			var topush = songData;
			
			queue.push(topush);
			console.log(topush);
			
			//console.log(queue);
			
			if(audioPlay.state.status == 'idle'){
				audioPlay.play(res);
				
				embedContent = {
					color: 0x0099ff,
					title: 'Current song',
					description: queue[queueposition].name,
					thumbnail:{
						url: queue[queueposition].thumbnail,
					},
				}
				
				inter.channel.send({
					embeds: [embedContent],
				})
			}
		});
	}
	
	
	
	
	if(inter.commandName == 'skip'){
		audioPlay.stop();
		
		if(queue[queueposition]){
			audioPlay.play(createAudioResource(createReadStream(' #' + queue[queueposition].id + '.opus')));
			inter.reply('skipping...');
			
			embedContent = {
				color: 0x0099ff,
				title: 'Current song',
				description: queue[queueposition].name,
				thumbnail:{
					url: queue[queueposition].thumbnail,
				},
			}
			
			inter.channel.send({
				embeds: [embedContent],
			})
		}
	}
	
	if(inter.commandName == 'resume'){
		console.log(queue);
	}
	
});

audioPlay.on(AudioPlayerStatus.Idle, () => {
	console.log('no song playing! 1!');
	
	if(queue[queueposition]){
		audioPlay.play(createAudioResource(createReadStream(' #' + queue[queueposition].id + '.opus')));
		
		if(queue[queueposition-1].id && queue[queueposition-1].id != queue[queueposition].id){
			console.log(queue[queueposition-1].id);
			
			fs.unlink(' #' + queue[queueposition-1].id + '.opus', (data) => {
				console.log(`deleted, i hope...`)
			});
		}
		
		embedContent = {
			color: 0x0099ff,
			title: 'Current song',
			description: queue[queueposition].name,
			thumbnail:{
				url: queue[queueposition].thumbnail,
			},
		}
		
		currentChannel.send({
			embeds: [embedContent],
		})
	}
	
	else{
		console.log('no more songs to play!');
		//console.log(queue);
		//console.log(queueposition + '\n');
		console.log(queue[queueposition-1].id);
		
		fs.unlink(' #' + queue[queueposition-1].id + '.opus', (data) => {
			console.log(`deleted, i hope...`)
		});
	}
});

audioPlay.on(AudioPlayerStatus.Playing, () => {
	console.log('already playing something lol');
	queueposition++;
	//console.log(queue);
	//console.log(queueposition + '\n');
});


const countMyMessages = async (channel) => {
	await console.log(channel)
}





