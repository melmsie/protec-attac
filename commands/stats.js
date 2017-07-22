exports.run = function (client, msg, args, config, Discord) {
	msg.channel.send({
		embed: new Discord.RichEmbed()
			.addField('Uptime', timeCon(process.uptime()), true)
			.addField('RAM Usage', `${(process.memoryUsage().rss / 1048576).toFixed()}MB`, true)
			.addField('Guild Count', client.guilds.size, true)
	})
}


function timeCon(time) {
	let days = Math.floor(time % 31536000 / 86400)
	let hours = Math.floor(time % 31536000 % 86400 / 3600)
	let minutes = Math.floor(time % 31536000 % 86400 % 3600 / 60)
	let seconds = Math.round(time % 31536000 % 86400 % 3600 % 60)
	days = days > 9 ? days : '0' + days
	hours = hours > 9 ? hours : '0' + hours
	minutes = minutes > 9 ? minutes : '0' + minutes
	seconds = seconds > 9 ? seconds : '0' + seconds
	return `${days > 0 ? `${days}:` : ''}${(hours || days) > 0 ? `${hours}:` : ''}${minutes}:${seconds}`
}