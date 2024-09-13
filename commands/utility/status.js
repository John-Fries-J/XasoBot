const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { green } = require('../../colors.json');
const { mcserver } = require('../../config.json');
const { statusBedrock, statusJava } = require('node-mcstatus');

const formatMotd = (motd) => {
    if (typeof motd === 'object') {
        return motd.clean || motd.text || JSON.stringify(motd);
    }
    return motd;
};

const getServerDataAndPlayerList = async () => {
    try {
        let data;
        if (mcserver.type === 'java') {
            data = await statusJava(mcserver.ip, mcserver.port);
        } else {
            data = await statusBedrock(mcserver.ip, mcserver.port);
        }
        const isOnline = data.online;
        const playerListArray = isOnline && data.players.sample ? data.players.sample.map(player => player.name) : [];
        return { data, playerListArray, isOnline };
    } catch (error) {
        console.error('Error fetching server data:', error);
        return { data: null, playerListArray: [], isOnline: false };
    }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Replies with Minecraft Servers Status'),
    async execute(interaction) {
        const { data, playerListArray, isOnline } = await getServerDataAndPlayerList();

        let description;
        if (isOnline) {
            description = `**Description**\n${formatMotd(data.motd)}\n\n**Players**\nOnline: ${data.players.online}\nMax: ${data.players.max}\n\n**Version**\n${mcserver.version}`;
            if (playerListArray.length > 0) {
                description += `\n\n**Players**\n${playerListArray.join(', ')}`;
            }
        } else {
            description = 'Server is offline.';
        }
        const statusEmbed = new EmbedBuilder()
            .setTitle('Minecraft Server: johnfries.net')
            .setThumbnail('https://cdn.discordapp.com/icons/1271431711389122663/2c50b85387919da5d541e51699d16d32.webp?size=96')
            .setDescription(description)
            .setColor(green)
            .setFooter({ text: 'Bot made by John Fries' });

        await interaction.reply({ embeds: [statusEmbed], ephemeral: false });
    },
};