const {Client, IntentsBitField, Application, SlashCommandBuilder, ButtonBuilder, codeBlock,ActivityType } = require('discord.js');
var WebRcon = require('webrconjs')

const {token, guildid, ip, port, password, chunk_val, channelid} = require('./config.json');
const client = new Client({intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMembers]});
const rcon = new WebRcon(ip, port);


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    const data = new SlashCommandBuilder()
        .setName('rcon')
        .setDescription('Send a command to the server')
        .addStringOption(option => option.setName('command').setDescription('The command to send').setRequired(true));

    client.guilds.cache.get(guildid).commands.create(data);
    
    
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    if (commandName === 'rcon') {
        const command = options.getString('command');
        rcon.run(command, 1337)

        await interaction.reply({content: `Command sent: ${command}`, ephemeral: true});

        rcon.on('message', async(message) => {
            if (message.identity === 1337) {
                console.log('got here')
                await interaction.followUp({content: codeBlock(`Response: ${message.message}`), ephemeral: true})
            }
        })
    }
});

rcon.on('connect', () => {
    console.log('Connected to RCON');
});

let msg_array = []
rcon.on('message', async(message) => {
    console.log(message)
    msg_array.push(message.message)
    if (msg_array.length === chunk_val) {
        client.guilds.cache.get(guildid).channels.cache.get(channelid).send(`${codeBlock(msg_array.join('\n'))}`)
        msg_array = []
    } 
})

client.login(token);
rcon.connect(password);
