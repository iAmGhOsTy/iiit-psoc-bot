const { readdirSync } = require("fs");
const create_mh = require("../../utils/menu")
const path = require("node:path");
const { CommandInteraction, Client, EmbedBuilder,ApplicationCommandOptionType } = require("discord.js");
module.exports = {
  name: "help",
  description: "Return all commands, or one specific command",
  owner: false,
  options: [
    {
      name: "command",
      description: "the full name of command",
      required: false,
      type:ApplicationCommandOptionType.String,
    },
  ],

  /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */

  run: async (client, interaction) => {
    await interaction.deferReply({
      ephemeral: false,
    });
    const args = interaction.options.getString("command");
    let color ="#0099ff";
    let categories = [];
    let cots = [];

    if (!args) {
      //categories to ignore
      let ignored = ["owner"];

      const emo = {
        Config: "<:staff:900459948398493747> ",
        Information: "<a:loading2:920544921352564746>",
        Public: "<a:dancemusic:920546770994487317>",
        Owner: "<a:a_crown:920548323377676298>",
      };

      let ccate = [];
      const slashCommandsPath = path.join(__dirname, "../../slashCommands");
      readdirSync(slashCommandsPath).forEach((dir) => {
        if (ignored.includes(dir.toLowerCase())) return;

        const name = `${emo[dir]} - ${dir}`;

        let nome = dir.toUpperCase();

        let cats = new Object();

        //this is how it will be created as
        cats = {
          name: name,
          value: `\`/help ${dir.toLowerCase()}\``,
          inline: true,
        };

        categories.push(cats);
        ccate.push(nome);
      });
      //embed
      const embed = new EmbedBuilder()
        .setTitle(`Bot Commands`)
        .setDescription(
          `>>> My prefix is \`/\`\nUse the menu, or use \`/help [category]\` to view commands base on their category!`
        )
        .addFields(categories)
        .setFooter({
          text: `Requested by ${interaction.member.user.username}`,
          iconURL: interaction.member.user.displayAvatarURL({
            dynamic: true,
          }),
        })
        .setTimestamp()
        .setColor(color);
      let menus = create_mh(ccate);
      return interaction
        .editReply({
          embeds: [embed],
          components: menus.smenu,
        })
        .then((msgg) => {
          const menuID = menus.sid;

          const select = async (interaction) => {
            if (interaction.customId != menuID) return;

            let { values } = interaction;

            let value = values[0];

            let catts = [];

            readdirSync("./slashCommands/").forEach((dir) => {
              if (dir.toLowerCase() !== value.toLowerCase()) return;
              const commands = readdirSync(`./slashCommands/${dir}/`).filter(
                (file) => file.endsWith(".js")
              );

              const cmds = commands.map((command) => {
                let file = require(`../../slashCommands/${dir}/${command}`); //getting the commands again

                if (!file.name) return "No command name.";

                let name = file.name.replace(".js", "");

                if (client.slashCommands.get(name).hidden) return;

                let des = client.slashCommands.get(name).description;
                let emo = client.slashCommands.get(name).emoji;
                let emoe = emo ? `${emo} - ` : ``;

                let obj = {
                  cname: `${emoe}\`${name}\``,
                  des,
                };

                return obj;
              });

              let dota = new Object();

              cmds.map((co) => {
                if (co == undefined) return;

                dota = {
                  name: `${cmds.length === 0 ? "In progress." : co.cname}`,
                  value: co.des ? co.des : `No Description`,
                  inline: true,
                };
                catts.push(dota);
              });

              cots.push(dir.toLowerCase());
            });

            if (cots.includes(value.toLowerCase())) {
              const combed = new EmbedBuilder()
                .setTitle(
                  `__${
                    value.charAt(0).toUpperCase() + value.slice(1)
                  } Commands!__`
                )
                .setDescription(
                  `Use \`/help\` followed by a command name to get more information on a command.\nFor example: \`/help ping\`.\n\n`
                )
                .addFields(catts)
                .setColor(color);

              await interaction.deferUpdate();

              return interaction.message.edit({
                embeds: [combed],
                components: menus.smenu,
              });
            }
          };

          const filter = (interaction) => {
            return (
              !interaction.user.bot &&
              interaction.userId == interaction.authorId
            );
          };

          const collector = msgg.createMessageComponentCollector({
            filter,
          });
          collector.on("collect", select);
          collector.on("end", () => null);
        });
    } else {
      let catts = [];

      readdirSync("./slashCommands/").forEach((dir) => {
        if (dir.toLowerCase() !== args.toLowerCase()) return;
        const commands = readdirSync(`./slashCommands/${dir}/`).filter((file) =>
          file.endsWith(".js")
        );

        const cmds = commands.map((command) => {
          let file = require(`../../slashCommands/${dir}/${command}`);

          if (!file.name) return "No command name.";

          let name = file.name.replace(".js", "");

          if (client.slashCommands.get(name).hidden) return;

          let des = client.slashCommands.get(name).description;
          let emo = client.slashCommands.get(name).emoji;
          let emoe = emo ? `${emo} - ` : ``;

          let obj = {
            cname: `${emoe}\`${name}\``,
            des,
          };

          return obj;
        });

        let dota = new Object();

        cmds.map((co) => {
          if (co == undefined) return;

          dota = {
            name: `${cmds.length === 0 ? "In progress." : `/` + co.cname}`,
            value: co.des ? co.des : `No Description`,
            inline: true,
          };
          catts.push(dota);
        });

        cots.push(dir.toLowerCase());
      });

      const command = client.slashCommands.get(args.toLowerCase());

      if (cots.includes(args.toLowerCase())) {
        const combed = new EmbedBuilder()
          .setTitle(
            `__${args.charAt(0).toUpperCase() + args.slice(1)} Commands!__`
          )
          .setDescription(
            `Use \`/help\` followed by a command name to get more information on a command.\nFor example: \`/help ping\`.\n\n`
          )
          .addFields(catts)
          .setColor(color);

        return await interaction.editReply({
          embeds: [combed],
        });
      }

      if (!command) {
        const embed = new EmbedBuilder()
          .setTitle(`Invalid command! Use \`/help\` for all of my commands!`)
          .setColor("RED");
        return await interaction.editReply({
          embeds: [embed],
          allowedMentions: {
            repliedUser: false,
          },
        });
      }

      const embed = new EmbedBuilder()
        .setTitle("Command Details:")
        .addFields(
          {
            name: "Command:",
            value: command.name
              ? `\`${command.name}\``
              : "No name for this command.",
          },
          // .addField(
          //     "Aliases:",
          //     command.aliases ?
          //     `\`${command.aliases.join("` `")}\`` :
          //     "No aliases for this command."
          // )
          {
            name: "Usage:",
            value: command.usage
              ? `\`/${command.name} ${command.usage}\``
              : `\`/${command.name}\``,
          },

          {
            name: "Command Description:",
            value: command.description
              ? command.description
              : "No description for this command.",
          }
        )
        .setFooter({
          text: `Requested by ${interaction.member.user.username}`,
          iconURL: interaction.member.user.displayAvatarURL({
            dynamic: true,
          }),
        })
        .setTimestamp()
        .setColor(color);
      return await interaction.editReply({
        embeds: [embed],
      });
    }
  },
};