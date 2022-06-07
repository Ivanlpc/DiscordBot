const config = require("./json/config.json")
const users = config.tablaUsuarios
const identifier = config.columnaIdentifier
const { Client, Intents, MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const mysql = require("mysql")
const fs= require("fs")
const Auth = require("./node_modules/auth.js")
const DB = {
	host: config.DB.host,
	user: config.DB.user,
	password: config.DB.password,
	database: config.DB.database
}
dbcon();

module.exports = {
	crearEmbedConfirmacion: function (licencia, ejecutor, Char, iconurl) {
		return new Promise(async (resolve, reject) => {
			let embed = await new MessageEmbed()
				.setColor("FF0000")
				.setTitle("¿Estás seguro de querer hacerle CK a esta licencia?")
				.addFields(
					{ name: "Licencia", value: licencia, inline: true },
					{ name: "Char", value: Char, inline: true }
				).setTimestamp()
				.setThumbnail(iconurl)
				.setFooter({ text: `${ejecutor.username}#${ejecutor.discriminator}`, iconURL: ejecutor.avatarURL() })
			resolve(embed)
		})
	},
	crearBotones: function () {
		const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('si')
					.setLabel('SI')
					.setStyle('SUCCESS'),
				new MessageButton()
					.setCustomId('no')
					.setLabel('NO')
					.setStyle('DANGER'),
			);
		return row
	},
	buscarLicencia: function(id){
		let sql= `SELECT * FROM players_external_informations WHERE identifier LIKE ?`;
		id="%"+id+"%";
		conexion.query(sql, [license], (err,rows)=>{
			if(err) return console.log(err);
			if(rows.length===0){
				respuesta({status:"err",message:"El usuario no ha entrado al servidor"})
			}else{
				console.log(rows);
				respuesta({status:"success"})
			}
		})
	},
	buscar: function (license, char, respuesta) {
		let syntax=""
		if (char != "Todos") {

			license= "Char"+char.toString()+":"+license;
			syntax = `=?`
		} else {
			license = "%"+license+"%";
			syntax= `LIKE ?`
		}
		let sql = `SELECT * FROM users WHERE ${config.scripts.columna[0]} ${syntax}`
		conexion.query(sql, [license], (err, rows) => {
			if (err) return console.log(err)
		
			if (rows.length > 0) {
				
				respuesta("si")
				
			} else {
				console.log("noexiste")
				respuesta("no")
				
			}
		})
		
	},
	printError: function (args, char) {
		return new Promise(async (resolve, reject) => {
			try {
				const discordEmbed = await new MessageEmbed()
					.setColor("FF0000")
					.setTitle("Perfil no encontrado")
					
					.addFields(
						{ name: "Licencia", value: args, inline: true },
						{ name: "Char", value: char.toString() }

					)
					.setTimestamp()
				resolve(discordEmbed);
			} catch (e) {
				console.log(e);
				reject(e);
			}
		})
	},
	borrarLicencia: function (licencia, char, callback) {
		let syntax
		if (char != "Todos") {
			licencia= "Char"+char.toString()+":"+licencia
			syntax = `=?`
		} else {
			licencia = "%"+licencia+"%"
			syntax= `LIKE ?`
		}
		let lista = config.scripts.nombre

		lista.forEach(async (script, index) => {

			let column = config.scripts.columna[index]

			let sql = `DELETE FROM ${script} WHERE ${column} ${syntax}`;

			await conexion.query(sql, [licencia], (err, rows) => {
				if (err) {
					console.log(err)
					callback("Error")
					return
				}
			})
		})
		callback("OK");

	},
	UpdateAuthConfig: async function(){
		let tempData = JSON.parse(fs.readFileSync('./json/configStream.json'));
	
		const authKey = await Auth.getKey(tempData.twitch_clientID, tempData.twitch_secret);
		if (!authKey) return;
	
		var tempConfig = JSON.parse(fs.readFileSync('./json/configStream.json'));
		tempConfig.authToken = authKey;
		fs.writeFileSync('./json/configStream.json', JSON.stringify(tempConfig));
	},
	buscarJSON: function(json,ejecutor,callback){
		let existe="no"
		let indice
            json.channels.forEach((user, index) => {
                if (user.discord_id === ejecutor) {
                    existe="yes"
					indice=index   
                }
            })
			callback(existe,indice)
	}
}
function dbcon() {
	conexion = mysql.createConnection(DB);


	conexion.connect(function (err) {
		if (err) {
			console.log("Hubo un error al conectarse a la base de datos => \n", err);
			setTimeout(dbcon, 2000);
		} else {
			console.log(`Conexión a la base de datos creada: \n Usuario = ${DB.user} \n Base de datos = ${DB.database} \n Server = ${DB.host}`);
		}
	});

	conexion.on('error', function (err) {
		console.log("Hubo un error => \n", err);
		if (err.code === 'PROTOCOL_CONNECTION_LOST') {
			dbcon();
		} else {
			throw err;
		}
	});



}