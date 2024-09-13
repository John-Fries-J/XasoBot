const { memberID, welcomeChannel } = require('../config.json');

module.exports = {
    name: 'guildMemberAdd',
    once: false,
    execute(member) {
        const guild = member.guild;
        const role = guild.roles.cache.get(memberID);
        const channel = guild.channels.cache.get(welcomeChannel);
        if (!role) {
            console.log('Role not found');
            return;
        }
        member.roles.add(role)
        channel.send(`WELCOME ${member} to **${guild.name}**! You are the ${guild.memberCount}th member!`);
    },
};