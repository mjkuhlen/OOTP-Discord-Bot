import { EmbedBuilder, SlashCommandBuilder, codeBlock } from "discord.js";
import { client } from "../src";
import { PrismaClient } from "@prisma/client";
import hrLeaders from "../src/utilities/battingLeaders/hrLeaders";
import rbiLeader from "../src/utilities/battingLeaders/rbiLeader";
import sbLeader from "../src/utilities/battingLeaders/sbLeader";
import warLeader from "../src/utilities/battingLeaders/warLeader";
import pwarLeader from "../src/utilities/pitchingLeaders/pwarLeader";
import wLeader from "../src/utilities/pitchingLeaders/wLeader";
import sLeader from "../src/utilities/pitchingLeaders/sLeader";
import kLeader from "../src/utilities/pitchingLeaders/kLeader";
import hLeader from "../src/utilities/battingLeaders/hLeader";

export default new client.command({
    structure: new SlashCommandBuilder()
    .setName('leaders')
    .setDescription('Replies with the league leaders for a selected category')
    .addStringOption(option =>
        option
            .setName('category')
            .setDescription('Choose the category')
            .setRequired(true)
            .addChoices(
                {name: 'HR', value: '8'},
                {name: 'Hits', value: '3'},
                {name: 'RBI', value: '10'},
                {name: 'Stolen Bases', value: '9'},
                {name: 'Batter WAR', value: '58'},
                {name: 'Pitching Wins', value: '29'},
                {name: 'Saves', value: '32'},
                {name: 'Strikeouts', value: '38'},
                {name: 'Pitching WAR', value: '59'}
            ))
    .addStringOption(option =>
        option
            .setName('league')
            .setDescription('Choose the league')
            .setRequired(true)
            .addChoices(
                { name: 'American League', value: '0'},
                { name: 'National League', value: '1'},
            )),
    run: async (client, interaction) => {
        try {
            await interaction.deferReply();
            const league_id = 200;
            const leagueValue = Number(interaction.options.getString('league'));
            const category = interaction.options.getString('category');
            const tableRows: any = [];
            let pLeaders: any [];
            let embedTitle = '';
            let leagueTitle = '';
            switch(category) {
                case '8':
                    embedTitle = 'Leaders HR';
                    pLeaders = await hrLeaders(league_id, leagueValue);
                    pLeaders.forEach((leader:any) => {
                        const row = `${leader.player.first_name} ${leader.player.last_name} - ${leader?.player?.team?.nickname} - ${leader.hr}`;
                        tableRows.push(row);
                    });
                    break;
                case '3':
                    embedTitle = 'Leaders Hits';
                    pLeaders = await hLeader(league_id, leagueValue);
                    pLeaders.forEach((leader:any) => {
                        const row = `${leader.player.first_name} ${leader.player.last_name} - ${leader?.player?.team?.nickname} - ${leader.h}`;
                        tableRows.push(row);
                    });
                    break;
                case '10':
                    embedTitle = 'Leaders RBI';
                    pLeaders = await rbiLeader(league_id, leagueValue);
                    pLeaders.forEach((leader:any) => {
                        const row = `${leader.player.first_name} ${leader.player.last_name} - ${leader?.player?.team?.nickname} - ${leader.rbi}`;
                        tableRows.push(row);
                    });
                    break;
                case '9':
                    embedTitle = 'Leaders Stolen Bases';
                    pLeaders = await sbLeader(league_id, leagueValue);
                    pLeaders.forEach((leader:any) => {
                        const row = `${leader.player.first_name} ${leader.player.last_name} - ${leader?.player?.team?.nickname} - ${leader.sb}`;
                        tableRows.push(row);
                    });
                    break;
                case '58':
                    embedTitle = 'Leaders Batting WAR';
                    pLeaders = await warLeader(league_id, leagueValue);
                    pLeaders.forEach((leader:any) => {
                        const row = `${leader.player.first_name} ${leader.player.last_name} - ${leader?.player?.team?.nickname} - ${leader.war}`;
                        tableRows.push(row);
                    });
                    break;
                case '59':
                    embedTitle = 'Leaders Pitching WAR';
                    pLeaders = await pwarLeader(league_id, leagueValue);
                    pLeaders.forEach((leader:any) => {
                        const row = `${leader.player.first_name} ${leader.player.last_name} - ${leader?.player?.team?.nickname} - ${leader.war}`;
                        tableRows.push(row);
                    });
                    break;
                case '29':
                    embedTitle = 'Leaders Wins';
                    pLeaders = await wLeader(league_id, leagueValue);
                    pLeaders.forEach((leader:any) => {
                        const row = `${leader.player.first_name} ${leader.player.last_name} - ${leader?.player?.team?.nickname} - ${leader.w}`;
                        tableRows.push(row);
                    });
                    break;
                case '32':
                    embedTitle = 'Leaders Saves';
                    pLeaders = await sLeader(league_id, leagueValue);
                    pLeaders.forEach((leader:any) => {
                        const row = `${leader.player.first_name} ${leader.player.last_name} - ${leader?.player?.team?.nickname} - ${leader.s}`;
                        tableRows.push(row);
                    });
                    break;
                case '38':
                    embedTitle = 'Leaders Strikeouts';
                    pLeaders = await kLeader(league_id, leagueValue);
                    pLeaders.forEach((leader:any) => {
                        const row = `${leader.player.first_name} ${leader.player.last_name} - ${leader?.player?.team?.nickname} - ${leader.k}`;
                        tableRows.push(row);
                    });
                    break;
            }
            switch (leagueValue) {
                case 0:
                    leagueTitle = 'American League';
                    break;
                case 1:
                    leagueTitle = 'National League';
                    break;
                default:
                    break;
                }

            const table = codeBlock(tableRows.join('\n'));
			const embed = new EmbedBuilder()
				.setTitle(`${leagueTitle} - ${embedTitle}`)
				.setDescription(table)
				.setColor('#0099ff');
            await interaction.editReply({embeds: [embed]})
        } catch (err) {
            console.error('Error Occured:', err);
			await interaction.editReply({content: 'Something went wrong. Simbot is sad.'})
        }
    }
})