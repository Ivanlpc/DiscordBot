const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const config = require("../json/config.json")
const configStream = require("../json/configStream.json");
const { UpdateAuthConfig, buscarJSON } = require("../functions.js")
console.log("Comando /ip cargado")
module.exports = {
    data: new SlashCommandBuilder()
        .setName('ip')
        .setDescription('Añade tu canal de twitch al bot')
        .addStringOption(option => option.setName('ip').setDescription('Nombre del canal de twitch').setRequired(true))
    async execute(interaction, client) {
        if (!interaction.member.roles.cache.has(config.rolAdmin)) return interaction.reply({  //Comprueba si el que interacciona tiene el rol de streamer de la config
            content: 'No tienes permiso para ejecutar este comando',
            ephemeral: true
        })


        var comandoUser = interaction.user.id;
        if (interaction.options.getMember("discord")) {
            if (!interaction.member.roles.cache.has(config.rolAdmin)) return interaction.reply({ content: "No tienes permiso para especificar el usuario", ephemeral: true })
            comandoUser = interaction.options.getMember("discord").user.id;
        }
        if (interaction.options.getSubcommand() === "add") {
            var twitch = interaction.options.getString("twitch");
            if (!twitch) return interaction.reply({ content: `Debes especificar el nombre del canal de twitch`, ephemeral: true })
            buscarJSON(configStream, comandoUser, async(existe) => {
                
                if (existe=="yes") { 
                   interaction.reply({ content: `El usuario <@!${comandoUser}> ya tiene un canal de twitch asignado`,ephemeral:true }) 
                 
                }else {
                    
                    let str = `{"ChannelName":"${twitch}","twitch_stream_id":"","discord_message_id":"","discord_id":"${comandoUser}"}`
                    str = JSON.parse(str)
                    configStream.channels.push(str)
                    fs.writeFileSync('./json/configStream.json', JSON.stringify(configStream));
                    UpdateAuthConfig();
                    interaction.reply({ content: `Se ha añadido el canal https://twitch.tv/${twitch} del usuario <@!${comandoUser}>`, ephemeral:true })
                }
            })

        } else if (interaction.options.getSubcommand() === "remove") {
            buscarJSON(configStream, comandoUser, (existe, indice) => {
                if (existe) {
                    configStream.channels.splice(indice, 1)
                    fs.writeFileSync('./json/configStream.json', JSON.stringify(configStream));
                    UpdateAuthConfig();
                    interaction.reply({ content: `Has eliminado del bot a <@!${comandoUser}>`, ephemeral: true })
                } else {
                    interaction.reply({ content: `El usuario <@!${comandoUser}> no está añadido al bot`, ephemeral: true })
                }
            })

        }
    }
}
module.exports.help = {
    name: 'twitch'
}
