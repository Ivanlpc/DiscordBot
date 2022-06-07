const fs = require('fs');
const {
    REST
} = require('@discordjs/rest');
const {
    Routes
} = require('discord-api-types/v9');
// Require the necessary discord.js classes
const {
    Client,
    Intents,
    Collection,
    MessageEmbed
} = require('discord.js');
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const config=require("./json/config.json");
// Create a new client instance
const client = new Client({
    intents: [Intents.FLAGS.GUILDS]
});
const commands = [];
const TEST_GUILD_ID = config.guildID

// Creating a collection for commands in client
client.commands = new Collection();

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
    client.commands.set(command.data.name, command);
}

// When the client is ready, this only runs once
client.once('ready', () => {
    
    // Registering the commands in the client
    const CLIENT_ID = client.user.id;
    const rest = new REST({
        version: '9'
    }).setToken(config.token);
    (async () => {
        try {
            if (!TEST_GUILD_ID) {
                await rest.put(
                    Routes.applicationCommands(CLIENT_ID), {
                        body: commands
                    },
                );
                console.log('Registrados los comandos para uso global');
            } else {
                await rest.put(
                    Routes.applicationGuildCommands(CLIENT_ID, TEST_GUILD_ID), {
                        body: commands
                    },
                );
                console.log('Registrados los comandos');
            }
        } catch (error) {
            if (error) console.error(error);
        }
    })();
    console.log(`Logueado como ${client.user.tag}`);
});
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
        await command.execute(interaction,client);
    } catch (error) {
        if (error) console.error(error);
        await interaction.reply({ content: 'Hubo un error al ejecutar el comando', ephemeral: true });
    }
});

client.login(config.token)
