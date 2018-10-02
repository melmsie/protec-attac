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
	const regex = new RegExp('(?:https?:\/\/)?discord(?:\.gg|\.com|app\.com\/invite)\/([A-Za-z0-9]+)', 'g')

	if (regex.test(msg.content)) {

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
	setInterval(collectBotListStats, 20000)
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

async function collectBotListStats () {
	const bots = {
		'wolver': '226393343385403403',
		'mantaro': '213466096718708737',
		'boobs': '285480424904327179',
		'neko': '334186716770598912',
		'toasty': '208946659361554432',
		'spotisearch': '303904389968560129',
		'rmb': '290947970457796608',
		'jim': '313749262687141888',
		'ub': '292953664492929025',
		'gtn': '307994108792799244',
		'Tsukasa': '254518325474885632',
		'lolbot': '272549225454239744',
		'Konata': '304789135124594698',
		'Hatsune': '346348688450387971',
		'Rythm': '235088799074484224'
	}
	
	for (const bot in bots) {
		const { body: { server_count } } = await snekfetch.get(`https://discordbots.org/api/bots/${bots[bot]}/stats`)
		metrics.gauge(`botlist.${bot}`, server_count)
	}
}
