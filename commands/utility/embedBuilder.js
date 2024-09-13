const { PermissionFlagsBits, SlashCommandBuilder, ChannelSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } = require('discord.js');
const { blue } = require('../../colors.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embedbuilder')
        .setDescription('Create an embed')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction) {
        const channelSelectMenu = new ChannelSelectMenuBuilder()
            .setCustomId('channel_select')
            .setPlaceholder('Select a channel')
            .setChannelTypes([0])

        const selectMenuRow = new ActionRowBuilder()
            .addComponents(channelSelectMenu);
        
        await interaction.reply({
            content: 'Please select a channel to send the embed to:',
            components: [selectMenuRow],
            ephemeral: true 
        });

        const filter = i => i.customId === 'channel_select' && i.user.id === interaction.user.id;
        const selectCollector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 60000 });

        selectCollector.on('collect', async i => {
            const selectedChannel = i.values[0];

            let embed = new EmbedBuilder()
                .setColor(blue)
                .setTitle('Custom Embed')
                .setDescription('Click the button below to edit this embed.');

            const editButton = new ButtonBuilder()
                .setCustomId('edit_embed')
                .setLabel('Edit Embed')
                .setStyle(ButtonStyle.Primary);

            const deleteButton = new ButtonBuilder()
                .setCustomId('delete_embed')
                .setLabel('Delete')
                .setStyle(ButtonStyle.Danger);

            const sendButton = new ButtonBuilder()
                .setCustomId('send_embed')
                .setLabel('Send Embed')
                .setStyle(ButtonStyle.Success);

            const buttonRow = new ActionRowBuilder()
                .addComponents(editButton, deleteButton, sendButton);

            await i.update({
                content: 'Embed creation started!',
                embeds: [embed],
                components: [buttonRow],
                ephemeral: true
            });

            const buttonCollector = i.message.createMessageComponentCollector({ time: 60000 });

            buttonCollector.on('collect', async btnInteraction => {
                if (btnInteraction.customId === 'edit_embed') {
                    const modal = new ModalBuilder()
                        .setCustomId('embed_modal')
                        .setTitle('Edit Embed');

                    const titleInput = new TextInputBuilder()
                        .setCustomId('embed_title')
                        .setLabel('Embed Title')
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder('Enter the title');

                    const descriptionInput = new TextInputBuilder()
                        .setCustomId('embed_description')
                        .setLabel('Embed Description')
                        .setStyle(TextInputStyle.Paragraph)
                        .setPlaceholder('Enter the description');

                    const modalRow1 = new ActionRowBuilder().addComponents(titleInput);
                    const modalRow2 = new ActionRowBuilder().addComponents(descriptionInput);

                    modal.addComponents(modalRow1, modalRow2);

                    await btnInteraction.showModal(modal);

                    try {
                        const submitted = await btnInteraction.awaitModalSubmit({
                            time: 60000,
                            filter: modalSubmit => modalSubmit.customId === 'embed_modal' && modalSubmit.user.id === btnInteraction.user.id,
                        });

                        const newTitle = submitted.fields.getTextInputValue('embed_title');
                        const newDescription = submitted.fields.getTextInputValue('embed_description');

                        embed = new EmbedBuilder()
                            .setColor(blue)
                            .setTitle(newTitle)
                            .setDescription(newDescription);

                        await submitted.update({
                            content: 'Embed updated!',
                            embeds: [embed],
                            components: [buttonRow],
                            ephemeral: true
                        });

                    } catch (error) {
                        console.error('Modal submission error:', error);
                        await btnInteraction.followUp({
                            content: 'Failed to submit modal or modal timed out.',
                            ephemeral: true
                        });
                    }
                }

                if (btnInteraction.customId === 'delete_embed') {
                    await btnInteraction.update({
                        content: 'Embed deleted.',
                        embeds: [],
                        components: [],
                        ephemeral: true
                    });
                    buttonCollector.stop();
                }

                if (btnInteraction.customId === 'send_embed') {
                    const channel = btnInteraction.guild.channels.cache.get(selectedChannel);

                    if (!channel) {
                        await btnInteraction.reply({
                            content: 'Failed to find the selected channel.',
                            ephemeral: true
                        });
                    } else {
                        await channel.send({ embeds: [embed] });
                        await btnInteraction.update({
                            content: 'Embed sent!',
                            components: [],
                            ephemeral: true
                        });
                        buttonCollector.stop();
                    }
                }
            });

            buttonCollector.on('end', collected => {
                if (collected.size === 0) {
                    interaction.editReply({
                        content: 'No response, embed creation timed out.',
                        components: [],
                        ephemeral: true
                    });
                }
            });
        });
    }
};
