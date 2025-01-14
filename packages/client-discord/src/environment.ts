import { IAgentRuntime } from "@elizaos/core";
import { z } from "zod";

export const discordEnvSchema = z.object({
    DISCORD_APPLICATION_ID: z
        .string()
        .min(1, "Discord application ID is required"),
    DISCORD_API_TOKEN: z.string().min(1, "Discord API token is required"),
});

export type DiscordConfig = z.infer<typeof discordEnvSchema>;

export async function validateDiscordConfig(
    runtime: IAgentRuntime
): Promise<DiscordConfig> {
    console.log("ZZZZZ runtime", runtime);
    console.log("ZZZZZ character", runtime.character);
    console.log("ZZZZZ clientConfig", runtime.character?.clientConfig);
    console.log(
        "ZZZZZ discord config",
        runtime.character?.clientConfig?.discord
    );

    const applicationIdKey =
        runtime.character?.clientConfig?.discord?.envApplicationIdKey;
    const apiTokenKey =
        runtime.character?.clientConfig?.discord?.envApiTokenKey;

    console.log("ZZZZZ applicationIdKey", applicationIdKey);
    console.log("ZZZZZ apiTokenKey", apiTokenKey);

    try {
        const config = {
            DISCORD_APPLICATION_ID:
                process.env[`${applicationIdKey}`] ||
                runtime.getSetting("DISCORD_APPLICATION_ID") ||
                process.env.DISCORD_APPLICATION_ID,
            DISCORD_API_TOKEN:
                process.env[`${apiTokenKey}`] ||
                runtime.getSetting("DISCORD_API_TOKEN") ||
                process.env.DISCORD_API_TOKEN,
        };

        console.log("ZZZZZ config", config);

        return discordEnvSchema.parse(config);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.errors
                .map((err) => `${err.path.join(".")}: ${err.message}`)
                .join("\n");
            throw new Error(
                `Discord configuration validation failed:\n${errorMessages}`
            );
        }
        throw error;
    }
}
