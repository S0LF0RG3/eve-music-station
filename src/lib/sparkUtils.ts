export function createPrompt(strings: TemplateStringsArray, ...values: any[]): string {
  return (window.spark.llmPrompt as any)(strings, ...values)
}

export async function callLLM(prompt: string, model?: string, jsonMode?: boolean): Promise<string> {
  return window.spark.llm(prompt, model, jsonMode)
}
