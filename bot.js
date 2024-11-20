const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");
require('dotenv').config(); // Carrega as variáveis do arquivo .env

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.DirectMessages],
});

// Carregar os tokens do ambiente
const EDUZZ_TOKEN = process.env.EDUZZ_TOKEN; // Variável do secret do GitHub
const BOT_TOKEN = process.env.BOT_TOKEN;    // Variável do secret do GitHub
const ROLE_NAME = "MEMBRO GR"; // Nome do cargo que será atribuído

client.once("ready", () => {
  console.log(`Bot logado como ${client.user.tag}`);
  console.log(`Conectado nos seguintes servidores:`);
  client.guilds.cache.forEach(guild => {
    console.log(`- ${guild.name}`);
  });
});

// Evento para novos membros
client.on('guildMemberAdd', async (member) => {
  console.log(`Novo membro entrou: ${member.user.tag}`);
  try {
    console.log(`Novo membro: ${member.user.tag}`);

    // Enviar uma mensagem no DM do novo membro pedindo o email
    await member.send(
      "Olá! Para liberar seu acesso ao conteúdo e comunidade, informe o e-mail usado na compra do curso:"
    );
  } catch (error) {
    console.error(`Não foi possível enviar DM para ${member.user.tag}:`, error);
  }
});

// Evento para receber as mensagens do novo membro (email)
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Verifica se a mensagem foi enviada em DM
  if (!message.guild) {
    const email = message.content.trim();

    // Verificar a compra na Eduzz
    const isPurchased = await checkEduzzPurchase(email);

    if (isPurchased) {
      try {
        // O servidor que o bot já está logado
        const guild = client.guilds.cache.first(); // Aqui pegamos o primeiro servidor
        if (!guild) {
          return message.author.send("Não foi encontrado nenhum servidor associado ao bot.");
        }

        // Verificar se o cargo existe no servidor
        const role = guild.roles.cache.find(role => role.name === ROLE_NAME);

        if (role) {
          // Buscar o membro no servidor e adicionar o cargo
          const member = await guild.members.fetch(message.author.id);
          await member.roles.add(role);
          await message.author.send("Você foi aprovado! O cargo 'Membro GR' foi atribuído. \n\n Agora você tem acesso a todos os recursos do curso e comunidade!! Seja Bem-vindo!!");
        }
      } catch (error) {
        console.error("Erro ao atribuir cargo:", error);
        await message.author.send("Houve um erro ao atribuir o cargo. Tente novamente ou abra um ticket no servidor.");
      }
    } else {
      await message.author.send("Não encontramos nenhuma compra associada ao seu e-mail. \n\nVerifique por qualquer erro: seja digitação ou uso de um email diferente do que foi utilizado na compra pela eduzz. \n\nSe persistir o erro abra um ticket no servidor.");
    }
  }
});

// Função para verificar a compra na Eduzz
async function checkEduzzPurchase(email) {
  try {
    const response = await axios.get(`https://api.eduzz.com/myeduzz/v1/customers/${email}`, {
      headers: {
        Authorization: `Bearer ${EDUZZ_TOKEN}`,
      },
    });

    console.log("Resposta da API:", response.data);

    // Verifique se o email está na resposta e se a compra é válida
    return response.data.email === email;  // Apenas verificando se o e-mail corresponde ao que foi informado
  } catch (error) {
    console.error("Erro ao verificar a compra na Eduzz:", error);
    return false;
  }
}

client.login(BOT_TOKEN);  // Usando o token do GitHub Secret

const discord = 'https://discord.gg/Tk86NVWQ';
