const { Collection, PermissionsBitField  } = require("discord.js");
const StickyMessage = require('../database/schemas/stickyMessage');

module.exports = async (client, message) => {
    if (message.author.bot) return;

    const prefix = client.config.prefix;

    if (message.content.match(new RegExp(`^<@!?${client.user.id}>( |)$`))) {
        return message.channel.send(`Hi, I'm ${client.user.username}! In this server, my prefix is \`${prefix}\``);
    }

    if (!message.content.startsWith(prefix)) {

        // Handle sticky message logic
        const stickyMessages = await StickyMessage.find({ channelId: message.channel.id });

        if (stickyMessages.length > 0) {
            const sticky = stickyMessages[0];

            try {
                const channel = await client.channels.fetch(sticky.channelId);
                
               
                const oldMessage = await channel.messages.fetch(sticky.lastStickyMessageId);
                setTimeout(async () => {
                    await oldMessage.delete();
                }, 1000); 

               
                setTimeout(async () => {
                    const newMessage = await channel.send(sticky.content);
                    await StickyMessage.updateOne({ _id: sticky._id }, { lastStickyMessageId: newMessage.id });
                }, 2000); 
            } catch (error) {
                console.error(`Failed to re-post sticky message: ${error}`);
            }
        }
        return;
    }

    const command = message.content.split(' ')[0].slice(prefix.length).toLowerCase();
    const args = message.content.split(' ').slice(1);
    let cmd;
    
    if (client.commands.has(command)) {
        cmd = client.commands.get(command);
    } else if (client.aliases.has(command)) {
        cmd = client.commands.get(client.aliases.get(command));
    }
    if (!cmd) return;


    const props = require(`../command/${cmd.category}/${cmd.name}`);

    // Cooldowns and errors
    if (!client.cooldowns.has(props.name)) {
        client.cooldowns.set(props.name, new Collection());
    }
    const now = Date.now();
    const timestamps = client.cooldowns.get(props.name);
    const cooldownAmount = (props.cooldown || 2) * 1000;

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`Wait ${timeLeft.toFixed(1)} more second${timeLeft.toFixed(1) < 2 ? '' : 's'} to use **${props.name}**`);
        }
    }
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    // Permission checker
    if (props.permissions) {
        const combinedPermissions = new PermissionsBitField(props.permissions.reduce((acc, perm) => acc | perm, 0n));
        
        if (!message.member.permissions.has(combinedPermissions)) {
            const missingPermissions = combinedPermissions.toArray().filter(permission => !message.member.permissions.has(permission)).map(permission => permission);
            return message.reply(`You're missing permissions: ${missingPermissions.map(p => `**${p}**`).join(', ')}`);
        }
    }

    if (props.args && !args.length) {
        return message.channel.send(`You didn't provide any arguments.`);
      }

    //muscic logic 
    if (props.inVc && !memberChannel) {
        return message.channel.send(
          'You must be in a Voice Channel to use this Command!',
        );
      }
    

    // Loading commands
    try {
        await cmd.run(client, message, args); 
    
    } catch (err) {
        console.error("Error executing command:", err);
        client.emit("error", err, message);
    }
};
