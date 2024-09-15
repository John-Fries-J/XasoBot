const { SlashCommandBulder, EmbedBuilder, ActionRowBuilder } = require('discord.js');
const { blue } = require('../../colors.json');
const { eventTeamRole, roleChannel } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rolesEmbed')
        .setDescription('Create a basic reaction role button embed send to the roles channel.'),
    async execute(interaction) {
        const role = guild.roles.cache.get(eventTeamRole);
        const channel = guild.channels.cache.get(roleChannel);

        const embed = new EmbedBuilder()
            .setTitle('Adriens Event Team Role')
            .setDescription('If You Get This Role You Will Be Added To The Adriens Event Team')
            .setColor(blue)
        const message = await channel.send({ embeds: [embed] });

        const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('event_team_role')
                .setLabel('Adriens Team Role')
                .setStyle('Primary')
        );

        message.edit({ components: [new ActionRowBuilder().addComponents(row)] });
        const filter = i => i.customId === 'event_team_role';
        const collector = message.createMessageComponentCollector({ filter, time: 15000 });
        collector.on('collect', async i => {
            i.deferUpdate();
            const member = guild.members.cache.get(i.user.id);
            member.roles.add(eventTeamRole);
        }
        )
    },
};