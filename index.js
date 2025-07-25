const { 
  Client, 
  GatewayIntentBits, 
  Partials, 
  Routes, 
  REST, 
  SlashCommandBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  ModalBuilder, 
  TextInputBuilder, 
  TextInputStyle, 
  Events 
} = require("discord.js");
require("dotenv").config();

const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

// تسجيل السلاش كوماند عند التشغيل (التسجيل للسيرفر فقط وليس عالمي، أسرع للتجربة)
const commands = [
  new SlashCommandBuilder()
    .setName("قيم")
    .setDescription("إدارة القيم بالأزرار والنماذج")
    .toJSON()
];

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log("تم تسجيل أوامر السلاش.");
  } catch (error) {
    console.error(error);
  }
})();

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  partials: [Partials.Channel]
});

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  // أمر /قيم
  if (interaction.isChatInputCommand() && interaction.commandName === "قيم") {
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("start_game")
          .setLabel("بدء قيم")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId("start_vote")
          .setLabel("بدء تصويت قيم")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("end_game")
          .setLabel("إنهاء قيم")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setLabel("Expert")
          .setStyle(ButtonStyle.Link)
          .setURL("https://your-expert-link.com") // عدل الرابط حسب احتياجك
      );

    await interaction.reply({
      content: "قيم جديد!\nاستخدم الأزرار بالأسفل لإدارة القيم.",
      components: [row],
      ephemeral: false
    });
  }

  // أزرار القيم
  if (interaction.isButton()) {
    if (interaction.customId === "start_game") {
      await interaction.reply({ content: "تم بدء القيم! بالتوفيق.", ephemeral: true });
    } else if (interaction.customId === "start_vote" || interaction.customId === "end_game") {
      const modal = new ModalBuilder()
        .setCustomId(`${interaction.customId}_modal`)
        .setTitle(interaction.customId === "start_vote" ? "بدء تصويت قيم" : "إنهاء القيم")
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId("what_to_write")
              .setLabel("وش بتكتب")
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId("game_ip")
              .setLabel("ايبي القيم")
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId("game_link")
              .setLabel("رابط القيم")
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId("quiz_link")
              .setLabel("رابط القيز (اختياري)")
              .setStyle(TextInputStyle.Short)
              .setRequired(false)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId("image_link")
              .setLabel("رابط الصورة (اختياري)")
              .setStyle(TextInputStyle.Short)
              .setRequired(false)
          ),
        );
      await interaction.showModal(modal);
    }
  }

  // عند إرسال النموذج
  if (interaction.isModalSubmit()) {
    const whatToWrite = interaction.fields.getTextInputValue("what_to_write");
    const gameIp = interaction.fields.getTextInputValue("game_ip");
    const gameLink = interaction.fields.getTextInputValue("game_link");
    const quizLink = interaction.fields.getTextInputValue("quiz_link");
    const imageLink = interaction.fields.getTextInputValue("image_link");

    let reply = `**وش بتكتب:** ${whatToWrite}\n**ايبي القيم:** ${gameIp}\n**رابط القيم:** ${gameLink}`;
    if (quizLink) reply += `\n**رابط القيز:** ${quizLink}`;
    if (imageLink) reply += `\n**رابط الصورة:** ${imageLink}`;

    await interaction.reply({ content: reply, ephemeral: true });
  }
});

client.login(TOKEN);
