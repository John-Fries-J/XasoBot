const { eventTeamRole, roleChannel, reactionRoleMessageId } = require('../../config.json');
const { PermissionFlagsBits, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle } = require('discord.js');
const { blue } = require('../../colors.json');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Create a basic reaction role button embed send to the roles channel.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const role = interaction.guild.roles.cache.get(eventTeamRole);
        const channel = interaction.guild.channels.cache.get(roleChannel);

        let message;
        if (reactionRoleMessageId) {
            try {
                message = await channel.messages.fetch(reactionRoleMessageId);
            } catch (error) {
                console.error("Could not fetch the reaction role message. It may have been deleted or the ID is incorrect.");
            }
        }
        if (!message) {
            const embed = new EmbedBuilder()
                .setTitle('Reaction Roles')
                .setDescription('Click on the designated button to get the role.')
                .setColor(blue);

            message = await channel.send({ embeds: [embed] });

            const config = require('../../config.json');
            config.reactionRoleMessageId = message.id;
            fs.writeFileSync('../../config.json', JSON.stringify(config, null, 2));
        }
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('eventteam')
                    .setLabel('Adriens Team')
                    .setStyle(ButtonStyle.Primary)
            );
        await message.edit({ components: [row] }).catch(error => {
            console.error("Failed to edit the message. It may have been deleted or modified:", error);
        });

        const filter = i => i.customId === 'eventteam';
        const collector = message.createMessageComponentCollector({ filter, time: 0 }); // No timeout for persistence

        collector.on('collect', async i => {
            await i.deferUpdate();
            const member = interaction.guild.members.cache.get(i.user.id);

            if (member) {
                if (member.roles.cache.has(eventTeamRole)) {
                    await member.roles.remove(eventTeamRole);
                    await i.user.send(`You have been **removed** from the role: ${role.name}`);
                } else {
                    await member.roles.add(eventTeamRole);
                    await i.user.send(`You have been **given** the role: ${role.name}`);
                }
            }
        });
    },
};
