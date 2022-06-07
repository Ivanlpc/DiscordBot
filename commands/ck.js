const { SlashCommandBuilder } = require('@discordjs/builders');
const { crearEmbedConfirmacion, crearBotones, borrarLicencia, printError, buscar } = require("../functions.js")
const config = require("../json/config.json")
console.log("Comando /ck cargado")
module.exports = {
    data: new SlashCommandBuilder()
        .setName('ck')
        .setDescription('Realiza un CK a una licencia o Char')
        .addStringOption(option =>
            option.setName('licencia')
                .setDescription('Numero de licencia')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('char')
                .setDescription('Numero de Char. Si está vacío se le hace CK a todos')
                .setRequired(false)),
    async execute(interaction, client) {

        if (!interaction.member.roles.cache.has(config.rolCK)) return interaction.reply({  //Comprueba si el que interacciona tiene el rol definido en la config
            content: 'No tienes permiso para ejecutar este comando',
            ephemeral: true
        })


        var row = crearBotones(); //Función que define el estilo de los botones del mensaje embed
        let char = interaction.options.getInteger("char"); //Devuelve el argumento char del comando
        if (interaction.options.getInteger("char") < 1) { //Si es nulo o inferior a 1, se pone por defecto en Todos
            char = "Todos"
        }
        let licencia = await interaction.options.getString("licencia") //Devuelve los números de licencia del comando

        if (licencia.length != 40) return interaction.reply({ content: `${licencia} no es una licencia válida, debe tener 40 carácteres`, ephemeral: true })
        let existe = buscar(licencia, char, async (resultado) => {
        

            if (resultado == "si") {
                let embedxd = await crearEmbedConfirmacion(licencia, interaction.member.user, char.toString(), client.user.avatarURL()) //Función para crear un embed y mandarlo

                const first = await interaction.reply({ embeds: [embedxd], components: [row] }) //Responde al comando con el embed generado anteriormente y los botones

                const filter = (interactionB) => {                                  //Pone un filtro para que sólamente pueda reaccionar el que hizo el comando
                    if (interactionB.user.id === interaction.user.id) return true;
                    return interactionB.reply({ content: "No puedes reaccionar a este mensaje", ephemeral: true });
                };
                const collector = await interaction.channel.createMessageComponentCollector({       //Crea un collector que está pendiente de las reacciones de los botones
                    filter,
                    max: 1,
                    time: 10000

                });
                collector.on("end", async (ButtonInteraction) => {  //Si termina el tiempo o reacciona a algún botón lo analiza y hace o no el CK
                    try {
                        let id = ButtonInteraction.first().customId;
                        if (id === "si") {
                            let borrar = borrarLicencia(licencia, char, (status) => {
                                if (status == "OK") {

                                    embedxd.setColor("#27FF00")
                                        .setTitle("CK Realizado");
                                } else {
                                    embedxd.setColor("#F92F03")
                                        .setTitle("CK FALLIDO")
                                        .addFields({ name: "Soporte:", value: "Revisa la consola para ver los errores", inline: false });
                                }
                                interaction.editReply({ embeds: [embedxd], components: [] });
                            })

                            ButtonInteraction.first().deferUpdate();
                        } else if (id === "no") {
                            await interaction.followUp({
                                content: '¡CK Cancelado!',
                                ephemeral: true
                            });
                            await interaction.deleteReply();
                            ButtonInteraction.first().deferUpdate();
                        }
                    } catch (e) {
                        console.log(e)
                        await interaction.followUp({
                            content: '¡Has excedido el límite de tiempo!',
                            ephemeral: true
                        });
                        await interaction.deleteReply();
                    }
                });
            } else {
                let embedxd = await printError(licencia, char)
                embedxd.setFooter({ text: `${interaction.member.user.username}#${interaction.member.user.discriminator}`, iconURL: client.user.avatarURL() })
                    .setThumbnail(client.user.avatarURL())
                interaction.reply({ embeds: [embedxd], ephemeral: true })
            }
        })
    }

};
module.exports.help = {
    name: 'ck'
}
