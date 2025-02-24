const { permissions } = require('../config.json');

module.exports = {
    has: function(interaction, commandName) {
        return permissions.role.some(roleId => interaction.member.roles.cache.has(roleId)) || permissions.id.includes(interaction.user.id);
    }
};
