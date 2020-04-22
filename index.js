const Discord = require("discord.js");
const axios = require("axios");
const client = new Discord.Client();
const phrases = [
  "mmmmm??",
  "y tu",
  "XD",
  "no compren bienes importados",
  "xupalo",
  "kie kieee"
];
const validIndicators = ["euro", "dolar", "bitcoin"];
const numberFormatter = new Intl.NumberFormat("de-DE");

const getEconomic = async message => {
  const splitted = message.split(" ");
  if (splitted.length !== 3) return;
  if (!validIndicators.includes(splitted[1]))
    return `oie ablame bn wm, metete el ${splitted[1]} donde te kepa wm`;
  const economicsIndicators = await axios.get("https://mindicador.cl/api");
  const indicator = splitted[1];
  const value =
    indicator === "bitcoin"
      ? economicsIndicators.data[indicator]["valor"] *
        economicsIndicators.data["dolar"]["valor"]
      : economicsIndicators.data[indicator]["valor"];
  const date = new Date(
    economicsIndicators.data[indicator]["fecha"]
  ).toLocaleString();
  return `está a ${numberFormatter.format(
    value
  )} CLP wum (al ${date} eso si makina)`;
};

const getCovid = async message => {
  const splitted = message.split(" ");
  const covidInfo = await axios.get("https://api.covid19api.com/summary");
  const countryName = splitted.slice(1).join(" ");
  let countryInfo;
  if (countryName === "toda la data") {
    const {
      data: { Global }
    } = covidInfo;
    countryInfo = Global;
  } else {
    const {
      data: { Countries }
    } = covidInfo;
    [countryInfo] = Countries.filter(e => e["Country"] === countryName);
    if (!countryInfo) {
      return "no lo pillé bro";
    }
  }
  const {
    NewConfirmed,
    TotalConfirmed,
    NewDeaths,
    TotalDeaths,
    NewRecovered,
    TotalRecovered
  } = countryInfo;
  const updateDate = new Date(countryInfo["Date"]).toLocaleString();
  return ` \nNuevos confirmados: ${numberFormatter.format(NewConfirmed)}
  Total confirmados: ${numberFormatter.format(TotalConfirmed)}
  Nuevas muertes: ${numberFormatter.format(NewDeaths)}
  Muertes totales: ${numberFormatter.format(TotalDeaths)}
  Nuevos recuperados: ${numberFormatter.format(NewRecovered)}
  Recuperados totales: ${numberFormatter.format(TotalRecovered)}
  ${countryName !== "toda la data" ? `Fecha: ${updateDate}` : ""}`;
};

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", async msg => {
  if (msg.content.startsWith("dime")) {
    const pivot = Math.random();
    if (pivot > 0.8) {
      const response = await getEconomic(msg.content);
      if (response) {
        msg.channel.send(response);
      }
    } else {
      const phrase = phrases[Math.floor(Math.random() * phrases.length)];
      msg.channel.send(phrase);
    }
  } else if (
    phrases.includes(msg.content) &&
    msg.author.username !== "DonPatris"
  ) {
    msg.channel.send("oie no copies mi mensaje wm");
  } else if (msg.content.startsWith("covid")) {
    const covidInfo = await getCovid(msg.content);
    if (covidInfo) {
      msg.channel.send(covidInfo);
    }
  }
});

client.login(process.env["DISCORD_TOKEN"]);
