const { Client, GatewayIntentBits, SlashCommandBuilder } = require('discord.js');
const { MongoClient } = require('mongodb');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const uri = ''; // Your mongodb
const dbName = 'keys'; // Database name
const collectionName = 'users'; // Collection name

client.once('ready', async () => {
    console.log('Bot is ready!');
    await client.guilds.cache.forEach(async guild => {
        const command = await guild.commands.create(getKeyCommand);
        console.log(`Slash command ${command.name} created in guild ${guild.name}`);
    });
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'getkey') {
        const userKey = await generateKey(interaction.user.id);
        await interaction.reply({ content: `Your key is: ${userKey}`, ephemeral: true });
    }
});

const getKeyCommand = new SlashCommandBuilder()
    .setName('getkey')
    .setDescription('Get a unique key');

async function generateKey(userId) {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client.connect();
        const database = client.db(dbName);
        const collection = database.collection(collectionName);

        const existingKey = await collection.findOne({ userId });
        if (existingKey) {
            return existingKey.key;
        }

        const newKey = Math.random().toString(36).substr(2, 10); // Generate a random key
        await collection.insertOne({ userId, key: newKey });
        return newKey;
    } finally {
        await client.close();
    }
}

client.login('YOUR TOKEN HERE');
