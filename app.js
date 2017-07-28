const config = require('./config.json')
const snekfetch = require('snekfetch')
const Discord = require('discord.js')
const client = new Discord.Client({
	disableEveryone: true
})

const metrics = require('datadog-metrics')
metrics.init({
	apiKey: config.datadog.APIkey,
	appKey: config.datadog.APPkey,
	flushIntervalSeconds: 3,
	prefix: 'protec.'
})

client.on('message', async msg => {
	metrics.increment('messages.seen')
	if (msg.channel.type === 'dm') return

	let command = msg.content.slice(config.prefix.length).toLowerCase().split(' ')[0]
	const args = msg.content.split(' ').slice(1)

	if (msg.content.includes('discord.gg')) {

		msg.delete()
		.then(() => msg.channel.send('**I protec**: Invite deleted')
		.then(() => msg.guild.member(msg.author).kick()
		.then(() => msg.channel.send(`**but I also attac**: ${msg.author.tag} kicked`))))
		.catch(err => msg.channel.send('I could not protec and attac for some reason. Is that person\'s role higher than mine? Do I have kick permissions? Do I have manage message permissions?'))
		metrics.increment('invites.killed')
	}

	if (!msg.content.toLowerCase().startsWith(config.prefix) || !command) {
		return
	}

	try {
		delete require.cache[require.resolve(`./commands/${command}`)]
		if (!msg.channel.permissionsFor(client.user.id).has(['SEND_MESSAGES', 'EMBED_LINKS']))
			return 
		require(`./commands/${command}`).run(client, msg, args, config, Discord)
		metrics.increment('total.commands')
	} catch (e) {
		if (e.message.includes('Cannot find module')) return
		return console.log(e)
	}
})

client.on('guildCreate', guild => {
	metrics.increment('guild.joined')
	snekfetch
		.post(`https://discordbots.org/api/bots/${client.user.id}/stats`)
		.set('Authorization', config.dblist)
		.send({
			'server_count': client.guilds.size
		})
		.then(console.log('Updated dbots status.'))

	guild.defaultChannel.send('**I protec**: I will delete any invites sent here\n\n**But I also attac**: I will kick anyone who sends an invite here.')

})
client.on('guildDelete', () => {
	metrics.increment('guild.left')
})

client.once('ready', () => {

	console.log(`[${new Date()}] ${client.user.username} loaded successfully.`)

	client.user.setGame('He Protec')

	setInterval(collectTechnicalStats, 3000)
	setInterval(collectBotStats, 30000)
})

process.on('unhandledRejection', err => {
	console.error(`${Date()}\n Uncaught Promise Error: \n${err.stack}`)
})

client.login(config.token)

function collectTechnicalStats() {
	var memUsage = process.memoryUsage()
	metrics.gauge('ram.rss', (memUsage.rss / 1048576).toFixed())
	metrics.gauge('ram.heapUsed', (memUsage.heapUsed / 1048576).toFixed())
	metrics.gauge('ping', client.ping.toFixed(0))
	metrics.gauge('current.uptime', process.uptime())
}

function collectBotStats() {
	metrics.gauge('totalGuilds', client.guilds.size)
	metrics.gauge('totalUsers', client.users.size)

}