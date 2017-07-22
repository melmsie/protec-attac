const config = require('./config.json')
const snekfetch = require('snekfetch')
const Discord = require('discord.js')
const client = new Discord.Client({
	disableEveryone: true
})

client.login(config.token)

client.on('message', async msg => {

	if (msg.channel.type === 'dm') return

	let command = msg.content.slice(config.prefix.length).toLowerCase().split(' ')[0]
	const args = msg.content.split(' ').slice(1)

	if (msg.content.includes('discord.gg')) {

		msg.delete()
		.then(() => msg.channel.send('**I protec**: Invite deleted')
		.then(() => msg.guild.member(msg.author).kick()
		.then(() => msg.channel.send(`**but I also attac**: ${msg.author.tag} kicked`))))
		.catch(err => msg.channel.send('I could not protec and attac for some reason. Is that person\'s role higher than mine? Do I have kick permissions? Do I have manage message permissions?'))
	}

	try {
		delete require.cache[require.resolve(`./commands/${command}`)]
		if (!msg.channel.permissionsFor(client.user.id).has(['SEND_MESSAGES', 'EMBED_LINKS']))
			return msg.author.send(`I either don't have permission to send messages or I don't have permission to embed links in #${msg.channel.name}`).catch(err => {
				console.log(err.stack)
			})
		require(`./commands/${command}`).run(client, msg, args, config, Discord)
	} catch (e) {
		if (e.message.includes('Cannot find module')) return
		return console.log(e)
	}
})

client.on('guildCreate', guild => {

	snekfetch
		.post(`https://discordbots.org/api/bots/${client.user.id}/stats`)
		.set('Authorization', config.dblist)
		.send({
			'server_count': client.guilds.size
		})
		.then(console.log('Updated dbots status.'))

	guild.defaultChannel.send('**I protec**: I will delete any invites sent here\n\n**But I also attac**: I will kick anyone who sends an invite here.')

})

client.once('ready', () => {

	console.log(`[${new Date()}] ${client.user.username} loaded successfully.`)

	client.user.setGame('He Protec')
})

process.on('unhandledRejection', err => {
	console.error(`${Date()}\n Uncaught Promise Error: \n${err.stack}`)
})