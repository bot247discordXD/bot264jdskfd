const { version } = require('./package.json');
const Guild = require('./schemas/guildsSchema');
const db = require('megadb');
const ownerGuildManager = new db.crearDB('ownerGuildManager', 'data_users');

async function install_commands(client, guild, database) {
	try {
		let _guild = await Guild.findOne({ id: guild.id });
		if(!_guild) {
			let newGuild = new Guild({
				id: guild.id, // Server ID.

				protection: {
					antiraid: {
						enable: true,
						amount: 0
					},
					antibots: {
						enable: false,
						_type: 'all'
					},
					antitokens: {
						enable: false,
						usersEntrities: [],
						entritiesCount: 0
					},
					antijoins: {
						enable: false,
						rememberEntrities: []
					},
					markMalicious: {
						enable: true,
						_type: 'changeNickname',
						rememberEntrities: []
					},
					warnEntry: true,
					kickMalicious: {
						enable: false,
						rememberEntrities: []
					},
					ownSystem: {
						enable: false
					},
					verification: {
						enable: false,
					},
					cannotEnterTwice: {
						enable: false,
						users: []
					},
					purgeWebhooksAttacks: {
						enable: true,
						amount: 0
					},
					intelligentSOS: {
						enable: false,
						cooldown: false
					}
				},

				moderation: {
					automoderator: { // Default moderation on the server.
						enable: false,
						actions: {
							warns: [ 3, 5 ],
							muteTime: [ 3600000, '10h' ],
							action: 'BAN',
							linksToIgnore: [ '.gif', '.png', '.jpg', '.txt', '.mp3' ]
						},
						events: {
							badwordDetect: true,
							floodDetect: true,
							manyPings: true,
							capitalLetters: false,
							manyEmojis: false,
							manyWords: false,
							linkDetect: true
						},
					},
				},

				configuration: {
					prefix: 'sp!', // The SERVER_PREFIX.
					language: 'Español',
					subData: {
						showDetailsInCmdsCommand: 'lessDetails' // The details of commands.
					},
				},
			});
			newGuild.save();
		}

		database.set(guild.id, version);
		
		if(ownerGuildManager.has(guild.ownerId)) {
			let g = await ownerGuildManager.get(guild.ownerId);
			if(!g.includes(guild.id)) {
				ownerGuildManager.push(guild.ownerId, guild.id);
			}
		}else{
			ownerGuildManager.set(guild.ownerId, [ guild.id ]);
		}
	} catch (error) {}
}

module.exports = install_commands;