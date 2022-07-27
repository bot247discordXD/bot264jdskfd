const Discord = require('discord.js-light');
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://Thiagopruebas:thiagoeselmasguapo.e@cluster0.uhxwa.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const { readdirSync } = require('fs');
const client = new Discord.Client({
    shards: 'auto',
    makeCache: Discord.Options.cacheWithLimits({
        ApplicationCommandManager: Infinity, // guild.commands
        BaseGuildEmojiManager: Infinity, // guild.emojis
        ChannelManager: Infinity, // client.channels
        GuildChannelManager: Infinity, // guild.channels
        GuildBanManager: Infinity, // guild.bans
        GuildManager: Infinity, // client.guilds
        GuildMemberManager: Infinity, // guild.members
        MessageManager: Infinity, // channel.messages
        PermissionOverwriteManager: Infinity, // channel.permissionOverwrites
        RoleManager: Infinity, // guild.roles
        UserManager: Infinity, // client.users
    }),
    intents: [Discord.Intents.FLAGS.GUILDS, "GUILD_MESSAGES", "GUILD_MEMBERS", "GUILD_BANS", "GUILDS", "GUILD_EMOJIS_AND_STICKERS", "GUILD_INVITES", "GUILD_WEBHOOKS", "GUILD_INTEGRATIONS", "GUILD_VOICE_STATES", "DIRECT_MESSAGES", "DIRECT_MESSAGE_TYPING"],
});
client.comandos = new Discord.Collection();

setInterval(() => {
	client.sweepMessages(1);
}, 60000);

// ------------------------------------
/* ----- Command + Event handler -----*/
// ------------------------------------

for(const file of readdirSync('./eventos/')) {
	if(file.endsWith('.js')) {
		const fileName = file.substring(0, file.length - 3);
		const fileContents = require(`./eventos/${file}`);
		client.on(fileName, fileContents.bind(null, client));
		delete require.cache[require.resolve(`./eventos/${file}`)];
	}
}

for(const subcarpeta of readdirSync('./comandos/')) { 
    for(const file of readdirSync('./comandos/'+subcarpeta)) { 
        if(file.endsWith(".js")) {
            let fileName = file.substring(0, file.length - 3); 
            let fileContents = require(`./comandos/${subcarpeta}/${file}`); 
            client.comandos.set(fileName, fileContents);
        }
    }
}

// ------------------------------------
/* ----- Command + Event handler -----*/
// ------------------------------------

// 	else if(command === 'ayuda' || command === 'help' || command === 'links' || command === 'invite') {
// 		const embed = new Discord.MessageEmbed()
// 			.setDescription(`<:sp_dev:875787925273595934> ¡Hola <@${message.author.id}>! Mi prefix en este servidor es \`${prefix}\`.\nMi prefix por defecto es \`sp!\`\n<:sp_flecha:875788005766492181> **__¿Necesitas ayuda?__**\n**- Visita mi página web [En desarrollo.]\n- Puedes ver mis comandos con \`${prefix}comandos\` <:SPan_Agency:830249669589205033>\n- Puedes entrar a [mi servidor de soporte](https://discord.gg/RuBvM5r9eM)\n- Puedes invitarme por: [Link Directo](https://discord.com/oauth2/authorize?client_id=779660400081764393&scope=bot&permissions=8) / [Top.gg](https://top.gg/bot/779660400081764393) / [Aura botList](https://auralist.glitch.me/bots/779660400081764393)**`)
// 			.setColor(0x5c4fff)
//         	.setFooter(message.guild.name, message.guild.iconURL());
// 		message.channel.send(embed);
// 	}
// });

// Aquí borrarémos datos del antiflood:
// setTimeout(async () => {
//     console.log('Borrando datos inútiles de la DB...');
//     await fns.deleteDB();
//     const crear = new db.crearDB('antiflooddetect', 'data_guilds');
//     const _crear = new db.crearDB('theBasicAntiflood', 'data_guilds');
//     const __crear = new db.crearDB('cooldown', 'data_bot');
//     console.log('Eliminaré datos de nuevo el: '+`${new Date().getDate()+1}`+' (En 24h)');
// }, 1);
// // Dejamos de borrar datos del antiflood.

process.on('unhandledRejection', async (err) => {
    // if(err.includes(['10062', '10008', 'VersionError]))return;
    console.error(err);
});

client.login("MTAwMTY1MTgwNDc4Nzk3NDE1NA.G8HL59.BbVtB3BxdcH9tFCPDUXqsSttU19soGGLgIwzBQ").then(() => {
    const package = require('./package.json');
    console.log(`${client.user.tag} (${client.user.id}) se ha encendido. Versión: ${package.version}.`);
});

/*
+ data_guilds:
guildManager

+ data_users:
ownerGuildManager
*/