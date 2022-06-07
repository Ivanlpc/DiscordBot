const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const config = require("../json/config.json")
const configStream = require("../json/configStream.json");
const { UpdateAuthConfig, buscarJSON } = require("../functions.js")
console.log("Comando /twitch cargado")
module.exports = {
    data: new SlashCommandBuilder()
        .setName('licencia')
        .setDescription('Busca la licencia de un jugador')
        .addUserOption(option => option.setName('discord').setDescription('Discord del jugador').setRequired(true)),
    async execute(interaction, client) {
        if (!interaction.member.roles.cache.has(config.rolAdmin)) return interaction.reply({  //Comprueba si el que interacciona tiene el rol de streamer de la config
            content: 'No tienes permiso para ejecutar este comando',
            ephemeral: true
        })
            comandoUser = interaction.options.getMember("discord").user.id;
        
        if (interaction.options.getSubcommand() === "add") {
            var twitch = interaction.options.getString("twitch");
            if (!twitch) return interaction.reply({ content: `Debes especificar el nombre del canal de twitch`, ephemeral: true })
            buscar(configStream, comandoUser, async (existe) => {

                if (existe == "yes") {
                    interaction.reply({ content: `El usuario <@!${comandoUser}> ya tiene un canal de twitch asignado`, ephemeral: true })

                } else {

                    let str = `{"ChannelName":"${twitch}","twitch_stream_id":"","discord_message_id":"","discord_id":"${comandoUser}"}`
                    str = JSON.parse(str)
                    configStream.channels.push(str)
                    fs.writeFileSync('./json/configStream.json', JSON.stringify(configStream));
                    UpdateAuthConfig();
                    interaction.reply({ content: `Se ha añadido el canal https://twitch.tv/${twitch} del usuario <@!${comandoUser}>`, ephemeral: true })
                }
            })

        } 
    }
}
module.exports.help = {
    name: 'licencia'
}
