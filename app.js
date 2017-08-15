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
	let memer = await snekfetch.get(`https://discordbots.org/api/bots/270904126974590976/stats`)
	let mantaro = await snekfetch.get(`https://discordbots.org/api/bots/213466096718708737/stats`)
	let boobs = await snekfetch.get(`https://discordbots.org/api/bots/285480424904327179/stats`)
	let neko = await snekfetch.get(`https://discordbots.org/api/bots/334186716770598912/stats`)
	let toasty = await snekfetch.get(`https://discordbots.org/api/bots/208946659361554432/stats`)
	let spotisearch = await snekfetch.get(`https://discordbots.org/api/bots/303904389968560129/stats`)
	let rmb = await snekfetch.get(`https://discordbots.org/api/bots/290947970457796608/stats`)
	let jim = await snekfetch.get(`https://discordbots.org/api/bots/313749262687141888/stats`)
	let ub = await snekfetch.get(`https://discordbots.org/api/bots/292953664492929025/stats`)
	let gtn = await snekfetch.get(`https://discordbots.org/api/bots/307994108792799244/stats`)
	let bad = await snekfetch.get(`https://bots.discord.pw/api/bots/249303797371895820/stats`)
	let xiao = await snekfetch.get(`https://bots.discord.pw/api/bots/278305350804045834/stats`)
	
	metrics.gauge('botlist.memer', memer.body.server_count)
	metrics.gauge('botlist.mantaro', mantaro.body.server_count)
	metrics.gauge('botlist.boobs', boobs.body.server_count)
	metrics.gauge('botlist.neko', neko.body.server_count)
	metrics.gauge('botlist.toasty', toasty.body.server_count)
	metrics.gauge('botlist.spotisearch', spotisearch.body.server_count)
	metrics.gauge('botlist.rmb', rmb.body.server_count)
	metrics.gauge('botlist.jim', jim.body.server_count)
	metrics.gauge('botlist.ub', ub.body.server_count)
	metrics.gauge('botlist.gtn', gtn.body.server_count)
	metrics.gauge('botlist.bad', bad.body.server_count)
	metrics.gauge('botlist.xiao', xiao.body.server_count)
	
}