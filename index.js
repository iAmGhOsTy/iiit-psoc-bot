require('dotenv').config()
const { Client, Collection,Options,GatewayIntentBits } = require("discord.js");
const config = require("./config.js");
const client = new Client({
    allowedMentions: { parse: ['users', 'roles'] },
    fetchAllMembers: false,
    intents: Object.keys(GatewayIntentBits).map((a)=>{
		return GatewayIntentBits[a]
	  }),
    sweepers: {
		...Options.DefaultSweeperSettings,
		messages: {
			interval: 3600, // Every hour...
			lifetime: 1800,	// Remove messages older than 30 minutes.
		},
		users: {
			interval: 3600, // Every hour...
			filter: () => user => user.bot && user.id !== client.user.id, // Remove all bots.
		},
    },
});

//SET COLLECTION
client.commands = new Collection();
client.slashCommands = new Collection();
client.aliases = new Collection();
// client.categories = readdirSync("./commands/");
client.cooldowns = new Collection();

//SET UTILS
client.logger = require('./src/utils/logger');
client.color = require('./src/utils/color.js');

//SET CONFIG
client.config = config;

//DataBase stuff
if (process.env.MongoURL) {
	const connect = require("./src/database/connect.js");
	connect(config);
  } else {
	console.log("No MongoURL provided, add it in the config.js file.");
	process.exit();
  }

// LOAD THE 4 HANDLERS
["error", "command", "slashCommands", "event"].forEach(file => { require(`./src/utils/handlers/${file}`)(client) })

client.login(process.env.TOKEN); 