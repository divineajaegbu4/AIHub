export interface AiProvider {
  chat(
    message: string,
    history?: { role: string; content: string }[],
  ): Promise<string>;

  streamChat(
    message: string,
    history?: {
      role: string;
      content: string;
      signal?: AbortSignal;
    }[],
  ): AsyncGenerator<string>;
}
