import * as vscode from "vscode"
import { buildApiHandler } from "../../api"
import { Logger } from "../../services/logging/Logger"
import debounce from "lodash/debounce"
import { ApiConfiguration } from "../../shared/api"

export class InlineCompletionProvider implements vscode.InlineCompletionItemProvider {
	private api: any
	private lastCompletion: string | null = null
	private lastPosition: vscode.Position | null = null
	private readonly MAX_CONTEXT_LINES = 50
	private readonly DEBOUNCE_MS = 300

	constructor() {
		try {
			// Create a simple configuration for the default provider (Anthropic)
			const config: ApiConfiguration = {
				apiProvider: "anthropic",
				apiModelId: "claude-3-sonnet-20240229", // Use a good default model
			}

			this.api = buildApiHandler(config)
		} catch (error) {
			Logger.log(`Failed to initialize API handler: ${error}`)
			this.api = null
		}
	}

	private getRelevantContext(document: vscode.TextDocument, position: vscode.Position): string {
		// Get lines before cursor, up to MAX_CONTEXT_LINES
		const startLine = Math.max(0, position.line - this.MAX_CONTEXT_LINES)
		const endLine = position.line
		const contextLines = []

		for (let i = startLine; i <= endLine; i++) {
			const line = document.lineAt(i)
			if (i === endLine) {
				// For the current line, only include text before cursor
				contextLines.push(line.text.substring(0, position.character))
			} else {
				contextLines.push(line.text)
			}
		}

		return contextLines.join("\n")
	}

	private createCompletionPrompt(document: vscode.TextDocument, position: vscode.Position): string {
		const languageId = document.languageId
		const context = this.getRelevantContext(document, position)

		return `Complete the following ${languageId} code. Only provide the completion, no explanations:\n\n${context}\n\nComplete from here:`
	}

	private async getCompletion(document: vscode.TextDocument, position: vscode.Position): Promise<string | null> {
		if (!this.api) {
			return null
		}

		try {
			const prompt = this.createCompletionPrompt(document, position)
			const completion = await this.api.completePrompt(prompt)
			return completion || null
		} catch (error) {
			Logger.log(`Error getting completion: ${error}`)
			return null
		}
	}

	// Debounced version of getCompletion
	private debouncedGetCompletion = debounce(
		async (document: vscode.TextDocument, position: vscode.Position): Promise<string | null> => {
			return this.getCompletion(document, position)
		},
		this.DEBOUNCE_MS,
	)

	async provideInlineCompletionItems(
		document: vscode.TextDocument,
		position: vscode.Position,
		context: vscode.InlineCompletionContext,
		token: vscode.CancellationToken,
	): Promise<vscode.InlineCompletionItem[] | vscode.InlineCompletionList | null | undefined> {
		try {
			// Check if we're in a comment or string
			const line = document.lineAt(position.line)
			const textBeforeCursor = line.text.substring(0, position.character)
			if (this.isInCommentOrString(document, position)) {
				return null
			}

			// Check if position has changed significantly
			if (
				this.lastPosition &&
				this.lastPosition.line === position.line &&
				Math.abs(this.lastPosition.character - position.character) < 3
			) {
				return null
			}

			this.lastPosition = position

			// Get completion
			const completion = await this.debouncedGetCompletion(document, position)

			if (!completion || token.isCancellationRequested) {
				return null
			}

			// Create inline completion item
			const item = new vscode.InlineCompletionItem(completion, new vscode.Range(position, position))

			return [item]
		} catch (error) {
			Logger.log(`Error in inline completion: ${error}`)
			return null
		}
	}

	private isInCommentOrString(document: vscode.TextDocument, position: vscode.Position): boolean {
		const line = document.lineAt(position.line)
		const text = line.text.substring(0, position.character)

		// Check for common comment patterns
		if (text.includes("//") || text.includes("/*") || text.includes("*/")) {
			return true
		}

		// Check for string literals (basic check)
		const singleQuotes = (text.match(/'/g) || []).length
		const doubleQuotes = (text.match(/"/g) || []).length
		return singleQuotes % 2 === 1 || doubleQuotes % 2 === 1
	}
}
