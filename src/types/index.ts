import { ChatInputCommandInteraction, ContextMenuCommandBuilder, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";
import ExtendedClient from "../class/ExtendedClient";

export interface Command {
    stucture: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">  | ContextMenuCommandBuilder 
    run: (client: ExtendedClient, interaction: ChatInputCommandInteraction) => void
};
