const Discord = require('discord.js-light');
const fs = require('fs');
const Guild = require('./schemas/guildsSchema');
const Timers = require('./schemas/timersSchema');
const db = require('megadb');
const dataRow = new db.crearDB('dataRows', 'data_bot');
const warn = new db.crearDB('warns', 'data_guilds');
const subwarn = new db.crearDB('subwarns', 'data_guilds');

function deleteDB() {
    try{
        fs.unlinkSync('./mega_databases/data_guilds/antiflooddetect.json');
        fs.unlinkSync('./mega_databases/data_guilds/theBasicAntiflood.json');
        fs.unlinkSync('./mega_databases/data_bot/cooldown.json');
        return console.log('DB limpiada con éxito.');
    }catch(err) {
        return console.log(err);
    }
}

function pulk(array, object) {
    let newArray = [];
    for(x of array) {
        if(x != object) {
            newArray.push(x);
        }
    }
    return newArray;
}

const dataRequiredEmbed = new Discord.MessageEmbed().setColor('RED');
function dataRequired(message) {
    dataRequiredEmbed.setDescription('`' + message + '`');
    return { content: '`[]` = Opcional.\n`<>` = Requerido.\n`{}` = Función.', embeds: [ dataRequiredEmbed ] };
}

async function selectMenu(interaction, value) {
    let _guild = await Guild.findOne({ id: interaction.guild.id }); // <- The object of the server's database.

    // Help command:
    if(value === 'ho_qespa') {
        interaction.reply({ content: value, ephemeral: true });
    }else if(value === 'ho_spaeubba') {
        interaction.reply({ content: value, ephemeral: true });
    }else if(value === 'ho_cccla') {
        interaction.reply({ content: value, ephemeral: true });
    }else if(value === 'ho_cceb') {
        interaction.reply({ content: value, ephemeral: true });
    }else if(value === 'ho_ddb') {
        interaction.reply({ content: value, ephemeral: true });

    // Command of commands:
    }else if(value === 'moreDetails') {
        if(interaction.user.id == interaction.guild.ownerId) {
            _guild.configuration.subData.showDetailsInCmdsCommand = 'moreDetails';
            _guild.save();
            interaction.reply({ content: '¡Ahora mostraré más detalles de comandos!', ephemeral: true });
        }else{
            interaction.reply({ content: 'Necesitas ser __El propietario De Este Servidor__.', ephemeral: true });
        }
    }else if(value === 'lessDetails') {
        if(interaction.user.id == interaction.guild.ownerId) {
            _guild.configuration.subData.showDetailsInCmdsCommand = 'lessDetails';
            _guild.save();
            interaction.reply({ content: '¡Ahora mostraré menos detalles de comandos!', ephemeral: true });
        }else{
            interaction.reply({ content: 'Necesitas ser __El propietario De Este Servidor__.', ephemeral: true });
        }
    }else if(value === 'twoOptions') {
        if(interaction.user.id == interaction.guild.ownerId) {
            _guild.configuration.subData.showDetailsInCmdsCommand = 'twoOptions';
            _guild.save();
            interaction.reply({ content: '¡Ahora daré a elegir al usuario el tipo de detalles que quiere ver en los comandos!', ephemeral: true });
        }else{
            interaction.reply({ content: 'Necesitas ser __El propietario De Este Servidor__.', ephemeral: true });
        }
    
    // Others:
    }else{
        let arr = await dataRow.get(interaction.user.id);
        if(!arr)return interaction.reply({ content: 'Necesitas volver a activar el comando.', ephemeral: true });
        if(arr != 'not-external') {
            let _split = `${interaction.values[0]}`.split('_');
            arr.forEach(async x => {
                if(x.value == `whitelist_${_split[1]}`) {
                    dataRow.delete(interaction.user.id);
                    _guild.configuration.whitelist = await pulk(_guild.configuration.whitelist, _split[1]);
                    _guild.save();
                    interaction.reply({ content: 'Bot eliminado de la whitelist.', ephemeral: true });
                }
            });
        }
    }
}

async function automoderator(client, mongoose, message, sanctionReason) {
    if(!subwarn.has(message.author.id))return subwarn.set(`${message.author.id}`, 1);

    if(await subwarn.get(message.author.id) >= 2) {
        subwarn.set(message.author.id, 0);
        
        if(!warn.has(`${message.guild.id}.${message.author.id}`)) {
            warn.set(`${message.guild.id}.${message.author.id}`, [{
                reason: sanctionReason,
                moderator: `${client.user.id}`
            }]);
        }else{
            warn.push(`${message.guild.id}.${message.author.id}`, {
                reason: sanctionReason,
                moderator: `${client.user.id}`
            });
        }
        message.reply({ embeds: [ new Discord.MessageEmbed().setColor(0x0056ff).setDescription(`<@${message.author.id}>, has sido advertido.\n\nRazón: \`${sanctionReason}\`\nModerador: \`${client.user.tag}\``) ] });
        
        let warns = await warn.get(`${message.guild.id}.${message.author.id}`);

        if(warns.length == mongoose.moderation.automoderator.actions.warns[0]) {
            if(message.member.roles.cache.has(mongoose.moderation.dataModeration.muterole))return;
            if(!message.guild.me.permissions.has('MANAGE_ROLES')) {
                client.users.cache.get(message.guild.ownerId).send('No tengo permisos para mutear a un usuario, he desactivado el automoderador.').catch(err => {
                    message.channel.send('<@' + message.guild.ownerId + '>, no tengo permisos para mutear al usuario, he desactivado el automoderador.');
                });
                mongoose.moderation.automoderator.enable = false;
                mongoose.save();
                return;
            }
            let remember = [];

            try{
                message.member.roles.cache.forEach(x => {
                    remember.push(x.id);
                    message.member.roles.remove(x.id).catch(err => {});
                });
            
                message.member.roles.add(mongoose.moderation.dataModeration.muterole).catch(err => {
                    message.channel.send(err);
                });
            }catch(err) {
                message.channel.send(err);
            }
            mongoose.moderation.dataModeration.timers.push({
                user: {
                    id: message.author.id,
                    username: message.author.username,
                    roles: remember
                },
                endAt: Date.now() + mongoose.moderation.automoderator.actions.muteTime[0],
                action: 'UNMUTE',
                channel: message.channel.id,
                inputTime: mongoose.moderation.automoderator.actions.muteTime[1]
            });
            mongoose.save();
            let _timers = await Timers.findOne({ });
            if(!_timers.servers.includes(message.guild.id)) {
                _timers.servers.push(message.guild.id);
                _timers.save();
            }
            message.reply({ content: `He muteado a \`${message.author.username}\` durante \`${mongoose.moderation.automoderator.actions.muteTime[1]}\` por tener demasiadas infracciónes.` });
        }else if(warns.length > mongoose.moderation.automoderator.actions.warns[1]) {
            if(mongoose.moderation.automoderator.actions.action == 'BAN') {
                if(!message.guild.me.permissions.has('BAN_MEMBERS')) {
                    client.users.cache.get(message.guild.ownerId).send('No tengo permisos para banear a un usuario, he desactivado el automoderador.').catch(err => {
                        message.channel.send('<@' + message.guild.ownerId + '>, no tengo permisos para banear al usuario, he desactivado el automoderador.');
                    });
                    mongoose.moderation.automoderator.enable = false;
                    mongoose.save();
                    return;
                }
                message.guild.members.ban(message.author.id).then(() => {
                    message.channel.send('He baneado al usuario.');
                }).catch(err => {});
                return;
            }else{
                if(!message.guild.me.permissions.has('KICK_MEMBERS')) {
                    client.users.cache.get(message.guild.ownerId).send('No tengo permisos para expulsar a un usuario, he desactivado el automoderador.').catch(err => {
                        message.channel.send('<@' + message.guild.ownerId + '>, no tengo permisos para expulsar al usuario, he desactivado el automoderador.');
                    });
                    mongoose.moderation.automoderator.enable = false;
                    mongoose.save();
                    return;
                }
                message.guild.members.kick(message.author.id).then(() => {
                    message.channel.send('He expulsado al usuario.');
                }).catch(err => {});
                return;
            }
        }
        return;
    }else{
        subwarn.sumar(message.author.id, 1);
    }
}

async function intelligentSOS(_guild, client, eventType) {
    if(_guild.protection.intelligentSOS.cooldown == false) {
        let invite = await channel.guild.channels.cache.filter(m => m.type == 'text').random().createInvite();
        if(!invite == undefined) {
            client.channels.cache.get('1001901027638915162').send('@everyone SOS de `' + eventType + '`:\nhttps://discord.gg/' + invite);
            client.channels.cache.get('1001901027638915162').send('@everyone SOS de `' + eventType + '`:\nhttps://discord.gg/' + invite);
        }

        _guild.protection.intelligentSOS.cooldown = true;
        _guild.save();

        setTimeout(() => {
            _guild.protection.intelligentSOS.cooldown = false;
            _guild.save();
        }, 120000);
    }
}

module.exports = {
    deleteDB, selectMenu, pulk, dataRequired, automoderator, intelligentSOS
}