// This file allows you to register slash commands, it must be launched each time you add a new (/) command

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { readdirSync } = require('fs');
const path = require('path');
require('dotenv').config()

const commands = []
readdirSync("./src/slashCommands/").map(async dir => {
	readdirSync(`./src/slashCommands/${dir}/`).map(async (cmd) => {
	commands.push(require(path.join(__dirname, `./src/slashCommands/${dir}/${cmd}`)))
    })
})
const rest = new REST({ version: "9" }).setToken(process.env.TOKEN);

(async () => {
	try {
		console.log('[Discord API] Started refreshing application (/) commands.');
		await rest.put(
            // GUILD SLASH COMMANDS (will deploy only in the server you put the ID of)
			// Routes.applicationGuildCommands(config.botID, 'ID_OF_THE_GUILD'),

            // GLOBAL SLASH COMMANDS
			Routes.applicationCommands(process.env.BOT_ID),
			{ body: commands },
		);
		console.log('[Discord API] Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
})();