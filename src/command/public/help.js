const{EmbedBuilder,codeBlock, Colors} = require("discord.js")
module.exports = {
    name: 'help',
    description: 'Help command',
    usage: '<prefix>help', //OPTIONAL (for the help cmd)
    examples: ['/help'], //OPTIONAL (for the help cmd)
    category: "public",
    cooldown: 1, // Cooldown in seconds, by default it's 2 seconds | OPTIONAL
    permissions: [],
    aliases:["h"], // OPTIONAL  
    
    run: async (client, message,args) => {
        try {
            const query = args[0];
            const isCategory = client.commands.map((cmd) => cmd.category?.toLowerCase()).includes(query?.toLowerCase());
            if (query && !isCategory) {
             const command = client.commands.get(query.toLowerCase()) || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(query.toLowerCase()));
             if (!command) {
              const embed = new EmbedBuilder()
               .setColor(Colors.Green)
               .setTimestamp()
               .setTitle("❌ Command not found")
               .setDescription(`> The command \`${query}\` does not exist. Please check your spelling and try again.`)
               .setFooter({
                text: `Requested by ${message.author.username}`,
                iconURL: message.author?.displayAvatarURL({
                 dynamic: true,
                 format: "png",
                 size: 2048,
                }),
               });
              return message.channel.send({ embeds: [embed] });
             }
         
             const embed = new EmbedBuilder()
              .setTitle(`❔ Help for ${command.name}`)
              .addFields([
               {
                name: "Name",
                value: codeBlock(command.name),
                inline: true,
               },
               {
                name: "Usage",
                value: codeBlock(command.usage),
                inline: true,
               },
               {
                name: "Description",
                value: codeBlock(command.description),
               },
               {
                name: "Cooldown",
                value: codeBlock((command.cooldown || 0)),
                inline: true,
               },
               {
                name: "Category",
                value: codeBlock(command.category),
                inline: true,
               },
               {
                name: "Aliases",
                value: codeBlock(command.aliases?.join(", ") || "None"),
                inline: true,
               }
              ])
              .setColor(Colors.Green)
              .setTimestamp()
              .setFooter({
               text: `Requested by ${message.author.username}`,
               iconURL: message.author.displayAvatarURL({
                dynamic: true,
                format: "png",
                size: 2048,
               }),
              });
             return message.channel.send({  embeds: [embed] });
            } else if (query && isCategory) {
             const commands = client.slashCommands.filter((cmd) => cmd.category.toLowerCase() === query.toLowerCase());
             const embed = new EmbedBuilder()
              .setTitle(` Available \`${query}\` commands \`(${commands.size})\``)
              .setDescription(`> ${commands.map((cmd) => `\`/${cmd.name}\``).join(", ")}`)
              .setColor(Colors.Green)
              .setTimestamp()
              .setFooter({
               text: `Requested by ${interaction.member?.user?.username}`,
               iconURL: interaction.member.user.displayAvatarURL({
                dynamic: true,
                format: "png",
                size: 2048,
               }),
              });
             return message.channel.send({  embeds: [embed] });
            } else {
             const categories = [...new Set(client.commands.map((cmd) => cmd.category))];
            
            
         

         
             const embed = new EmbedBuilder()
              .setTitle("❔ Help")
              .setDescription(`> Use the menu, or use \`/help [category]\`to view commands based on their category!`)
              .addFields(
               categories.map((category) => ({
                name: ` ${category}`,
                value: codeBlock(`/help ${category.toLowerCase()}`),
                inline: true,
               }))
              )
              .setColor(Colors.Green)
              .setTimestamp()
              .setThumbnail(client.user?.displayAvatarURL({ dynamic: true, format: "png", size: 2048 }))
              .setAuthor({
               name: `${client.user?.username} Help`,
               iconURL: client.user?.displayAvatarURL({ dynamic: true, format: "png", size: 2048 }),
              })
              .setFooter({
               text: `Requested by ${message.author?.username}`,
               iconURL: message.author.displayAvatarURL({
                dynamic: true,
                format: "png",
                size: 2048,
               }),
              });
             return message.channel.send({  embeds: [embed] });
            }
           } catch (err) {
            console.log(err);
            return message.channel.send({ content: `> An error occurred while executing this command. Please try again later.` });
           }
    }
}