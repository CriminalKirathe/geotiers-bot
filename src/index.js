const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActivityType } = require('discord.js');
const fs = require('fs');
require('dotenv').config();
const config = require('./config.json');
const { createClient } = require('@supabase/supabase-js');

// Supabase Initialization
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
    ],
});

client.once('clientReady', (readyClient) => {
    console.log(`Logged in as ${readyClient.user.tag}!`);

    // Set bot status
    readyClient.user.setPresence({
        activities: [{
            name: 'play.geotiers.xyz',
            type: ActivityType.Playing
        }],
        status: 'online'
    });

    console.log('✅ Bot status set: Playing on play.geotiers.xyz');
});

client.on('interactionCreate', async (interaction) => {
    // Autocomplete Handling
    if (interaction.isAutocomplete()) {
        if (interaction.commandName === 'result') {
            const focusedOption = interaction.options.getFocused(true);
            if (focusedOption.name === 'gamemode') {
                const member = interaction.member;
                const isAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator);
                const gamemodes = ['vanilla', 'uhc', 'pot', 'nethpot', 'smp', 'sword', 'axe', 'mace'];

                let filteredChoices = [];

                for (const gm of gamemodes) {
                    const allowedRoles = config.gamemodeRoles ? config.gamemodeRoles[gm] : [];
                    const hasRole = isAdmin || (allowedRoles && allowedRoles.length > 0 && allowedRoles.some(roleId => member.roles.cache.has(roleId)));

                    if (hasRole) {
                        filteredChoices.push({ name: gm.toUpperCase(), value: gm });
                    }
                }

                await interaction.respond(filteredChoices).catch(console.error);
            }
        }
        return;
    }

    // Button Interaction Handling
    if (interaction.isButton()) {
        if (interaction.customId === 'create_ticket') {
            const guild = interaction.guild;
            const member = interaction.member;

            // Check if user already has an open ticket
            const existingTicket = guild.channels.cache.find(
                ch => ch.name === `ticket-${member.user.username.toLowerCase()}` && ch.type === ChannelType.GuildText
            );

            if (existingTicket) {
                return interaction.reply({ content: 'თქვენ უკვე გაქვთ ღია ტიკეტი!', flags: [MessageFlags.Ephemeral] });
            }

            // Show modal form
            const modal = new ModalBuilder()
                .setCustomId('ticket_modal')
                .setTitle('📝 ტიკეტის შექმნა');

            const reasonInput = new TextInputBuilder()
                .setCustomId('ticket_reason')
                .setLabel('რა არის თქვენი პრობლემა?')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('გთხოვთ დეტალურად აღწეროთ თქვენი პრობლემა...')
                .setRequired(true)
                .setMinLength(10)
                .setMaxLength(1000);

            const firstActionRow = new ActionRowBuilder().addComponents(reasonInput);
            modal.addComponents(firstActionRow);

            await interaction.showModal(modal);
        }

        if (interaction.customId === 'close_ticket') {
            const channel = interaction.channel;

            if (!channel.name.startsWith('ticket-')) {
                return interaction.reply({ content: 'ეს არ არის ტიკეტის არხი!', flags: [MessageFlags.Ephemeral] });
            }

            // Show modal for close reason
            const modal = new ModalBuilder()
                .setCustomId('close_ticket_modal')
                .setTitle('🔒 ტიკეტის დახურვა');

            const reasonInput = new TextInputBuilder()
                .setCustomId('close_reason')
                .setLabel('დახურვის მიზეზი')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('მიუთითეთ რატომ იხურება ტიკეტი...')
                .setRequired(true)
                .setMinLength(5)
                .setMaxLength(500);

            const firstActionRow = new ActionRowBuilder().addComponents(reasonInput);
            modal.addComponents(firstActionRow);

            await interaction.showModal(modal);
        }

        // Giveaway Entry Button
        if (interaction.customId.startsWith('giveaway_enter_')) {
            try {
                let giveaways = {};
                try {
                    const data = fs.readFileSync('./src/giveaways.json', 'utf8');
                    giveaways = JSON.parse(data);
                } catch (e) {
                    return interaction.reply({ content: 'გათამაშება ვერ მოიძებნა!', flags: [MessageFlags.Ephemeral] });
                }

                const giveaway = giveaways[interaction.message.id];
                if (!giveaway) {
                    return interaction.reply({ content: 'გათამაშება ვერ მოიძებნა!', flags: [MessageFlags.Ephemeral] });
                }

                const userId = interaction.user.id;

                if (!giveaway.participants) giveaway.participants = [];

                if (giveaway.participants.includes(userId)) {
                    // Remove from giveaway
                    giveaway.participants = giveaway.participants.filter(id => id !== userId);
                    await interaction.reply({ content: '❌ თქვენ გამოხვედით გათამაშებიდან!', flags: [MessageFlags.Ephemeral] });
                } else {
                    // Add to giveaway
                    giveaway.participants.push(userId);
                    await interaction.reply({ content: '✅ თქვენ ჩაერთეთ გათამაშებაში!', flags: [MessageFlags.Ephemeral] });
                }

                // Update button label
                const updatedButton = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(interaction.customId)
                            .setLabel(giveaway.participants.length.toString())
                            .setStyle(ButtonStyle.Success)
                            .setEmoji('🎉')
                    );

                await interaction.message.edit({ components: [updatedButton] });

                // Save updated data
                fs.writeFileSync('./src/giveaways.json', JSON.stringify(giveaways, null, 2));

            } catch (error) {
                console.error('Error handling giveaway entry:', error);
                await interaction.reply({ content: 'შეცდომა მოხდა!', flags: [MessageFlags.Ephemeral] }).catch(() => { });
            }
        }

        return;
    }

    // Modal Submit Handling
    if (interaction.isModalSubmit()) {
        if (interaction.customId === 'ticket_modal') {
            const guild = interaction.guild;
            const member = interaction.member;
            const reason = interaction.fields.getTextInputValue('ticket_reason');

            await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

            try {
                const ticketChannel = await guild.channels.create({
                    name: `ticket-${member.user.username}`,
                    type: ChannelType.GuildText,
                    parent: config.ticketSystem?.categoryId || null,
                    permissionOverwrites: [
                        {
                            id: guild.id,
                            deny: [PermissionFlagsBits.ViewChannel],
                        },
                        {
                            id: member.id,
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                        },
                        {
                            id: client.user.id,
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                        },
                    ],
                });

                // Add support role if configured
                if (config.ticketSystem?.supportRoleId) {
                    await ticketChannel.permissionOverwrites.create(config.ticketSystem.supportRoleId, {
                        ViewChannel: true,
                        SendMessages: true,
                        ReadMessageHistory: true,
                    });
                }

                // Welcome Embed
                const welcomeEmbed = new EmbedBuilder()
                    .setColor(0x5865F2)
                    .setTitle('🎫 ახალი ტიკეტი')
                    .setDescription(`გამარჯობა ${member}!\n\nპერსონალი მალე დაგიკავშირდებათ და დაგეხმარებათ თქვენს პრობლემაში.`)
                    .setFooter({ text: 'ტიკეტის დასახურად გამოიყენეთ /close ან დააჭირეთ ღილაკს' })
                    .setTimestamp();

                // Problem Embed
                const problemEmbed = new EmbedBuilder()
                    .setColor(0xED4245)
                    .setTitle('📋 პრობლემის აღწერა')
                    .setDescription(reason)
                    .setFooter({ text: `შექმნილია ${member.user.tag} მიერ`, iconURL: member.user.displayAvatarURL() })
                    .setTimestamp();

                const closeButton = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('close_ticket')
                            .setLabel('დახურვა')
                            .setStyle(ButtonStyle.Danger)
                            .setEmoji('🔒')
                    );

                await ticketChannel.send({
                    content: `${member} ${config.ticketSystem?.supportRoleId ? `<@&${config.ticketSystem.supportRoleId}>` : ''}`,
                    embeds: [welcomeEmbed, problemEmbed],
                    components: [closeButton]
                });

                await interaction.editReply({ content: `✅ ტიკეტი შეიქმნა: ${ticketChannel}` });
            } catch (error) {
                console.error('Error creating ticket:', error);
                await interaction.editReply({ content: 'ტიკეტის შექმნისას მოხდა შეცდომა.' });
            }
        }

        if (interaction.customId === 'close_ticket_modal') {
            const channel = interaction.channel;
            const closeReason = interaction.fields.getTextInputValue('close_reason');
            const closedBy = interaction.user;

            await interaction.reply({ content: '🔒 ტიკეტი იხურება და ტრანსკრიპტი იქმნება...' });

            try {
                // Fetch messages for transcript
                const messages = await channel.messages.fetch({ limit: 100 });
                const sortedMessages = [...messages.values()].reverse();

                // Create transcript text
                let transcript = `═══════════════════════════════════════\n`;
                transcript += `📋 TICKET TRANSCRIPT\n`;
                transcript += `═══════════════════════════════════════\n`;
                transcript += `🎫 Ticket: ${channel.name}\n`;
                transcript += `👤 Closed by: ${closedBy.tag}\n`;
                transcript += `📝 Close Reason: ${closeReason}\n`;
                transcript += `⏰ Closed at: ${new Date().toLocaleString('ka-GE')}\n`;
                transcript += `═══════════════════════════════════════\n\n`;

                sortedMessages.forEach(msg => {
                    const timestamp = msg.createdAt.toLocaleString('ka-GE');
                    transcript += `[${timestamp}] ${msg.author.tag}:\n`;
                    if (msg.content) transcript += `${msg.content}\n`;
                    if (msg.embeds.length > 0) {
                        msg.embeds.forEach(embed => {
                            if (embed.title) transcript += `[Embed: ${embed.title}]\n`;
                            if (embed.description) transcript += `${embed.description}\n`;
                        });
                    }
                    transcript += `\n`;
                });

                // Send transcript to log channel
                if (config.ticketSystem?.transcriptChannelId) {
                    const transcriptChannel = channel.guild.channels.cache.get(config.ticketSystem.transcriptChannelId);

                    if (transcriptChannel) {
                        const transcriptEmbed = new EmbedBuilder()
                            .setColor(0xED4245)
                            .setTitle('🔒 ტიკეტი დაიხურა')
                            .addFields(
                                { name: '🎫 ტიკეტი', value: channel.name, inline: true },
                                { name: '👤 დახურა', value: closedBy.toString(), inline: true },
                                { name: '📝 მიზეზი', value: closeReason, inline: false }
                            )
                            .setTimestamp();

                        // Create transcript file
                        const buffer = Buffer.from(transcript, 'utf-8');

                        await transcriptChannel.send({
                            embeds: [transcriptEmbed],
                            files: [{
                                attachment: buffer,
                                name: `transcript-${channel.name}-${Date.now()}.txt`
                            }]
                        });
                    }
                }

                setTimeout(async () => {
                    await channel.delete();
                }, 3000);
            } catch (error) {
                console.error('Error closing ticket:', error);
                await interaction.followUp({ content: 'ტიკეტის დახურვისას მოხდა შეცდომა.', flags: [MessageFlags.Ephemeral] });
            }
        }

        if (interaction.customId === 'giveaway_modal') {
            const prize = interaction.fields.getTextInputValue('giveaway_prize');
            const winnersStr = interaction.fields.getTextInputValue('giveaway_winners');
            const durationStr = interaction.fields.getTextInputValue('giveaway_duration');

            const winners = parseInt(winnersStr);
            const duration = parseInt(durationStr);

            if (isNaN(winners) || winners < 1 || winners > 20) {
                return interaction.reply({ content: 'გამარჯვებულების რაოდენობა უნდა იყოს 1-დან 20-მდე!', flags: [MessageFlags.Ephemeral] });
            }

            if (isNaN(duration) || duration < 1) {
                return interaction.reply({ content: 'ხანგრძლივობა უნდა იყოს მინიმუმ 1 წუთი!', flags: [MessageFlags.Ephemeral] });
            }

            await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

            const channel = interaction.channel;
            const endTime = Date.now() + (duration * 60 * 1000);
            const endDate = new Date(endTime);

            try {
                const giveawayEmbed = new EmbedBuilder()
                    .setColor(0x5865F2)
                    .setTitle(prize)
                    .setDescription(`Click 🎉 to enter!\n**__Duration:__** ${duration}m (Ends <t:${Math.floor(endTime / 1000)}:R>)\n**Hosted by:** ${interaction.user}`)
                    .setFooter({ text: `${winners} winner${winners > 1 ? 's' : ''} • Ends ${endDate.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}` });

                const enterButton = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`giveaway_enter_${Date.now()}`)
                            .setLabel('0')
                            .setStyle(ButtonStyle.Success)
                            .setEmoji('🎉')
                    );

                const giveawayMessage = await channel.send({
                    content: '🎁 **GIVEAWAY** 🎁',
                    embeds: [giveawayEmbed],
                    components: [enterButton]
                });

                // Save giveaway data
                let giveaways = {};
                try {
                    const data = fs.readFileSync('./src/giveaways.json', 'utf8');
                    giveaways = JSON.parse(data);
                } catch (e) { giveaways = {}; }

                giveaways[giveawayMessage.id] = {
                    prize,
                    winners,
                    endTime,
                    channelId: channel.id,
                    hostId: interaction.user.id,
                    participants: []
                };

                fs.writeFileSync('./src/giveaways.json', JSON.stringify(giveaways, null, 2));

                await interaction.editReply({ content: `✅ გათამაშება დაიწყო!` });

                // Set timeout to end giveaway
                setTimeout(async () => {
                    await endGiveaway(giveawayMessage.id, client);
                }, duration * 60 * 1000);

            } catch (error) {
                console.error('Error starting giveaway:', error);
                await interaction.editReply({ content: 'გათამაშების დაწყებისას მოხდა შეცდომა.' });
            }
        }

        return;
    }

    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'result') {
        // Permission Check: Check if the user has ANY tester role or is admin
        const member = interaction.member;
        const isAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator);

        // Collect all possible tester roles from config
        const allTesterRoles = [...config.testerRoleIds];
        if (config.gamemodeRoles) {
            Object.values(config.gamemodeRoles).forEach(roleArray => {
                allTesterRoles.push(...roleArray);
            });
        }

        const hasAnyTesterRole = allTesterRoles.some(roleId => member.roles.cache.has(roleId)) || isAdmin;

        if (!hasAnyTesterRole) {
            return interaction.reply({ content: 'თქვენ არ გაქვთ ამ ქომანდის გამოყენების უფლება.', flags: [MessageFlags.Ephemeral] });
        }

        const gamemode = interaction.options.getString('gamemode');

        // Gamemode Restriction Check
        const allowedRolesForGamemode = config.gamemodeRoles ? config.gamemodeRoles[gamemode] : [];
        const hasGamemodePermission = isAdmin ||
            (allowedRolesForGamemode && allowedRolesForGamemode.length > 0 && allowedRolesForGamemode.some(roleId => member.roles.cache.has(roleId)));

        if (!hasGamemodePermission) {
            return interaction.reply({
                content: `თქვენ არ გაქვთ უფლება გამოიყენოთ ${gamemode.toUpperCase()} გეიმმოუდი. თქვენ მხოლოდ იმ გეიმმოუდების გამოყენება შეგიძლიათ, რომელზეც გაქვთ შესაბამისი როლი (მაგ. Vanilla Tester).`,
                flags: [MessageFlags.Ephemeral]
            });
        }

        const userTested = interaction.options.getUser('user-tested');
        const tierBefore = interaction.options.getString('tier-before');
        const tierEarned = interaction.options.getString('tier-earned');
        const ign = interaction.options.getString('ign');
        const tester = interaction.user;

        // Defer reply to prevent timeout (Supabase calls might take > 3s)
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        const targetMember = await interaction.guild.members.fetch(userTested.id).catch(() => null);

        if (!targetMember) {
            return interaction.editReply({ content: 'მომხმარებელი ვერ მოიძებნა ამ სერვერზე.' });
        }

        // 1. Role Management Logic
        try {
            const gamemodeTierRoles = config.tierRoles[gamemode];

            if (gamemodeTierRoles) {
                // Remove old tier role
                if (tierBefore !== 'none' && gamemodeTierRoles[tierBefore]) {
                    const oldRoleId = gamemodeTierRoles[tierBefore];
                    if (oldRoleId && !oldRoleId.includes('ROLE_ID')) {
                        const oldRole = interaction.guild.roles.cache.get(oldRoleId);
                        if (oldRole && targetMember.roles.cache.has(oldRoleId)) {
                            await targetMember.roles.remove(oldRole).catch(e => console.error(`❌ [ERROR] Role removal failed:`, e.message));
                        }
                    }
                }

                // Add new tier role
                const newRoleId = gamemodeTierRoles[tierEarned];
                if (newRoleId && !newRoleId.includes('ROLE_ID')) {
                    const newRole = interaction.guild.roles.cache.get(newRoleId);
                    if (newRole) {
                        await targetMember.roles.add(newRole).catch(e => {
                            console.error(`❌ [ERROR] Role assignment failed:`, e.message);
                        });
                    }
                }
            }
        } catch (error) {
            console.error('❌ [CRITICAL ERROR] Role management error:', error);
        }

        // 2. Upload to Supabase (Following complete-supabase-setup.sql)
        let dbStatus = "✅ აიტვირთა";
        try {
            // Upsert player first to get ID
            const { data: playerData, error: playerError } = await supabase
                .from('players')
                .upsert({ username: ign }, { onConflict: 'username' })
                .select('id')
                .single();

            if (playerError) throw playerError;

            // Upsert tier (this triggers automatic point calculation in DB)
            const { error: tierError } = await supabase
                .from('player_tiers')
                .upsert({
                    player_id: playerData.id,
                    game_mode: gamemode.toLowerCase(),
                    tier: tierEarned.toUpperCase()
                }, { onConflict: 'player_id, game_mode' });

            if (tierError) throw tierError;

            console.log(`✅ Supabase update successful for ${ign}`);
        } catch (supabaseError) {
            console.error('❌ [SUPABASE ERROR]:', supabaseError);
            dbStatus = "❌ შეცდომა ბაზაში";
        }

        // 3. Post to Result Channel
        const specificChannelId = config.gamemodeChannels ? config.gamemodeChannels[gamemode] : config.resultChannelId;
        const resultChannel = await interaction.guild.channels.fetch(specificChannelId).catch(() => null);

        if (resultChannel) {
            const resultText = `IGN : ${ign}\nGamemode: ${gamemode.toUpperCase()}\nTier-Before: ${tierBefore === 'none' ? 'N/A' : tierBefore.toUpperCase()}\nTier-Earned: ${tierEarned.toUpperCase()}`;

            const mcAvatarUrl = `https://mc-heads.net/avatar/${ign}/128`;
            const resultEmbed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('Tier Test Results 🏆')
                .setThumbnail(mcAvatarUrl)
                .addFields(
                    { name: 'IGN', value: ign, inline: false },
                    { name: 'Gamemode', value: gamemode.toUpperCase(), inline: false },
                    { name: 'Tier Before', value: tierBefore === 'none' ? 'N/A' : tierBefore.toUpperCase(), inline: false },
                    { name: 'Tier Earned', value: tierEarned.toUpperCase(), inline: false },
                    { name: 'Tester', value: `${tester}`, inline: false }
                );

            await resultChannel.send({
                content: `${userTested}\n${resultText}`,
                embeds: [resultEmbed]
            });

            await interaction.editReply({ content: `✅ შედეგი გაიგზავნა! (ბაზა: ${dbStatus})` });

            // 4. Update Tester Statistics
            try {
                let stats = {};
                try {
                    const data = fs.readFileSync('./src/tester-stats.json', 'utf8');
                    stats = JSON.parse(data);
                } catch (e) { stats = {}; }

                const testerId = tester.id;
                if (!stats[testerId]) stats[testerId] = { username: tester.tag, count: 0 };
                stats[testerId].count++;
                stats[testerId].username = tester.tag;

                fs.writeFileSync('./src/tester-stats.json', JSON.stringify(stats, null, 2));

                if (config.testerStatsChannelId) {
                    const statsChannel = interaction.guild.channels.cache.get(config.testerStatsChannelId);
                    if (statsChannel) {
                        await statsChannel.send(`🎯 ${tester} has completed **${stats[testerId].count}** test${stats[testerId].count > 1 ? 's' : ''} !!!`);
                    }
                }
            } catch (error) {
                console.error('Error updating tester stats:', error);
            }
        } else {
            await interaction.editReply({ content: 'შეცდომა: შედეგების ჩანელი ვერ მოიძებნა. შეამოწმეთ ID: ' + specificChannelId });
        }
    }

    // MODERATION COMMANDS
    if (interaction.commandName === 'mute') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return interaction.reply({ content: 'თქვენ არ გაქვთ წევრების გაჩუმების (Timeout) უფლება.', flags: [MessageFlags.Ephemeral] });
        }

        const target = interaction.options.getMember('target');
        const duration = interaction.options.getInteger('duration');
        const reason = interaction.options.getString('reason') || 'მიზეზი არ არის მითითებული';

        if (!target) return interaction.reply({ content: 'მომხმარებელი ვერ მოიძებნა.', flags: [MessageFlags.Ephemeral] });
        if (!target.moderatable) return interaction.reply({ content: 'ამ მომხმარებლის გაჩუმება შეუძლებელია.', flags: [MessageFlags.Ephemeral] });

        try {
            await target.timeout(duration * 60 * 1000, reason);
            await interaction.reply({ content: `✅ მომხმარებელი ${target.user.tag} გაჩუმდა ${duration} წუთით. მიზეზი: ${reason}` });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'გაჩუმებისას მოხდა შეცდომა.', flags: [MessageFlags.Ephemeral] });
        }
    }

    if (interaction.commandName === 'serverinfo') {
        const guild = interaction.guild;

        // Fetch all members to get accurate counts
        await guild.members.fetch();

        const totalMembers = guild.memberCount;
        const botCount = guild.members.cache.filter(m => m.user.bot).size;
        const humanCount = totalMembers - botCount;

        const textChannels = guild.channels.cache.filter(c => c.type === 0).size;
        const voiceChannels = guild.channels.cache.filter(c => c.type === 2).size;
        const categories = guild.channels.cache.filter(c => c.type === 4).size;

        const roleCount = guild.roles.cache.size;
        const emojiCount = guild.emojis.cache.size;

        const serverInfoEmbed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle(`📊 ${guild.name} - სერვერის ინფორმაცია`)
            .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: '👑 მფლობელი', value: `<@${guild.ownerId}>`, inline: true },
                { name: '🆔 სერვერის ID', value: guild.id, inline: true },
                { name: '📅 შექმნის თარიღი', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true },
                { name: '\u200B', value: '\u200B', inline: false },
                { name: '👥 წევრები', value: `სულ: **${totalMembers}**\nადამიანები: **${humanCount}**\nბოტები: **${botCount}**`, inline: true },
                { name: '📢 არხები', value: `ტექსტური: **${textChannels}**\nხმოვანი: **${voiceChannels}**\nკატეგორიები: **${categories}**`, inline: true },
                { name: '🎭 სხვა', value: `როლები: **${roleCount}**\nემოჯი: **${emojiCount}**`, inline: true },
                { name: '🔐 დაცვის დონე', value: guild.verificationLevel === 0 ? 'არ არის' : guild.verificationLevel === 1 ? 'დაბალი' : guild.verificationLevel === 2 ? 'საშუალო' : guild.verificationLevel === 3 ? 'მაღალი' : 'ძალიან მაღალი', inline: true }
            )
            .setFooter({ text: `მოთხოვნილია ${interaction.user.tag} მიერ`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        if (guild.description) {
            serverInfoEmbed.setDescription(guild.description);
        }

        await interaction.reply({ embeds: [serverInfoEmbed] });
    }

    if (interaction.commandName === 'membercount') {
        const guild = interaction.guild;

        // Fetch all members to get accurate counts
        await guild.members.fetch();

        const totalMembers = guild.memberCount;
        const botCount = guild.members.cache.filter(m => m.user.bot).size;
        const humanCount = totalMembers - botCount;

        const memberCountEmbed = new EmbedBuilder()
            .setColor(0x57F287)
            .setTitle('👥 წევრების სტატისტიკა')
            .setThumbnail(guild.iconURL({ dynamic: true, size: 128 }))
            .addFields(
                { name: '📊 ყველა', value: `**${totalMembers}**`, inline: true },
                { name: '👤 ადამიანები', value: `**${humanCount}**`, inline: true },
                { name: '🤖 ბოტები', value: `**${botCount}**`, inline: true }
            )
            .setFooter({ text: guild.name, iconURL: guild.iconURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [memberCountEmbed] });
    }

    // TICKET SYSTEM COMMANDS
    if (interaction.commandName === 'ticket-setup') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: 'მხოლოდ ადმინისტრატორებს შეუძლიათ ტიკეტ სისტემის დაყენება.', flags: [MessageFlags.Ephemeral] });
        }

        const channel = interaction.options.getChannel('channel');

        const setupEmbed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('🎫 ტიკეტ სისტემა')
            .setDescription('დააჭირეთ ღილაკს ქვემოთ ტიკეტის შესაქმნელად.\n\nპერსონალი მალე დაგიკავშირდებათ და დაგეხმარებათ თქვენს პრობლემაში.')
            .setFooter({ text: 'GeoTiers Support System' })
            .setTimestamp();

        const button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('create_ticket')
                    .setLabel('შექმენი ტიკეტი')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🎫')
            );

        await channel.send({ embeds: [setupEmbed], components: [button] });
        await interaction.reply({ content: `✅ ტიკეტ სისტემა დაყენდა ${channel}-ში!`, flags: [MessageFlags.Ephemeral] });
    }

    if (interaction.commandName === 'close') {
        const channel = interaction.channel;

        if (!channel.name.startsWith('ticket-')) {
            return interaction.reply({ content: 'ეს ქომანდი მხოლოდ ტიკეტის არხებში მუშაობს!', flags: [MessageFlags.Ephemeral] });
        }

        // Show modal for close reason
        const modal = new ModalBuilder()
            .setCustomId('close_ticket_modal')
            .setTitle('🔒 ტიკეტის დახურვა');

        const reasonInput = new TextInputBuilder()
            .setCustomId('close_reason')
            .setLabel('დახურვის მიზეზი')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('მიუთითეთ რატომ იხურება ტიკეტი...')
            .setRequired(true)
            .setMinLength(5)
            .setMaxLength(500);

        const firstActionRow = new ActionRowBuilder().addComponents(reasonInput);
        modal.addComponents(firstActionRow);

        await interaction.showModal(modal);
    }

    if (interaction.commandName === 'add') {
        const channel = interaction.channel;

        if (!channel.name.startsWith('ticket-')) {
            return interaction.reply({ content: 'ეს ქომანდი მხოლოდ ტიკეტის არხებში მუშაობს!', flags: [MessageFlags.Ephemeral] });
        }

        const user = interaction.options.getUser('user');
        const member = await interaction.guild.members.fetch(user.id);

        await channel.permissionOverwrites.create(member, {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true,
        });

        await interaction.reply({ content: `✅ ${user} დაემატა ტიკეტში.` });
    }

    // TESTER STATISTICS COMMANDS
    if (interaction.commandName === 'leaderboard') {
        try {
            let stats = {};
            try {
                const data = fs.readFileSync('./src/tester-stats.json', 'utf8');
                stats = JSON.parse(data);
            } catch (e) { stats = {}; }

            // Sort testers by test count
            const sorted = Object.entries(stats)
                .map(([id, data]) => ({ id, ...data }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10); // Top 10

            if (sorted.length === 0) {
                return interaction.reply({ content: 'ჯერ არცერთი ტესტი არ ჩატარებულა!', flags: [MessageFlags.Ephemeral] });
            }

            const leaderboardEmbed = new EmbedBuilder()
                .setColor(0xFFD700)
                .setTitle('🏆 ტესტერების ლიდერბორდი')
                .setDescription('ყველაზე აქტიური ტესტერები ამ თვეში:')
                .setTimestamp();

            sorted.forEach((tester, index) => {
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
                leaderboardEmbed.addFields({
                    name: `${medal} ${tester.username}`,
                    value: `ტესტები: **${tester.count}**`,
                    inline: false
                });
            });

            await interaction.reply({ embeds: [leaderboardEmbed] });
        } catch (error) {
            console.error('Error showing leaderboard:', error);
            await interaction.reply({ content: 'ლიდერბორდის ჩვენებისას მოხდა შეცდომა.', flags: [MessageFlags.Ephemeral] });
        }
    }

    if (interaction.commandName === 'reset-stats') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: 'მხოლოდ ადმინისტრატორებს შეუძლიათ სტატისტიკის გადატვირთვა.', flags: [MessageFlags.Ephemeral] });
        }

        try {
            // Reset stats file
            fs.writeFileSync('./src/tester-stats.json', JSON.stringify({}, null, 2));

            // Send notification to stats channel
            if (config.testerStatsChannelId) {
                const statsChannel = interaction.guild.channels.cache.get(config.testerStatsChannelId);
                if (statsChannel) {
                    const resetEmbed = new EmbedBuilder()
                        .setColor(0x57F287)
                        .setTitle('🔄 ახალი თვე დაიწყო!')
                        .setDescription('ტესტერების სტატისტიკა დარესტარტდა.\n\nიწყება ახალი კონკურენცია საუკეთესო ტესტერის ტიტულისთვის!')
                        .setFooter({ text: `დარესტარტდა ${interaction.user.tag} მიერ` })
                        .setTimestamp();

                    await statsChannel.send({ embeds: [resetEmbed] });
                }
            }

            await interaction.reply({ content: '✅ ტესტერების სტატისტიკა წარმატებით დარესტარტდა!', flags: [MessageFlags.Ephemeral] });
        } catch (error) {
            console.error('Error resetting stats:', error);
            await interaction.reply({ content: 'სტატისტიკის გადატვირთვისას მოხდა შეცდომა.', flags: [MessageFlags.Ephemeral] });
        }
    }

    // GIVEAWAY SYSTEM
    if (interaction.commandName === 'giveaway') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: 'მხოლოდ ადმინისტრატორებს შეუძლიათ გათამაშების დაწყება.', flags: [MessageFlags.Ephemeral] });
        }

        // Show modal for giveaway details
        const modal = new ModalBuilder()
            .setCustomId('giveaway_modal')
            .setTitle('🎉 გათამაშების შექმნა');

        const prizeInput = new TextInputBuilder()
            .setCustomId('giveaway_prize')
            .setLabel('პრიზი')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('მაგ: Discord Nitro, 50 GEL')
            .setRequired(true)
            .setMaxLength(100);

        const winnersInput = new TextInputBuilder()
            .setCustomId('giveaway_winners')
            .setLabel('გამარჯვებულების რაოდენობა')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('მაგ: 1')
            .setRequired(true)
            .setMinLength(1)
            .setMaxLength(2);

        const durationInput = new TextInputBuilder()
            .setCustomId('giveaway_duration')
            .setLabel('ხანგრძლივობა (წუთებში)')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('მაგ: 60')
            .setRequired(true)
            .setMaxLength(5);

        const row1 = new ActionRowBuilder().addComponents(prizeInput);
        const row2 = new ActionRowBuilder().addComponents(winnersInput);
        const row3 = new ActionRowBuilder().addComponents(durationInput);

        modal.addComponents(row1, row2, row3);

        await interaction.showModal(modal);
    }

    if (interaction.commandName === 'gend') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: 'მხოლოდ ადმინისტრატორებს შეუძლიათ გათამაშების დასრულება.', flags: [MessageFlags.Ephemeral] });
        }

        const messageId = interaction.options.getString('message_id');

        try {
            await endGiveaway(messageId, client);
            await interaction.reply({ content: '✅ გათამაშება დასრულდა!', flags: [MessageFlags.Ephemeral] });
        } catch (error) {
            console.error('Error ending giveaway:', error);
            await interaction.reply({ content: 'გათამაშების დასრულებისას მოხდა შეცდომა.', flags: [MessageFlags.Ephemeral] });
        }
    }
});

// Giveaway end function
async function endGiveaway(messageId, client) {
    try {
        let giveaways = {};
        try {
            const data = fs.readFileSync('./src/giveaways.json', 'utf8');
            giveaways = JSON.parse(data);
        } catch (e) { return; }

        const giveaway = giveaways[messageId];
        if (!giveaway) return;

        const channel = await client.channels.fetch(giveaway.channelId);
        const message = await channel.messages.fetch(messageId);

        const participants = giveaway.participants || [];

        if (participants.length === 0) {
            const canceledEmbed = new EmbedBuilder()
                .setColor(0xED4245)
                .setTitle(giveaway.prize)
                .setDescription('No participants')
                .setFooter({ text: 'Giveaway Canceled' })
                .setTimestamp();

            await message.edit({ content: '🎁 **GIVEAWAY CANCELED** 🎁', embeds: [canceledEmbed], components: [] });
            await channel.send('❌ Giveaway canceled - no participants.');

            delete giveaways[messageId];
            fs.writeFileSync('./src/giveaways.json', JSON.stringify(giveaways, null, 2));
            return;
        }

        const winnersCount = Math.min(giveaway.winners, participants.length);

        // Create weighted participant pool (boosted role gets multiple entries)
        let weightedParticipants = [];

        for (const userId of participants) {
            try {
                const member = await channel.guild.members.fetch(userId);
                const hasBoostedRole = config.giveawayBoostedRoleId &&
                    !config.giveawayBoostedRoleId.includes('ROLE_ID') &&
                    member.roles.cache.has(config.giveawayBoostedRoleId);

                const multiplier = hasBoostedRole ? (config.giveawayBoostedMultiplier || 2) : 1;

                for (let i = 0; i < multiplier; i++) {
                    weightedParticipants.push(userId);
                }
            } catch (e) {
                weightedParticipants.push(userId);
            }
        }

        // Randomly select winners from weighted pool
        const shuffled = [...weightedParticipants].sort(() => 0.5 - Math.random());
        const winnerIds = [];
        const uniqueWinners = new Set();

        for (const id of shuffled) {
            if (!uniqueWinners.has(id)) {
                uniqueWinners.add(id);
                winnerIds.push(id);
                if (winnerIds.length >= winnersCount) break;
            }
        }

        const winnerMentions = winnerIds.map(id => `<@${id}>`).join(', ');

        const winnerEmbed = new EmbedBuilder()
            .setColor(0x57F287)
            .setTitle('🎊 Giveaway Ended')
            .setDescription(`**Prize:** ${giveaway.prize}\n\n**Winner${winnersCount > 1 ? 's' : ''}:** ${winnerMentions}\n**Hosted by:** <@${giveaway.hostId}>`)
            .setTimestamp();

        await channel.send({ content: winnerMentions, embeds: [winnerEmbed] });

        // Update original message
        const endedEmbed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle(giveaway.prize)
            .setDescription(`**Winner${winnersCount > 1 ? 's' : ''}:** ${winnerMentions}`)
            .setFooter({ text: 'Giveaway Ended' })
            .setTimestamp();

        await message.edit({ content: '🎁 **GIVEAWAY ENDED** 🎁', embeds: [endedEmbed], components: [] });

        delete giveaways[messageId];
        fs.writeFileSync('./src/giveaways.json', JSON.stringify(giveaways, null, 2));

    } catch (error) {
        console.error('Error in endGiveaway:', error);
    }
}

client.login(process.env.DISCORD_TOKEN);

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Stopping bot...');
    client.destroy();
    process.exit();
});

process.on('SIGTERM', () => {
    console.log('Stopping bot...');
    client.destroy();
    process.exit();
});
