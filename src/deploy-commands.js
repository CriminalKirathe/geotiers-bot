const { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
require('dotenv').config();

const commands = [
    new SlashCommandBuilder()
        .setName('result')
        .setDescription('Submit a testing result')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addUserOption(option =>
            option.setName('user-tested')
                .setDescription('The user who was tested')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('tier-before')
                .setDescription('The tier the player had before')
                .setRequired(true)
                .addChoices(
                    { name: 'LT3', value: 'lt3' },
                    { name: 'HT4', value: 'ht4' },
                    { name: 'LT4', value: 'lt4' },
                    { name: 'HT5', value: 'ht5' },
                    { name: 'LT5', value: 'lt5' },
                    { name: 'No Tier / Other', value: 'none' }
                ))
        .addStringOption(option =>
            option.setName('tier-earned')
                .setDescription('The tier the player earned')
                .setRequired(true)
                .addChoices(
                    { name: 'LT3', value: 'lt3' },
                    { name: 'HT4', value: 'ht4' },
                    { name: 'LT4', value: 'lt4' },
                    { name: 'HT5', value: 'ht5' },
                    { name: 'LT5', value: 'lt5' }
                ))
        .addStringOption(option =>
            option.setName('gamemode')
                .setDescription('The gamemode used for testing')
                .setRequired(true)
                .setAutocomplete(true))
        .addStringOption(option =>
            option.setName('ign')
                .setDescription('Minecraft IGN of the player')
                .setRequired(true)),

    // Mute (Timeout) Command
    new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Timeout a user (mute)')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option => option.setName('target').setDescription('The user to mute').setRequired(true))
        .addIntegerOption(option => option.setName('duration').setDescription('Duration in minutes').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Reason for the mute')),

    // Server Info Command
    new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Display server information'),

    // Member Count Command
    new SlashCommandBuilder()
        .setName('membercount')
        .setDescription('Show member count statistics'),

    // Ticket Setup Command
    new SlashCommandBuilder()
        .setName('ticket-setup')
        .setDescription('Setup ticket system panel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option => option.setName('channel').setDescription('Channel to send the ticket panel').setRequired(true)),

    // Close Ticket Command
    new SlashCommandBuilder()
        .setName('close')
        .setDescription('Close the current ticket'),

    // Add User to Ticket
    new SlashCommandBuilder()
        .setName('add')
        .setDescription('Add a user to the ticket')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addUserOption(option => option.setName('user').setDescription('User to add').setRequired(true)),

    // Tester Leaderboard
    new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Show tester statistics leaderboard'),

    // Reset Stats (Admin only)
    new SlashCommandBuilder()
        .setName('reset-stats')
        .setDescription('Reset tester statistics for the new month')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    // Giveaway Start
    new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('Start a giveaway')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    // Giveaway End (Manual)
    new SlashCommandBuilder()
        .setName('gend')
        .setDescription('End a giveaway early')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => option.setName('message_id').setDescription('Giveaway message ID').setRequired(true))
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
